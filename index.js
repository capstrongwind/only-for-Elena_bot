const { Telegraf } = require('telegraf');
const { Router, Markup } = Telegraf;
const session = require('telegraf/session')
const createPollStage = require('./somePart/createPoll');
const axios = require("axios");
const isAdmin = require('./somePart/adminUser');
const startPoll = require('./request/startPoll');
const stopPoll = require('./request/stopPoll');
const showResult = require('./request/showResult');


// const idChannel = -1001169347047;
const tokenBot = '1421299207:AAGet9IZPonFC3Eo77xGWp45MH-eyTRFRWw';
const errorNotAdmin = 'Стопендра, тебе сюда нельзя!';

const bot = new Telegraf(tokenBot, {
  channelMode: true,
})

const baseUrl = 'http://172.104.236.107:8080/telegram/data';

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
  startPoll()
    .then(() => {
      ctx.reply('Запускаем, детка. Держись!!!');
    })
})

bot.command('/stop', (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply(errorNotAdmin);
  ctx.session.step = 'stop';
  stopPoll()
    .then(() => {
      ctx.reply('Все опрос закрыт, больше никто никогда ничего не изменит! Ты красава в любом случае');
    })
})

bot.command('/result', (ctx) => {
  ctx.session.step = 'result';
  showResult()
    .then(data => {
      const text = data.questionToAnswerResponses.map(i => {
        return `${i.userId} - ${i.answerContent}\n`;
      })
      ctx.reply(`Вот что ответили самые быстрые:\n${data.questionToAnswerResponses[0].questionContent}\n ${text.join('')}`);
    })
})

alreadyAnswered = new Map();

bot.command('gogogo', (ctx) => {
    return axios.get(baseUrl + '/poll/current').then((response) => {
        if (response.data.status !== 'ACTIVE') {
            ctx.reply("Иди своей дорогой сталкер, тут нет ни одного активного опроса");
            return;
        }

        const question = response.data.questions[0];

        const questionText = question.content;
        const answers = question.answers.map((answer) =>({text: answer.content, id: answer.id}));

        const inlineMessageRatingKeyboard = Markup.inlineKeyboard(
            answers.map((answer) => Markup.callbackButton(answer.text, answer.id))).extra()

        ctx.session.startTime = new Date()

        answers.forEach((answer) => {
            bot.action(answer.id, (ctx) => {

                const usersAnsweredToQuestion = alreadyAnswered.get(question.id);
                if (usersAnsweredToQuestion && usersAnsweredToQuestion.includes(ctx.from.id)) {
                    ctx.reply("Воу воу палехче низя многа раз");
                    return;
                }


                if (usersAnsweredToQuestion) {
                    usersAnsweredToQuestion.push(ctx.from.id)
                } else {
                    alreadyAnswered.set(question.id, [ctx.from.id]);
                }

                let timeToAnswer = (new Date() - ctx.session.startTime) / 1000;
                if (timeToAnswer < 3) {
                    axios.post(baseUrl + '/bind/answer', {
                        userId: `${ctx.from.username} ${ctx.from.first_name} ${ctx.from.last_name}`, answerId: ctx.update.callback_query.data
                    })
                    ctx.reply('Красаучег успел!')
                    delete ctx.session.startTime;
                } else {
                    ctx.reply('Медаль сутулого слоупоку! Тупил ' + timeToAnswer)
                }
            })
        })

        ctx.telegram.sendMessage(ctx.chat.id, questionText, inlineMessageRatingKeyboard);
    }).catch((error) => console.error(error));
})

bot.on('text', (ctx) => {
  if (['create', 'createAnswer'].includes(ctx.session.step)) {
    createPollStage(ctx)
  } else {
    ctx.reply('Дружок, не тупи. Команды набери /create. Че там тебе хочется?');
  }
})



bot.launch()
