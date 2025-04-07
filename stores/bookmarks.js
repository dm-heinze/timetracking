import { defineStore } from 'pinia'

export const useBookmarksStore = defineStore('bookmarks', {
    state: () => ({
        list: []
    }),

    actions: {
        add(issue) {
            const currentIssue = this.list.find((storeIssue) => storeIssue.id === issue.id)
            if (!currentIssue) {
                this.list.push(issue)
            }
        },

        remove(issue) {
            const issueIndex = this.list.findIndex((storeIssue) => storeIssue.id === issue.id)
            if (issueIndex !== -1) {
                this.list.splice(issueIndex, 1)
            }
        }
    },

    persist: {
        storage: piniaPluginPersistedstate.localStorage(),
    },
})