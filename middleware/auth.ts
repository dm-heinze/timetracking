export default defineNuxtRouteMiddleware(async (to) => {
    // Spezielle Behandlung für den Callback mit store_refresh_token Parameter
    if (to.query.store_refresh_token === 'true') {
        // Erlaube diesen Pfad ohne Authentifizierungsprüfung
        return
    }

    // Ausnahmen für Login und Auth-Routen
    if (to.path === '/login' || to.path.startsWith('/api/auth')) {
        return
    }

    const { isAuthenticated, initialized, initialize } = useAuth()

    // Initialisieren, falls noch nicht geschehen
    if (!initialized.value) {
        await initialize()
    }

    // Wenn nicht authentifiziert, zu Login weiterleiten
    if (!isAuthenticated.value) {
        return navigateTo('/login')
    }
})