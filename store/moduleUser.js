import axios from 'axios';
import _ from 'lodash';
import base64 from 'base-64';

export const state = () => ({
    user: {
        name: '',
        pass: ''
    },
    jiraApiObj: {},
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
    showErrorMessages: false
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
    setUserName: (state, value) => {
        state.user.name = value;
    },
    setUserPass: (state, value) => {
        state.user.pass = value;
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
        state.allExistingProjects = value;
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
            axios.post('/api/addWorklog', { headers: getters.getHeader(state), comment: payload.comment, timeSpentSeconds: payload.timeSpentSeconds, ticketId: payload.ticketId })
                .then(() => {
                    commit('markTaskAsBooked', { taskToMarkAsBooked: payload.uniqueId });

                    dispatch('saveSelectedTasksToStorage').then(() => resolve()).catch(() => reject());
                })
                .catch(() => reject());
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
                            if (!__selectedTask.booked) await axios.post('/api/addWorklog', { headers: getters.getHeader(state), comment: __selectedTask.comment, timeSpentSeconds: __selectedTask.timeSpent, ticketId: __selectedTask.key })
                        }))
                            .then(() => {
                                state.selectedTasks.forEach((__bookedTask) => commit('markTaskAsBooked', { taskToMarkAsBooked: __bookedTask.uniqueId }));

                                dispatch('saveSelectedTasksToStorage').then(() => resolve()).catch(() => reject());
                            })
                            .catch(() => reject()); // todo
                    } catch (e) {
                        console.log("err occurred in requestSavingWorklogs");
                        reject();
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
    retrieveSessionFromCookies: function({ commit, state }, payload) {
        return new Promise((resolve, reject) => {
            const __sessionIdVal = this.$cookies.get('JSESSIONID')
            if (!_.isEmpty(__sessionIdVal)) {
                commit('setSessionObject', { value: base64.decode(__sessionIdVal), name: 'JSESSIONID' })

                resolve();
            } else {
                resolve();
            }

        })
    },
    setUser: function({commit, state}, payload) {
        return new Promise((resolve, reject) => {
            commit('setUserName', payload.data.name);
            commit('setUserPass', payload.data.pass);
            resolve('user set');
        })
    },
    resetState: function({ commit, state, dispatch }, payload) {
        return new Promise((resolve, reject) => {
            commit('setSessionObject', {});
            commit('setCurrentUserName', {});
            commit('setSearchResult', []);
            commit('setUserName', {});
            commit('setUserPass', {});
            commit('resetPrefilledSearchSuggestions');
            commit('setExistingProjects', []);

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
            axios.delete('/api/logout', { params: { value: state.sessionObject.value } })
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
            commit('setUserName', payload.data.name);
            commit('setUserPass', payload.data.pass);

            axios.post('/api/login', { username: state.user.name, password: state.user.pass })
                .then((response) => {
                    if (response.data) { // todo
                        if (response.data === 401) reject("Your credentials are not valid.");
                        if (response.data === 403) reject("Try again later.");

                        if (response.data !== 401 && response.data !== 403) {
                            commit('setSessionObject', response.data);

                            dispatch('saveSessionIdToCookies')
                                .then(() => resolve())
                                .catch(() => console.log("err occurred while saving to localForage"))
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

            axios.post('/api/getTickets', { headers: getters.getHeader(state), searchTerm: payload.searchTerm, currentUser: state.currentUser.name })
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
                if (process.server) {
                    axios({
                        method: 'GET',
                        url: process.env.BASE_DOMAIN + process.env.ENDPOINT_REST + 'project',
                        headers: getters.getHeader(state),
                    })
                        .then((__response) => {
                            const stringifiedResponse = JSON.stringify(__response.data);

                            resolve(JSON.parse(stringifiedResponse));
                        })
                        .catch((err) => reject(err))
                } else {
                    axios.post('/api/getProjects', { headers: getters.getHeader(state) })
                        .then((__res) => resolve(__res.data))
                        .catch((err) => reject(err))
                }
            } else {
                resolve();
            }
        })
    },
    requestRelatedTickets: function ({commit, state, dispatch}, payload) {
        return new Promise((resolve, reject) => {
            axios.post('/api/getProjectRelatedTickets', { headers: getters.getHeader(state), selectedProject: state.selectedProject })
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
                .catch(() => console.log("err occurred"))
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

            if (process.server) {
                axios({
                    method: 'GET',
                    url: process.env.BASE_DOMAIN + process.env.ENDPOINT_REST + 'issue/picker',
                    headers: getters.getHeader(state),
                })
                    .then((__response) => {
                        const stringifiedResponse = JSON.stringify(__response.data);

                        resolve(JSON.parse(stringifiedResponse));
                    })
                    .catch((err) => reject(err))
            } else {
               axios.post('/api/getSmartPickedIssues', { headers: getters.getHeader(state) })
                    .then((__res) => resolve(__res.data))
                    .catch((err) => reject(err))
            }
        })
    },
    requestAssignedTickets: function ({commit, state, dispatch}, payload) {
        return new Promise((resolve, reject) => {
            if (process.server) {
                const jqlSearchString = `assignee = currentUser() AND resolution = Unresolved order by updated DESC`;

                axios({
                    method: 'POST', // use POST to get the assigned tickets only
                    url: process.env.BASE_DOMAIN + process.env.ENDPOINT_REST + 'search',
                    data: { jql: jqlSearchString },
                    headers: getters.getHeader(state),
                })
                    .then((__response) => {
                        const stringifiedResponse = JSON.stringify(__response.data);

                        resolve(JSON.parse(stringifiedResponse));
                    })
                    .catch((err) => {
                        if (err.response.status === 401) console.log("no valid sessionId");

                        reject(err);
                    })
            } else {
                axios.post('/api/getAssignedTickets', { headers: getters.getHeader(state) })
                    .then((__res) => resolve(__res.data))
                    .catch((err) => reject(err))
            }
        })
    },
    requestPrefill: function ({commit, state, dispatch}, payload) {
        return new Promise((resolve, reject) => {
            dispatch('requestAssignedTickets')
                .then((__res) => {
                    commit('setCurrentUserName', { name: __res.issues[0].fields.assignee.name });

                    const __parsedAssignedIssues = __res.issues.map((__issue, index) => {
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

                    __parsedAssignedIssues.forEach((__issue) => commit('addToPrefilledSearchSuggestions', __issue))

                    dispatch('requestSmartPickedIssues')
                        .then((__res) => {
                            const __parsedSmartPickedIssues = __res.sections[0].issues.map((issue, index) => {
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

                            dispatch('requestAllProjects')
                                .then((__res) => {
                                    const __projects = __res.map((__project) => { return {
                                        id: __project.id,
                                        key: __project.key,
                                        name: __project.name,
                                        avatar: __project.avatarUrls['16x16']
                                    }})

                                    commit('setExistingProjects', __projects);

                                    resolve()
                                })
                                .catch((err) => reject(err));
                        })
                        .catch((err) => reject(err))
                })
                .catch((err) => {
                    commit('setSessionObject', {}); // todo

                    dispatch('removeFromCookies', 'JSESSIONID') // todo
                        .then(() => reject(err)) // todo
                        .catch(() => reject(err))
                })
        })
    }
};
