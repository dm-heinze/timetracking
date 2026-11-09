import { defineStore } from 'pinia'

const DEFAULT_ORDER = ['bookmarks', 'assigned', 'planned']

function isValidOrder(value) {
    return (
        Array.isArray(value) &&
        value.length === DEFAULT_ORDER.length &&
        DEFAULT_ORDER.every((key) => value.includes(key))
    )
}

export const useSettingsStore = defineStore('settings', {
    state: () => ({
        sidebarOrder: [...DEFAULT_ORDER]
    }),

    getters: {
        validatedSidebarOrder(state) {
            return isValidOrder(state.sidebarOrder) ? state.sidebarOrder : [...DEFAULT_ORDER]
        }
    },

    actions: {
        moveSectionUp(index) {
            if (index <= 0) return
            const order = [...this.sidebarOrder]
            ;[order[index - 1], order[index]] = [order[index], order[index - 1]]
            this.sidebarOrder = order
        },

        moveSectionDown(index) {
            if (index >= this.sidebarOrder.length - 1) return
            const order = [...this.sidebarOrder]
            ;[order[index], order[index + 1]] = [order[index + 1], order[index]]
            this.sidebarOrder = order
        }
    },

    persist: {
        storage: piniaPluginPersistedstate.localStorage(),
    },
})
