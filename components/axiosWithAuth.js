const axios = require('axios');

function axiosWithAuth(user_id, tokens){
    const token = tokens.filter(obj => obj[user_id])[0];

    return axios.create({
        baseURL: 'https://ddq.herokuapp.com/api/',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${token[user_id]}`,
        },
    });
};

module.exports = axiosWithAuth;