export const state = () => ({
  list: []
})

export const mutations = {
  add (state, issue) {
    let currentIssue = state.list.find((storeIssue) => storeIssue.id === issue.id)
    if (!currentIssue) {
      state.list.push(issue)
    }
  },
  remove (state, { id }) {
    let currentIssue = state.list.find((issue) => issue.id === id)
    const issueIndex = state.list.indexOf(currentIssue)
    state.list.splice(issueIndex, 1)
  },
}
