import axios from 'axios';

const response = function (request, response) {
    let body = '';

    request.on('data', function (data) {
        body += data;
    })

    request.on('end', function () {
        let headers = {
            'Content-Type': 'application/json',
        }

        axios({
            method: 'POST',
            baseURL: process.env.BASE_DOMAIN,
            url: process.env.ENDPOINT_AUTH,
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
            .catch((err) => {
                response.writeHead(err.response.status);
                response.end(JSON.stringify(err));
            })
    })
}

export default {
    path: 'api/login',
    handler: response
}
