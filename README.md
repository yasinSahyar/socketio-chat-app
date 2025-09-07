# Socket.IO Chat Application

A simple real-time chat application built with **Node.js**, **Express**, and **Socket.IO**.  
Supports **nicknames**, **rooms**, and **real-time messaging**.

---

## ⚙️ How the App Works

1. Enter a nickname (e.g., **Charlie**).  
2. Choose or create a room (e.g., **tech**).  
3. Write a message and click **Send**.  
4. Messages are visible only to users in the **same room**.  
5. System messages notify when users join, leave, or change nicknames.

---

## Socket.IO Namespaces and Rooms

### Analogy
- **Namespace** = Building  
- **Room** = Room inside the building  
- **Socket** = Person who can enter multiple rooms but only inside one building

### Namespaces Example

```js
// Server-side: create a /chat namespace
const chatNamespace = io.of('/chat');

chatNamespace.on('connection', (socket) => {
  console.log('User connected to chat namespace:', socket.id);
});

Rooms

Subgroups inside a namespace

Created dynamically when a user joins

Removed automatically when empty

A socket can join multiple rooms in one namespace

Used to scope messages to specific groups

Rooms Example
// Server-side: join a room inside the chat namespace
chatNamespace.on('connection', (socket) => {
  socket.on('join room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });
});

🚀 Deployment using Azure Web Service

The application is deployed at:
👉 https://newchatapp-frhdg5gsccf8dmht.northeurope-01.azurewebsites.net/


---


![chat Screenshot](images/locall01.png)  
![chat Screenshot](images/locall02.png)  
![chat Screenshot](images/locall03.png) 