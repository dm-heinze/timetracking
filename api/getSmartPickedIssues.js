import axios from 'axios';


const response = function (request, response) {
    let body = '';

    request.on('data', function (data) {
        body += data;

        const parsedDataObject =JSON.parse(body);

        let headers = {
            'Content-Type': 'application/json',
            cookie: `JSESSIONID=${parsedDataObject.sessionId}`
        }


        axios({
            method: 'GET',
            url: process.env.BASE_DOMAIN + process.env.ENDPOINT_REST + 'issue/picker',
            headers: headers,
        })
            .then((__response) => {
                response.end(JSON.stringify(__response.data));
            })
            .catch((err) =>{
                response.end(JSON.stringify(err));
            })
    })
}


export default {
    path: 'api/getSmartPickedIssues', // todo
    handler: response
}
