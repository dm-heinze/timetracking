<template>
    <div class="grid grid-cols-12">
        <TheBreak />
        <div class="col-span-12 lg:col-span-4 lg:h-screen overflow-auto"
             style="-ms-overflow-style: none; scrollbar-width: none;">
            <div class="flex flex-col gap-8 p-4 lg:p-12">
                <div class="flex flex-col gap-5">
                    <h2 class="text-2xl font-bold text-primary">Ticket Search</h2>
                    <Search class="w-full" @select-issue="select"/>
                </div>

                <div class="flex flex-col gap-5">
                    <h2 class="flex justify-between items-center text-2xl font-bold text-primary">Bookmarks</h2>
                    <IssuePicker :issues="bookmarkedIssues" bookmarkable class="space-y-3 pt-2" @select-issue="select" />
                </div>

                <div class="flex flex-col gap-5">
                    <h2 class="flex justify-between items-center text-2xl font-bold text-primary">
                        Assigned Tickets

                        <button @click="refreshAssignedTickets++" class="btn btn-ghost btn-circle">
                            <Icon name="lucide:refresh-cw" class="w-6 h-6" />
                        </button>
                    </h2>
                    <IssuesAssignedToMe :key="refreshAssignedTickets" @select-issue="select" />
                </div>

                <div class="flex flex-col gap-5">
                    <h2 class="flex justify-between items-center text-2xl font-bold text-primary">Settings</h2>
                    <ThemeSwitch />
                </div>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-8 lg:h-screen bg-base-200 overflow-auto">
            <div class="flex flex-col gap-10 p-4 max-w-5xl lg:p-12">
                <ClientOnly>
                    <TheTopBar />
                    <TheIssueList />
                </ClientOnly>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBookmarksStore } from '~/stores/bookmarks'
import { useIssuesStore } from '~/stores/issues'
import Search from '~/components/Search.vue'
import TheIssueList from '~/components/TheIssueList.vue'
import TheTopBar from '~/components/TheTopBar.vue'
import IssuesAssignedToMe from '~/components/IssuesAssignedToMe.vue'
import IssuePicker from '~/components/IssuePicker.vue'
import ThemeSwitch from '~/components/ThemeSwitch.vue'

// Middleware für Auth (in Nuxt 3 definiert man das Middleware in der setup-Funktion)
definePageMeta({
    middleware: 'auth'
})

// Stores
const bookmarksStore = useBookmarksStore()
const issuesStore = useIssuesStore()

// Reaktive Daten
const refreshAssignedTickets = ref(0)

// Computed Properties
const bookmarkedIssues = computed(() => bookmarksStore.list)

// Methoden
function select(issue) {
    issuesStore.add(issue)
}
</script>