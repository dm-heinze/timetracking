<template>
    <div class="flex flex-col p-5 border rounded gap-2 bg-base-100 md:flex-row md:flex-wrap md:justify-between md:gap-3 lg:justify-around lg:gap-4" :class="{ 'border-success bg-success-100': issueData.interval !== null, 'border-error': isCustomTask}">
        <div v-if="isCustomTask" class="w-full text-center md:text-left md:w-[200px] md:max-w-[200px] lg:mr-auto">
            <div v-if="!editName" class="font-bold text-primary">{{ issueData.name }}</div>
            <input v-if="editName" v-model="customTaskName" class="input input-bordered"/>
        </div>
        <a v-else :href="`${jiraResource.url}/browse/${issueData.key}`" class="w-full text-center md:text-left md:w-[200px] md:max-w-[200px] lg:mr-auto hover:underline" target="_blank" rel="noopener">
            <div class="font-bold text-primary">{{ issueData.key }}</div>
            <div class="text-neutral-content text-sm text-truncate">{{ issueData?.fields?.summary }}</div>
        </a>
        <div class="flex flex-col gap-2 md:flex-row items-center">
            <button v-if="isCustomTask && !editName" @click="editName = true" :disabled="issueData.interval !== null" class="btn btn-sm btn-outline btn-neutral w-full md:w-auto">
                <Icon name="lucide:edit-2" class="w-4 h-4 mr-1" /> Edit Name
            </button>
            <button v-if="isCustomTask && editName" @click="editName = false" :disabled="issueData.interval !== null" class="btn btn-sm btn-outline btn-success w-full md:w-auto">
                <Icon name="lucide:save" class="w-4 h-4 mr-1" /> Save Name
            </button>
            <button @click="requestAction('assignIssue')" :disabled="issueData.interval !== null" class="btn btn-sm btn-outline btn-neutral w-full md:w-auto">
                <Icon name="lucide:plus-circle" class="w-4 h-4 mr-1" /> Assign Ticket
            </button>
        </div>
        <div class="flex justify-center items-center md:ml-auto md:gap-2 lg:ml-0">
            <button v-if="issueData.interval === null" @click="startTimer()" class="btn btn-circle btn-ghost text-primary">
                <Icon name="lucide:play-circle" class="w-6 h-6" />
            </button>
            <button v-else @click="pauseTimer()" class="btn btn-circle btn-ghost text-primary">
                <Icon name="lucide:pause-circle" class="w-6 h-6" />
            </button>
            <button @click="requestAction('addWorklog')" :disabled="issueData.interval !== null || comment === '' || timeWorked === '00:00:00' || isCustomTask" class="btn btn-circle btn-ghost text-primary">
                <Icon name="lucide:send" class="w-6 h-6" />
            </button>
            <button @click="requestAction('remove')" :disabled="issueData.interval !== null" class="btn btn-circle btn-ghost text-primary">
                <Icon name="lucide:trash-2" class="w-6 h-6" />
            </button>
            <div class="text-primary flex-shrink-0">
                <label :for="`timer-${issueData.key}`" class="font-bold">Total:</label>
                <input :id="`timer-${issueData.key}`" :disabled="issueData.interval !== null" v-model="timeWorked" type="time" step="1" class="input min-w-[135px] pr-0" :class="{ 'input-error': timeWorked === '00:00:00' }" />
            </div>
        </div>
        <textarea v-model="comment" class="w-full textarea textarea-bordered rounded p-2 resize-y overflow-hidden h-16" :class="{ 'bg-error/25': comment === '' }" rows="4" />

        <ConfirmationModal @close="showModal = false" @confirm="confirm" :show-modal="showModal" :type="modalType" :issue="issueData" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useIssuesStore } from '~/stores/issues'
import { useBreakStore } from '~/stores/break'
import ConfirmationModal from './ConfirmationModal.vue'
import { useAuth } from '~/composables/useAuth'

let workerTimers = null
if (import.meta.client) {
    workerTimers = await import('worker-timers')
}

const issuesStore = useIssuesStore()
const breakStore = useBreakStore()
const { session } = useAuth()
const jiraResource = computed(() => session.value?.jiraResource)

const props = defineProps({
    issueData: {
        type: Object,
        required: true
    }
})

const startDate = ref('')
const seconds = ref(0)
const minutes = ref(0)
const hours = ref(0)
const comment = ref('')
const showModal = ref(false)
const modalType = ref('')
const editName = ref(false)
const loading = ref(false)

