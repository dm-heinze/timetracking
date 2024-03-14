const axios = require('axios');
const bodyParser = require('body-parser')
const app = require('express')()

require('dotenv').config();

app.use(bodyParser.urlencoded({
  extended: true
}));

app.post('/', (req, res) => {
  const {
    code,
    refresh_token,
    client_id,
    redirect_uri,
    response_type,
    audience,
    grant_type,
    code_verifier
  } = req.body;

  axios
    .request({
      method: 'post',
      url: 'https://auth.atlassian.com/oauth/token',
      data: {
        code,
        refresh_token,
        client_id,
        client_secret: process.env.JIRA_CLIENT_SECRET,
        redirect_uri,
        response_type,
        audience,
        grant_type,
        code_verifier,
      },
      headers: {
        Accept: 'application/json'
      }
    })
    .then((response) => {
      res.json(response.data)
    })
    .catch((error) => {
      res.writeHead(error.response.status);
      res.end(JSON.stringify(error));
    });
})

module.exports = app
