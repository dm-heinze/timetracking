import axios from 'axios';
import _ from 'lodash';
import { __base_url } from "../utility/constants";

export const state = () => ({
    allExistingProjects: [],
    prefilledSearchSuggestions: [], // todo
    assignedTickets: []
})

export const getters = {
    getSmartPickedSuggestions: (state, getters, rootState) => {
        return _.slice(state.prefilledSearchSuggestions.filter((__ticket) => __ticket.assignee !== rootState.moduleUser.currentUser.name), 0, 5) // end excluded
    }
}

export const mutations = {
    resetPrefilledSearchSuggestions : (state) => {
        state.prefilledSearchSuggestions = [];
    },
    setExistingProjects: (state, value) => {
        if (value.length === 0) state.allExistingProjects = value;
        else {
            state.allExistingProjects = value.map((__project) => {
                return {
                    id: __project.id,
                    key: __project.key,
                    name: __project.name,
                    avatar: __project.avatarUrls['16x16'] // todo
                }
            });
        }
    },
    addToPrefilledSearchSuggestions : (state, value) => {
        // check needed to prevent duplication from aggregated search results for assigned & picked issues
        const isAlreadyInSuggestions = state.prefilledSearchSuggestions.filter((__searchSuggestion) => __searchSuggestion.key === value.key).length !== 0;
        if (!isAlreadyInSuggestions) state.prefilledSearchSuggestions.push(value);
    },
    // needed bc if on refreshing assignedTickets, a ticket previously part of suggestions, may need to get removed from that listing
    updatePrefill: (state, value) => {
        // for every assignedTicket check if included in prefilledSearchSuggestions array
        // if included check if the assignee field == currentUser
        // if not - set it to the currentUser
        // bc -> assignee may be empty but should be currentUser.name:
        // if key already in prefilledSearchSuggestion the updated object will not be added to it by mutation addToPrefilledSearchSuggestions
        // bc -> the endpoint for smartPickedIssues does not return the assignee field for found issues
        state.assignedTickets.forEach((__assignedTicket) => {
            const __indexToUpdate = state.prefilledSearchSuggestions.findIndex((__searchSuggestion) => __searchSuggestion.key === __assignedTicket.key);

            if (state.prefilledSearchSuggestions[__indexToUpdate].assignee !== value.currentUser.name) { // todo
                state.prefilledSearchSuggestions[__indexToUpdate].assignee = value.currentUser.name;
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
}

export const actions = {
    updatePrefilledSearchSuggestions: function ({ commit, rootState }, payload) {
        return new Promise((resolve, reject) => { // todo
            commit('updatePrefill', { currentUser: rootState.moduleUser.currentUser });

            resolve();
        })
    },
    requestAllProjects: function ({ commit, state, rootGetters, dispatch }, payload) {
        return new Promise((resolve, reject) => {
            // only re-fetch projects on initial load & reload/refresh
            if (state.allExistingProjects.length === 0) {
                axios({
                    method: 'post',
                    baseURL: __base_url,
                    url: `/api/getProjects`,
                    data: {
                        headers: rootGetters['moduleUser/getHeader']
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
    refreshAssignedTickets: function ({ commit, state, dispatch }, payload) {
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
                            uniqueId: _.now() + index, // todo
                            startAndEndTimesArray: [] // todo
                        }
                    });
                    __parsedAssignedIssues.forEach((__issue) => commit('addToPrefilledSearchSuggestions', __issue)); // todo

                    commit('setAssignedTickets', __parsedAssignedIssues);

                    dispatch('updatePrefilledSearchSuggestions').then(() => resolve()).catch(() => reject()); // originally a mutation -> now action so currentUser can be retrieved via rootState
                })
                .catch((err) => {
                    console.log("An err occurred");
                    reject(err);
                })
        })
    },
    requestSmartPickedIssues: function ({ state, rootGetters }) {
        return new Promise((resolve, reject) => {
            axios({
                method: 'post',
                baseURL: __base_url,
                url: `/api/getSmartPickedIssues`,
                data: {
                    headers: rootGetters['moduleUser/getHeader']
                }
            })
                .then((__res) => resolve(__res.data))
                .catch((err) => {
                    if (err.response.status === 401) reject(err.response.status); // sessionId exists in cookies but has expired // todo
                    else reject(err);
                })
        })
    },
    requestAssignedTickets: function ({ commit, state, rootGetters, dispatch }, payload) {
        return new Promise((resolve, reject) => {
            axios({
                method: 'post',
                baseURL: __base_url,
                url: `/api/getAssignedTickets`,
                data: {
                    headers: rootGetters['moduleUser/getHeader']
                }
            })
                .then((__res) => resolve(__res.data))
                .catch((err) => {
                    // todo
                    if (err.response.status === 401) reject(err.response.status); // sessionId exists in cookies but has expired // todo
                    else reject(err);
                })
        })
    },
    requestPrefill: function ({ state, rootState, commit, dispatch }) {
        return new Promise(async (resolve, reject) => {
            try {
                const [ assignedTickets, smartPickedIssues ] = await Promise.all([ dispatch('requestAssignedTickets'), dispatch('requestSmartPickedIssues') ]);


                // assignedTickets
                if (assignedTickets.issues.length) {
                    // if there are assignedTickets but the request is not queued after the login step the val for currentUser was not set before
                    if (!rootState.moduleUser.currentUser.name) commit('moduleUser/setCurrentUserName', { name: assignedTickets.issues[0].fields.assignee.name }, { root: true }); // used to filter for assignedTickets without the need for an extra array // todo!

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
                            uniqueId: _.now() + index, // todo
                            startAndEndTimesArray: [] // todo
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
                        uniqueId: _.now() + index, // todo
                        startAndEndTimesArray: [] // todo
                    }
                })

                __parsedSmartPickedIssues.forEach((__parsedIssue) => commit('addToPrefilledSearchSuggestions', __parsedIssue));


                // if request not queued after login but due to reload the field may not be available if the assignedTickets.issues array is empty
                if (!rootState.moduleUser.currentUser.name && !assignedTickets.issues.length) {
                    dispatch('moduleUser/requestCurrentUser', {}, { root: true })
                        .then((__res) => {
                            commit('moduleUser/setCurrentUserName', { name: __res.name }, { root: true });

                            resolve();
                        })
                        .catch((err) => reject(err))
                } else {
                    resolve();
                }
            } catch (err) {
                if (err === 401) {
                    commit('moduleUser/setSessionObject', {}, { root: true }); // todo

                    dispatch('moduleUser/removeFromCookies', 'JSESSIONID', { root: true }) // todo
                        .then(() => reject(err)) // todo
                        .catch(() => reject(err))
                } else {
                    reject(err); // todo
                }
            }
        })
    }
}
