import base64 from 'base-64';
import { __SHOW_START_AND_END_TIMES } from "~/utility/constants";

export const actions = {
    nuxtServerInit: function({ commit, state }, payload) {
        return new Promise((resolve, reject) => {
            // show start and end times
            const __cookieShowStartAndEndTimes = this.$cookies.get(__SHOW_START_AND_END_TIMES);

            if (__cookieShowStartAndEndTimes) {
                commit('moduleTask/setShowStartAndEndTimes', { value: __cookieShowStartAndEndTimes });
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
