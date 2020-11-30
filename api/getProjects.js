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
            url: process.env.BASE_DOMAIN + process.env.ENDPOINT_REST + 'project',
            headers: parsedDataObject.headers,
        })
            .then((__response) => {
                response.end(JSON.stringify(__response.data));
            })
            .catch((err) =>{
                console.log("err occurred");

                response.writeHead(err.response.status);

                response.end(JSON.stringify(err));
            })
    })
}


export default {
    path: 'api/getProjects',
    handler: response
}
