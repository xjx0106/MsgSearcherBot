const TelegramBot = require('node-telegram-bot-api');

const TELEGRAM_BOT_TOKEN = require("./token.js");

// Create a bot that uses 'polling' to fetch new updates
module.exports = new TelegramBot(TELEGRAM_BOT_TOKEN, {
  polling: true
});

require('./src/seacher');