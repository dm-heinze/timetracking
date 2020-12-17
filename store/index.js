import base64 from 'base-64';

export const actions = {
    nuxtServerInit: function({ commit, state }, payload) {
        return new Promise((resolve, reject) => {
            // day
            const __lastSavedCurrentDay = this.$cookies.get('CURRENT_DAY');
            const __currentDayNow = new Date().toDateString();

            if (__lastSavedCurrentDay) {
                if (__lastSavedCurrentDay !== __currentDayNow) {
                    // not the same day anymore
                    // -> set today's date to vuex store
                    commit('moduleUser/setCurrentDay', { currentDay: __currentDayNow });

                    // & update cookies
                    this.$cookies.set('CURRENT_DAY', __currentDayNow);
                } else {
                    // still the same day
                    // -> use saved date for vuex store
                    commit('moduleUser/setCurrentDay', { currentDay: __lastSavedCurrentDay });
                }
            } else {
                // no val yet saved to cookies todo: expire cookie?
                this.$cookies.set('CURRENT_DAY', __currentDayNow);

                commit('moduleUser/setCurrentDay', { currentDay: __currentDayNow });
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
