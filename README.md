# Anonymous Memer Bot

A simple, privacy-first Discord meme bot. Upload an image, select position, box color, and font, add your text, and get a clean meme back. Everything processed in-memory.

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

## The Tracking Exploits This Project Addresses

**EXIF Metadata**
Image files, particularly JPEGs, embed metadata at the time of capture. This includes GPS coordinates, device model, timestamp, and software used. This data travels with the image when shared. Canvas re-rendering produces a fresh PNG buffer from pixel data only, leaving none of this behind in the output.

**Share Identifiers**
Platforms like YouTube generate unique identifiers appended to share URLs (e.g. `?si=Aa1Uc_fRHKC0ay85`). These allow the platform to trace propagation back to the original sharer. This bot produces a standalone image with no embedded URLs or platform identifiers.

**Upload Attribution**
When a user uploads an image directly to a platform, that upload is logged under their account. This creates a permanent, traceable link between the user's identity and the content, meaning every person who reshares that meme can be traced back to the original uploader through platform records alone. The bot fetches the source image, re-renders it through canvas, and posts the output under the bot's identity. The authored artifact in the channel has no user attribution.

**Account Association**
Memes shared directly from a personal account carry an implicit identity chain — account → upload → content. The bot breaks this by acting as a neutral publisher. The output exists independently of who requested it.

## Identity Proxy

The bot functions as an identity proxy. It stands between the user and the output, absorbing authorship of the final artifact. From the perspective of anyone viewing the channel, the platform's CDN, or the image file itself, the bot made this. That separation is the core mechanism. The user interacts privately through Discord's ephemeral interaction system, and what surfaces publicly is a clean image authored by a bot account with no thread back to the requester.

## Zero Footprint Experiment

This bot is an early experiment in zero footprint (ZF) architecture, a lightweight, practical approach to privacy that achieves meaningful outcomes through minimization and non-retention.

The philosophy: if it doesn't exist then it can't be exposed.

**What each part of this bot is zero-footprinting:**

- **Session state (Map)** — User session data exists only in memory, keyed temporarily during the interaction. It is deleted immediately on completion. There is no database, file write, or log entry tied to the user.
- **Image processing (canvas)** — The source image is never stored. It is fetched into a buffer, processed, and the buffer is discarded after output. The re-render strips all metadata by construction.
- **Output (PNG buffer)** — The finished meme is handed directly to Discord as a buffer. It is never written to disk on the bot's side.
- **Cleanup interval** — Abandoned sessions are cleared on a timed interval. No orphaned data persists beyond the session window.

## Platform Limitations and Known Gaps

This bot operates on Discord, which is a centralized platform with its own logging and infrastructure. These gaps are known and accepted.

**Discord CDN caching**
When a user uploads an image to Discord, it is hosted temporarily on Discord's CDN before the bot fetches it. Discord retains that upload according to their own data policies. This is outside the bot's control. The surface is reduced, the bot does not retain it, but it is not entirely eliminated.

**Platform-level correlation**
Discord can internally correlate interaction events to accounts. The bot does not expose this and does not contribute to it, but it cannot prevent what the platform itself observes. A `/memer` invocation does not produce a visible message in the channel, and the bot logs nothing. What Discord retains on their end is a platform concern, not a bot concern.

**Third-party logging bots**
Servers running audit or moderation bots may capture interaction events independently. This is a server configuration concern. A server that deploys this bot in the spirit it was built would not run conflicting surveillance tooling.

The output meme is posted by the bot, carries no source metadata, and the bot retains nothing about who created it.

## Forking

This is open source and you are free to fork it. A few notes if you do:

- Do not add analytics, telemetry, or external logging. It directly contradicts what this project is (unless you just want a dank memer.)
- Do not add persistent storage for sessions or user data. Keep it in-memory.
- Do not add third-party tracking dependencies.
- If you extend it, extend the ZF principle with it. Rate limiting, concurrency controls, and input validation are all compatible with zero footprint architecture.

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
