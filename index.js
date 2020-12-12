const { options } = require('superagent');
const { Telegraf } = require('telegraf');
const session = require('telegraf/session')

const idChannel = -1001169347047;
const tokenBot = '1421299207:AAGet9IZPonFC3Eo77xGWp45MH-eyTRFRWw';


const bot = new Telegraf(tokenBot, {
    channelMode: true,
})

bot.start(ctx => ctx.reply(`
    Привет ${ctx.from.first_name}!"
`))
bot.catch((err, ctx) => {
    console.log(`Ooops, encountered an error for ${ctx.updateType}`, err)
  })

bot.use(session())
bot.on('text', (ctx) => {
  ctx.session.counter = ctx.session.counter || 0
  ctx.session.counter++
  ctx.telegram.sendMessage(idChannel, 'jhjhj')
  return ctx.reply(`Message counter:${ctx.session.counter} ${ctx.message.chat.id}`)
})
bot.action('create', (ctx) => {
    console.log(`Ooops`) 
})

bot.launch()