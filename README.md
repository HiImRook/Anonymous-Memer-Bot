# Anonymous Memer Bot

A simple, completely anonymous Discord meme bot. Upload an image, select position, box color, and font, add your text, and get a clean meme back. Everything processed in-memory.

## How It Works

`/memer` → upload image → select position, color, font → enter text → done.

The bot is the author, not you. This is the point.

## Features

- Top or bottom text box placement
- Black or white box with automatic contrast text
- 20 font options
- Text auto-scales and wraps to fit the box
- Shift+Enter support for line breaks
- Output is a clean PNG with no source metadata

## Privacy

Image metadata, platform upload records, and account associations can all be used to trace a meme back to its creator. Canvas processing produces a clean output with none of the source file's identifying information. Session data is processed in-memory and cleared immediately after the meme is generated.

## Quick Start

```bash
git clone https://github.com/HiImRook/Anonymous-Memer-Bot.git
cd Anonymous-Memer-Bot
npm install
```

Create a `.env` file in the project root. This file holds your bot token and is excluded from version control by `.gitignore`:

```
DISCORD_TOKEN=your_token_here
```

Run:

```bash
node bot.js
```

## Discord Bot Setup

- Enable `Message Content Intent` in the Discord Developer Portal
- OAuth2 scopes: `bot` + `applications.commands`
- Permissions: Send Messages, Attach Files, Use Slash Commands, Read Message History

## Architecture

**In-Memory State:**
Session data is stored in a Map and cleared immediately after each meme is generated. A cleanup interval handles any abandoned sessions.

## Stack

- Node.js
- discord.js v14
- node-canvas
- dotenv

## Related Projects

- **Valid Blockchain:** https://github.com/HiImRook/accessible-pos-chain
- **K.E.V.I.N. AI Agent:** https://github.com/HiImRook/K.E.V.I.N.

## License

MIT License — See LICENSE file

Copyright (c) 2025-2026 Rook
