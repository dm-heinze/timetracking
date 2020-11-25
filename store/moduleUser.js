import axios from 'axios';
import _ from 'lodash';
import base64 from 'base-64';
import { __base_url } from "../utility/constants";

export const state = () => ({
    sessionObject: {}, // currently has 2 fields: name & value,
    currentUser: {},
    searchResults: [],
    isTimerActive: false,
    allExistingProjects: [],
    selectedProject: '',
    relatedTickets: [],
    activeTicket: '',
    breaks: [],
    onABreak: false,
    accumulatedBreakTime: '00:00:00',
    selectedTasks: [],
    prefilledSearchSuggestions: [],
    lastTicket: '',
    bookmarked: [],
    settingsOpen: false,
    showErrorMessages: false,
    editingCustomTask: ''
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
    updateEditingCustomTask: (state, payload) => {
        state.editingCustomTask = payload.activeTaskId;
    },
    resetPrefilledSearchSuggestions : (state) => {
        state.prefilledSearchSuggestions = [];
    },
    toggleShowErrorMessages: (state, payload) => {
        state.showErrorMessages = payload.show;
    },
    toggleSettings: (state) => {
        state.settingsOpen = !state.settingsOpen;
    },
    updateBookmarks: (state, value) => {
        if (state.bookmarked.find((__bookmarked) => __bookmarked.key === value.bookmark)) {
            state.bookmarked = state.bookmarked.filter((__bookmarked) => __bookmarked.key !== value.bookmark)
        } else {
            state.bookmarked.push({ key: value.bookmark, summary: value.summary });
        }
    },
    setBookmarks: (state, value) => {
        state.bookmarked = value;
    },
    setSelectedTasks: (state, value) => {
        state.selectedTasks = value;
    },
    markTaskAsBooked: (state, value) => {
        state.selectedTasks = state.selectedTasks.map((__selectedTask) => {
            if (__selectedTask.uniqueId === value.taskToMarkAsBooked) __selectedTask.booked = true;
            return __selectedTask;
        })
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
    setSearchResult: (state, value) => {
        state.searchResults = value;
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
    setSelectedProject: (state, value) => {
        state.selectedProject = value;
    },
    setRelatedTickets: (state, value) => {
        state.relatedTickets = value;
    },
    addBreak: (state, value) => {
        state.breaks.push(value);
    },
    setActiveTicket: (state, value) => {
        state.activeTicket = value;
    },
    toggleBreak: (state) => {
        state.onABreak = !state.onABreak;
    },
    updateTotalBreakTime: (state, value) => {
        state.accumulatedBreakTime = value.totalBreakTime
    },
    addToPrefilledSearchSuggestions : (state, value) => {
        // check needed to prevent duplication from aggregated search results for assigned & picked issues
        const isAlreadyInSuggestions = state.prefilledSearchSuggestions.filter((__searchSuggestion) => __searchSuggestion.key === value.key).length !== 0;
        if (!isAlreadyInSuggestions) state.prefilledSearchSuggestions.push(value);
    },
    updateOrderSearchSuggestions: (state) => {
        state.prefilledSearchSuggestions = _.reverse(state.prefilledSearchSuggestions);
    },
    saveTaskStartTime: (state, value) => {
        state.selectedTasks = state.selectedTasks.map((__selectedTask) => {
            if (__selectedTask.uniqueId === value.uniqueId) __selectedTask.startTime = value.startTime;
            return __selectedTask;
        })
    },
    saveTaskEndTime: (state, value) => {
        state.selectedTasks = state.selectedTasks.map((__selectedIssue) => {
            if (__selectedIssue.uniqueId === value.uniqueId) __selectedIssue.endTime = value.endTime;
            return __selectedIssue;
        })
    },
    removeSelectedTask: (state, value) => {
        state.selectedTasks = state.selectedTasks.filter((__selectedTask) => __selectedTask.uniqueId !== value);
    },
    removeAllSelectedTasks: (state, value) => {
        state.selectedTasks = [];
    },
    saveTaskComment: (state, value) => {
        state.selectedTasks = state.selectedTasks.map((__selectedTask) => {
            if (__selectedTask.uniqueId === value.uniqueId) __selectedTask.comment = value.comment;
            return __selectedTask;
        })
    },
    saveTimeSpentOnTask: (state, value) => {
        state.selectedTasks = state.selectedTasks.map((__selectedTask) => {
            if (__selectedTask.uniqueId === value.uniqueId) __selectedTask.timeSpent = value.timeSpent;
            return __selectedTask;
        })
    },
    addSelectedTask: (state, value) => {
        // hide any validation messages
        if (state.showErrorMessages) state.showErrorMessages = false; // todo

        state.selectedTasks.push(value);
    },

    assignToTicket: (state, value) => {
        const filteredByTaskKey = state.relatedTickets.filter((__relatedTicket) => __relatedTicket.key === value.assignedTicketKey);

        state.selectedTasks = state.selectedTasks.map((__selectedTask, index) => {
            if (__selectedTask.uniqueId === value.uniqueId) {
                __selectedTask.key = value.assignedTicketKey;
                __selectedTask.summary = filteredByTaskKey[0].summary;
                __selectedTask.assignedToTicket = true;
                __selectedTask.issueLink = process.env.BASE_DOMAIN + process.env.ENDPOINT_BROWSE + value.assignedTicketKey;
                __selectedTask.booked = false;
                __selectedTask.uniqueId = _.now() + index; // todo
            }
            return __selectedTask;
        })
    },
    assignNameToCustomTask: (state, value) => {
        state.selectedTasks = state.selectedTasks.map((__selectedTask) => {
            if (__selectedTask.uniqueId === value.currentTaskKey) {
                __selectedTask.key = value.assignedTaskKey;
                __selectedTask.issueLink = process.env.BASE_DOMAIN + process.env.ENDPOINT_BROWSE + value.assignedTaskKey;
            }
            return __selectedTask;
        })
    }
};

export const actions = {
    saveBookmarksToStorage: function ({ state }) {
        return new Promise((resolve, reject) => {
            this.$localForage.setItem('BOOKMARKS', state.bookmarked)
                .then(() => resolve())
                .catch(() => reject())
        })
    },
    saveSelectedTasksToStorage: function ({ state }) {
        return new Promise((resolve, reject) => {
            this.$localForage.setItem('SELECTEDTASKS', state.selectedTasks)
                .then(() => resolve())
                .catch(() => reject())
        })
    },
    saveBreaksToStorage: function ({ state }) {
        return new Promise((resolve, reject) => {
            this.$localForage.setItem('BREAKS', state.accumulatedBreakTime)
                .then(() => resolve())
                .catch(() => reject())
        })
    },
    retrieveBreaksFromStorage: function({ commit }) {
        return new Promise((resolve, reject) => {
            this.$localForage.getItem('BREAKS').then((__result) => {
                if (!_.isEmpty(__result)) {
                    commit('updateTotalBreakTime', { totalBreakTime: __result });

                    resolve();
                } else {
                    resolve();
                }
            })
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
    requestSavingSingleWorklog: function ({ state, commit, dispatch }, payload) {
        return new Promise(async (resolve, reject) => {
            axios({ method: 'post', baseURL: __base_url, url: `/api/addWorklog`, data: { headers: getters.getHeader(state), comment: payload.comment, timeSpentSeconds: payload.timeSpentSeconds, ticketId: payload.ticketId }})
                .then(() => {
                    commit('markTaskAsBooked', { taskToMarkAsBooked: payload.uniqueId });

                    dispatch('saveSelectedTasksToStorage').then(() => resolve()).catch(() => reject());
                })
                .catch((err) => reject(err));
        })
    },
    requestSavingWorklogs: function ({ state, commit, dispatch }) {
        return new Promise(async (resolve, reject) => {
            if (state.selectedTasks.length !== 0) { // todo
                let hasNonTrackedTasks = state.selectedTasks.filter((__selectedTask) => !(__selectedTask.timeSpent)).length !== 0;

                let hasUnassignedCustomTasks = state.selectedTasks.filter((__selectedTask) => !__selectedTask.assignedToTicket).length !== 0;

                if (hasNonTrackedTasks || hasUnassignedCustomTasks) reject();

                if (!hasNonTrackedTasks && !hasUnassignedCustomTasks) {
                    try {
                        await Promise.all(state.selectedTasks.map(async __selectedTask => {
                            if (!__selectedTask.booked) await axios({ method: 'post', baseURL: __base_url, url: `/api/addWorklog`, data: { headers: getters.getHeader(state), comment: __selectedTask.comment, timeSpentSeconds: __selectedTask.timeSpent, ticketId: __selectedTask.key }})
                        }))
                            .then(() => {
                                state.selectedTasks.forEach((__bookedTask) => commit('markTaskAsBooked', { taskToMarkAsBooked: __bookedTask.uniqueId }));

                                dispatch('saveSelectedTasksToStorage').then(() => resolve()).catch(() => reject());
                            })
                            .catch(() => reject()); // todo
                    } catch (err) {
                        console.log("err occurred in requestSavingWorklogs");
                        reject(err);
                    }
                }
            } else {
                reject("no selected tasks"); // todo
            }
        })
    },
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
    resetState: function({ commit, state, dispatch }, payload) {
        return new Promise((resolve, reject) => {
            commit('setSessionObject', {});
            commit('setCurrentUserName', {});
            commit('setSearchResult', []);
            commit('resetPrefilledSearchSuggestions');
            commit('setExistingProjects', []);
            commit('setBookmarks', []);
            commit('setSelectedTasks', []);
            commit('updateTotalBreakTime', { totalBreakTime: '00:00:00' });

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
            axios({ method: 'delete', baseURL: __base_url, url: `/api/logout`, params: { value: state.sessionObject.value } }) // todo
                .then((_response) => {
                    if (_response.data.status === 204) {
                        dispatch('resetState')
                            .then(() => resolve())
                            .catch(() => reject())
                    } else {
                        // todo
                        reject()
                    }
                })
                .catch((err) => console.log("err occurred: ", err))
        })
    },
    createApiObject: function({ commit, state, dispatch }, payload) {
        return new Promise((resolve, reject) => {
            console.log("process.env.PORT: ", process.env.PORT);
            console.log("process.env.baseUrl: ", process.env.baseUrl);
            console.log("process.env.VERCEL_URL: ", process.env.VERCEL_URL);
            axios({ method: 'post', baseURL: __base_url, url: `/api/login`, data: { username: payload.data.name, password: payload.data.pass }})
                .then(async (response) => {
                    if (response.data) { // todo
                        if (response.data === 401) reject("Your credentials are not valid."); // todo
                        if (response.data === 403) reject("Try again later.");

                        if (response.data !== 401 && response.data !== 403) {
                            commit('setSessionObject', response.data);

                            await Promise.all([
                                await dispatch('saveSessionIdToCookies'),
                                await dispatch('retrieveSelectedTasksFromStorage'),
                                await dispatch('retrieveBreaksFromStorage'),
                                await dispatch('retrieveBookmarksFromStorage'),
                            ])
                                .then(() => resolve())
                                .catch(() => {
                                    console.log("err occurred while saving/retrieving to/from localForage");
                                    reject();
                                })
                        }
                    } else {
                        resolve();
                    }
                })
                .catch((err) => {
                    reject();
                })
        })
    },
    getIssue: function ({commit, state, dispatch}, payload) {
        return new Promise((resolve, reject) => {
            axios({ method: 'post', baseURL: __base_url, url: `/api/getTickets`, data: { headers: getters.getHeader(state), searchTerm: payload.searchTerm, currentUser: state.currentUser.name }})
                .then((__res) => {
                    if (__res.data.issues.length !== 0) {
                        const searchResults =__res.data.issues.map((__issueInSearchResult, index) => {
                            return {
                                summary: __issueInSearchResult.fields.summary,
                                key: __issueInSearchResult.key,
                                issueLink: process.env.BASE_DOMAIN + process.env.ENDPOINT_BROWSE + __issueInSearchResult.key,
                                comment: '',
                                timeSpent: 0,
                                startTime: '',
                                endTime: '',
                                assignedToTicket: true,
                                booked: false,
                                uniqueId: _.now() + index // todo
                            };
                        })

                        commit('setSearchResult', searchResults);

                        searchResults.forEach((__searchResult) => commit('addToPrefilledSearchSuggestions', __searchResult))

                        commit('updateOrderSearchSuggestions');

                        resolve(searchResults);
                    } else {
                        // case when there is no search result
                        commit('setSearchResult', []);

                        resolve();
                    }
                })
                .catch((err) => {
                    if(state.onABreak) commit('toggleBreak');

                    if (state.isTimerActive) {
                        commit('setLastTicket', state.activeTicket);

                        commit('setIsTimerActive');
                    }

                    reject(err);
                })
        })
    },
    requestAllProjects: function ({commit, state, dispatch}, payload) {
        return new Promise((resolve, reject) => {
            // only re-fetch projects on initial load & reload/refresh
            if (state.allExistingProjects.length === 0) {
                axios({ method: 'post', baseURL: __base_url, url: `/api/getProjects`, data: { headers: getters.getHeader(state) }})
                    .then((__res) => {
                        commit('setExistingProjects', __res.data);

                        resolve();
                    })
                    .catch((err) => reject(err))
            }
        })
    },
    requestRelatedTickets: function ({commit, state, dispatch}, payload) {
        return new Promise((resolve, reject) => {
            axios({ method: 'post', baseURL: __base_url, url: `/api/getProjectRelatedTickets`, data: { headers: getters.getHeader(state), selectedProject: state.selectedProject }})
                .then((__res) => {
                    const __relatedTickets = __res.data.issues.map((__ticket) =>  {
                        return {
                            id: __ticket.id,
                            key: __ticket.key,
                            summary: __ticket.fields.summary,
                            // booked: false // todo
                        }
                    })

                    commit('setRelatedTickets', __relatedTickets);

                    resolve();
                })
                .catch((err) => {
                    // regardless any further errors a non-valid sessionId needs to lead to a logout // todo
                    dispatch('resetState').then(() => reject(err)).catch(() => reject(err));
                })
        })
    },
    retrieveSelectedTasksFromStorage: function({ commit }) {
        return new Promise((resolve, reject) => {
            this.$localForage.getItem('SELECTEDTASKS').then((__result) => {
                if (!_.isEmpty(__result)) {
                    commit('setSelectedTasks', __result);

                    resolve();
                } else {
                    resolve();
                }
            })
        })
    },
    requestSmartPickedIssues: function ({ state }) {
        return new Promise((resolve, reject) => {
            axios({ method: 'post', baseURL: __base_url, url: `/api/getSmartPickedIssues`, data:{ headers: getters.getHeader(state) }})
                .then((__res) => resolve(__res.data))
                .catch((err) => reject(err))
        })
    },
    requestAssignedTickets: function ({commit, state, dispatch}, payload) {
        return new Promise((resolve, reject) => {
            axios({ method: 'post', baseURL: __base_url, url: `/api/getAssignedTickets`, data: { headers: getters.getHeader(state) }})
                .then((__res) => resolve(__res.data))
                .catch((err) => reject(err))

        })
    },
    requestPrefill: function ({ commit, dispatch }) {
        return new Promise(async (resolve, reject) => {
            try {
                const [ assignedTickets, smartPickedIssues ] = await Promise.all([ dispatch('requestAssignedTickets'), dispatch('requestSmartPickedIssues') ]);


                // assignedTickets
                commit('setCurrentUserName', { name: assignedTickets.issues[0].fields.assignee.name });

                const __parsedAssignedIssues = assignedTickets.issues.map((__issue, index) => {
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
                __parsedAssignedIssues.forEach((__issue) => commit('addToPrefilledSearchSuggestions', __issue));


                // smartPickedIssues
                const __parsedSmartPickedIssues = smartPickedIssues.sections[0].issues.map((issue, index) => {
                    return {
                        key: issue.key,
                        summary: issue.summary,
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

                resolve();
            } catch (err) {
                if (err.response.status === 401) {
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
