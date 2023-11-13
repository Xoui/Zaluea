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

const admins = [
  { username: 'admin', password: 'admin123' },
  // Add other admin accounts as needed
];

const bannedUsers = [];

// Function to check if a user is banned
function isUserBanned(username) {
  return bannedUsers.includes(username);
}

// Function to ban a user
function banUser(username) {
  if (!isUserBanned(username)) {
    bannedUsers.push(username);
    io.emit('chat message', `[Server]: ${username} has been banned.`);
  }
}

// Function to get the list of banned users
function getBanList() {
  return bannedUsers;
}

io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    // Check if the message is a ban command
    if (msg.startsWith('/ban')) {
      // Extract the username from the message
      const [, usernameToBan] = msg.split(' ');

      if (socket.isAdmin) {
        // Only admins can use the ban command
        banUser(usernameToBan);
      } else {
        io.emit('chat message', `[Server]: Only admins can use the /ban command.`);
      }
    } else if (msg === '/banlist' && socket.isAdmin) {
      // Check if the message is a banlist command
      const banList = getBanList();
      io.emit('chat message', `[Server]: Banned users: ${banList.join(', ')}`);
    } else if (isUserBanned(socket.username)) {
      // If the user is banned, prevent them from sending messages
      socket.emit('chat message', '[Server]: You have been banned.');
    } else {
      // Regular chat message
      io.emit('chat message', `${socket.username || 'Anonymous'}: ${msg}`);
    }
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      io.emit('chat message', `[Server]: ${socket.username} has left the chat.`);
    }
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
