const { Telegraf, Markup } = require('telegraf')
const { message } = require('telegraf/filters')

const { telegram, config } = require('./config/config.json')
const { torrentsGetInfo } = require('./src/qbit-torrent')
const { lookUpByName, importMovie } = require('./src/radarr-api')

let bot 
let watchIntervalId
let list

function init() {
  console.log('Bot started')
  bot = new Telegraf(telegram.botToken)

  /*
  * handle start command
  */
  bot.start(ctx => {
    const from = ctx.update.message.from
    if (verify(ctx)) {
      ctx.reply(`Welcome ${from.first_name || from.username}`)
    } else {
      ctx.reply('You are not authorized to use this bot')
    }
  })

  bot.help((ctx) => ctx.reply('Help isn\'t ready yet :('))

  bot.command('search',async ctx => {
    if (verify(ctx)) {
      const name = ctx.update.message.text.replace('/search', '').trim()
      console.log('lookup for - ', name)
      try {
        list = await lookUpByName(name)
      } catch (err) {
        console.log(err)
        return ctx.reply('Error searching for movie')
      }
      
      return ctx.reply('Search result', {
        parse_mode: 'MarkdownV2',
        ...Markup.inlineKeyboard([
          ...list.map(movie => {
            return [
              Markup.button.callback(
                `${movie.title} ${movie.year} ${movie.ratings?.imdb?.value}`,
                `select:${movie.tmdbId}`,
              )
            ]
          })
        ]).resize()
      })
    }
  })

  bot.on('callback_query', async (ctx) => {
    const [command, tmdbId] = ctx.callbackQuery.data.split(':')
    const movie = list.find(m => m.tmdbId === Number(tmdbId))

    switch(command) {
      case 'select':
        console.log('select', movie.title)
        ctx.replyWithPhoto({
          url: movie.remotePoster,
        }, {
          caption: `${movie.title} ${movie.year}\n${movie.overview}`,
          parse_mode: 'HTML',
          ...Markup.inlineKeyboard([
            Markup.button.callback('ADD', `add:${tmdbId}`),
          ])
        })
        break
      case 'add':
        console.log('add', movie.title)
        try {
          await importMovie(movie)
          ctx.reply('Movie added')
        } catch (err) {
          console.log(err)
          ctx.reply('Error adding movie')
        }
    }
  })

  bot.launch()

  torrentsWatcher()
}

function destroy () {
  clearInterval(watchIntervalId)
  watchIntervalId = null
  console.log('Bot stopped')
}

function torrentsWatcher () {
  let lastCheck = Date.now()
  watchIntervalId = setInterval(async () => {
    try {
      const completed = await torrentsGetInfo(lastCheck)
      lastCheck = Date.now()
      if (completed.length) {
        console.log('Completed torrents', completed)
        
        completed.forEach(torrent => {
          const message = `Torrent ${torrent.name} completed`;
          bot.telegram.sendMessage(telegram.chatId, message);
        });
      }
    } catch(err) {
      console.log('watchInterval', err)
    }
  }, config.watchInterval)
}

function verify(ctx) {
  const chat = ctx.update.message.chat
  if (chat.id === telegram.chatId) {
    return true
  } else {
    ctx.reply('You are not authorized to use this bot')
    return false
  }
}

// init bot
init()

// Enable graceful stop
process.once('SIGINT', () => {
  destroy()
  bot.stop('SIGINT')
})

process.once('SIGTERM', () => {
  destroy()
  bot.stop('SIGTERM')
})
