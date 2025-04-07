<template>
    <div class="space-y-3">
        <div class="form-control">
            <div class="join">
                <input
                    v-model="searchTerm"
                    @input="requestSearch"
                    @keyup.esc="resetSearch()"
                    type="text"
                    placeholder="Search..."
                    class="input input-bordered border-r-0 pl-6 w-full join-item"
                    aria-label="Search for tickets"
                />
                <button @click="!searchLoading && searchTerm !== '' ? resetSearch() : false" class="btn btn-outline border-l-0 border-base-content border-opacity-20 pl-4 pr-5 w-14 h-12 join-item" :disabled="searchTerm === '' && searchLoading">
                    <Icon v-if="!searchLoading && searchTerm === ''" name="lucide:search" class="w-5 h-5" />
                    <Icon v-if="!searchLoading && searchTerm !== ''" name="lucide:x" class="w-5 h-5" />
                    <span class="loading" v-if="searchLoading" />
                </button>
            </div>
        </div>

        <IssuePicker
            :issues="issues"
            bookmarkable
            class="space-y-3 pt-2 overflow-y-scroll lg:h-[320px]"
            style="-ms-overflow-style: none; scrollbar-width: none;"
            @select-issue="addIssue"
        />
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import IssuePicker from "./IssuePicker.vue"

const emit = defineEmits(['select-issue'])

const searchTerm = ref('')
const searchLoading = ref(false)
const issues = ref([])

const debouncedSearch = useDebounceFn(async () => {
    if (searchTerm.value && searchTerm.value.trim() !== '') {
        try {
            searchLoading.value = true
            const jiraClient = useJiraClient()
            if (!jiraClient) return
            const regexForTicketKeys = /[a-z]+\-[1-9]+[0-9]*$/i

            let jqlSearchString
            if (searchTerm.value.match(regexForTicketKeys)) {
                jqlSearchString = `key = '${searchTerm.value}' ORDER BY created DESC`
            } else {
                jqlSearchString = `summary ~ '${searchTerm.value}' ORDER BY created DESC`
            }

            const { issues: jiraIssues } = await jiraClient.issueSearch.searchForIssuesUsingJqlPost({
                jql: jqlSearchString,
                fields: ['summary']
            })
            issues.value = jiraIssues

            searchLoading.value = false
        } catch (e) {
            searchLoading.value = false
            console.error(e)
        }
    }
}, 1000)

function requestSearch() {
    debouncedSearch()
}

function resetSearch() {
    searchTerm.value = ''
    issues.value = []
}

function addIssue(issue) {
    emit('select-issue', issue)
}
</script>

<style scoped>
.btn.loading:before {
    margin-right: 0;
}
</style>