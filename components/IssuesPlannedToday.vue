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

async function loadData({ plans = [] }) {
    const jiraClient = useJiraClient()
    if (!jiraClient) return

    await Promise.all([
        loadIssues(jiraClient, plans.filter(plan => plan.type === 'ISSUE')),
        loadProjects(jiraClient, plans.filter(plan => plan.type === 'PROJECT'))
    ])
}

// One entry per plan: an item planned twice shows up twice, each with its own note.
function toPlanEntries(plans, item) {
    return plans
        .filter(plan => plan.itemId === String(item.id))
        .map(plan => ({
            ...item,
            planId: plan.id,
            plannedNote: plan.note,
            plannedTime: formatDuration(plan.plannedSeconds)
        }))
}

// 5400 → "1h 30m", 1800 → "30m", 0 → null
function formatDuration(seconds) {
    if (!seconds) return null

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.round((seconds % 3600) / 60)

    return [hours && `${hours}h`, minutes && `${minutes}m`].filter(Boolean).join(' ')
}

async function loadIssues(jiraClient, issuePlans) {
    if (!issuePlans.length) {
        issues.value = []
        return
    }

    const issueIds = [...new Set(issuePlans.map(plan => plan.itemId))]
    const { issues: jiraIssues } = await jiraClient.issueSearch.searchForIssuesUsingJqlEnhancedSearchPost({
        jql: `id IN (${issueIds.join(',')}) order by created DESC`,
        fields: ['summary']
    })
    issues.value = jiraIssues.flatMap(issue => toPlanEntries(issuePlans, issue))
}

async function loadProjects(jiraClient, projectPlans) {
    if (!projectPlans.length) {
        projects.value = []
        return
    }

    const projectIds = [...new Set(projectPlans.map(plan => plan.itemId))]
    const jiraProjects = await Promise.all(
        projectIds.map(id => jiraClient.projects.getProject({ projectIdOrKey: id }))
    )
    projects.value = jiraProjects.flatMap(project => toPlanEntries(projectPlans, project))
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
