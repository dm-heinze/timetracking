import axios from 'axios';
import _ from 'lodash';
import base64 from 'base-64';
import { __base_url } from "../utility/constants";

export const state = () => ({
    sessionObject: {}, // currently has 2 fields: name & value,
    currentUser: {},
    searchResults: [],
    searchTerm: '',
    searchLoading: false,
    alreadyExists: false, // searchTerm matches ticketId pattern & searchTerm already in state.prefilledSearchSuggestions
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
    assignedTickets: [],
    lastTicket: '',
    bookmarked: [],
    settingsOpen: false,
    showSuggestions: true,
    suggestionGroups: ['Assigned Tickets', 'Suggestions', 'Bookmarks'], // default order
    showErrorMessages: false,
    errorOccurred: false, // todo
    editingCustomTask: '',
    logoutInProgress: false,
    currentDay: '',
    showAllSelectedTasksOfCurrentDay: false, // show booked AND non-booked selectedTasks
    showUnbookedTasksLeftModal: false, // any tasks from previous days w/ no 'dayAdded' field can be booked through the modal shown when this state value has val true
    doesNotHaveFieldDayAdded: []
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
    },
    // previously saved tasks will not have the field 'dayAdded' when retrieved from localStorage
    // but to prevent loss of any unbooked tasks when re-ordering selectedTasks, all non-booked tasks from before need to be retained in storage
    getSelectedTasksWithoutDayIndicator: (state) => {
        return state.selectedTasks.filter((__ticket) => !__ticket.hasOwnProperty('dayAdded'))
    },
    getSelectedTasksWithDayIndicator: (state) => {
        return state.selectedTasks.filter((__ticket) => __ticket.hasOwnProperty('dayAdded'))
    }
}

