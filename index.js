const { Telegraf } = require('telegraf');
const { Router, Markup } = Telegraf;
const session = require('telegraf/session')
const createPollStage = require('./somePart/createPoll');
const isAdmin = require('./somePart/adminUser');

const idChannel = -1001169347047;
const tokenBot = '1421299207:AAGet9IZPonFC3Eo77xGWp45MH-eyTRFRWw';
const errorNotAdmin = 'Стопендра, тебе сюда нельзя!';

const bot = new Telegraf(tokenBot, {
  channelMode: true,
})

bot.use(session())

bot.start(ctx => ctx.reply(`Привет ${ctx.from.first_name}!"`))

bot.catch((err, ctx) => console.log(`Ooops, encountered an error for ${ctx.updateType}`, err))

bot.command('/create', (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply(errorNotAdmin);
  ctx.session.step = 'create';
  return ctx.reply('Ну давай свой вопрос, удивим всех');
})

bot.command('/run', (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply(errorNotAdmin);
  ctx.session.step = 'run';
  
  return ctx.reply('Запускаем, детка. Держись!!!');
})

bot.command('/stop', (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply(errorNotAdmin);
  ctx.session.step = 'stop';
  
  return ctx.reply('Все опрос закрыт, больше никто никогда ничего не изменит! Ты красава в любом случае');
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
    ctx.reply('Дружок, не тупи. Команды набери /create. Че там тебе хочется?');
  }
})



bot.launch()
