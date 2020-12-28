import axios from 'axios';
import { __base_url } from "../utility/constants";

export const state = () => ({
    showUnbookedTasksLeftModal: false, // any tasks from previous days w/ no 'dayAdded' field can be booked through the modal shown when this state value has val true
    doesNotHaveFieldDayAdded: [],
    updateMessageShown: false
})

export const mutations = {
    updateUpdateMessageShown: (state, value) => {
        state.updateMessageShown = value;
    },
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
    saveCommentOfDoesNotHaveFieldDayAddedTask: (state, value) => {
        state.doesNotHaveFieldDayAdded = state.doesNotHaveFieldDayAdded.map((__selectedTask) => {
            // casting to a number bc event.target.name resulted in a string val
            if (__selectedTask.uniqueId === Number(value.uniqueId)) __selectedTask.comment = value.comment;
            return __selectedTask;
        })
    }
}

export const actions = {
    requestSavingPreviousWorklogs: function ({ state, rootState, rootGetters, commit, dispatch }) {
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
                                        headers: rootGetters['moduleUser/getHeader'],
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
                                commit('moduleTask/removeDoesNotHaveFieldDayAddedTasks', {}, { root: true });

                                // save updated list of selectedTasks to storage
                                dispatch('moduleTask/saveSelectedTasksToStorage', {}, { root: true })
                                    .then(() => resolve())
                                    .catch(() => reject()); // todo
                            })
                            .catch((err) => {
                                console.log("err occurred: ", err);

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
                    } catch (err) {
                        console.log("err occurred in requestSavingPreviousWorklogs: ", err);

                        reject(err); // todo
                    }
                }
            } else {
                reject("no selected tasks"); // todo
            }
        })
    }
}
