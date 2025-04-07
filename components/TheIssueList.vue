<template>
    <div v-if="issues.length === 0">
        No issues selected yet
    </div>
    <div class="flex flex-col gap-5" v-else>
        <Issue v-for="issue in issues" :key="issue.storeId" :issue-data="issue" />
    </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useIssuesStore } from '~/stores/issues'
import Issue from './Issue.vue'

const issuesStore = useIssuesStore()

const issues = computed(() => issuesStore.list)

onMounted(() => {
    // Stop running timers can occur on page refresh while task is running
    const runningTask = issues.value.find((issue) => issue.interval !== null)
    if (runningTask) {
        issuesStore.update({ id: runningTask.storeId, property: 'interval', value: null })
    }
})
</script>