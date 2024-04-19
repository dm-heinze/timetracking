export const state = () => ({
  active: false,
  interval: null,
  time: '00:00:00'
})

export const mutations = {
  setState (state, { stateName, value }) {
    state[stateName] = value
  }
}
