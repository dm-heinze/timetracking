import axios from 'axios'
import { Version3Client } from 'jira.js'

export default async function ({ $auth, $axios }, inject) {
  class NuxtAuthJira extends Version3Client {
    constructor(config) {
      super(config)

      const nuxtAxios = $axios
      nuxtAxios.setBaseURL(config.host)

      const STRICT_GDPR_FLAG = 'x-atlassian-force-account-id'
      const ATLASSIAN_TOKEN_CHECK_FLAG = 'X-Atlassian-Token'
      const ATLASSIAN_TOKEN_CHECK_NOCHECK_VALUE = 'no-check'
      const headers = this.removeUndefinedProperties({
        [STRICT_GDPR_FLAG]: config.strictGDPR,
        [ATLASSIAN_TOKEN_CHECK_FLAG]: config.noCheckAtlassianToken ? ATLASSIAN_TOKEN_CHECK_NOCHECK_VALUE : undefined,
        ...config.baseRequestConfig?.headers,
      })
      Object.keys(headers, (index) => {
        nuxtAxios.setHeader(index, headers[index])
      })

      this.instance = nuxtAxios
    }
  }

  async function auth(accessToken) {
    const availableResources = await axios.request({
      method: 'get',
      url: 'https://api.atlassian.com/oauth/token/accessible-resources',
      headers: {
        Authorization: accessToken,
        Accept: 'application/json',
      }
    })

    const matchingResource = availableResources?.data.find(resource => resource.name === process.env.jiraResourceName)

    if (matchingResource) {
      return {
        resource: matchingResource,
        client: new NuxtAuthJira({
          host: `https://api.atlassian.com/ex/jira/${matchingResource.id}`,
          authentication: {
            oauth2: {
              accessToken: accessToken.replace('Bearer ', ''),
            },
          },
          middlewares: {
            onError: (error) => {
              console.error('Auth Plugin Jira Client Error')
              console.error(error)

              if(error.name === 'ExpiredAuthSessionError') {
                location.reload()
              }
            }
          }
        }),
      };
    } else {
      return false;
    }
  }

  try {
    if($auth.loggedIn) {
      const { resource, client } = await auth($auth.strategy.token.get())
      inject('jiraResource', resource)
      inject('jira', client)
      return
    }

    $auth.$storage.watchState('loggedIn', async (newValue) => {
      if (newValue) {
        const { resource, client } = await auth($auth.strategy.token.get())
        inject('jiraResource', resource)
        inject('jira', client)
      }
    })
  } catch (e) {
    console.log('Catched Auth Plugin Error')
  }
}
