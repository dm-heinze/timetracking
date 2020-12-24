import axios from 'axios';
import _ from 'lodash';
import { __base_url } from "../utility/constants";

export const state = () => ({
    searchResults: [],
    searchTerm: '',
    searchLoading: false,
    alreadyExists: false, // searchTerm matches ticketId pattern & searchTerm already in state.prefilledSearchSuggestions
    selectedProject: '',
    relatedTickets: []
})

export const mutations = {
    setAlreadyExists: (state, payload) => {
        state.alreadyExists = payload; // payload of type bool
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
    setSelectedProject: (state, value) => {
        state.selectedProject = value;
    },
    setRelatedTickets: (state, value) => {
        state.relatedTickets = value;
    }
}

export const actions = {
    resetSearch: function({ commit, state }, payload) {
        commit('setSearchTerm', '');
        commit('setSearchResult', []);
        if (payload.close) commit('moduleUser/toggleSettings', {}, { root: true });
    },
    getIssue: function ({ commit, state, rootState, rootGetters, dispatch }, payload) {
        return new Promise((resolve, reject) => {
            axios({
                method: 'post',
                baseURL: __base_url,
                url: `/api/getTickets`,
                data: {
                    headers: rootGetters['moduleUser/getHeader'],
                    searchTerm: payload.searchTerm,
                    currentUser: rootState.moduleUser.currentUser.name
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

                        searchResults.forEach((__searchResult) => commit('moduleUser/addToPrefilledSearchSuggestions', __searchResult, { root: true })) // todo

                        commit('moduleUser/updateOrderSearchSuggestions', {}, { root: true }); // todo

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
                            if (rootState.moduleBreak.onABreak) commit('moduleBreak/toggleBreak', {}, { root: true });

                            if (rootState.moduleUser.isTimerActive) {
                                commit('moduleUser/logoutStarted', true, { root: true });

                                commit('moduleUser/setLastTicket', rootState.moduleUser.activeTicket, { root: true });

                                commit('moduleUser/setActiveTicket', '', { root: true });

                                commit('moduleUser/setIsTimerActive', {}, { root: true });
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
    requestRelatedTickets: function ({ commit, state, rootGetters, dispatch }, payload) {
        return new Promise((resolve, reject) => {
            axios({
                method: 'post',
                baseURL: __base_url,
                url: `/api/getProjectRelatedTickets`,
                data: {
                    headers: rootGetters['moduleUser/getHeader'],
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
                            commit('moduleUser/logoutStarted', true, { root: true });

                            dispatch('moduleUser/stopTrackers', {}, { root: true })
                                .then(() => {
                                    // regardless any further errors a non-valid sessionId needs to lead to a logout // todo
                                    dispatch('moduleUser/resetState', {}, { root: true })
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
    }
}
