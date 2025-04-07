<template>
    <div class="min-h-screen flex flex-col justify-center items-center gap-5">
        <div aria-label="Loading..." role="status">
            <svg class="h-12 w-12 animate-spin" viewBox="3 3 18 18">
                <path
                    class="fill-gray-200"
                    d="M12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19C15.866 19 19 15.866 19 12C19 8.13401 15.866 5 12 5ZM3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z"></path>
                <path
                    class="fill-primary"
                    d="M16.9497 7.05015C14.2161 4.31648 9.78392 4.31648 7.05025 7.05015C6.65973 7.44067 6.02656 7.44067 5.63604 7.05015C5.24551 6.65962 5.24551 6.02646 5.63604 5.63593C9.15076 2.12121 14.8492 2.12121 18.364 5.63593C18.7545 6.02646 18.7545 6.65962 18.364 7.05015C17.9734 7.44067 17.3403 7.44067 16.9497 7.05015Z"></path>
            </svg>
        </div>
        <h5>Authentifizierung wird verarbeitet...</h5>
    </div>
</template>

<script setup>
import { onMounted } from 'vue'
import axios from 'axios'
import { useAuth } from '~/composables/useAuth'

// Auth-Hooks verwenden
const { session } = useAuth()
// Jira-Resource aus Session-Objekt verwenden
const jiraResource = computed(() => session.value?.jiraResource)
const route = useRoute()

onMounted(async () => {
    try {
        // Code aus dem Callback extrahieren
        const { code, state } = route.query

        // State überprüfen
        const savedState = localStorage.getItem('auth_state')
        if (state !== savedState) {
            throw new Error('OAuth state mismatch')
        }

        // Code Verifier abrufen
        const codeVerifier = localStorage.getItem('code_verifier')

        // Token anfordern
        const response = await axios.post('/api/auth', {
            code,
            client_id: useRuntimeConfig().public.jiraClientId,
            redirect_uri: `${window.location.origin}/auth/callback`,
            grant_type: 'authorization_code',
            code_verifier: codeVerifier
        })

        // Token speichern
        jiraAuth.token.value = `Bearer ${response.data.access_token}`

        // Jira-Ressource abrufen
        const resources = await axios.get('https://api.atlassian.com/oauth/token/accessible-resources', {
            headers: {
                Authorization: jiraAuth.token.value,
                Accept: 'application/json',
            }
        })

        const matchingResource = resources.data.find(
            resource => resource.name === useRuntimeConfig().public.jiraResourceName
        )

        if (matchingResource) {
            jiraResource.value = matchingResource

            // Zur Hauptseite navigieren
            navigateTo('/')
        } else {
            throw new Error('Resource not found')
        }
    } catch (error) {
        console.error('Authentication error', error)
        navigateTo('/login')
    }
})
</script>