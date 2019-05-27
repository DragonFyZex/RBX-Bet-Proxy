const axios = require('axios');
module.exports = async (roblosecurity) => {
    try {
        await axios({
            method: 'post',
            url: 'https://api.roblox.com/sign-out/v1',
            headers: {
              Cookie: roblosecurity
            },
            withCredentials: true
          });
      } catch (e) {
        // this will 100% fail, just need the token
        const XCSRFTOKEN = e.response.headers['x-csrf-token'];
        return XCSRFTOKEN;
    }
};
  