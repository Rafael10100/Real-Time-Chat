const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // URL do frontend React
    methods: ["GET", "POST"]
  }
});

// Armazenar usuários online
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log(`Usuário conectado: ${socket.id}`);

  // Evento quando um usuário entra no chat
  socket.on('user_join', (username) => {
    onlineUsers.set(socket.id, username);
    io.emit('users_update', Array.from(onlineUsers.values()));
    io.emit('receive_message', {
      author: "Sistema",
      message: `${username} entrou no chat`,
      timestamp: new Date().toLocaleTimeString()
    });
  });

  // Evento para receber e retransmitir mensagens
  socket.on('send_message', (data) => {
    io.emit('receive_message', {
      ...data,
      timestamp: new Date().toLocaleTimeString()
    });
  });

  // Evento quando um usuário digita
  socket.on('typing', (username) => {
    socket.broadcast.emit('user_typing', username);
  });

  // Evento quando para de digitar
  socket.on('stop_typing', () => {
    socket.broadcast.emit('user_stop_typing');
  });

  // Evento de desconexão
  socket.on('disconnect', () => {
    const username = onlineUsers.get(socket.id);
    onlineUsers.delete(socket.id);
    io.emit('users_update', Array.from(onlineUsers.values()));
    io.emit('receive_message', {
      author: "Sistema",
      message: `${username} saiu do chat`,
      timestamp: new Date().toLocaleTimeString()
    });
  });
});

server.listen(3001, () => {
  console.log('Backend rodando na porta 3001');
});
