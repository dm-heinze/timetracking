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
                const currentUser = {
                    name: __response.data.name
                }

                response.end(JSON.stringify(currentUser));
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
