export default async (context) => {
    if (!(process.server)) {
        await context.store.dispatch('moduleUser/retrieveSessionFromStorage', context)
        await context.store.dispatch('moduleUser/retrieveCurrentUserFromStorage', context)
        await context.store.dispatch('moduleUser/retrieveSelectedTicketsFromStorage', context)
        await context.store.dispatch('moduleUser/retrieveSelectedTasksFromStorage', context)
        await context.store.dispatch('moduleUser/retrieveBreaksFromStorage', context)
    }
}
