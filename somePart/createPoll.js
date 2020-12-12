
const createPoll = require('../request/createPoll');
const createAnswer = require('../request/createAnswer');
const isAdmin = require('../somePart/adminUser')

const createPollStage = function (ctx) {
  if (!isAdmin(ctx)) return ctx.reply('Тормози братуха, тебе сюда нельзя!');
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
            ctx.reply("Notbad, я запомнил. Теперь давай напишем ответы")
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
            ctx.reply("Нормалды все сохранилось! Давай еще вариантов, или отправляй в канал /run")
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
}

module.exports = createPollStage
