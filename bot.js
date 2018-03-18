const Discord = require('discord.js');
const client = new Discord.Client();
const request = require('request');
const auth = require('./auth.json');

const botUsername = auth.discord.bot_name;
const createImage = 'CREATE_IMG'
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
            if (message.content.startsWith('!')) {
                this.handleCommand(message);
            }
            if (message.author.username === botUsername) {
                this.handleBotMessage(message);
            }
        });
        
        client.login(auth.discord.auth_token);
    }
    
    handleCommand(message) {
        let input = message.content.split(' ');
        if (input.length !== 2) {
            return;
        }

        if (input[0] == '!album') {
            message.channel.send(createImage)
            .then((sentMessage) => {
                this.populateAlbum(input[1], sentMessage);
            });
        }
    }

    handleBotMessage(message) {
        if (message.content !== createImage) {
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
        const filter = (reaction, user) => (reaction.emoji.name === emojiList.leftArrow || reaction.emoji.name === emojiList.rightArrow)
                                            && user.username !== botUsername;
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
        let numImages = imagesData.images.length;
        let current = imagesData.current;
        current = this.adjustImageIndex(current, -1, numImages);
        this.albumDict[message.id].current = current;
        this.editDisplayImage(message, imagesData.images[current].link);
        // message.edit(imagesData.images[current].link);
    }

    handleRightArrow(message) {
        let imagesData = this.albumDict[message.id];
        let numImages = imagesData.images.length;
        let current = imagesData.current;
        current = this.adjustImageIndex(current, 1, numImages);
        this.albumDict[message.id].current = current;
        this.editDisplayImage(message, imagesData.images[current].link);
        // message.edit(imagesData.images[current].link);
    }

    adjustImageIndex(index, shift, modulo) {
        let final = index + shift + modulo;
        final = final % modulo;
        return final;
    }

    editDisplayImage(message, link) {
        message.edit(link);
    }

    // TODO: Add support for galleries
    // const url = 'https://api.imgur.com/3/gallery/album/vgW1p';
    // const url2 = 'https://api.imgur.com/3/album/vtJCJ';

    populateAlbum(albumLink, sentMessage) {
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
            // Set the default displayed image to the first image
            this.albumDict[sentMessage.id] = { images: parsed.data.images, current: 0 };
            this.editDisplayImage(sentMessage, this.albumDict[sentMessage.id].images[0].link);
        });
    }

}

function start() {
    let bot = new Bot();
    bot.initialize();
}

start();