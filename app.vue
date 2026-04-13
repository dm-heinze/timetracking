<template>
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>
</template>

<script setup>
const savedTheme = import.meta.client ? localStorage.getItem('theme') || 'dmf' : 'dmf'
const route = useRoute()

onMounted(() => {
    if (route.query.store_refresh_token === 'true') {
        // Refresh-Token aus temporärem Cookie in localStorage übertragen
        const cookies = document.cookie.split(';')
        const refreshTokenCookie = cookies.find(c => c.trim().startsWith('auth_refresh_token_temp='))

        if (refreshTokenCookie) {
            const refreshToken = refreshTokenCookie.split('=')[1]
            localStorage.setItem('auth_refresh_token', refreshToken)

            // Temporäres Cookie löschen
            document.cookie = 'auth_refresh_token_temp=; max-age=0; path=/;'

            // Query-Parameter aus URL entfernen (ohne Seite neu zu laden)
            window.history.replaceState({}, document.title, '/')
        }
    }

    if (route.query.store_tempo_refresh_token === 'true') {
        // Tempo Refresh-Token aus temporärem Cookie in localStorage übertragen
        const cookies = document.cookie.split(';')
        const tempoRefreshTokenCookie = cookies.find(c => c.trim().startsWith('tempo_refresh_token_temp='))

        if (tempoRefreshTokenCookie) {
            const refreshToken = tempoRefreshTokenCookie.split('=')[1]
            localStorage.setItem('tempo_refresh_token', refreshToken)

            document.cookie = 'tempo_refresh_token_temp=; max-age=0; path=/;'
            window.history.replaceState({}, document.title, '/')
        }
    }
})

useHead({
    htmlAttrs: {
        'data-theme': savedTheme
    }
})
</script>

<style>
html, body {
    height: 100%;
    margin: 0;
    font-family: 'Open Sans', sans-serif;
}

[data-theme="dark"] .border,
[data-theme="dark"] .border-b {
    border-color: #3F4455;
}
</style>