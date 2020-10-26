import axios from 'axios';

const response = function (request, response) {
    let body = '';

    request.on('data', function (data) {
      body += data;

      let headers = {
        'Content-Type': 'application/json',
      }

      axios({
        method: 'POST',
        url: process.env.BASE_DOMAIN + process.env.ENDPOINT_AUTH,
        data: body,
        headers: headers,

      })
        .then((__response) => {
            const sessionObject = {
              name: __response.data.session.name,
              value: __response.data.session.value
            }

            response.end(JSON.stringify(sessionObject));
        })
        .catch(() => response.end()) // todo
    })
}

export default {
    path: 'api/login',
    handler: response
}
