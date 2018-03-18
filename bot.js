const Discord = require('discord.js');
const client = new Discord.Client();
const request = require('request');

const auth = require('./auth.json');

const img = 'https://i.imgur.com/IcrST7s.jpg';
const img2 = 'https://i.imgur.com/3ktz5Ql.jpg';
const botname = 'site-bot';

client.on('message', message => {
    if (message.content === 'ping') {
        message.channel.send('CREATEIMG');
        // message.react("👍");
    }
    if (message.author.username === botname) {
        handleBotMessage(message);
    }
});

client.login(auth.discord.auth_token);


function handleBotMessage(message) {
    if (message.content !== 'CREATEIMG') {
        return;
    }
    addReactions(message);
    createReactionCollector(message);
}

function addReactions(message) {
    message.clearReactions().then(() => {
        message.react("⬅");
        message.react("➡");
    });
}

function createReactionCollector(message) {
    const filter = (reaction, user) => (reaction.emoji.name === '⬅' || reaction.emoji.name === '➡') && user.username !== botname;
    const collector = message.createReactionCollector(filter);
    collector.on('collect', r => emojiCollected(message, r.emoji.name));
}

function emojiCollected(message, emojiName) {
    console.log('sitelog test collect?');
    if (emojiName === '⬅') {
        message.edit(img);
    } else if (emojiName === '➡') {
        message.edit(img2);
    }
    addReactions(message);
}

// TODO: Add support for galleries
// const url = 'https://api.imgur.com/3/gallery/album/vgW1p';
const url = 'https://api.imgur.com/3/album/vtJCJ';
const options = {
    url: url,
    headers: {
        'Authorization': auth.imgur.auth_header
    }
};

request.get(options, (err, res, body) => {
    var parsed = JSON.parse(body);
    initializeGallery(parsed.data.images);
});

function initializeGallery(imageList) {
    for (image in imageList) {
        console.log(imageList[image].link);
    }
}