let Discord = require('discord.js')
const client = new Discord.Client();
let request = require('request');

let auth = require('./auth.json');

const img = 'https://i.imgur.com/IcrST7s.jpg';
const img2 = 'https://i.imgur.com/3ktz5Ql.jpg';
const botname = 'site-bot';
const emojiList = {
    leftArrow: "⬅",
    rightArrow: "➡"
};

class Bot {
    constructor(){
        this.albumDict = {};
    }

    initialize() {
        client.on('message', message => {
            if (message.content.startsWith('album')) {
                message.channel.send('CREATEIMG')
                .then((sentMessage) => {
                    this.populateAlbum(message, sentMessage);
                });
            }
            if (message.author.username === botname) {
                this.handleBotMessage(message);
            }
        });
        
        client.login(auth.discord.auth_token);
    }
    
    handleBotMessage(message) {
        if (message.content !== 'CREATEIMG') {
            return;
        }
        this.addReactions(message);
        this.createReactionCollector(message);
    }

    addReactions(message) {
        message.clearReactions()
        .then(() => {
        message.react(emojiList.leftArrow)
        .then(() => {
        message.react(emojiList.rightArrow);
        })});
    }

    createReactionCollector(message) {
        const filter = (reaction, user) => (reaction.emoji.name === emojiList.leftArrow || reaction.emoji.name === emojiList.rightArrow) && user.username !== botname;
        const collector = message.createReactionCollector(filter);
        collector.on('collect', r => this.emojiCollected(message, r.emoji.name));
    }

    emojiCollected(message, emojiName) {
        if (emojiName === emojiList.leftArrow) {
            this.handleLeftArrow(message);
        } else if (emojiName === emojiList.rightArrow) {
            this.handleRightArrow(message);
        }
        this.addReactions(message);
    }

    handleLeftArrow(message) {
        let imagesData = this.albumDict[message.id];
        console.log(imagesData);
        let numImages = imagesData.images.length;
        let current = imagesData.current;
        current = this.adjustImageIndex(current, -1, numImages);
        this.albumDict[message.id].current = current;
        message.edit(imagesData.images[current].link);
    }

    handleRightArrow(message) {
        let imagesData = this.albumDict[message.id];
        let numImages = imagesData.images.length;
        let current = imagesData.current;
        current = this.adjustImageIndex(current, 1, numImages);
        this.albumDict[message.id].current = current;
        message.edit(imagesData.images[current].link);
    }

    adjustImageIndex(index, shift, modulo) {
        let final = index + shift + modulo;
        final = final % modulo;
        return final;
    }

    // TODO: Add support for galleries
    // const url = 'https://api.imgur.com/3/gallery/album/vgW1p';
    // const url2 = 'https://api.imgur.com/3/album/vtJCJ';

    populateAlbum(message, sentMessage) {
        let input = message.content.split(' ');
        if (input.length !== 2) {
            return;
        }

        let albumLink = input[1];
        this.retrieveImagesFromUrl(albumLink, sentMessage);
    }

    retrieveImagesFromUrl(albumLink, sentMessage) {
        const options = {
            url: albumLink,
            headers: {
                'Authorization': auth.imgur.auth_header
            }
        };
        request.get(options, (err, res, body) => {
            if (err) {
                console.log('imgur request error:', err);
                return;
            }
            let parsed = JSON.parse(body);
            this.albumDict[sentMessage.id] = { images: parsed.data.images, current: 0 };
        });
    }

}

function start() {
    let bot = new Bot();
    bot.initialize();
}

start();