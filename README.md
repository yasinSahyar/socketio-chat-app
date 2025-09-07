# Socket.IO Chat Application

A simple real-time chat application built with **Node.js**, **Express**, and **Socket.IO**.  
Supports **nicknames**, **rooms**, and **real-time messaging**.

---
## ⚙️ How the App Works
Enter a nickname (e.g., Charlie).

Choose or create a room (e.g., tech).

Write a message and click Send.

Messages are visible only to users in the same room.

System messages notify when users join, leave, or change nicknames.


## Socket.IO Namespaces and Rooms
Analogy

Namespace = Building

Room = Room inside the building

Socket = Person who can enter multiple rooms but only inside one building
#const chatNamespace = io.of('/chat');
chatNamespace.on('connection', (socket) => {
  console.log('User connected to chat namespace:', socket.id);
});


## Rooms

Subgroups inside a namespace.

Created dynamically when a user joins.

Removed automatically when empty.

A socket can join multiple rooms in one namespace.

Used to scope messages to specific groups.

chatNamespace.on('connection', (socket) => {
  socket.on('join room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });
});



-

![chat Screenshot](images/locall01.png)  
![chat Screenshot](images/locall02.png)  
![chat Screenshot](images/locall03.png) 