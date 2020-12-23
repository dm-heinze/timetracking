import _ from 'lodash';

export const state = () => ({
    showSuggestions: true,
    suggestionGroups: ['Assigned Tickets', 'Suggestions', 'Bookmarks'], // default order
})

export const mutations = {
    toggleSuggestions: (state, value) => {
        state.showSuggestions = !state.showSuggestions;
    },
    setShowSuggestions: (state, value) => {
        state.showSuggestions = value;
    },
    setSuggestionGroups: (state, value) => {
        state.suggestionGroups = value;
    }
}

export const actions = {
    updateSelectionForSuggestions: function ({ state, commit }) {
        return new Promise((resolve, reject) => {
            commit('toggleSuggestions');

            // save to storage // todo: extract in separate action
            this.$localForage.setItem('VISIBILITY_SUGGESTIONS', state.showSuggestions)
                .then(() => resolve())
                .catch(() => reject())
        })
    },
    retrieveSelectionForSuggestionsFromStorage: function({ state, commit }) {
        return new Promise((resolve) => {
            this.$localForage.getItem('VISIBILITY_SUGGESTIONS').then((__result) => {
                if (__result === false) { // todo!
                    commit('setShowSuggestions', __result);

                    resolve();
                } else {
                    commit('setShowSuggestions', true); // todo!
                    resolve();
                }
            })
        })
    },
    saveSuggestionGroupsToStorage: function ({ state }) {
        return new Promise((resolve, reject) => {
            this.$localForage.setItem('SUGGESTION_GROUPS', state.suggestionGroups)
                .then(() => resolve())
                .catch(() => reject())
        })
    },
    retrieveSuggestionGroupsFromStorage: function({ commit }) {
        return new Promise((resolve) => {
            this.$localForage.getItem('SUGGESTION_GROUPS').then((__result) => {
                if (!_.isEmpty(__result)) {
                    commit('setSuggestionGroups', __result);

                    resolve();
                } else {
                    resolve(); // default already defined in store state will be used
                }
            })
        })
    }
}
