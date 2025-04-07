<template>
    <div class="flex flex-col justify-between items-center gap-4 md:flex-row md:flex-wrap">
        <button @click="requestAction('addCustomTask')" class="btn btn-primary">
            <Icon name="lucide:plus-circle" class="w-5 h-5" />
            <span class="md:hidden xl:block uppercase">Add a custom task</span>
        </button>
        <button @click="onStartBreak()" class="btn btn-secondary" :disabled="breakActive">
            <Icon name="lucide:coffee" class="w-5 h-5" />
            <span class="md:hidden xl:block uppercase">Take a break</span>
        </button>

        <div class="flex flex-col md:ml-auto items-end">
            <div>Worked: <span class="font-bold">{{ timeSpentTotal }}</span></div>
            <div class="flex gap-1 items-center">
                <div class="tooltip tooltip-bottom tooltip-primary" data-tip="Reset break time">
                    <button @click="onResetBreak()" class="btn btn-xs btn-circle btn-outline" :disabled="breakActive || breakTime === '00:00:00'">
                        <Icon name="lucide:rotate-cw" class="w-4 h-4"/>
                    </button>
                </div>
                <span>Break:</span><span class="font-bold">{{ breakTime }}</span>
            </div>
        </div>
        <button @click="requestAction('addWorklogs')" class="btn btn-accent" :disabled="!validIssues">
            <Icon name="lucide:send" class="w-5 h-5" />
            <span class="md:hidden xl:block uppercase">Push all your tasks</span>
        </button>

        <ConfirmationModal @close="showModal = false" @confirm="confirm" :show-modal="showModal" :type="modalType" :loading="loading" />
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useIssuesStore } from '~/stores/issues'
import { useBreakStore } from '~/stores/break'
import ConfirmationModal from './ConfirmationModal.vue'

// Stores
const issuesStore = useIssuesStore()
const breakStore = useBreakStore()

// State
const showModal = ref(false)
const modalType = ref('')
const loading = ref(false)

// Computed
const timeSpentTotal = computed(() => {
    let totalH = 0
    let totalM = 0
    let totalS = 0

    issuesStore.list.forEach((issue) => {
        const [h, m, s] = issue.timeSpent.split(':')

        const intS = parseInt(s)
        const intM = parseInt(m)
        const intH = parseInt(h)

        totalS = intS + totalS
        if (totalS >= 60) {
            totalS = totalS - 60
            totalM++
        }

        totalM = intM + totalM
        if (totalM >= 60) {
            totalM = totalM - 60
            totalH++
        }

        totalH = intH + totalH
    })

    return `${totalH < 10 ? '0' + totalH : totalH}:${totalM < 10 ? '0' + totalM : totalM}:${totalS < 10 ? '0' + totalS : totalS}`
})

const validIssues = computed(() => {
    let isValid = true

    if (issuesStore.list.length === 0) {
        return false
    }

    issuesStore.list.forEach((issue) => {
        if (issue.comment === '' || issue.timeSpent === '00:00:00' || issue.key === 'CUSTOM') {
            isValid = false
        }
    })

    return isValid
})

const breakTime = computed(() => breakStore.time)
const breakActive = computed(() => breakStore.active)

// Methods
function requestAction(action) {
    modalType.value = action
    showModal.value = true
}

function confirm(payload) {
    if (modalType.value === 'addWorklogs') {
        addWorklogs()
    }

    if (modalType.value === 'addCustomTask') {
        addCustomTask(payload)
    }
}

function resetModal() {
    showModal.value = false
    setTimeout(() => {
        modalType.value = ''
    }, 500)
}

async function addWorklogs() {
    loading.value = true
    try {
        const jiraClient = useJiraClient()
        if (!jiraClient) return

        await Promise.all(
            issuesStore.list.map(async (issue) => {
                await jiraClient.issueWorklogs.addWorklog({
                    issueIdOrKey: issue.key,
                    comment: issue.comment,
                    timeSpent: parseJiraTimeFormat(issue.timeSpent)
                })

                issuesStore.remove({ id: issue.storeId })
            })
        )
        loading.value = false
        onResetBreak()
        resetModal()
    } catch (e) {
        console.error(e)
        loading.value = false
    }
}

function parseJiraTimeFormat(time) {
    let [h, m, s] = time.split(':')

    h = parseInt(h)
    m = parseInt(m)
    s = parseInt(s)

    if(s > 0) {
        m = m + 1
    }

    return `${h}h ${m}m`
}

function onStartBreak() {
    breakStore.setState({ stateName: 'active', value: true })
}

function onResetBreak() {
    breakStore.setState({ stateName: 'active', value: false })
    breakStore.setState({ stateName: 'interval', value: null })
    breakStore.setState({ stateName: 'time', value: '00:00:00' })
}

function addCustomTask(payload) {
    issuesStore.add({
        key: 'CUSTOM',
        name: payload.customTaskName !== '' ? payload.customTaskName : new Date().getTime()
    })

    resetModal()
}
</script>