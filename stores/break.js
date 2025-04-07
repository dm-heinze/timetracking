import { defineStore } from 'pinia'

export const useBreakStore = defineStore('break', {
    state: () => ({
        active: false,
        interval: null,
        time: '00:00:00'
    }),

    actions: {
        setState({ stateName, value }) {
            this[stateName] = value
        }
    },

    persist: {
        storage: piniaPluginPersistedstate.localStorage(),
    },
})