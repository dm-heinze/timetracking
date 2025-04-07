<template>
    <div class="col-span-12 flex justify-center items-center bg-error overflow-hidden text-white transition-all" :class="active ? 'h-20' : 'h-0'">
        <Icon name="lucide:coffee" class="w-6 h-6 mr-2" />
        <span>You are currently on a break for</span>
        <span class="font-bold ml-1">{{ breakTime }}</span>
        <button @click="onStopBreak()" class="btn btn-secondary ml-4">
            <Icon name="lucide:pause-circle" class="w-6 h-6 mr-2" />Stop break
        </button>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useBreakStore } from '~/stores/break'
import { useIssuesStore } from '~/stores/issues'

let workerTimers = null
if (import.meta.client) {
    workerTimers = await import('worker-timers')
}

// Stores
const breakStore = useBreakStore()
const issuesStore = useIssuesStore()

// State
const startDate = ref('')
const seconds = ref(0)
const minutes = ref(0)
const hours = ref(0)

// Computed
const active = computed(() => breakStore.active)
const time = computed(() => breakStore.time)

const breakTime = computed({
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

// Lifecycle
onMounted(() => {
    const [h, m, s] = breakStore.time.split(':')
    hours.value = parseInt(h)
    minutes.value = parseInt(m)
    seconds.value = parseInt(s)

    onStopBreak()
})

// Watchers
watch(active, (isActive) => {
    if (isActive) {
        stopActiveTimers()

        if (breakStore.interval !== null) {
            workerTimers.clearInterval(breakStore.interval)
        }

        // Set start date from now minus time that is already set
        const d = new Date()
        d.setHours(d.getHours() - hours.value)
        d.setMinutes(d.getMinutes() - minutes.value)
        d.setSeconds(d.getSeconds() - seconds.value)
        startDate.value = d

        breakStore.setState({
            stateName: 'interval',
            value: workerTimers.setInterval(processTimer, 1000)
        })
    }

    if (!isActive) {
        workerTimers.clearInterval(breakStore.interval)
        breakStore.setState({ stateName: 'interval', value: null })
    }
})

watch(breakTime, (newTime) => {
    breakStore.setState({ stateName: 'time', value: newTime })
})

watch(time, (newTime) => {
    if (newTime === '00:00:00') {
        seconds.value = 0
        minutes.value = 0
        hours.value = 0
    }
})

// Methods
function onStopBreak() {
    breakStore.setState({ stateName: 'active', value: false })
}

function processTimer() {
    const now = new Date()
    const elapsed = new Date(now - startDate.value)

    seconds.value = elapsed.getSeconds()
    minutes.value = elapsed.getMinutes()
    // empty datetime Object starts at 01:00:00
    hours.value = elapsed.getHours() - 1
}

function stopActiveTimers() {
    const activeIssues = issuesStore.list.filter(issue => issue.interval !== null)
    activeIssues.forEach((issue) => {
        workerTimers.clearInterval(issue.interval)
        issuesStore.update({ id: issue.storeId, property: 'interval', value: null })
    })
}
</script>