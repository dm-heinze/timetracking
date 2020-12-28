import _ from 'lodash';

export const state = () => ({
    bookmarked: []
})

export const mutations = {
    updateBookmarks: (state, value) => {
        if (state.bookmarked.find((__bookmarked) => __bookmarked.key === value.bookmark)) {
            state.bookmarked = state.bookmarked.filter((__bookmarked) => __bookmarked.key !== value.bookmark)
        } else {
            state.bookmarked.push({ key: value.bookmark, summary: value.summary });
        }
    },
    setBookmarks: (state, value) => {
        state.bookmarked = value;
    }
}

export const actions = {
    saveBookmarksToStorage: function ({ state }) {
        return new Promise((resolve, reject) => {
            this.$localForage.setItem('BOOKMARKS', state.bookmarked)
                .then(() => resolve())
                .catch(() => reject())
        })
    },
    retrieveBookmarksFromStorage: function({ commit }) {
        return new Promise((resolve) => {
            this.$localForage.getItem('BOOKMARKS').then((__result) => {
                if (!_.isEmpty(__result)) {
                    commit('setBookmarks', __result );

                    resolve();
                } else {
                    resolve();
                }
            })
        })
    },
    toggleBookmarked: function ({ state, commit, dispatch }, payload) {
        return new Promise(async (resolve, reject) => {
            // summary default==='' -> no val may be passed in
            commit('updateBookmarks', { bookmark: payload.searchResultToBeToggled, summary: payload.summary ? payload.summary : '' });

            dispatch('saveBookmarksToStorage').then(() => resolve()).catch(() => reject());
        })
    }
}
