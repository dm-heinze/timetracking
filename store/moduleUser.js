import axios from 'axios';
import base64 from 'base-64';
import { __base_url } from "../utility/constants";

export const state = () => ({
    sessionObject: {}, // currently has 2 fields: name & value,
    currentUser: {},
    isTimerActive: false,
    activeTicket: '',
    lastTicket: '',
    settingsOpen: false,
    errorOccurred: false, // todo
    logoutInProgress: false,
    currentDay: ''
});

export const getters = {
    getHeader: (state) => {
        return {
            'Content-Type': 'application/json',
            cookie: `JSESSIONID=${state.sessionObject.value}`,
        }
    }
}

export const mutations = {
    setCurrentDay: (state, payload) => {
        state.currentDay = payload.currentDay; // todo
    },
    updateErrorOccurred: (state, payload) => {
        state.errorOccurred = payload;
    },
    logoutStarted: (state, payload) => {
        state.logoutInProgress = payload;
    },
    toggleSettings: (state) => {
        state.settingsOpen = !state.settingsOpen;
    },
    setLastTicket: (state, value) => {
        state.lastTicket = value;
    },
    setSessionObject: (state, value) => {
        state.sessionObject = value;
    },
    setCurrentUserName: (state, value) => {
        state.currentUser = { name: value.name }
    },
    setIsTimerActive: (state, value) => {
        state.isTimerActive = !(state.isTimerActive);
    },
    setActiveTicket: (state, value) => {
        state.activeTicket = value;
    }
};

export const actions = {
    removeFromStorage: function({commit, state}, payload) {
        return new Promise((resolve, reject) => {
            this.$localForage.removeItem(payload)
                .then(() => resolve())
                .catch(() => reject())
        })
    },
    removeFromCookies: function({commit, state}, payload) {
        return new Promise((resolve, reject) => {
            this.$cookies.remove(payload);

            resolve();
        })
    },
    saveSessionIdToCookies: function({commit, state}, payload) {
        return new Promise((resolve, reject) => {
            this.$cookies.set(state.sessionObject.name, base64.encode(state.sessionObject.value))

            resolve();
        })
    },
    stopTrackers: function({ commit, state, rootState, dispatch }, payload) {
        return new Promise((resolve, reject) => { // todo
            // check if any break or task trackers are active
            if (rootState.moduleBreak.onABreak) commit('moduleBreak/toggleBreak', {}, { root: true }); // todo

            if (state.isTimerActive) {
                commit('setLastTicket', state.activeTicket);

                commit('setActiveTicket', '');

                commit('setIsTimerActive');
            }

            resolve();
        })
    },
    resetState: function({ commit, state, rootState, dispatch }, payload) {
        return new Promise((resolve, reject) => {
            commit('setSessionObject', {});
            commit('setCurrentUserName', {});
            commit('moduleSearch/setSearchResult', [], { root: true });
            commit('modulePrefill/resetPrefilledSearchSuggestions', {}, { root: true });
            commit('modulePrefill/setExistingProjects', [], { root: true });
            if (rootState.moduleSearch.selectedProject) commit('moduleSearch/setSelectedProject', '', { root: true });
            if (rootState.moduleSearch.relatedTickets) commit('moduleSearch/setRelatedTickets', [], { root: true });
            commit('moduleBookmark/setBookmarks', [], { root: true }); // todo
            commit('moduleTask/setSelectedTasks', [], { root: true }); // todo
            commit('moduleBreak/updateTotalBreakTime', { totalBreakTime: '00:00:00' }, { root: true }); // todo
            commit('logoutStarted', false);

            dispatch('removeFromCookies', 'JSESSIONID')
                .then(() => resolve())
                .catch(() => {
                    console.log("err occurred while removing entry from storage");
                    reject();
                })
        })
    },
    requestSessionRemoval: function({ commit, state, dispatch }) {
        return new Promise((resolve, reject) => {
            axios({
                method: 'delete',
                baseURL: __base_url,
                url: `/api/logout`,
                params: {
                    value: state.sessionObject.value
                }
            }) // todo
                .then((_response) => {
                    if (_response.data.status === 204) {
                        commit('logoutStarted', true);

                        dispatch('stopTrackers').then(() => resolve()).catch(() => reject()) // todo
                    } else {
                        // todo
                        reject()
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.status === 401) { // the session has already expired or sessionId unavailable
                            commit('logoutStarted', true);

                            dispatch('stopTrackers').then(() => resolve()).catch(() => reject()) // todo
                        }
                        else reject("An error occurred");
                    }
                    else reject("An error occurred");
                })
        })
    },
    createApiObject: function({ commit, state, dispatch }, payload) {
        return new Promise((resolve, reject) => {
            axios({
                method: 'post',
                baseURL: __base_url,
                url: `/api/login`,
                data: {
                    username: payload.data.name,
                    password: payload.data.pass
                }
            })
                .then(async (response) => {
                    if (response.data) { // todo
                        commit('setSessionObject', response.data);

                        // currentUser may not have any assignedTickets which return the assignee === currentUser -> setting the currentUser here
                        // receiving a sessionId indicates the correctness of the entered credentials therefore the user entered name can be set as the currentUser val
                        commit('setCurrentUserName', { name: payload.data.name });

                        await Promise.all([
                            await dispatch('saveSessionIdToCookies'),
                            await dispatch('moduleTask/retrieveSelectedTasksFromStorage', {}, { root: true }), // todo
                            await dispatch('moduleBreak/retrieveBreaksFromStorage', {}, { root: true }), // todo
                            await dispatch('moduleBookmark/retrieveBookmarksFromStorage', {}, { root: true }), // todo
                        ])
                            .then(() => resolve())
                            .catch(() => {
                                console.log("err occurred while saving/retrieving to/from localForage");
                                reject(); // todo
                            })

                    } else {
                        resolve(); // todo
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.status === 401) reject("Your credentials are not valid.");
                        if (err.response.status === 403) reject("Try again later.");
                    } else reject("An error occurred");
                })
        })
    },
    requestCurrentUser: function ({commit, state, dispatch}, payload) {
        return new Promise((resolve, reject) => {
            axios({
                method: 'post',
                baseURL: __base_url,
                url: `/api/getCurrentUser`,
                data: {
                    headers: getters.getHeader(state)
                }
            })
                .then((__res) => resolve(__res.data))
                .catch((err) => {
                    if (err.response.status === 401) reject(err.response.status); // sessionId exists in cookies but has expired // todo
                    else reject(err);
                })
        })
    }
};
