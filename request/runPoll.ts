const axios = require('axios');


const createAnswer = function (pollId, questionId, text) {
  return axios.post('http://172.104.236.107:8080/telegram/data/answer', {
    pollId,
    questionId,
    content: text,
  })
    .then(function (response) {
      if (response.status === 200) {
        return response.data
      }
      throw Error('not 200 status')
    })
    .catch(function (error) {
      console.log(error);
    });
}

module.exports = createAnswer;