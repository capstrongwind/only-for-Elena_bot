const {options} = require('superagent');
const {Telegraf} = require('telegraf');
const {Router, Markup} = Telegraf;
const session = require('telegraf/session')
const createPollStage = require('./somePart/createPoll');
const axios = require("axios");

const idChannel = -1001169347047;
const tokenBot = '1462648349:AAH2cuyphuVUU0PkaFblaD_Ea7JPZcNIQNI';


const bot = new Telegraf(tokenBot, {
    channelMode: true,
})

const baseUrl = 'http://172.104.236.107:8080/telegram/data';

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

alreadyAnswered = new Map();

bot.command('gogogo', (ctx) => {
    return axios.get(baseUrl + '/poll/current').then((response) => {
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
                        userId: ctx.from.id, answerId: ctx.update.callback_query.data
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
        ctx.reply('Дружок, не тупи. Команды набери /send /create. Че там тебе хочется?');
    }
})


bot.launch()
