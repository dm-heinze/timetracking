import { defineEventHandler, getCookie, setCookie, createError } from 'h3'

export default defineEventHandler(async (event) => {
    const tempoToken = getCookie(event, 'tempo_session')
    if (!tempoToken) {
        return { tempoAuthRequired: true }
    }

    const userCookie = getCookie(event, 'auth_user')
    if (!userCookie) {
        throw createError({ statusCode: 401, message: 'Not authenticated with Jira' })
    }

    const user = JSON.parse(userCookie)
    const today = new Date().toISOString().split('T')[0]

    try {
        const response = await $fetch<{ results: any[] }>(`https://api.tempo.io/4/plans/user/${user.id}`, {
            headers: { Authorization: `Bearer ${tempoToken}` },
            query: { from: today, to: today }
        })

        const plans = response.results
            .filter(plan => ['ISSUE', 'PROJECT'].includes(plan.planItem?.type))
            .map(plan => ({
                id: plan.id,
                type: plan.planItem.type,
                itemId: String(plan.planItem.id),
                note: plan.description || null,
                plannedSeconds: plan.totalPlannedSecondsInScope || 0
            }))

        return { plans }
    } catch (error: any) {
        if (error?.response?.status === 401) {
            setCookie(event, 'tempo_session', '', { maxAge: 0 })
            return { tempoAuthRequired: true }
        }
        throw createError({ statusCode: 500, message: 'Failed to fetch Tempo plans' })
    }
})
