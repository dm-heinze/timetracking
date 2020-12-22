export default async (context) => {
    if (!(process.server)) {
        await Promise.all([
            await context.store.dispatch('moduleUser/retrieveSelectedTasksFromStorage', context),
            await context.store.dispatch('moduleBreak/retrieveBreaksFromStorage', context),
            await context.store.dispatch('moduleUser/retrieveBookmarksFromStorage', context),
            await context.store.dispatch('moduleUser/retrieveSelectionForSuggestionsFromStorage', context), // todo: as cookie?
            await context.store.dispatch('moduleUser/retrieveSuggestionGroupsFromStorage', context) // todo: as cookie?
        ])
    }
}
