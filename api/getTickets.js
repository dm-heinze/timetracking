import axios from 'axios';
import { regexForTicketKeys } from "../utility/constants";


const response = function (request, response) {
    let body = '';

    request.on('data', function (data) {
        body += data;
    })

    request.on('end', function () {
        const parsedDataObject = JSON.parse(body);

        let jqlSearchString;
        if (parsedDataObject.searchTerm.match(regexForTicketKeys)) {
            jqlSearchString = `key = '${parsedDataObject.searchTerm}' ORDER BY created DESC`;
        } else {
            jqlSearchString = `summary ~ '${parsedDataObject.searchTerm}' ORDER BY created DESC`;
        }

        axios({
            method: 'POST', // both GET & POST are allowed
            baseURL: process.env.BASE_DOMAIN,
            url: process.env.ENDPOINT_REST + 'search',
            data: { jql: jqlSearchString },
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
    path: 'api/getTickets',
    handler: response
}
