const { options } = require('superagent');
const { Telegraf } = require('telegraf');
const { Router, Markup } = Telegraf;
const session = require('telegraf/session')

const idChannel = -1001169347047;
const tokenBot = '1421299207:AAGet9IZPonFC3Eo77xGWp45MH-eyTRFRWw';


const bot = new Telegraf(tokenBot, {
    channelMode: true,
})

bot.start(ctx => ctx.reply(`
    Привет ${ctx.from.first_name}! Набери /start для запуска опроса, у тебя будет 3 секунды чтобы ответить, не задумывайся!"
`))
bot.catch((err, ctx) => {
    console.log(`Ooops, encountered an error for ${ctx.updateType}`, err)
})

bot.use(session())
bot.command('/create', (ctx) => {
    ctx.session.step = 'create';
})
bot.command('send', (ctx) => {
    ctx.reply('Получаем последний сделанный опрос');
    ctx.reply('Шлем в тот канал');
    ctx.telegram.sendMessage(idChannel, "Ваш опрос красавчики!")
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
    // TODO do it with SCENE... after
    let text = ''
    switch (ctx.session.step) {
        case 'create': {
            text = `Вопрос: ${ctx.message.text}`;
            ctx.session.step = 'createAnswer';
            break;
        }
        case 'createAnswer': {
            text = `Вариант ответа: ${ctx.message.text}`;
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