export const mutations = {
    toggleUnbookedTasksLeftModal: (state, value) => {
        state.showUnbookedTasksLeftModal = !state.showUnbookedTasksLeftModal;
    },
    updateListDoesNotHaveFieldDayAdded: (state, value) => {
        state.doesNotHaveFieldDayAdded = value;
    },
    removeFromDoesNotHaveFieldDayAdded: (state, payload) => {
        state.doesNotHaveFieldDayAdded = state.doesNotHaveFieldDayAdded.filter((__task) => __task.uniqueId !== payload.uniqueIdOfTaskToDelete)
    },
    saveTimeSpentOnDoesNotHaveFieldDayAddedTask: (state, value) => {
        state.doesNotHaveFieldDayAdded = state.doesNotHaveFieldDayAdded.map((__selectedTask) => {
            if (__selectedTask.uniqueId === value.uniqueId) __selectedTask.timeSpent = value.timeSpent;
            return __selectedTask;
        })
    },
    removeDoesNotHaveFieldDayAddedTasks: (state, value) => {
        state.selectedTasks = state.selectedTasks.filter((__task) => __task.hasOwnProperty('dayAdded'))
    },
    toggleShowAllSelectedTasksOfCurrentDay: (state, value) => {
        state.showAllSelectedTasksOfCurrentDay = !state.showAllSelectedTasksOfCurrentDay;
    },
    setCurrentDay: (state, payload) => {
        state.currentDay = payload.currentDay; // todo
    },
    toggleSuggestions: (state, value) => {
        state.showSuggestions = !state.showSuggestions;
    },
    setShowSuggestions: (state, value) => {
        state.showSuggestions = value;
    },
    setBookedAt: (state, value) => {
        state.selectedTasks = state.selectedTasks.map((__selectedTask) => {
            if (__selectedTask.uniqueId === value.taskToSetBookedAt) __selectedTask.bookedAt = _.now();
            return __selectedTask;
        })
    },
    setAlreadyExists: (state, payload) => {
        state.alreadyExists = payload; // payload of type bool
    },
    updateErrorOccurred: (state, payload) => {
        state.errorOccurred = payload;
    },
    logoutStarted: (state, payload) => {
        state.logoutInProgress = payload;
    },
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
    setSuggestionGroups: (state, value) => {
        state.suggestionGroups = value;
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
    setSearchTerm: (state, value) => {
        state.searchTerm = value;
    },
    setSearchLoading: (state, value) => {
        state.searchLoading = value;
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
    saveSuggestionGroupsToStorage: function ({ state }) {
        return new Promise((resolve, reject) => {
            this.$localForage.setItem('SUGGESTION_GROUPS', state.suggestionGroups)
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
    },
    toggleBookmarked: function ({ state, commit, dispatch }, payload) {
        return new Promise(async (resolve, reject) => {
            // summary default==='' -> no val may be passed in
            commit('updateBookmarks', { bookmark: payload.searchResultToBeToggled, summary: payload.summary ? payload.summary : '' });

            dispatch('saveBookmarksToStorage').then(() => resolve()).catch(() => reject());
        })
    },
    addToSelectedIssues: function ({ state, commit, dispatch }, payload) {
        return new Promise(async (resolve, reject) => {
            let __selection;

            if (payload.fromSearchResults) {
                __selection = _.cloneDeep(payload.selectedTicket);
                __selection.uniqueId = _.now();
                __selection.dayAdded = new Date().toDateString();
            } else {
                __selection = {
                    assignedToTicket: true,
                    uniqueId: _.now(),
                    key: payload.selectedTicket.key,
                    issueLink: process.env.BASE_DOMAIN + process.env.ENDPOINT_BROWSE + payload.selectedTicket.key,
                    summary: payload.selectedTicket.summary,
                    comment: '',
                    timeSpent: 0,
                    startTime: '',
                    endTime: '',
                    booked: false,
                    assignee: '', // todo!
                    dayAdded: new Date().toDateString()
                };
            }

            commit('addSelectedTask', __selection);

            dispatch('saveSelectedTasksToStorage').then(() => resolve()).catch(() => reject());
        })
    },
    requestSavingSingleWorklog: function ({ state, commit, dispatch }, payload) {
        return new Promise(async (resolve, reject) => {
            axios({ method: 'post', baseURL: __base_url, url: `/api/addWorklog`, data: { headers: getters.getHeader(state), comment: payload.comment, timeSpentSeconds: payload.timeSpentSeconds, ticketId: payload.ticketId }})
                .then(() => {
                    commit('markTaskAsBooked', { taskToMarkAsBooked: payload.uniqueId });

                    commit('setBookedAt', { taskToSetBookedAt: payload.uniqueId }); // previously booked items won't have this field set in this step! (previous as in previous implementation)

                    dispatch('saveSelectedTasksToStorage').then(() => resolve()).catch(() => reject());
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.status === 401) {
                            if (state.isTimerActive) commit('logoutStarted', true);
                            dispatch('stopTrackers')
                                .then(() => {
                                    // regardless any further errors a non-valid sessionId needs to lead to a logout // todo
                                    dispatch('resetState')
                                        .then(() => reject(err))
                                        .catch(() => reject(err));
                                })
                                .catch(() => reject(err)) // todo
                        } else reject(err);
                    } else reject(err);
                });
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
                            if (!__selectedTask.booked) {
                                await axios({
                                    method: 'post',
                                    baseURL: __base_url,
                                    url: `/api/addWorklog`,
                                    data: {
                                        headers: getters.getHeader(state),
                                        comment: __selectedTask.comment,
                                        timeSpentSeconds: __selectedTask.timeSpent,
                                        ticketId: __selectedTask.key
                                    }
                                })
                            }
                        }))
                            .then(() => {
                                // note: previously booked items won't have the field 'bookedAt' set in this step!
                                // (previous as in previous implementation)
                                state.selectedTasks.forEach((__bookedTask) => {
                                    commit('markTaskAsBooked', { taskToMarkAsBooked: __bookedTask.uniqueId })
                                    commit('setBookedAt', { taskToSetBookedAt: __bookedTask.uniqueId })
                                });

                                dispatch('saveSelectedTasksToStorage').then(() => resolve()).catch(() => reject());
                            })
                            .catch((err) => {
                                console.log("err occurred: ", err);

                                if (err.response) {
                                    if (err.response.status === 401) {
                                        if (state.isTimerActive) commit('logoutStarted', true);
                                        dispatch('stopTrackers')
                                            .then(() => {
                                                // regardless any further errors a non-valid sessionId needs to lead to a logout // todo
                                                dispatch('resetState')
                                                    .then(() => reject(err))
                                                    .catch(() => reject(err));
                                            })
                                            .catch(() => reject(err)) // todo
                                    } else reject(err);
                                } else reject(err);
                            });
                    } catch (err) {
                        console.log("err occurred in requestSavingWorklogs: ", err);

                        reject(err); // todo
                    }
                }
            } else {
                reject("no selected tasks"); // todo
            }
        })
    },
    requestSavingPreviousWorklogs: function ({ state, commit, dispatch }) {
        return new Promise(async (resolve, reject) => {
            // todo
            if (state.doesNotHaveFieldDayAdded.length !== 0) { // todo
                let hasNonTrackedTasks = state.doesNotHaveFieldDayAdded.filter((__selectedTask) => !(__selectedTask.timeSpent)).length !== 0;

                let hasUnassignedCustomTasks = state.doesNotHaveFieldDayAdded.filter((__selectedTask) => !__selectedTask.assignedToTicket).length !== 0;

                if (hasNonTrackedTasks || hasUnassignedCustomTasks) reject();

                if (!hasNonTrackedTasks && !hasUnassignedCustomTasks) {
                    try {
                        await Promise.all(state.doesNotHaveFieldDayAdded.map(async __selectedTask => {
                            if (!__selectedTask.booked) {
                                await axios({
                                    method: 'post',
                                    baseURL: __base_url,
                                    url: `/api/addWorklog`,
                                    data: {
                                        headers: getters.getHeader(state),
                                        comment: __selectedTask.comment,
                                        timeSpentSeconds: __selectedTask.timeSpent,
                                        ticketId: __selectedTask.key
                                    }
                                })
                            }
                        }))
                            .then(() => {
                                // remove all tasks as they have been booked
                                // if they had been booked previously w/ no 'dayAdded' field they would've been already removed on app start anyways
                                // the field 'dayAdded' was not part of previous implementations
                                commit('updateListDoesNotHaveFieldDayAdded', []);

                                // remove every task from selectedTasks that does not include field dayAdded
                                commit('removeDoesNotHaveFieldDayAddedTasks');

                                // save updated list of selectedTasks to storage
                                dispatch('saveSelectedTasksToStorage').then(() => resolve()).catch(() => reject());
                            })
                            .catch((err) => {
                                console.log("err occurred: ", err);

                                if (err.response) {
                                    if (err.response.status === 401) {
                                        if (state.isTimerActive) commit('logoutStarted', true);
                                        dispatch('stopTrackers')
                                            .then(() => {
                                                // regardless any further errors a non-valid sessionId needs to lead to a logout // todo
                                                dispatch('resetState')
                                                    .then(() => reject(err))
                                                    .catch(() => reject(err));
                                            })
                                            .catch(() => reject(err)) // todo
                                    } else reject(err);
                                } else reject(err);
                            });
                    } catch (err) {
                        console.log("err occurred in requestSavingPreviousWorklogs: ", err);

                        reject(err); // todo
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
    resetSearch: function({ commit, state }, payload) {
        commit('setSearchTerm', '');
        commit('setSearchResult', []);
        if (payload.close) commit('toggleSettings');
    },
    stopTrackers: function({ commit, state, dispatch }, payload) {
        return new Promise((resolve, reject) => { // todo
            // check if any break or task trackers are active
            if (state.onABreak) commit('toggleBreak');

            if (state.isTimerActive) {
                commit('setLastTicket', state.activeTicket);

                commit('setActiveTicket', '');

                commit('setIsTimerActive');
            }

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
            if (state.selectedProject) commit('setSelectedProject', '');
            if (state.relatedTickets) commit('setRelatedTickets', []); // todo
            commit('setBookmarks', []);
            commit('setSelectedTasks', []);
            commit('updateTotalBreakTime', { totalBreakTime: '00:00:00' });
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
                            await dispatch('retrieveSelectedTasksFromStorage'),
                            await dispatch('retrieveBreaksFromStorage'),
                            await dispatch('retrieveBookmarksFromStorage'),
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
    getIssue: function ({commit, state, dispatch}, payload) {
        return new Promise((resolve, reject) => {
            axios({
                method: 'post',
                baseURL: __base_url,
                url: `/api/getTickets`,
                data: {
                    headers: getters.getHeader(state),
                    searchTerm: payload.searchTerm,
                    currentUser: state.currentUser.name
                }
            })
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
                    if (err.response) {
                        if (err.response.status === 401) {
                            // stop any running trackers before logout step
                            if(state.onABreak) commit('toggleBreak');

                            if (state.isTimerActive) {
                                commit('logoutStarted', true);

                                commit('setLastTicket', state.activeTicket);

                                commit('setActiveTicket', '');

                                commit('setIsTimerActive');
                            }

                            /*if (state.isTimerActive) commit('logoutStarted', true);
                           dispatch('stopTrackers'); */

                            reject(err.response.status);
                        }
                        else reject(err); // todo: status code?
                    } else reject(err);
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
    requestRelatedTickets: function ({commit, state, dispatch}, payload) {
        return new Promise((resolve, reject) => {
            axios({
                method: 'post',
                baseURL: __base_url,
                url: `/api/getProjectRelatedTickets`,
                data: {
                    headers: getters.getHeader(state),
                    selectedProject: state.selectedProject
                }
            })
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
                    if (err.response) {
                        if (err.response.status === 401) {
                            commit('logoutStarted', true);

                            dispatch('stopTrackers')
                                .then(() => {
                                    // regardless any further errors a non-valid sessionId needs to lead to a logout // todo
                                    dispatch('resetState')
                                        .then(() => reject(err))
                                        .catch(() => reject(err));
                                })
                                .catch(() => reject(err)) // todo
                        } else reject(err); // todo
                    } else {
                        reject(err); // todo
                    }
                })
        })
    },
    retrieveSelectedTasksFromStorage: function({ commit, dispatch }) { // todo
        return new Promise((resolve, reject) => {
            this.$localForage.getItem('SELECTEDTASKS').then((__result) => {
                if (!_.isEmpty(__result)) {
                    const expirationDuration = 5 * 24 * 60 * 60 * 1000; // 5 days in milliseconds - bc val of 'bookedAt' is in milliseconds // todo: actual val to be used in prod
                    // const expirationDuration = 72000; // 1.2 minutes in milliseconds // todo: val for testing purposes

                    // important: previously booked items won't have the field 'bookedAt' set!
                    // -> delete silently if the field does not exist for booked tasks
                    // general note: only SOME TASKS will have the 'bookedAt' field: when being booked the field 'bookedAt' gets added
                    // if the item is either not booked yet or booked but not expired yet leave in list
                    // - everything else will be deleted from localStorage & never sent to vuex store
                    const __removedExpiredBookedTasks = __result.filter((__task) =>
                        // using hasOwnProperty in condition will delete previously booked items (previous as in previous implementation)
                        // any booked tasks that have not expired yet & have the field dayAdded -> keep in list
                        // todo: case -> booked + but not expired + does not have the field dayAdded -> SOLVED below //
                        (__task.booked && __task.hasOwnProperty('bookedAt') && ((__task.bookedAt + expirationDuration) > _.now()) && __task.hasOwnProperty('dayAdded')) || !__task.booked
                    )

                    const __doesNotHaveFieldDayAdded = __removedExpiredBookedTasks.filter((__task) => !__task.hasOwnProperty('dayAdded'));
                    if (__doesNotHaveFieldDayAdded.length) {
                        commit('updateListDoesNotHaveFieldDayAdded', __doesNotHaveFieldDayAdded);

                        commit('toggleUnbookedTasksLeftModal'); // this toggles on the visibility of the modal
                    }

                    // set vuex store state
                    commit('setSelectedTasks', __removedExpiredBookedTasks); // todo: dayAdded field - alternative implementation

                    // save vuex store state to localStorage
                    // anything (booked && expired) will now be completely removed from selectedTasks list:
                    dispatch('saveSelectedTasksToStorage').then(() => resolve()).catch(() => reject());
                } else {
                    resolve();
                }
            })
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
