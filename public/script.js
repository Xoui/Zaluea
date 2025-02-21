// JavaScript (client-side)

const socket = io();

let username = localStorage.getItem('username') || prompt('Enter your username: ');
localStorage.setItem('username', username);

socket.emit('username', username);

// Load chat history from local storage
const chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];

// Display past messages
const messagesContainer = document.querySelector('#messages');
chatHistory.forEach((msg) => {
  const item = document.createElement('li');
  item.innerHTML = msg;
  messagesContainer.appendChild(item);
});

document.querySelector('form').addEventListener('submit', function(e) {
  e.preventDefault();
  const message = document.querySelector('#m').value.trim();

  if (message.startsWith('/clear')) {
    // Clear messages locally
    messagesContainer.innerHTML = '';

    // Emit signal to the server to clear messages globally
    socket.emit('clear messages');

    // Update chat history in local storage
    chatHistory.length = 0;
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  } else if (message.startsWith('/rename')) {
    const newName = message.split(' ')[1]; // Extract the new name from the message
    if (newName) {
      socket.emit('rename', newName);
    }
  } else if (message) {
    // Emit raw message to the server
    socket.emit('chat message', message);
  }

  // Scroll to the bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  document.querySelector('#m').value = '';
});

// Handle the 'rename' event from the server
socket.on('rename', function(data) {
  const { oldName, newName } = data;
  // Update the displayed messages when a user changes their name
  document.querySelectorAll('li').forEach((item) => {
    if (item.innerHTML.includes(`${oldName}:`)) {
      item.innerHTML = item.innerHTML.replace(`${oldName}:`, `${newName}:`);
    }
  });
});

socket.on('chat message', function(msg) {
  // Display received message
  const item = document.createElement('li');
  item.innerHTML = msg;
  messagesContainer.appendChild(item);

  // Save received message to chat history in local storage
  chatHistory.push(msg);
  localStorage.setItem('chatHistory', JSON.stringify(chatHistory));

  // Scroll to the bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
});
