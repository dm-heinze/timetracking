export default async (context) => {
    if (!(process.server)) {
        // retrieve/set day from/to cookies
        const __lastSavedCurrentDay = context.$cookies.get('CURRENT_DAY');
        const __currentDayNow = new Date().toDateString();

        if (__lastSavedCurrentDay) {
            if (__lastSavedCurrentDay !== __currentDayNow) {
                // not the same day anymore
                // -> set today's date to vuex store
                context.store.commit('moduleUser/setCurrentDay', { currentDay: __currentDayNow }, context); // todo

                // & update cookies
                context.$cookies.set('CURRENT_DAY', __currentDayNow);
            } else {
                // still the same day
                // -> use saved date for vuex store
                context.store.commit('moduleUser/setCurrentDay', { currentDay: __lastSavedCurrentDay }, context);
            }
        } else {
            // no val yet saved to cookies todo: expire cookie?
            context.$cookies.set('CURRENT_DAY', __currentDayNow);

            context.store.commit('moduleUser/setCurrentDay', { currentDay: __currentDayNow }, context);
        }


        // retrieve data from localStorage
        await Promise.all([
            await context.store.dispatch('moduleUser/retrieveSelectedTasksFromStorage', context), // this needs the current date for the UI
            await context.store.dispatch('moduleBreak/retrieveBreaksFromStorage', context),
            await context.store.dispatch('moduleBookmark/retrieveBookmarksFromStorage', context),
            await context.store.dispatch('moduleOptional/retrieveSelectionForSuggestionsFromStorage', context), // todo: as cookie?
            await context.store.dispatch('moduleOptional/retrieveSuggestionGroupsFromStorage', context) // todo: as cookie?
        ])
    }
}
