import base64 from 'base-64';

export const actions = {
    nuxtServerInit: function({ commit, state }, payload) {
        return new Promise((resolve, reject) => {
            // day
            const __lastSavedCurrentDay = this.$cookies.get('CURRENT_DAY');
            const __currentDayNow = new Date().toDateString();

            if (__lastSavedCurrentDay) {
                if (base64.decode(__lastSavedCurrentDay) !== __currentDayNow) {
                    // set new val to vuex store
                    commit('moduleUser/setCurrentDay', { currentDay: __currentDayNow });

                    // set new val to cookies
                    this.$cookies.set('CURRENT_DAY', base64.encode(__currentDayNow));
                }
            } else {
                this.$cookies.set('CURRENT_DAY', base64.encode(__currentDayNow)); // todo
            }


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
