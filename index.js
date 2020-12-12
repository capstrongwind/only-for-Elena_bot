const { options } = require('superagent');
const { Telegraf } = require('telegraf');
const session = require('telegraf/session')
const createPoll = require('./request/createPoll');
const createAnswer = require('./request/createAnswer');

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
bot.command('/create', (ctx) => {
  ctx.session.step = 'create';
  return ctx.reply('Ну давай свой вопрос.');
})
bot.command('send', (ctx) => {
  ctx.reply('Получаем последний сделанный опрос');
  ctx.reply('Шлем в тот канал');
  ctx.telegram.sendMessage(idChannel, "Ваш опрос красавчики!")
  return ctx.reply('Шикос');
})

bot.on('text', (ctx) => {
  // TODO do it with SCENE... after
  let text = ''
  switch (ctx.session.step) {
    case 'create': {
      text = `Вопрос: ${ctx.message.text}`;
      ctx.session.step = 'createAnswer';
      createPoll(text)
        .then(ans => {
          if (ans && ans.pollId && ans.qweId) {
            ctx.session.pollId = ans.pollId;
            ctx.session.qweId = ans.qweId;
            ctx.reply("Нормалды все сохранилось! Пиши теперь ответы")
          } else {
            ctx.reply("че-то не получилось")
          }
        });
      break;
    }
    case 'createAnswer': {
      text = `Вариант ответа: ${ctx.message.text}`;
      createAnswer(ctx.session.pollId, ctx.session.qweId, ctx.message.text)
        .then(ans => {
          if (ans) {
            ctx.reply("Нормалды все сохранилось! Давай еще вариантов, или отправляй в канал /send")
          } else {
            ctx.reply("че-то не получилось")
          }
        });
      break;
    }
    default: {
      return ctx.reply('ЧЁ????');
    }
  }
  // send to API!

  // ctx.telegram.sendMessage(idChannel, text)
  return ctx.reply(text);
})



bot.launch()