export function useTempoAuth() {
    function tempoLogin() {
        window.location.href = '/api/auth/tempo/login'
    }

    async function tempoRefreshToken(): Promise<boolean> {
        if (!process.client) return false

        const refreshToken = localStorage.getItem('tempo_refresh_token')
        if (!refreshToken) return false

        try {
            const response = await $fetch<{ authenticated: boolean; refreshToken?: string }>('/api/auth/tempo/refresh', {
                method: 'POST',
                body: { refreshToken }
            })

            if (response.authenticated && response.refreshToken) {
                localStorage.setItem('tempo_refresh_token', response.refreshToken)
            }

            return response.authenticated
        } catch {
            return false
        }
    }

    return { tempoLogin, tempoRefreshToken }
}
