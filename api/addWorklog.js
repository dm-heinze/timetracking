import axios from 'axios';


const response = function (request, response) {
    let body = '';

    request.on('data', function (data) {
        body += data;
    })

    request.on('end', function () {
        const parsedDataObject = JSON.parse(body);

        const ticketId = parsedDataObject.ticketId;

        axios({
            method: 'POST',
            baseURL: process.env.BASE_DOMAIN,
            url: process.env.ENDPOINT_REST + `issue/${ticketId}/worklog`,
            headers: parsedDataObject.headers,
            data: {
                comment: parsedDataObject.comment,
                timeSpentSeconds: (Math.ceil(parsedDataObject.timeSpentSeconds / 60000) * 60000) / 1000 // todo
            }
        })
            .then((__response) => {
                response.end(); // todo: add error handling -> pass statusCode to caller
            })
            .catch((err) =>{
                response.writeHead(err.response.status);

                response.end(JSON.stringify(err.response.status));
            })
    })
}


export default {
    path: 'api/addWorklog',
    handler: response
}
