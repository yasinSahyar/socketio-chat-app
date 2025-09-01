'use strict';

// Varsayılan namespace
const socket = io();

// Elemanlar
const $messages = document.getElementById('messages');
const $msgForm = document.getElementById('msg-form');
const $msgInput = document.getElementById('m');
const $profileForm = document.getElementById('profile-form');
const $nickname = document.getElementById('nickname');
const $room = document.getElementById('room');
const $roomName = document.getElementById('roomName');
const $count = document.getElementById('count');
const $presence = document.getElementById('presence');

// LocalStorage'dan önceki değerleri yükleyelim
const savedNick = localStorage.getItem('nickname') || '';
const savedRoom = localStorage.getItem('room') || 'lobi';
$nickname.value = savedNick;
$room.value = savedRoom;
$roomName.textContent = savedRoom;

// Profil formu
$profileForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const nickname = $nickname.value.trim() || 'Anonim';
  const room = ($room.value.trim() || 'lobi').toLowerCase();

  localStorage.setItem('nickname', nickname);
  localStorage.setItem('room', room);

  socket.emit('set-profile', { nickname, room });
  $roomName.textContent = room;
  $msgInput.focus();
});

// Mesaj formu
$msgForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = $msgInput.value.trim();
  if (!text) return;
  socket.emit('chat-message', text);
  $msgInput.value = '';
  $msgInput.focus();
});

// Sunucudan sistem mesajları
socket.on('system', (msg) => {
  addSystemMessage(msg);
});

// Sunucudan sohbet mesajları
socket.on('chat-message', (payload) => {
  addChatMessage(payload);
});

// Katılımcı sayısı / presence güncellemesi
socket.on('presence', ({ room, count }) => {
  $roomName.textContent = room;
  $count.textContent = count;
});

// Yardımcı render fonksiyonları
function addChatMessage({ from, text, ts }) {
  const li = document.createElement('li');
  const time = new Date(ts || Date.now()).toLocaleTimeString();
  li.innerHTML = `<span class="from">${escapeHtml(from)}</span> <span class="time">${time}</span><br>${linkify(escapeHtml(text))}`;
  li.classList.add('msg');
  $messages.appendChild(li);
  $messages.scrollTop = $messages.scrollHeight;
}

function addSystemMessage(text) {
  const li = document.createElement('li');
  li.textContent = text;
  li.classList.add('system');
  $messages.appendChild(li);
  $messages.scrollTop = $messages.scrollHeight;
}

// Basit XSS koruması
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }[m]));
}

// Linkleri tıklanabilir yap
function linkify(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
}

// Sayfa yüklenince otomatik profile gönder
window.addEventListener('load', () => {
  $profileForm.dispatchEvent(new Event('submit'));
});
