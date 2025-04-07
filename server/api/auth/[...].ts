import { defineEventHandler, getQuery, sendRedirect, setCookie, getCookie, createError } from 'h3'
import axios from 'axios'
import { randomUUID, createHash } from 'crypto'

// Konfiguration aus Runtime-Config abrufen
const config = useRuntimeConfig()

// OAuth2 Konfiguration für Jira
const oauthConfig = {
    clientId: config.jira.clientId,
    clientSecret: config.jira.clientSecret,
    redirectUri: process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000/api/auth/callback'
        : `${config.jira.authOrigin || 'https://your-production-domain.com'}/api/auth/callback`,
    authorizationUrl: 'https://auth.atlassian.com/authorize',
    tokenUrl: 'https://auth.atlassian.com/oauth/token',
    userInfoUrl: 'https://api.atlassian.com/me',
    resourcesUrl: 'https://api.atlassian.com/oauth/token/accessible-resources',
    scope: 'read:me read:jira-work read:jira-user write:jira-work offline_access',
    audience: 'api.atlassian.com'
}

export default defineEventHandler(async (event) => {
    // Extrahiere den genauen Pfad für das Routing
    const url = event.node.req.url || ''
    const path = url.split('?')[0] // Entferne Query-Parameter

    // Startpunkt des OAuth-Flows
    if (path === '/api/auth/login') {
        // PKCE Code Challenge erstellen
        const codeVerifier = randomUUID() + randomUUID()
        const codeChallenge = createHash('sha256')
            .update(codeVerifier)
            .digest('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '')

        // State zum Schutz erstellen
        const state = randomUUID()

        // Code Verifier und State in Cookies speichern (nur für den Auth-Flow)
        setCookie(event, 'code_verifier', codeVerifier, {
            maxAge: 60 * 10, // 10 Minuten
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'lax'
        })

        setCookie(event, 'oauth_state', state, {
            maxAge: 60 * 10, // 10 Minuten
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'lax'
        })

        // URL für die Weiterleitung zu Jira erstellen
        const authorizationUrl = new URL(oauthConfig.authorizationUrl)
        authorizationUrl.searchParams.append('client_id', oauthConfig.clientId)
        authorizationUrl.searchParams.append('redirect_uri', oauthConfig.redirectUri)
        authorizationUrl.searchParams.append('response_type', 'code')
        authorizationUrl.searchParams.append('scope', oauthConfig.scope)
        authorizationUrl.searchParams.append('audience', oauthConfig.audience)
        authorizationUrl.searchParams.append('state', state)
        authorizationUrl.searchParams.append('code_challenge', codeChallenge)
        authorizationUrl.searchParams.append('code_challenge_method', 'S256')
        authorizationUrl.searchParams.append('prompt', 'consent')

        // Zum Jira-Login weiterleiten
        return sendRedirect(event, authorizationUrl.toString())
    }

    // Callback des OAuth-Flows
    if (path === '/api/auth/callback') {
        const query = getQuery(event)
        const { code, state } = query

        // State überprüfen
        const savedState = getCookie(event, 'oauth_state')
        if (state !== savedState) {
            throw createError({
                statusCode: 400,
                message: 'State mismatch - possible CSRF attack'
            })
        }

        // Code Verifier abrufen
        const codeVerifier = getCookie(event, 'code_verifier')
        if (!codeVerifier) {
            throw createError({
                statusCode: 400,
                message: 'Code verifier not found'
            })
        }

        try {
            // Token vom OAuth-Provider abrufen
            const tokenResponse = await axios.post(oauthConfig.tokenUrl, {
                client_id: oauthConfig.clientId,
                client_secret: oauthConfig.clientSecret,
                code,
                grant_type: 'authorization_code',
                redirect_uri: oauthConfig.redirectUri,
                code_verifier: codeVerifier
            })

            const {
                access_token,
                refresh_token,
                expires_in // in seconds
            } = tokenResponse.data

            // Benutzerinfo abrufen
            const userResponse = await axios.get(oauthConfig.userInfoUrl, {
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            })

            // Jira-Ressourcen abrufen
            const resourcesResponse = await axios.get(oauthConfig.resourcesUrl, {
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            })

            // Passende Ressource finden
            const matchingResource = resourcesResponse.data.find(
                resource => resource.name === config.jira.resourceName
            )

            if (!matchingResource) {
                throw createError({
                    statusCode: 404,
                    message: `Jira resource ${config.jira.resourceName} not found`
                })
            }

            // Session erstellen
            const session = {
                accessToken: access_token,
                refreshToken: refresh_token,
                user: {
                    id: userResponse.data.account_id,
                    email: userResponse.data.email,
                },
                jiraResource: {
                    id: matchingResource.id,
                    name: matchingResource.name,
                    url: matchingResource.url
                }
            }

            const cookieOptions = {
                maxAge: (60 * 60 * 24 * 30),
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV !== 'development',
                sameSite: 'lax'
            }

            // 1. Token-Cookie (httpOnly für Sicherheit)
            setCookie(event, 'auth_session', JSON.stringify({
                at: access_token,
                exp: Date.now() + (expires_in * 1000)
            }), cookieOptions)

            // 2. Benutzer-Cookie
            setCookie(event, 'auth_user', JSON.stringify({
                id: userResponse.data.account_id,
                name: userResponse.data.name,
                email: userResponse.data.email,
                picture: userResponse.data.picture
            }), cookieOptions)

            // 3. Jira-Resource-Cookie
            setCookie(event, 'auth_resource', JSON.stringify(matchingResource), cookieOptions)

            // Code-Verifier und State-Cookies löschen
            setCookie(event, 'code_verifier', '', { maxAge: 0 })
            setCookie(event, 'oauth_state', '', { maxAge: 0 })

            // Spezielle Cookie-Option für JS-lesbares Cookie (nicht httpOnly!)
            setCookie(event, 'auth_refresh_token_temp', refresh_token, {
                ...cookieOptions,
                httpOnly: false // Wichtig: Dieses Cookie muss vom JS lesbar sein
            })

            // Direkte Weiterleitung zur Hauptseite mit einem speziellen Query-Parameter
            return sendRedirect(event, '/?store_refresh_token=true')
        } catch (error) {
            throw createError({
                statusCode: 500,
                message: 'Error during authentication'
            })
        }
    }

    if (path === '/api/auth/refresh') {
        const sessionCookie = getCookie(event, 'auth_session')

        if (!sessionCookie) {
            return { authenticated: false, error: 'No token cookie found' }
        }

        // Client muss den Refresh Token im Anfragekörper senden, da wir ihn nicht aus dem Cookie lesen können
        const body = await readBody(event)
        const { refreshToken } = body

        if (!refreshToken) {
            return { authenticated: false, error: 'No refresh token provided' }
        }

        try {
            // Token erneuern
            const tokenResponse = await axios.post(oauthConfig.tokenUrl, {
                client_id: oauthConfig.clientId,
                client_secret: oauthConfig.clientSecret,
                grant_type: 'refresh_token',
                refresh_token: refreshToken
            })

            const {
                access_token,
                refresh_token,
                expires_in
            } = tokenResponse.data

            const expiresAt = Date.now() + (expires_in * 1000)

            // Token-Cookie erneuern
            setCookie(event, 'auth_session', JSON.stringify({
                at: access_token,
                exp: expiresAt
            }), {
                maxAge: (60 * 60 * 24 * 30),
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV !== 'development',
                sameSite: 'lax'
            })

            // Session-Daten für den Client
            return {
                authenticated: true,
                accessToken: access_token,
                expiresAt: expiresAt,
                refreshToken: refresh_token || refreshToken // Neuen oder alten Refresh-Token zurückgeben
            }
        } catch (error) {
            // Cookies löschen bei Fehler
            setCookie(event, 'auth_session', '', { maxAge: 0 })
            setCookie(event, 'auth_user', '', { maxAge: 0 })
            setCookie(event, 'auth_resource', '', { maxAge: 0 })

            return { authenticated: false, error: 'Failed to refresh token' }
        }
    }

    // Logout-Endpunkt
    if (path === '/api/auth/logout') {
        setCookie(event, 'auth_tokens', '', { maxAge: 0 })
        setCookie(event, 'auth_user', '', { maxAge: 0 })
        setCookie(event, 'auth_resource', '', { maxAge: 0 })
        // Zur Login-Seite weiterleiten mit JS-Script, das auch localStorage löscht
        return `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Abmeldung</title>
            <script>
              localStorage.removeItem('auth_refresh_token');
              window.location.href = '/login';
            </script>
          </head>
          <body>
            <p>Abmeldung erfolgreich. Weiterleitung...</p>
          </body>
          </html>
        `
    }

    // API zum Abrufen der aktuellen Session
    if (path === '/api/auth/session') {
        const sessionCookie = getCookie(event, 'auth_session')
        const userCookie = getCookie(event, 'auth_user')
        const resourceCookie = getCookie(event, 'auth_resource')

        if (!sessionCookie || !userCookie || !resourceCookie) {
            return { authenticated: false }
        }

        try {
            const session = JSON.parse(sessionCookie)
            const user = JSON.parse(userCookie)
            const jiraResource = JSON.parse(resourceCookie)

            if (session.exp < Date.now()) {
                // Token ist abgelaufen - wir signalisieren dem Client, dass ein Refresh nötig ist
                // Da wir serverseitig keinen Zugriff auf localStorage haben, muss der Client den Refresh durchführen
                return {
                    authenticated: false,
                    reason: 'expired',
                    needsRefresh: true
                }
            }

            return {
                authenticated: true,
                user: user.user,
                jiraResource,
                accessToken: session.at,
                expiresAt: session.exp
            }
        } catch (error) {
            return { authenticated: false }
        }
    }

    throw createError({
        statusCode: 404,
        message: 'Auth endpoint not found'
    })
})