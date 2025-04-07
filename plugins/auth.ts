export default defineNuxtPlugin(nuxtApp => {
    const session = useState('auth-session', () => null)
    const error = useState('auth-error', () => null)
    const initialized = useState('auth-initialized', () => false)
    const tokenExpiry = useState('auth-token-expiry', () => 0)
    const refreshInProgress = useState('auth-refresh-in-progress', () => false)

    const isAuthenticated = computed(() => !!session.value?.authenticated)

    async function fetchSession() {
        error.value = null

        try {
            const response = await $fetch('/api/auth/session')

            // Prüfen, ob ein Token-Refresh nötig ist
            if (!response.authenticated && response.needsRefresh) {
                // Führe einen Token-Refresh durch
                await refreshToken()

                // Nach erfolgreicher Erneuerung die Session erneut laden
                session.value = await $fetch('/api/auth/session')
            } else {
                session.value = response
            }

            // Token-Erneuerung planen
            if (session.value?.authenticated && session.value?.expiresAt) {
                tokenExpiry.value = session.value.expiresAt
                scheduleTokenRefresh()
            }
        } catch (err) {
            error.value = err
            session.value = null
        }
    }

    // Funktion zum Aktualisieren des Tokens
    async function refreshToken() {
        if (refreshInProgress.value) return
        if (!process.client) return

        refreshInProgress.value = true

        try {
            // Refresh Token aus localStorage holen
            const refreshToken = localStorage.getItem('auth_refresh_token')
            if (!refreshToken) {
                throw new Error('No refresh token found')
            }

            const response = await $fetch('/api/auth/refresh', {
                method: 'POST',
                body: { refreshToken }
            })

            if (response.authenticated) {
                session.value = {
                    ...session.value,
                    accessToken: response.accessToken,
                    expiresAt: response.expiresAt
                }

                tokenExpiry.value = response.expiresAt

                // Neuen Refresh Token speichern, falls vorhanden
                if (response.refreshToken) {
                    localStorage.setItem('auth_refresh_token', response.refreshToken)
                }

                // Timer für nächste Erneuerung setzen
                scheduleTokenRefresh()
            } else {
                // Bei Fehler ausloggen
                session.value = null
                localStorage.removeItem('auth_refresh_token')
                navigateTo('/login')
            }
        } catch (error) {
            console.error('Failed to refresh token:', error)
            session.value = null
            localStorage.removeItem('auth_refresh_token')
            navigateTo('/login')
        } finally {
            refreshInProgress.value = false
        }
    }

    // Timer für die Token-Erneuerung planen
    function scheduleTokenRefresh() {
        if (!import.meta.client) return

        // Aktuellen Timer löschen, falls vorhanden
        if (window.tokenRefreshTimer) {
            clearTimeout(window.tokenRefreshTimer)
        }

        // Berechnen, wann der Token erneuert werden sollte (5 Minuten vor Ablauf)
        const timeUntilRefresh = Math.max(0, tokenExpiry.value - Date.now() - (5 * 60 * 1000))

        if (timeUntilRefresh > 0) {
            // Timer setzen
            window.tokenRefreshTimer = setTimeout(() => {
                refreshToken()
            }, timeUntilRefresh)
        } else {
            // Wenn der Token bereits nahe am Ablauf ist oder abgelaufen ist, sofort erneuern
            console.log('Token erneuern (sofort)...')
            refreshToken()
        }
    }

    async function initialize() {
        if (initialized.value) return

        await fetchSession()
        initialized.value = true
    }

    // Auf Client-Seite automatisch initialisieren
    if (import.meta.client) {
        nuxtApp.hook('app:mounted', async () => {
            await initialize()

            // Fokus-Event für Token-Erneuerung
            window.addEventListener('focus', () => {
                const timeLeft = tokenExpiry.value - Date.now()
                if (session.value?.authenticated && timeLeft < 5 * 60 * 1000) {
                    refreshToken()
                }
            })
        })
    }

    return {
        provide: {
            auth: {
                session,
                error,
                isAuthenticated,
                initialized,
                fetchSession,
                initialize,
                refreshToken,
                tokenExpiry
            }
        }
    }
})