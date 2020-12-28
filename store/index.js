import base64 from 'base-64';

export const actions = {
    nuxtServerInit: function({ commit, state }, payload) {
        return new Promise((resolve, reject) => {
            // sessionId
            const __cookieExists = this.$cookies.get('JSESSIONID');

            if (!__cookieExists) resolve();

            if (__cookieExists) {
                commit('moduleUser/setSessionObject', { value: base64.decode(__cookieExists), name: 'JSESSIONID' });

                resolve();
            }
        })
    }
};
