const axios = require('axios');

module.exports = async function query(q, method, params = {}) {
    let result;
    if (method === 'GET') {
        result = await axios.get(q);
    } else if (method === 'POST') {
        result = await axios.post(q, params);
    }

    if (result.status === 200) {
        return result.data;
    } else {
        return false;
    }
}