// Require Discord.js and define discord token
const token = 'MTE2NzkwNTgzOTc4NTQ0NzUwNg.GFW-Z5.7jK4eqpij9LKBI2KfIcb_0eZlhkNkCMED-MC5w';
const { Client, Intents, GatewayIntentBits } = require('discord.js');

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ]
});

// When the client is ready, run this code (only once)
client.once('ready', () => {
  console.log(`Ready! Logged in as ${client.user.tag}`);
});

// Listen for messages
client.on('messageCreate', msg => {
  if (msg.content.includes('discord.gg')) {
    // Delete the message
    msg.delete()
      .then(() => {
        // Log the deletion to a specified channel
        const logChannel = client.channels.cache.get('LOG_CHANNEL_ID');
        logChannel.send(`Deleted message from ${msg.author.tag}: ${msg.content}`);
      })
      .catch(console.error);
  }
});

// Log in to Discord with your client's token
client.login(token);