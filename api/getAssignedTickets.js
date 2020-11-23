import axios from 'axios';


const response = function (request, response) {
    let body = '';

    request.on('data', function (data) {
        body += data;
    })

    request.on('end', function () {
        const parsedDataObject = JSON.parse(body);

        const jqlSearchString = `assignee = currentUser() AND resolution = Unresolved order by updated DESC`;

        axios({
            method: 'POST', // use POST to get the assigned tickets only
            baseURL: process.env.BASE_DOMAIN,
            url: process.env.ENDPOINT_REST + 'search',
            data: { jql: jqlSearchString },
            headers: parsedDataObject.headers,
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
