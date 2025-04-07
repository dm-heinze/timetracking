import { defineStore } from 'pinia'

const dynamicIssueDataMock = {
    storeId: null,
    comment: '',
    timeSpent: '00:00:00',
    interval: null
}

function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

export const useIssuesStore = defineStore('issues', {
    state: () => ({
        list: []
    }),

    actions: {
        add(issue) {
            const obj = {
                ...issue,
                ...dynamicIssueDataMock
            }

            obj.storeId = uuidv4()

            this.list.push(obj)
        },

        remove({ id }) {
            const issueIndex = this.list.findIndex((issue) => issue.storeId === id)
            if (issueIndex !== -1) {
                this.list.splice(issueIndex, 1)
            }
        },

        update({ id, property, value }) {
            const issueIndex = this.list.findIndex((issue) => issue.storeId === id)
            if (issueIndex !== -1) {
                this.list[issueIndex][property] = value
            }
        },

        override({ id, issue }) {
            const issueIndex = this.list.findIndex((issue) => issue.storeId === id)
            if (issueIndex !== -1) {
                this.list[issueIndex] = { ...this.list[issueIndex], ...issue }
            }
        }
    },

    persist: {
        storage: piniaPluginPersistedstate.localStorage(),
    },
})