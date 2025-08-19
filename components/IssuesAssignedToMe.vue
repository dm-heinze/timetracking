<template>
    <div>
        <IssuePicker :issues="issues" @select-issue="select" class="space-y-3" />
    </div>
</template>

<script setup>
const emit = defineEmits(['select-issue'])

const issues = ref([])
const { isAuthenticated } = useAuth()

watch(isAuthenticated, async (newVal, oldVal) => {
    if (!oldVal && newVal) {
        await getIssuesAssignedToMe()
    }
})

async function getIssuesAssignedToMe() {
    try {
        const jiraClient = useJiraClient()
        if (!jiraClient) return

        const { issues: jiraIssues } = await jiraClient.issueSearch.searchForIssuesUsingJqlEnhancedSearchPost({
            jql: 'assignee = currentUser() AND resolution = Unresolved order by updated DESC',
            fields: ['summary']
        })
        issues.value = jiraIssues
    } catch (e) {
        console.error(e)
    }
}

function select(issue) {
    emit('select-issue', issue)
}

onMounted(async () => {
    await getIssuesAssignedToMe()
})
</script>