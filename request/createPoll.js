const axios = require('axios');

const url = 'http://172.104.236.107:8080';


const createQuestion = function (pollId, text) {
  return axios.post(`${url}/telegram/data/question`, {
    content: text,
    pollId,
  })
    .then(function (response) {
      if (response.status === 200) {
        return { pollId, qweId: response.data }
      }
      throw Error('not 200 status')
    })
    .catch(function (error) {
      console.log(error);
    });
}

const createPoll = function (text) {
  return axios.post(`${url}/telegram/data/poll`, {
    pollName: text,
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

const create = function (text) {
  return createPoll(text)
    .then(pollId => createQuestion(pollId, text))
}



module.exports = create;