import axios from 'axios';
import _ from 'lodash';

export const state = () => ({
    user: {
        name: '',
        pass: ''
    },
    jiraApiObj: {},
    sessionObject: {}, // currently has 2 fields: name & value,
    currentUser: {},
    searchResults: [],
    selectedIssues: [],
    customTasks: [],
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
    lastTicket: ''
});

export const mutations = {
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
    setJiraApiObj: (state, value) => {
        state.jiraApiObj = value;
    },
    setSessionObject: (state, value) => {
        state.sessionObject = value;
    },
    setCurrentUser: (state, value) => {
        if (_.isEmpty(value)) {
            state.currentUser = {}
        } else {
            state.currentUser = {
                // avatar: value.avatarUrls['48x48'],
                displayName: value.displayName,
                key: value.key,
                name: value.name,
                emailAddress: value.emailAddress
                // timeZone: value.timeZone
            }
        }
    },
    setSearchResult: (state, value) => {
        state.searchResults = value;
    },
    addSelectedIssue: (state, value) => {
        state.selectedIssues.push(value);
    },
    removeSelectedTicket: (state, value) => {
        state.selectedIssues = state.selectedIssues.filter((__selectedIssue) => __selectedIssue.key !== value);
    },
    removeAllSelectedTickets: (state) => {
        state.selectedIssues = [];
    },
    addCustomTask: (state) => {
        const newCustomTask = { assignedTo: '', key: `New custom task ${state.customTasks.length + 1}`, issueLink: '', summary: '', comment: '', timeSpent: '', booked: false };
        state.customTasks.push(newCustomTask);
    },
    removeCustomTask: (state, value) => {
        state.customTasks = state.customTasks.filter((__customTask) => __customTask.key !== value);
    },
    saveComment: (state, value) => {
        state.selectedIssues = state.selectedIssues.map((__selectedIssue) => {
            if (__selectedIssue.key === value.ticket) __selectedIssue.comment = value.comment;
            return __selectedIssue;
        })
    },
    setIsTimerActive: (state, value) => {
        state.isTimerActive = !(state.isTimerActive);
    },
    saveTimeSpent: (state, value) => {
        state.selectedIssues = state.selectedIssues.map((__selectedIssue) => {
            if (__selectedIssue.key === value.ticket) __selectedIssue.timeSpent = value.timeSpent;
            return __selectedIssue;
        })
    },
    saveStartTime: (state, value) => {
        state.selectedIssues = state.selectedIssues.map((__selectedIssue) => {
            if (__selectedIssue.key === value.ticket) __selectedIssue.startTime = value.startTime;
            return __selectedIssue;
        })
    },
    saveEndTime: (state, value) => {
        state.selectedIssues = state.selectedIssues.map((__selectedIssue) => {
            if (__selectedIssue.key === value.ticket) __selectedIssue.endTime = value.endTime;
            return __selectedIssue;
        })
    },
    saveStartTimeCustomTask: (state, value) => {
        state.customTasks = state.customTasks.map((__customTask) => {
            if (__customTask.key === value.customTaskKey) __customTask.startTime = value.startTime;
            return __customTask;
        })
    },
    saveEndTimeCustomTask: (state, value) => {
        state.customTasks = state.customTasks.map((__customTask) => {
            if (__customTask.key === value.customTaskKey) __customTask.endTime = value.endTime;
            return __customTask;
        })
    },
    saveTimeSpentCustomTask: (state, value) => {
        state.customTasks = state.customTasks.map((__customTask) => {
            if (__customTask.key === value.customTaskKey) __customTask.timeSpent = value.timeSpent;
            return __customTask;
        })
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

    // unified versions
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
    // end unified versions

    assignNameToCustomTask: (state, value) => {
        state.selectedTasks = state.selectedTasks.map((__selectedTask) => {
            if (__selectedTask.key === value.currentTaskKey) {
                __selectedTask.key = value.assignedTaskKey;
                __selectedTask.issueLink = process.env.BASE_DOMAIN + process.env.ENDPOINT_BROWSE + value.assignedTaskKey;
            }
            return __selectedTask;
        })
    }
};

export const getters = {
    getUser: state => {
        return state.user;
    },
    getJiraApiObj: state => {
        return state.jiraApiObj;
    }
};

export const actions = {
    saveSelectedTasksToStorage: function ({ state }) {
        return new Promise((resolve, reject) => {
            this.$localForage.setItem('SELECTEDTASKS', state.selectedTasks)
                .then(() => resolve())
                .catch(() => reject())
        })
    },
    saveSelectedCustomTasksToStorage: function ({ state }) {
        return new Promise((resolve, reject) => {
            this.$localForage.setItem('CUSTOMTASKS', state.customTasks)
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
    requestSavingSingleWorklog: function ({ state, commit, dispatch }, payload) {
        return new Promise(async (resolve, reject) => {
            axios.post('/api/addWorklog', { sessionId: state.sessionObject.value, comment: payload.comment, timeSpentSeconds: payload.timeSpentSeconds, ticketId: payload.ticketId })
                .then(() => {
                    commit('markTaskAsBooked', { taskToMarkAsBooked: payload.uniqueId });

                    dispatch('saveSelectedTasksToStorage').then(() => resolve()).catch(() => reject());
                })
                .catch(() => reject());
        })
    },
    requestSavingWorklogs: function ({ state, commit, dispatch }) {
        return new Promise(async (resolve, reject) => {
            if (state.selectedTasks.length !== 0) {
                let hasNonTrackedTasks = state.selectedTasks.filter((__selectedTask) => !(__selectedTask.timeSpent)).length !== 0;

                let hasUnassignedCustomTasks = state.selectedTasks.filter((__selectedTask) => !__selectedTask.assignedToTicket).length !== 0;

                if (hasNonTrackedTasks) reject("hasNonTrackedTasks");
                if (hasUnassignedCustomTasks) reject("hasUnassignedCustomTasks");
                if (!hasNonTrackedTasks && !hasUnassignedCustomTasks) {
                    try {
                        await Promise.all(state.selectedTasks.map(async __selectedTask => {
                            if (!__selectedTask.booked) await axios.post('/api/addWorklog', { sessionId: state.sessionObject.value, comment: __selectedTask.comment, timeSpentSeconds: __selectedTask.timeSpent, ticketId: __selectedTask.key })
                        }))
                            .then(() => {
                                state.selectedTasks.forEach((__bookedTask) => {
                                    commit('markTaskAsBooked', { taskToMarkAsBooked: __bookedTask.key }); // todo

                                    dispatch('saveSelectedTasksToStorage').then(() => resolve()).catch(() => reject());
                                });
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

    saveSelectedTicketsToStorage: function ({ state }) {
        return new Promise((resolve, reject) => {
            this.$localForage.setItem('SELECTEDTICKETS', state.selectedIssues)
                .then(() => resolve())
                .catch(() => reject())
        })
    },
    retrieveSelectedTicketsFromStorage: function({ commit }) {
        return new Promise((resolve, reject) => {
            this.$localForage.getItem('SELECTEDTICKETS').then((__result) => {
                if (!_.isEmpty(__result)) {
                    for (let __retrievedTicket of __result) {
                        let currentTicket = {
                            summary: __retrievedTicket.summary,
                            key: __retrievedTicket.key,
                            issueLink: __retrievedTicket.issueLink,
                            comment: __retrievedTicket.comment,
                            timeSpent: __retrievedTicket.timeSpent,
                            startTime:  __retrievedTicket.startTime,
                            endTime: __retrievedTicket.endTime,
                            // assignee: __retrievedTicket.assignee // todo
                            booked: __retrievedTicket.booked,
                            uniqueId: __retrievedTicket.uniqueId
                        }

                        commit('addSelectedIssue', currentTicket);
                    }

                    resolve();
                } else {
                    resolve();
                }
            })
        })
    },
    saveCurrentUserToStorage: function ({ state }) {
        return new Promise((resolve, reject) => {
            this.$localForage.setItem('JIRAUSER', {
                // avatar: state.currentUser.avatarUrls['48x48'],
                displayName: state.currentUser.displayName,
                key: state.currentUser.key,
                name: state.currentUser.name,
                emailAddress: state.currentUser.emailAddress
                // timeZone: state.currentUser.timeZone
            })
                .then(() => resolve())
                .catch(() => reject())
        })
    },
    retrieveCurrentUserFromStorage: function({ commit }) {
        return new Promise((resolve, reject) => {
            this.$localForage.getItem('JIRAUSER').then((__result) => {
                if (!_.isEmpty(__result)) {
                    commit('setCurrentUser', {
                        // avatar: __result.avatarUrls['48x48'],
                        displayName: __result.displayName,
                        key: __result.key,
                        name: __result.name,
                        emailAddress: __result.emailAddress
                        // timeZone: __result.timeZone
                    })

                    resolve();
                } else {
                    resolve();
                }
            })
        })
    },
    removeFromStorage: function({commit, state}, payload) {
        return new Promise((resolve, reject) => {
            this.$localForage.removeItem(payload)
                .then(() => resolve())
                .catch(() => reject())
        })
    },
    saveSessionIdToStorage: function({commit, state}, payload) {
        return new Promise((resolve, reject) => {
            // todo
            this.$localForage.setItem(state.sessionObject.name, { sessionId: state.sessionObject.value, addedAt: Date.now() })
                .then(() => resolve())
                .catch(() => {
                    console.log("err occurred when saving to localForage");
                    reject();
                })
        })
    },
    retrieveSessionFromStorage: function({ commit, state }, payload) {
        return new Promise((resolve, reject) => {
            this.$localForage.getItem('JSESSIONID').then((__result) => {
                if (!_.isEmpty(__result)) {
                    commit('setSessionObject', { value: __result.sessionId, name: 'JSESSIONID' })
                    resolve();
                } else {
                    resolve();
                }
            })
        })
    },
    setUser: function({commit, state}, payload) {
        return new Promise((resolve, reject) => {
            commit('setUserName', payload.data.name);
            commit('setUserPass', payload.data.pass);
            resolve('user set');
        })
    },
    requestSessionRemoval: function({ commit, state, dispatch }) {
        return new Promise((resolve, reject) => {
            axios.delete('/api/logout', { params: { value: state.sessionObject.value } })
                .then((_response) => {
                    if (_response.data.status === 204) {
                        commit('setSessionObject', {});
                        commit('setCurrentUser', {});
                        commit('setSearchResult', []);
                        commit('setUserName', {});
                        commit('setUserPass', {});
                        commit('removeAllSelectedTickets');

                        dispatch('removeFromStorage', 'JSESSIONID')
                            .then(() => {
                                dispatch('removeFromStorage', 'JIRAUSER')
                                    .then(() => resolve())
                                    .catch(() => {
                                        console.log("err occurred while removing entry from storage");
                                        reject();
                                    })
                            })
                            .catch(() => {
                                console.log("err occurred while removing entry from storage");
                                reject();
                            })
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

                            dispatch('saveSessionIdToStorage')
                                .then(() => {
                                    dispatch('getCurrentUser')
                                        .then(() => {
                                            commit('setUserName', {});
                                            commit('setUserPass', {});

                                            resolve()
                                        })
                                        .catch(() => reject());
                                })
                                .catch(() => console.log("err occurred while saving to localForage"))
                        }
                    } else {
                        resolve();
                    }
                })
                .catch(() => {
                    reject();
                })
        })
    },
    getCurrentUser: function({ commit, state, dispatch }) {
        return new Promise((resolve, reject) => {
            axios.post('/api/getCurrentUser', { sessionId: state.sessionObject.value })
                .then((__res) => {
                    if (!_.isEmpty(__res.data)) {
                        commit('setCurrentUser', __res.data);

                        dispatch('saveCurrentUserToStorage').then(() => resolve()).catch(() => reject());
                    } else {
                        resolve();
                    }
                })
                .catch(() => {
                    console.log("err in getCurrentUser occurred");
                    reject();
                });
        })
    },
    getIssue: function ({commit, state, dispatch}, payload) {
        return new Promise((resolve, reject) => {

            axios.post('/api/getTickets', { sessionId: state.sessionObject.value, searchTerm: payload.searchTerm, currentUser: state.currentUser.name })
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
                .catch((err) => console.log("err occurred: ", err))
        })
    },
    requestAllProjects: function ({commit, state, dispatch}, payload) {
        return new Promise((resolve, reject) => {
            // only re-fetch projects on initial load & reload/refresh
            if (state.allExistingProjects.length === 0) {
                axios.post('/api/getProjects', { sessionId: state.sessionObject.value })
                    .then((__res) => {
                        const __projects = __res.data.map((__project) => { return {
                            id: __project.id,
                            key: __project.key,
                            name: __project.name,
                            avatar: __project.avatarUrls['16x16']
                        }})
                        commit('setExistingProjects', __projects);

                        resolve();
                    })
                    .catch(() => {
                        console.log("err occurred");

                        reject();
                    })
            } else {
                resolve();
            }
        })
    },
    requestRelatedTickets: function ({commit, state, dispatch}, payload) {
        return new Promise((resolve, reject) => {
            axios.post('/api/getProjectRelatedTickets', { sessionId: state.sessionObject.value, selectedProject: state.selectedProject })
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
    getPickedIssues: function ({commit, state, dispatch}, payload) {
        return new Promise((resolve, reject) => {

            axios.post('/api/getAutoCompletion', { sessionId: state.sessionObject.value, searchTerm: payload.searchTerm })
                .then((__res) => {
                    console.log("res: ", __res);

                    resolve();
                })
                .catch(() => console.log("err occurred"))
        })
    },
    requestAssignedTickets: function ({commit, state, dispatch}, payload) {
        return new Promise((resolve, reject) => {
            axios.post('/api/getAssignedTickets', { sessionId: state.sessionObject.value, currentUser: state.currentUser.name })
                .then((__res) => resolve(__res))
                .catch(() => console.log("err occurred"))
        })
    },
    requestPrefill: function ({commit, state, dispatch}, payload) {
        return new Promise((resolve, reject) => {
            dispatch('requestAssignedTickets')
                .then((__res) => {
                    const __parsedAssignedIssues = __res.data.issues.map((__issue, index) => {
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


                    axios.post('/api/getSmartPickedIssues', { sessionId: state.sessionObject.value })
                        .then((__res) => {
                            const __parsedSmartPickedIssues = __res.data.sections[0].issues.map((issue, index) => {
                                return {
                                    key: issue.key,
                                    summary: issue.summary,
                                    assignee: '',
                                    issueLink: process.env.BASE_DOMAIN + process.env.ENDPOINT_BROWSE + this.searchTerm,
                                    comment: '',
                                    timeSpent: 0,
                                    startTime: '',
                                    endTime: '',
                                    assignedToTicket: true,
                                    booked: false,
                                    uniqueId: _.now() + index // todo
                                }
                            })

                            __parsedSmartPickedIssues.forEach((__parsedIssue) => commit('addToPrefilledSearchSuggestions', __parsedIssue))

                            dispatch('requestAllProjects').then(() => resolve()).catch(() => console.log("err happened")); // todo
                        })
                        .catch((err) => console.log("err occurred: ", err))


                    resolve()
                })
                .catch((err) => console.log("err occurred: ", err))
        })
    }
};
