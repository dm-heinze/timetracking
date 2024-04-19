# Jira Timetracking-Tool for Jira Cloud by DMF

Web App to manage your daily worklogs against the jira cloud.

## Security
This is an [OAuth 2.0 (3LO)](https://developer.atlassian.com/cloud/jira/platform/oauth-2-3lo-apps/) app.
OAuth 2.0 (3LO) apps are created and managed in the [jira developer console](https://developer.atlassian.com/console/myapps/).
This is how you [enable OAuth 2.0 (3LO)](https://developer.atlassian.com/cloud/jira/platform/oauth-2-3lo-apps/#enabling-oauth-2-0--3lo-).

#### Required scopes:
```
'read:me',
'read:jira-work',
'read:jira-user',
'write:jira-work',
'offline_access'
```

## Configure .env
```
JIRA_CLIENT_ID=XXXXXXXXXXXXXXXXXX <= See Jira Developer Console 
JIRA_CLIENT_SECRET=XXXXXXXXXXXXXXXXXX <= See Jira Developer Console 
JIRA_RESOURCE_NAME=mycompany <= Name of the jira site or product you want to work with
```

## Technologies
- Nuxt 2
- Nuxt Auth Module
- Jira Api Client
- TailwindCSS
- DaisyUI

## Build

```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start

# generate static project
$ npm run generate
```

For detailed explanation on how things work, check out the [documentation](https://nuxtjs.org).
