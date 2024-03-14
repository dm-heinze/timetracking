export const state = () => ({
  list: []
})

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

export const mutations = {
  add (state, issue) {
    const obj = {
      ...issue,
      ...dynamicIssueDataMock
    }

    obj.storeId = uuidv4()

    state.list.push(obj)
  },
  remove (state, { id }) {
    let currentIssue = state.list.find((issue) => issue.storeId === id)
    const issueIndex = state.list.indexOf(currentIssue)
    state.list.splice(issueIndex, 1)
  },
  update (state, { id, property, value }) {
    let currentIssue = state.list.find((issue) => issue.storeId === id)
    const issueIndex = state.list.indexOf(currentIssue)
    currentIssue[property] = value
    state.list[issueIndex] = currentIssue
  },
  override (state, { id, issue }) {
    let currentIssue = state.list.find((issue) => issue.storeId === id)
    const issueIndex = state.list.indexOf(currentIssue)
    currentIssue = Object.assign(currentIssue, issue)
    state.list[issueIndex] = currentIssue
  }
}
