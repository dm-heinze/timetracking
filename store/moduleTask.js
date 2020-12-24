import axios from 'axios';
import _ from 'lodash';
import { __base_url } from "../utility/constants";

export const state = () => ({
    selectedTasks: [],
    editingCustomTask: '',
    showErrorMessages: false,
    showAllSelectedTasksOfCurrentDay: false, // show booked AND non-booked selectedTasks
    showUnbookedTasksNotOfTheDay: false,
})

export const getters = {
    // previously saved tasks will not have the field 'dayAdded' when retrieved from localStorage
    // but to prevent loss of any unbooked tasks when re-ordering selectedTasks, all non-booked tasks from before need to be retained in storage
    getSelectedTasksWithoutDayIndicator: (state) => {
        return state.selectedTasks.filter((__ticket) => !__ticket.hasOwnProperty('dayAdded'))
    },
    getSelectedTasksWithDayIndicator: (state) => {
        return state.selectedTasks.filter((__ticket) => __ticket.hasOwnProperty('dayAdded'))
    },
    getSelectedTicket: (state, getters, rootState) => (__assignedTicketKey) => {
        return rootState.moduleUser.relatedTickets.filter((__relatedTicket) => __relatedTicket.key === __assignedTicketKey); // todo
    }
}

export const mutations = {
    // booking
    markTaskAsBooked: (state, value) => {
        state.selectedTasks = state.selectedTasks.map((__selectedTask) => {
            if (__selectedTask.uniqueId === value.taskToMarkAsBooked) __selectedTask.booked = true;
            return __selectedTask;
        })
    },
    setBookedAt: (state, value) => {
        state.selectedTasks = state.selectedTasks.map((__selectedTask) => {
            if (__selectedTask.uniqueId === value.taskToSetBookedAt) __selectedTask.bookedAt = _.now();
            return __selectedTask;
        })
    },
    // end of booking

    // selected tasks
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
    toggleShowErrorMessages: (state, payload) => {
        state.showErrorMessages = payload.show;
    },
    updateEditingCustomTask: (state, payload) => {
        state.editingCustomTask = payload.activeTaskId;
    },
    assignTaskToTicket: (state, value) => {
        state.selectedTasks = state.selectedTasks.map((__selectedTask, index) => {
            if (__selectedTask.uniqueId === value.uniqueId) {
                __selectedTask.key = value.assignedTicket.key;
                __selectedTask.summary = value.assignedTicket.summary;
                __selectedTask.assignedToTicket = true;
                __selectedTask.issueLink = process.env.BASE_DOMAIN + process.env.ENDPOINT_BROWSE + value.assignedTicket.key;
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
    },
    setSelectedTasks: (state, value) => {
        state.selectedTasks = value;
    },
    removeDoesNotHaveFieldDayAddedTasks: (state, value) => {
        state.selectedTasks = state.selectedTasks.filter((__task) => __task.hasOwnProperty('dayAdded'))
    },
    toggleShowAllSelectedTasksOfCurrentDay: (state, value) => {
        if (!state.showUnbookedTasksNotOfTheDay) state.showAllSelectedTasksOfCurrentDay = !state.showAllSelectedTasksOfCurrentDay;
    },
    toggleUnbookedTasksNotOfTheDay: (state, value) => {
        state.showUnbookedTasksNotOfTheDay = !state.showUnbookedTasksNotOfTheDay;
    }
    // end of selected tasks
}

export const actions = {
    // booking
    requestSavingSingleWorklog: function ({ state, rootState, rootGetters, commit, dispatch }, payload) {
        return new Promise(async (resolve, reject) => {
            axios({ method: 'post',
                baseURL: __base_url,
                url: `/api/addWorklog`,
                data: {
                    headers: rootGetters['moduleUser/getHeader'],
                    comment: payload.comment,
                    timeSpentSeconds: payload.timeSpentSeconds,
                    ticketId: payload.ticketId
                }
            })
                .then(() => {
                    commit('markTaskAsBooked', { taskToMarkAsBooked: payload.uniqueId });

                    commit('setBookedAt', { taskToSetBookedAt: payload.uniqueId }); // previously booked items won't have this field set in this step! (previous as in previous implementation)

                    dispatch('saveSelectedTasksToStorage').then(() => resolve()).catch(() => reject());
                })
                .catch((err) => {
                    if (err.response) {
                        if (err.response.status === 401) {
                            if (rootState.moduleUser.isTimerActive) commit('moduleUser/logoutStarted', true, { root: true });
                            dispatch('moduleUser/stopTrackers', {}, { root: true })
                                .then(() => {
                                    // regardless any further errors a non-valid sessionId needs to lead to a logout // todo
                                    dispatch('moduleUser/resetState', {}, { root: true })
                                        .then(() => reject(err))
                                        .catch(() => reject(err));
                                })
                                .catch(() => reject(err)) // todo
                        } else reject(err);
                    } else reject(err);
                });
        })
    },
    requestSavingWorklogs: function ({ state, rootState, rootGetters, commit, dispatch }) {
        return new Promise(async (resolve, reject) => {
            if (state.selectedTasks.length !== 0) { // todo!

                let hasNonTrackedTasks = state.selectedTasks
                    .filter((__selectedTask) => __selectedTask.dayAdded === rootState.moduleUser.currentDay)
                    .filter((__selectedTask) => !(__selectedTask.timeSpent))
                    .length !== 0;

                let hasUnassignedCustomTasks = state.selectedTasks
                    .filter((__selectedTask) => __selectedTask.dayAdded === rootState.moduleUser.currentDay)
                    .filter((__selectedTask) => !__selectedTask.assignedToTicket)
                    .length !== 0;

                if (hasNonTrackedTasks || hasUnassignedCustomTasks) reject();

                if (!hasNonTrackedTasks && !hasUnassignedCustomTasks) {
                    try {
                        // only book tasks from today
                        // - tasks from previous days should only be booked one by one via 'requestSavingSingleWorklog'
                        await Promise.all(
                            state.selectedTasks
                                .filter((__selectedTask) => __selectedTask.dayAdded === rootState.moduleUser.currentDay)
                                .map(async __selectedTask => {
                                    if (!__selectedTask.booked) {
                                        await axios({
                                            method: 'post',
                                            baseURL: __base_url,
                                            url: `/api/addWorklog`,
                                            data: {
                                                headers: rootGetters['moduleUser/getHeader'],
                                                comment: __selectedTask.comment,
                                                timeSpentSeconds: __selectedTask.timeSpent,
                                                ticketId: __selectedTask.key
                                            }
                                        })
                                    }
                                })
                        )
                            .then(() => {
                                // note: previously booked items won't have the field 'bookedAt' set in this step!
                                // (previous as in previous implementation)

                                // only mark those tasks as booked that are from current day as only those got booked above
                                state.selectedTasks
                                    .filter((__selectedTask) => __selectedTask.dayAdded === rootState.moduleUser.currentDay)
                                    .forEach((__bookedTask) => {
                                        commit('markTaskAsBooked', { taskToMarkAsBooked: __bookedTask.uniqueId })
                                        commit('setBookedAt', { taskToSetBookedAt: __bookedTask.uniqueId })
                                    });

                                dispatch('saveSelectedTasksToStorage').then(() => resolve()).catch(() => reject());
                            })
                            .catch((err) => {
                                console.log("err occurred: ", err);

                                if (err.response) { // todo
                                    if (err.response.status === 401) {
                                        if (rootState.moduleUser.isTimerActive) commit('moduleUser/logoutStarted', true, { root: true });
                                        dispatch('moduleUser/stopTrackers', {}, { root: true })
                                            .then(() => {
                                                // regardless any further errors a non-valid sessionId needs to lead to a logout // todo
                                                dispatch('moduleUser/resetState', {}, { root: true })
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
    // end of booking

    // selected tasks
    // this action was previously a mutation
    // refactored to action to allow access to getters
    assignToTicket: function ({ state, getters, commit, dispatch }, payload) {
        return new Promise(async (resolve, reject) => {
            const __task = getters.getSelectedTicket(payload.assignedTicketKey)[0]; // todo

            // pass through uniqueId received from caller component TicketAssignment.vue
            commit('assignTaskToTicket', { assignedTicket: __task, uniqueId: payload.uniqueId });

            resolve();
        }
    )},
    saveSelectedTasksToStorage: function ({ state }) {
        return new Promise((resolve, reject) => {
            this.$localForage.setItem('SELECTEDTASKS', state.selectedTasks)
                .then(() => resolve())
                .catch(() => reject())
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
                        commit('moduleUser/updateListDoesNotHaveFieldDayAdded', __doesNotHaveFieldDayAdded, { root: true });

                        commit('moduleUser/toggleUnbookedTasksLeftModal', {}, { root: true }); // this toggles on the visibility of the modal
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
    }
    // end of selected tasks
}
