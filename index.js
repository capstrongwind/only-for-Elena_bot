const { options } = require('superagent');
const { Telegraf } = require('telegraf');
const { Router, Markup } = Telegraf;
const session = require('telegraf/session')
const createPollStage = require('./somePart/createPoll');

const idChannel = -1001169347047;
const tokenBot = '1421299207:AAGet9IZPonFC3Eo77xGWp45MH-eyTRFRWw';


const bot = new Telegraf(tokenBot, {
  channelMode: true,
})

bot.use(session())

bot.start(ctx => ctx.reply(`Привет ${ctx.from.first_name}!"`))

bot.catch((err, ctx) => console.log(`Ooops, encountered an error for ${ctx.updateType}`, err))

bot.command('/create', (ctx) => {
  ctx.session.step = 'create';
  return ctx.reply('Ну давай свой вопрос, давай удивим всех');
})

bot.command('/send', (ctx) => {
  ctx.session.step = 'send';
  ctx.reply('Получаем последний сделанный опрос');
  ctx.reply('Шлем в тот канал');
  ctx.telegram.sendMessage(idChannel, "Ваш опрос красавчики!")
  return ctx.reply('Шикос');
})

bot.command('/result', (ctx) => {
  ctx.session.step = 'result';
  ctx.reply('Получаем последние результаты');
  ctx.reply('Шлем в тот канал');
  ctx.telegram.sendMessage(idChannel, "Вот что ответили самые быстрые: \nмаруська любит помидор, \nванька - паровоз")
  return ctx.reply('Шикос');
})

bot.command('gogogo', (ctx) => {

    const question = "Как чё?";

    const answers = [
        {text: 'Че', id: "UUID1"},
        {text: 'Как', id: "UUID2"},
        {text: 'Че Как', id: "UUID3"}
    ]

    const inlineMessageRatingKeyboard = Markup.inlineKeyboard(
        answers.map((answer) => Markup.callbackButton(answer.text, answer.id))).extra()

    const startTime = new Date();

    answers.forEach((answer) => {
        bot.action(answer.id, (ctx) => {
            let timeToAnswer = (new Date() - startTime)/1000;
            if (timeToAnswer < 3) {
                ctx.reply('Красаучег успел!')
            } else {
                ctx.reply('Медаль сутулого слоупоку! Тупил ' + timeToAnswer)
            }
        })
    })

    ctx.telegram.sendMessage(ctx.chat.id, question, inlineMessageRatingKeyboard);
})

bot.on('text', (ctx) => {
  if (['create', 'createAnswer'].includes(ctx.session.step)) {
    createPollStage(ctx)
  } else {
    ctx.reply('Дружок, не тупи. Команды набери /send /create. Че там тебе хочется?');
  }
})



bot.launch()
