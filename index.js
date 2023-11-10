// socket.js

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const PORT = process.env.PORT || 3000;

io.on('connection', (socket) => {
  socket.on('username', (username) => {
    socket.username = username;
    io.emit('chat message', `[Server]: ${username} has joined the chat.`);
  });

  socket.on('disconnect', () => {
    io.emit('chat message', `[Server]: ${socket.username} has left the chat.`);
  });

  socket.on('chat message', (msg) => {
    io.emit('chat message', `${socket.username}: ${msg}`);
  });

  socket.on('rename', (newName) => {
    const oldName = socket.username;
    socket.username = newName;

    // Notify clients about the name change
    io.emit('rename', { oldName, newName });

    io.emit('chat message', `[Server]: ${oldName} has been renamed to ${newName}.`);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
