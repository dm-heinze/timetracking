import axios from 'axios';


const response = function (request, response) {
    let body = '';

    request.on('data', function (data) {
        body += data;
    })

    request.on('end', function () {
        const parsedDataObject = JSON.parse(body);

        axios({
            method: 'GET',
            baseURL: process.env.BASE_DOMAIN,
            url: process.env.ENDPOINT_REST + 'myself',
            headers: parsedDataObject.headers,
        })
            .then((__response) => {
                response.end(JSON.stringify(__response.data));
            })
            .catch((err) =>{
                response.writeHead(err.response.status);

                response.end(JSON.stringify(err));
            })
    })
}


export default {
    path: 'api/getCurrentUser',
    handler: response
}
