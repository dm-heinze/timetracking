import axios from 'axios';
import _ from 'lodash';
import base64 from 'base-64';
import { __base_url } from "../utility/constants";

export const state = () => ({
    sessionObject: {}, // currently has 2 fields: name & value,
    currentUser: {},
    isTimerActive: false,
    allExistingProjects: [],
    activeTicket: '',
    prefilledSearchSuggestions: [], // todo
    assignedTickets: [],
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
    },
    getSmartPickedSuggestions: (state) => {
        return _.slice(state.prefilledSearchSuggestions.filter((__ticket) => __ticket.assignee !== state.currentUser.name), 0, 5) // end excluded
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
    resetPrefilledSearchSuggestions : (state) => {
        state.prefilledSearchSuggestions = [];
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
    setExistingProjects: (state, value) => {
        if (value.length === 0) state.allExistingProjects = value;
        else {
            state.allExistingProjects = value.map((__project) => {
                return {
                    id: __project.id,
                    key: __project.key,
                    name: __project.name,
                    avatar: __project.avatarUrls['16x16']
                }
            });
        }
    },
    setActiveTicket: (state, value) => {
        state.activeTicket = value;
    },
    addToPrefilledSearchSuggestions : (state, value) => {
        // check needed to prevent duplication from aggregated search results for assigned & picked issues
        const isAlreadyInSuggestions = state.prefilledSearchSuggestions.filter((__searchSuggestion) => __searchSuggestion.key === value.key).length !== 0;
        if (!isAlreadyInSuggestions) state.prefilledSearchSuggestions.push(value);
    },
    // needed bc if on refreshing assignedTickets, a ticket previously part of suggestions, may need to get removed from that listing
    updatePrefilledSearchSuggestions: (state, value) => {
        // for every assignedTicket check if included in prefilledSearchSuggestions array
        // if included check if the assignee field == currentUser
        // if not - set it to the currentUser
        // bc -> assignee may be empty but should be currentUser.name:
        // if key already in prefilledSearchSuggestion the updated object will not be added to it by mutation addToPrefilledSearchSuggestions
        // bc -> the endpoint for smartPickedIssues does not return the assignee field for found issues
        state.assignedTickets.forEach((__assignedTicket) => {
            const __indexToUpdate = state.prefilledSearchSuggestions.findIndex((__searchSuggestion) => __searchSuggestion.key === __assignedTicket.key);

            if (state.prefilledSearchSuggestions[__indexToUpdate].assignee !== state.currentUser.name) {
                state.prefilledSearchSuggestions[__indexToUpdate].assignee = state.currentUser.name;
            }

            // bc summary field may have changed between being viewed & being displayed as a smart picked search suggestion and being assigned as a ticket
            if (state.prefilledSearchSuggestions[__indexToUpdate].summary !== __assignedTicket.summary) {
                state.prefilledSearchSuggestions[__indexToUpdate].summary =  __assignedTicket.summary;
            }
        })
    },
    setAssignedTickets : (state, value) => {
        state.assignedTickets = value;
    },
    updateOrderSearchSuggestions: (state) => {
        state.prefilledSearchSuggestions = _.reverse(state.prefilledSearchSuggestions);
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
            commit('resetPrefilledSearchSuggestions');
            commit('setExistingProjects', []);
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
    requestAllProjects: function ({commit, state, dispatch}, payload) {
        return new Promise((resolve, reject) => {
            // only re-fetch projects on initial load & reload/refresh
            if (state.allExistingProjects.length === 0) {
                axios({
                    method: 'post',
                    baseURL: __base_url,
                    url: `/api/getProjects`,
                    data: {
                        headers: getters.getHeader(state)
                    }
                })
                    .then((__res) => {
                        commit('setExistingProjects', __res.data);

                        resolve();
                    })
                    .catch((err) => reject(err))
            }
        })
    },
    refreshAssignedTickets: function ({commit, state, dispatch}, payload) {
        return new Promise((resolve, reject) => {
            dispatch('requestAssignedTickets')
                .then((__res) => {
                    const __parsedAssignedIssues = __res.issues.map((__issue, index) => { // todo
                        return {
                            key: __issue.key,
                            id: __issue.id,
                            summary: __issue.fields.summary, // todo
                            assignee: __issue.fields.assignee.name,
                            // avatarUrl: __issue.fields.project.avatarUrls['16x16']
                            issueLink: process.env.BASE_DOMAIN + process.env.ENDPOINT_BROWSE + __issue.key,
                            comment: '',
                            timeSpent: 0,
                            startTime: '',
                            endTime: '',
                            assignedToTicket: true,
                            booked: false,
                            uniqueId: _.now() + index // todo
                        }
                    });
                    __parsedAssignedIssues.forEach((__issue) => commit('addToPrefilledSearchSuggestions', __issue)); // todo

                    commit('setAssignedTickets', __parsedAssignedIssues);

                    commit('updatePrefilledSearchSuggestions');
                })
                .catch((err) => {
                    console.log("An err occurred");
                    reject(err);
                })
        })
    },
    requestSmartPickedIssues: function ({ state }) {
        return new Promise((resolve, reject) => {
            axios({
                method: 'post',
                baseURL: __base_url,
                url: `/api/getSmartPickedIssues`,
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
    },
    requestAssignedTickets: function ({commit, state, dispatch}, payload) {
        return new Promise((resolve, reject) => {
            axios({
                method: 'post',
                baseURL: __base_url,
                url: `/api/getAssignedTickets`,
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
    },
    requestPrefill: function ({ state, commit, dispatch }) {
        return new Promise(async (resolve, reject) => {
            try {
                const [ assignedTickets, smartPickedIssues ] = await Promise.all([ dispatch('requestAssignedTickets'), dispatch('requestSmartPickedIssues') ]);


                // assignedTickets
                if (assignedTickets.issues.length) {
                    // if there are assignedTickets but the request is not queued after the login step the val for currentUser was not set before
                    if (!state.currentUser.name) commit('setCurrentUserName', { name: assignedTickets.issues[0].fields.assignee.name }); // used to filter for assignedTickets without the need for an extra array // todo

                    const __parsedAssignedIssues = assignedTickets.issues.map((__issue, index) => { // todo
                        return {
                            key: __issue.key,
                            id: __issue.id,
                            summary: __issue.fields.summary, // todo
                            assignee: __issue.fields.assignee.name,
                            // avatarUrl: __issue.fields.project.avatarUrls['16x16']
                            issueLink: process.env.BASE_DOMAIN + process.env.ENDPOINT_BROWSE + __issue.key,
                            comment: '',
                            timeSpent: 0,
                            startTime: '',
                            endTime: '',
                            assignedToTicket: true,
                            booked: false,
                            uniqueId: _.now() + index // todo
                        }
                    });

                    __parsedAssignedIssues.forEach((__issue) => commit('addToPrefilledSearchSuggestions', __issue)); // todo

                    commit('setAssignedTickets', __parsedAssignedIssues);
                }


                // smartPickedIssues
                const __parsedSmartPickedIssues = smartPickedIssues.sections[0].issues.map((issue, index) => {
                    return {
                        key: issue.key,
                        summary: issue.summaryText, // todo!
                        // summaryText: issue.summaryText, // todo: available field for data received from this endpoint
                        assignee: '',
                        issueLink: process.env.BASE_DOMAIN + process.env.ENDPOINT_BROWSE + issue.key,
                        comment: '',
                        timeSpent: 0,
                        startTime: '',
                        endTime: '',
                        assignedToTicket: true,
                        booked: false,
                        uniqueId: _.now() + index // todo
                    }
                })

                __parsedSmartPickedIssues.forEach((__parsedIssue) => commit('addToPrefilledSearchSuggestions', __parsedIssue));


                // if request not queued after login but due to reload the field may not be available if the assignedTickets.issues array is empty
                if (!state.currentUser.name && !assignedTickets.issues.length) {
                    dispatch('requestCurrentUser')
                        .then((__res) => {
                            commit('setCurrentUserName', { name: __res.name });

                            resolve();
                        })
                        .catch((err) => reject(err))
                } else {
                    resolve();
                }
            } catch (err) {
                if (err === 401) {
                    commit('setSessionObject', {}); // todo

                    dispatch('removeFromCookies', 'JSESSIONID') // todo
                        .then(() => reject(err)) // todo
                        .catch(() => reject(err))
                } else {
                    reject(err); // todo
                }
            }
        })
    }
};
