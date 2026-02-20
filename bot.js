const { Client, GatewayIntentBits, SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js')
const { createCanvas, loadImage } = require('canvas')
require('dotenv').config()

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
})

const FONT_OPTIONS = [
  { label: 'Impact', value: 'Impact' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Arial Black', value: 'Arial Black' },
  { label: 'Comic Sans MS', value: 'Comic Sans MS' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Courier New', value: 'Courier New' },
  { label: 'Verdana', value: 'Verdana' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Trebuchet MS', value: 'Trebuchet MS' },
  { label: 'Tahoma', value: 'Tahoma' },
  { label: 'Helvetica', value: 'Helvetica' },
  { label: 'Palatino', value: 'Palatino' },
  { label: 'Garamond', value: 'Garamond' },
  { label: 'Bookman', value: 'Bookman' },
  { label: 'Lucida Sans', value: 'Lucida Sans' },
  { label: 'Monaco', value: 'Monaco' },
  { label: 'Copperplate', value: 'Copperplate' },
  { label: 'Papyrus', value: 'Papyrus' },
  { label: 'Brush Script MT', value: 'Brush Script MT' },
  { label: 'Luminari', value: 'Luminari' },
]

const pendingMemes = new Map()

const SESSION_CLEANUP_INTERVAL = 10 * 60 * 1000
const SESSION_MAX_AGE = 15 * 60 * 1000

async function createMeme(imageUrl, position, color, text, fontChoice) {
  try {
    const response = await fetch(imageUrl)
    const arrayBuffer = await response.arrayBuffer()
    const imageBuffer = Buffer.from(arrayBuffer)

    const image = await loadImage(imageBuffer)
    const { width, height } = image

    const boxHeight = Math.round(height * 0.50)
    const totalHeight = height + boxHeight

    const canvas = createCanvas(width, totalHeight)
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = color === 'black' ? '#000000' : '#ffffff'

    if (position === 'top') {
      ctx.fillRect(0, 0, width, boxHeight)
      ctx.drawImage(image, 0, boxHeight)
    } else {
      ctx.drawImage(image, 0, 0)
      ctx.fillRect(0, height, width, boxHeight)
    }

    const padding = 20
    const maxWidth = width - (padding * 2)
    const maxHeight = boxHeight - (padding * 2)
    const boxY = position === 'top' ? 0 : height

    ctx.fillStyle = color === 'black' ? '#ffffff' : '#000000'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const selectedFont = fontChoice && fontChoice !== 'default' ? fontChoice : 'Impact'
    let fontSize = Math.round(boxHeight * 0.35)
    const minFontSize = 12

    while (fontSize >= minFontSize) {
      ctx.font = `${fontSize}px "${selectedFont}"`

      const lines = text.split('\n')
      const wrappedLines = []

      for (const line of lines) {
        if (line.trim() === '') {
          wrappedLines.push('')
          continue
        }
        const words = line.split(' ')
        let currentLine = ''
        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word
          if (ctx.measureText(testLine).width > maxWidth && currentLine) {
            wrappedLines.push(currentLine)
            currentLine = word
          } else {
            currentLine = testLine
          }
        }
        if (currentLine) wrappedLines.push(currentLine)
      }

      const lineHeight = fontSize * 1.2
      const totalTextHeight = wrappedLines.length * lineHeight

      if (totalTextHeight <= maxHeight) {
        const startY = boxY + (boxHeight / 2) - (totalTextHeight / 2) + (lineHeight / 2)
        wrappedLines.forEach((line, index) => {
          ctx.fillText(line, width / 2, startY + (index * lineHeight))
        })
        break
      }

      fontSize -= 2
    }

    return { buffer: canvas.toBuffer('image/png') }
  } catch (error) {
    console.error('CreateMeme Error:', error)
    return { error: `Error processing image: ${error.message}` }
  }
}

function cleanupSessions() {
  const now = Date.now()
  for (const [userId, data] of pendingMemes) {
    if (now - data.timestamp > SESSION_MAX_AGE) {
      pendingMemes.delete(userId)
    }
  }
}

const memerCommand = new SlashCommandBuilder()
  .setName('memer')
  .setDescription('Create a meme with text box')
  .addAttachmentOption((option) =>
    option
      .setName('image')
      .setDescription('Upload a .png, .jpg, or .webp image')
      .setRequired(true)
  )

client.once('ready', async () => {
  try {
    console.log(`Logged in as ${client.user.tag}`)
    await client.application.commands.set([memerCommand])
    console.log('Slash command registered')
    setInterval(cleanupSessions, SESSION_CLEANUP_INTERVAL)
    client.user.setPresence({ activities: [{ name: 'Meme Maker', type: 'PLAYING' }], status: 'online' })
  } catch (error) {
    console.error('Ready Event Error:', error)
  }
})

client.on('error', (error) => {
  console.error('Client Error:', error)
})

client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isCommand() && interaction.commandName === 'memer') {
      const attachment = interaction.options.getAttachment('image')
      if (!attachment || (!attachment.contentType.startsWith('image/png') && !attachment.contentType.startsWith('image/jpeg') && !attachment.contentType.startsWith('image/webp'))) {
        await interaction.reply({ content: '❌ Please upload a valid .png, .jpg, or .webp image.', ephemeral: true })
        return
      }

      pendingMemes.set(interaction.user.id, { imageUrl: attachment.url, timestamp: Date.now() })

      const row1 = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('meme_position')
          .setPlaceholder('Select text box position')
          .addOptions([
            { label: 'Top', value: 'top' },
            { label: 'Bottom', value: 'bottom' }
          ])
      )

      const row2 = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('meme_color')
          .setPlaceholder('Select box color')
          .addOptions([
            { label: 'Black', value: 'black' },
            { label: 'White', value: 'white' }
          ])
      )

      const row3 = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('meme_font')
          .setPlaceholder('Select font')
          .addOptions(FONT_OPTIONS)
      )

      await interaction.reply({
        content: 'Select your meme settings:',
        components: [row1, row2, row3],
        ephemeral: true
      })
    }

    if (interaction.isStringSelectMenu()) {
      const memeData = pendingMemes.get(interaction.user.id)
      if (!memeData) {
        await interaction.reply({ content: '❌ Session expired. Please run /memer again.', ephemeral: true })
        return
      }

      if (interaction.customId === 'meme_position') {
        memeData.position = interaction.values[0]
        await interaction.update({ content: `Position: **${interaction.values[0]}**\nSelect color and font, then enter text.`, components: interaction.message.components })
      } else if (interaction.customId === 'meme_color') {
        memeData.color = interaction.values[0]
        await interaction.update({ content: `Color: **${interaction.values[0]}**\nSelect position and font, then enter text.`, components: interaction.message.components })
      } else if (interaction.customId === 'meme_font') {
        memeData.font = interaction.values[0]

        if (memeData.position && memeData.color) {
          const modal = new ModalBuilder()
            .setCustomId('meme_text_modal')
            .setTitle('Enter Meme Text')

          const textInput = new TextInputBuilder()
            .setCustomId('meme_text')
            .setLabel('Meme Text (Shift+Enter for new line)')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)

          modal.addComponents(new ActionRowBuilder().addComponents(textInput))
          await interaction.showModal(modal)
        } else {
          await interaction.update({ content: `Font: **${interaction.values[0]}**\nSelect position and color, then enter text.`, components: interaction.message.components })
        }
      }
    }

    if (interaction.isModalSubmit() && interaction.customId === 'meme_text_modal') {
      const memeData = pendingMemes.get(interaction.user.id)
      if (!memeData) {
        await interaction.reply({ content: '❌ Session expired. Please run /memer again.', ephemeral: true })
        return
      }

      await interaction.deferReply()

      const text = interaction.fields.getTextInputValue('meme_text')
      const { buffer, error } = await createMeme(memeData.imageUrl, memeData.position, memeData.color, text, memeData.font || 'Impact')

      pendingMemes.delete(interaction.user.id)

      if (error) {
        await interaction.editReply({ content: `❌ ${error}` })
        return
      }

      await interaction.editReply({ files: [{ attachment: buffer, name: 'meme.png' }] })
    }

  } catch (error) {
    console.error('Interaction Error:', error)
    if (interaction.deferred) {
      await interaction.editReply({ content: '❌ An error occurred while processing the image.' })
    } else if (!interaction.replied) {
      await interaction.reply({ content: '❌ An error occurred while processing the image.', ephemeral: true })
    }
  }
})

const TOKEN = process.env.DISCORD_TOKEN
try {
  client.login(TOKEN)
} catch (error) {
  console.error('Login Error:', error)
}
