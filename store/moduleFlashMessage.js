//
// request helper module
//
export const state = () => ({
    message: null,
    status: 'primary'
});

export const mutations = {
    setMessage: (state, value) => {
        state.message = value;
    },
    resetMessage: (state, value) => {
        state.message = null;
    },
    setStatus: (state, value) => {
        state.status = value;
    },
};

export const getters = {
    getMessage: function () {
        return state.message;
    },
    getStatus: function () {
        return state.status;
    }
};

export const actions = {
    flashMessage: function ({commit, state}, payload) {
        commit('setMessage', payload.message);
        commit('setStatus', payload.status);
    }
};
