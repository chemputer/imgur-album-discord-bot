# imgur-album-discord-bot
Discord bot to automatically import imgur albums

## Intro

I wanted to learn how to build a discord bot and learn how to use react emojis to capture user inputs.
I decided to go with implementing a discord bot that automatically parsed through an imgur album and
displayed its images with a way to use discord emojis to scroll through them.

Here's how the final result looks.

![dog1](https://i.imgur.com/LCBOYyz.png "Example 1")
![dog2](https://i.imgur.com/bTg8YYR.gifv "Example 2")

Clicking on the emoji arrows scrolls through the images in the album.

## Start

1. Clone this repo
2. Run `npm install`
3. Register for the imgur API, and add the auth info to `auth.json`
4. Register for the discord API, create a bot and add the auth info to `auth.json`
5. Invite the bot to your discord server
6. Run the bot with `node bot.js`
7. Access album by typing the command `!album https://api.imgur.com/3/album/vtJCJ`