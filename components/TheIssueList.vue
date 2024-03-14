<template>
  <div v-if="issues.length === 0">
    No issues selected yet
  </div>
  <div class="flex flex-col gap-5" v-else>
    <Issue v-for="issue in issues" :key="issue.storeId" :issue-data="issue" />
  </div>
</template>

<script>
import Issue from './Issue.vue'

export default {
  name: 'TheIssueList',
  components: { Issue },
  computed: {
    issues () {
      return this.$store.state.issues.list
    }
  },
  mounted() {
    // Stop running timers can occur on page refresh while task is running
    const runningTask = this.issues.find((issue) => issue.interval !== null)
    if (runningTask) {
      this.$store.commit('issues/update', { id: runningTask.storeId, property: 'interval', value: null })
    }
  }
}
</script>