const timeWorked = computed({
    get() {
        let h = hours.value < 10 ? '0' + hours.value : hours.value
        let m = minutes.value < 10 ? '0' + minutes.value : minutes.value
        let s = seconds.value < 10 ? '0' + seconds.value : seconds.value

        return `${h}:${m}:${s}`
    },
    set(time) {
        const [h, m, s] = time.split(':')
        hours.value = parseInt(h)
        minutes.value = parseInt(m)
        seconds.value = parseInt(s)
    }
})

const isCustomTask = computed(() => {
    return props.issueData.key.includes('CUSTOM')
})

const customTaskName = computed({
    get() {
        return props.issueData.name
    },
    set(newVal) {
        issuesStore.update({ id: props.issueData.storeId, property: 'name', value: newVal })
    }
})

onMounted(() => {
    timeWorked.value = props.issueData.timeSpent
    comment.value = props.issueData.comment
})

onBeforeUnmount(() => {
    if (props.issueData.interval) {
        workerTimers.clearInterval(props.issueData.interval)
    }
})

watch(timeWorked, (newTime) => {
    issuesStore.update({ id: props.issueData.storeId, property: 'timeSpent', value: newTime })
})

watch(comment, (newComment) => {
    issuesStore.update({ id: props.issueData.storeId, property: 'comment', value: newComment })
})

function confirm(payload) {
    if (modalType.value === 'remove') {
        removeIssue()
    }

    if (modalType.value === 'addWorklog') {
        addWorklog()
    }

    if (modalType.value === 'assignIssue') {
        assignIssue(payload)
    }
}

function resetModal() {
    showModal.value = false
    setTimeout(() => {
        modalType.value = ''
    }, 500)
}

function removeIssue() {
    issuesStore.remove({ id: props.issueData.storeId })
    resetModal()
}

async function addWorklog() {
    loading.value = true
    try {
        const jiraClient = useJiraClient()

        if (!jiraClient) {
            console.error('Jira client not available')
            loading.value = false
            return
        }

        await jiraClient.issueWorklogs.addWorklog({
            issueIdOrKey: props.issueData.key,
            comment: props.issueData.comment,
            timeSpent: parseJiraTimeFormat(props.issueData.timeSpent)
        })

        loading.value = false
        removeIssue()
    } catch (e) {
        console.error('Error adding worklog:', e)
        loading.value = false
    }
}

async function assignIssue(payload) {
    try {
        issuesStore.override({ id: props.issueData.storeId, issue: payload })
        resetModal()
    } catch (e) {
        console.error('Error assigning issue:', e)
    }
}

function parseJiraTimeFormat(time) {
    let [h, m, s] = time.split(':')

    h = parseInt(h)
    m = parseInt(m)
    s = parseInt(s)

    if (s > 0) {
        m = m + 1
    }

    return `${h}h ${m}m`
}

function processTimer() {
    const now = new Date()
    const elapsed = new Date(now - startDate.value)

    seconds.value = elapsed.getSeconds()
    minutes.value = elapsed.getMinutes()
    // empty datetime Object starts at 01:00:00
    hours.value = elapsed.getHours() - 1
}

function requestAction(action) {
    modalType.value = action
    showModal.value = true
}

function startTimer() {
    editName.value = false
    breakStore.setState({ stateName: 'active', value: false })
    stopActiveTimers()

    if(props.issueData.interval !== null) {
        workerTimers.clearInterval(props.issueData.interval)
    }

    // Set start date from now minus time that is already set
    const d = new Date()
    d.setHours(d.getHours() - hours.value)
    d.setMinutes(d.getMinutes() - minutes.value)
    d.setSeconds(d.getSeconds() - seconds.value)
    startDate.value = d

    issuesStore.update({
        id: props.issueData.storeId,
        property: 'interval',
        value: workerTimers.setInterval(processTimer, 1000)
    })
}

function pauseTimer() {
    workerTimers.clearInterval(props.issueData.interval)
    issuesStore.update({ id: props.issueData.storeId, property: 'interval', value: null })
}

function stopActiveTimers() {
    const activeIssues = issuesStore.list.filter(issue => issue.interval !== null)
    activeIssues.forEach((issue) => {
        workerTimers.clearInterval(issue.interval)
        issuesStore.update({ id: issue.storeId, property: 'interval', value: null })
    })
}
</script>