

const axios = require('axios');


const stopPoll = function () {
  return axios.put('http://172.104.236.107:8080/telegram/data/poll/stop')
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

module.exports = stopPoll;