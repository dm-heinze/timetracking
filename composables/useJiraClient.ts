import { Version3Client } from 'jira.js'
import { useAuth } from './useAuth'

export function useJiraClient() {
    const { session, isAuthenticated, refreshToken } = useAuth()

    // Kein Client, wenn nicht authentifiziert
    if (!isAuthenticated.value) {
        return null
    }

    // Client erstellen
    return new Version3Client({
        host: `https://api.atlassian.com/ex/jira/${session?.value?.jiraResource.id}`,
        authentication: {
            oauth2: {
                accessToken: session?.value?.accessToken,
            },
        },
        middlewares: {
            onError: async (error) => {
                console.error('Jira Client Error:', error)

                // Bei 401 (Unauthorized) Token erneuern und erneut versuchen
                if (error.status === 401) {
                    // Token erneuern
                    await refreshToken()

                    // Wiederholung der Anfrage mit erneutem Token würde hier erfolgen
                    // Das erfordert eine komplexere Logik, die den ursprünglichen Request wiederholt

                    // Dieser einfache Ansatz leitet einfach zur aktuellen Seite um
                    window.location.reload()
                }
            }
        }
    })
}