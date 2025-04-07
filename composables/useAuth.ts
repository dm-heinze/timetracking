export function useAuth() {
    const { $auth } = useNuxtApp()
    return $auth
}