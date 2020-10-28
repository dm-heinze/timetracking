import axios from 'axios';


const response = function (request, response) {
    let body = '';

    request.on('data', function (data) {
        body += data;

        const parsedDataObject =JSON.parse(body);

        let headers = {
            'Content-Type': 'application/json',
            cookie: `JSESSIONID=${parsedDataObject.sessionId}`,
        }

        const jqlSearchString = `assignee = ${parsedDataObject.currentUser} AND resolution = Unresolved order by updated DESC`;

        axios({
            method: 'POST', // use POST to get the assigned tickets only
            url: process.env.BASE_DOMAIN + process.env.ENDPOINT_REST + 'search',
            data: { jql: jqlSearchString },
            headers: headers,
        })
            .then((__response) => {
                // if (__response.status === 200) // todo
                response.end(JSON.stringify(__response.data));
            })
            .catch((err) =>{
                response.end(JSON.stringify(err));
            })
    })
}


export default {
    path: 'api/getAssignedTickets',
    handler: response
}
