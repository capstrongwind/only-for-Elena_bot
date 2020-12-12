const { options } = require('superagent');
const { Telegraf } = require('telegraf');
const session = require('telegraf/session')
const createPollStage = require('./somePart/createPoll');

const idChannel = -1001169347047;
const tokenBot = '1421299207:AAGet9IZPonFC3Eo77xGWp45MH-eyTRFRWw';


const bot = new Telegraf(tokenBot, {
  channelMode: true,
})

bot.use(session())

bot.start(ctx => ctx.reply(`
    Привет ${ctx.from.first_name}!"
`))
bot.catch((err, ctx) => {
  console.log(`Ooops, encountered an error for ${ctx.updateType}`, err)
})

bot.command('/create', (ctx) => {
  ctx.session.step = 'create';
  return ctx.reply('Ну давай свой вопрос, давай удивим всех');
})
bot.command('send', (ctx) => {
  ctx.session.step = 'send';
  ctx.reply('Получаем последний сделанный опрос');
  ctx.reply('Шлем в тот канал');
  ctx.telegram.sendMessage(idChannel, "Ваш опрос красавчики!")
  return ctx.reply('Шикос');
})

bot.on('text', (ctx) => {
  if (['create', 'createAnswer'].includes(ctx.session.step)) {
    createPollStage(ctx)
  } else {
    ctx.reply('Дружок, не тупи. Команды набери /send /create. Че там тебе хочется?');
  }
})



bot.launch()