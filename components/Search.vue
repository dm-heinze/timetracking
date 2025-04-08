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
    if (!searchTerm.value?.trim()) return

    try {
        const term = searchTerm.value.trim()
        searchLoading.value = true
        const jiraClient = useJiraClient()
        if (!jiraClient) return

        const regexForTicketKeys = /[a-z0-9]+-[1-9][0-9]*$/i
        const escapeJql = (str) => str.replace(/'/g, "\\'")

        // Determine the search key and search type
        let searchKey = term
        let isKeySearch = false

        // Extract key from URL if applicable
        if (term.startsWith('https://')) {
            try {
                const url = new URL(term)
                const lastPathSegment = url.pathname.split('/').filter(Boolean).pop()

                if (lastPathSegment && regexForTicketKeys.test(lastPathSegment)) {
                    searchKey = lastPathSegment
                    isKeySearch = true
                }
            } catch {
                // URL parsing failed, continue with original term
            }
        } else if (regexForTicketKeys.test(term)) {
            isKeySearch = true
        }

        // Create JQL based on whether we're searching by key or summary
        const jqlSearchString = isKeySearch
            ? `key = '${escapeJql(searchKey)}' ORDER BY created DESC`
            : `summary ~ '${escapeJql(term)}' ORDER BY created DESC`

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