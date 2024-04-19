<template>
  <div>
    <IssuePicker :issues="issues" @select-issue="select" class="space-y-3" />
  </div>
</template>

<script>
import IssuePicker from "./IssuePicker.vue";

export default {
  name: 'IssuesAssignedToMe',
  components: { IssuePicker },
  data() {
    return {
      issues: []
    }
  },
  async created() {
    await this.getIssuesAssignedToMe()
  },
  methods: {
    getIssuesAssignedToMe: async function () {
      try {
        const { issues } = await this.$jira.issueSearch.searchForIssuesUsingJqlPost({ jql: 'assignee = currentUser() AND resolution = Unresolved order by updated DESC', fields: ['summary'] });
        this.issues = issues;
      } catch (e) {
        console.log(e);
      }
    },
    select: function (issue) {
      this.$emit('select-issue', issue);
    }
  }
}
</script>
