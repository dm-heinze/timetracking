import axios from 'axios';
import { __base_url } from "../utility/constants";

export const actions = {
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
                    commit('moduleTask/updateBookedStatus', { taskToMarkAsBooked: payload.uniqueId }, { root: true });

                    dispatch('moduleTask/saveSelectedTasksToStorage', {}, { root: true })
                        .then(() => resolve())
                        .catch(() => reject());
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
    requestSavingWorklogs: function ({ state, rootState, getters, rootGetters, commit, dispatch }) {
        return new Promise(async (resolve, reject) => {
            if (rootState.moduleTask.selectedTasks.length !== 0) { // todo!
                let hasNonTrackedTasks = rootGetters['moduleTask/getSelectedTasksOfCurrentDay']
                    .filter((__selectedTask) => !(__selectedTask.timeSpent))
                    .length !== 0;

                let hasUnassignedCustomTasks = rootGetters['moduleTask/getSelectedTasksOfCurrentDay']
                    .filter((__selectedTask) => !__selectedTask.assignedToTicket)
                    .length !== 0;

                if (hasNonTrackedTasks || hasUnassignedCustomTasks) reject();

                if (!hasNonTrackedTasks && !hasUnassignedCustomTasks) {
                    try {
                        // only book tasks from today
                        // - tasks from previous days should only be booked one by one via 'requestSavingSingleWorklog'
                        await Promise.all(
                            rootGetters['moduleTask/getSelectedTasksOfCurrentDay']
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
                                rootGetters['moduleTask/getSelectedTasksOfCurrentDay']
                                    .forEach((__selectedTask) => {
                                        if (!__selectedTask.booked) { // todo
                                            commit('moduleTask/updateBookedStatus', { taskToMarkAsBooked: __selectedTask.uniqueId }, { root: true })
                                        }
                                    });

                                dispatch('moduleTask/saveSelectedTasksToStorage', {}, { root: true })
                                    .then(() => resolve())
                                    .catch(() => reject());
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
                                    } else if (err.response.status === 504) { // resolve on jira -> vercel timeout (DEV-65)
                                        rootGetters['moduleTask/getSelectedTasksOfCurrentDay']
                                            .forEach((__selectedTask) => {
                                                if (!__selectedTask.booked) { // todo
                                                    commit('moduleTask/updateBookedStatus', { taskToMarkAsBooked: __selectedTask.uniqueId }, { root: true })
                                                }
                                            });

                                        dispatch('moduleTask/saveSelectedTasksToStorage', {}, { root: true })
                                            .then(() => resolve())
                                            .catch(() => reject());
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
    }
}
