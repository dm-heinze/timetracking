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
            url: process.env.BASE_DOMAIN + process.env.ENDPOINT_REST + 'project',
            headers: headers,
        })
            .then((__response) => {
                response.end(JSON.stringify(__response.data));
            })
            .catch((err) =>{
                console.log("err occurred");
                response.end(JSON.stringify(err));
            })
    })
}


export default {
    path: 'api/getProjects',
    handler: response
}
