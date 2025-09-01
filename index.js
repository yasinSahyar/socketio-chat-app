'use strict';

const path = require('path');
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(http, {
  // Gerekirse CORS açabilirsiniz (örn. başka origin'den bağlanırken)
  // cors: { origin: "*" }
});

// Statik dosyalar
app.use(express.static(path.join(__dirname, 'public')));

// Basit sağlık kontrolü
app.get('/healthz', (_req, res) => res.json({ ok: true }));

// Varsayılan odayı 'lobi' yapalım
const DEFAULT_ROOM = 'lobi';

io.on('connection', (socket) => {
  console.log('New connection:', socket.id);
  // Socket'e basit bir profil tutturuyoruz
  socket.data.nickname = 'Anonim';
  socket.data.room = DEFAULT_ROOM;
  socket.join(DEFAULT_ROOM);

  socket.emit('system', `Welcome to chat! Default room: ${DEFAULT_ROOM}`);
  socket.to(DEFAULT_ROOM).emit('system', `A user joined: ${socket.data.nickname}`);

  // Kullanıcı profil ve oda seçimini bildirir
  socket.on('set-profile', (payload = {}) => {
    try {
      const oldRoom = socket.data.room || DEFAULT_ROOM;

      const nickname = (payload.nickname ?? '').toString().trim().slice(0, 32) || 'Anonim';
      let room = (payload.room ?? '').toString().trim().toLowerCase();
      if (!room) room = DEFAULT_ROOM;

      // Nickname güncelle
      socket.data.nickname = nickname;

      // Oda değişmişse, eskisinden çık, yenisine gir
      if (room !== oldRoom) {
        socket.leave(oldRoom);
        socket.join(room);
        socket.data.room = room;
        socket.emit('system', `You joined the room: ${room}`);
        socket.to(room).emit('system', `${nickname} joined the room`);
        socket.to(oldRoom).emit('system', `${nickname} left the room`);
      } else {
        // Sadece nick değişmiş olabilir
        socket.emit('system', `Profile updated. Your name: ${nickname}, Room: ${room}`);
      }

      // Mevcut oda kişi sayısını yayınlayalım
      io.to(socket.data.room).emit('presence', {
        room: socket.data.room,
        count: io.sockets.adapter.rooms.get(socket.data.room)?.size || 0
      });
    } catch (err) {
      console.error('set-profile error:', err);
    }
  });

  // Mesaj gönderme
  socket.on('chat-message', (text) => {
    text = String(text || '').trim();
    if (!text) return;

    const payload = {
      from: socket.data.nickname || 'Anonim',
      text,
      ts: Date.now(),
      room: socket.data.room || DEFAULT_ROOM,
    };

    // Sadece bulunduğu odaya yayınla
    io.to(payload.room).emit('chat-message', payload);
  });

  // Bağlantı koptuğunda
  socket.on('disconnect', () => {
    const room = socket.data.room || DEFAULT_ROOM;
    socket.to(room).emit('system', `${socket.data.nickname} left`);
    io.to(room).emit('presence', {
      room,
      count: io.sockets.adapter.rooms.get(room)?.size || 0
    });
    console.log('The connection is broken:', socket.id);
  });
});

// Örnek: Namespace (yönetim amaçlı)
// /admin isim-uzayına bağlanan istemciler duyuru yapabilir
const adminNs = io.of('/admin');
adminNs.on('connection', (socket) => {
  console.log('Admin namespace link:', socket.id);
  socket.on('announcement', (msg) => {
    const msgStr = String(msg || '').slice(0, 200);
    io.emit('system', `[Announcement] ${msgStr}`);
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`The server is running on ${PORT}`);
});
