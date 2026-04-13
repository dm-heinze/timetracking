<template>
    <div>
        <div v-if="tempoAuthRequired" class="flex flex-col gap-3">
            <p class="text-sm text-neutral-content">Connect your Tempo account to see scheduled tickets.</p>
            <button @click="tempoLogin()" class="btn btn-primary btn-sm w-fit">
                <Icon name="lucide:calendar-check" class="w-4 h-4" />
                Connect Tempo
            </button>
        </div>

        <div v-else class="space-y-3">
            <IssuePicker :issues="issues" @select-issue="select" class="space-y-3" />
            <ProjectPicker :projects="projects" @select-project="selectProject" class="space-y-3" />
        </div>
    </div>
</template>

<script setup>
const emit = defineEmits(['select-issue', 'assign-project'])

const issues = ref([])
const projects = ref([])
const tempoAuthRequired = ref(false)
const { isAuthenticated } = useAuth()
const { tempoLogin, tempoRefreshToken } = useTempoAuth()

watch(isAuthenticated, async (newVal, oldVal) => {
    if (!oldVal && newVal) {
        await getPlannedTickets()
    }
})

async function getPlannedTickets() {
    try {
        const response = await $fetch('/api/tempo/plans')

        if (response.tempoAuthRequired) {
            const refreshed = await tempoRefreshToken()
            if (refreshed) {
                const retryResponse = await $fetch('/api/tempo/plans')
                if (retryResponse.tempoAuthRequired) {
                    tempoAuthRequired.value = true
                    return
                }
                await loadData(retryResponse)
            } else {
                tempoAuthRequired.value = true
            }
            return
        }

        tempoAuthRequired.value = false
        await loadData(response)
    } catch (e) {
        console.error(e)
    }
}

async function loadData({ issueIds, projectIds }) {
    const jiraClient = useJiraClient()
    if (!jiraClient) return

    await Promise.all([
        loadIssues(jiraClient, issueIds),
        loadProjects(jiraClient, projectIds)
    ])
}

async function loadIssues(jiraClient, issueIds) {
    if (!issueIds?.length) {
        issues.value = []
        return
    }

    const { issues: jiraIssues } = await jiraClient.issueSearch.searchForIssuesUsingJqlEnhancedSearchPost({
        jql: `id IN (${issueIds.join(',')}) order by created DESC`,
        fields: ['summary']
    })
    issues.value = jiraIssues
}

async function loadProjects(jiraClient, projectIds) {
    if (!projectIds?.length) {
        projects.value = []
        return
    }

    const results = await Promise.all(
        projectIds.map(id => jiraClient.projects.getProject({ projectIdOrKey: id }))
    )
    projects.value = results
}

function select(issue) {
    emit('select-issue', issue)
}

function selectProject(project) {
    emit('assign-project', project.key)
}

onMounted(async () => {
    await getPlannedTickets()
})
</script>
