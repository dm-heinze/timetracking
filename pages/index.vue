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

                <template v-for="section in sidebarOrder" :key="section">
                    <div v-if="section === 'bookmarks'" class="flex flex-col gap-5">
                        <h2 class="flex justify-between items-center text-2xl font-bold text-primary">Bookmarks</h2>
                        <IssuePicker :issues="bookmarkedIssues" bookmarkable class="space-y-3 pt-2" @select-issue="select" />
                    </div>

                    <div v-else-if="section === 'assigned'" class="flex flex-col gap-5">
                        <h2 class="flex justify-between items-center text-2xl font-bold text-primary">
                            Assigned Tickets

                            <button @click="refreshAssignedTickets++" class="btn btn-ghost btn-circle">
                                <Icon name="lucide:refresh-cw" class="w-6 h-6" />
                            </button>
                        </h2>
                        <IssuesAssignedToMe :key="refreshAssignedTickets" @select-issue="select" />
                    </div>

                    <div v-else-if="section === 'planned'" class="flex flex-col gap-5">
                        <h2 class="flex justify-between items-center text-2xl font-bold text-primary">
                            Planned Today

                            <button @click="refreshPlannedTickets++" class="btn btn-ghost btn-circle">
                                <Icon name="lucide:refresh-cw" class="w-6 h-6" />
                            </button>
                        </h2>
                        <IssuesPlannedToday :key="refreshPlannedTickets" @select-issue="select" @assign-project="selectProject" />
                    </div>
                </template>

                <div class="flex flex-col gap-5">
                    <h2 class="flex justify-between items-center text-2xl font-bold text-primary">Settings</h2>
                    <ThemeSwitch />
                    <div class="form-control w-full">
                        <label class="label">
                            <span class="label-text font-bold">Section order</span>
                        </label>
                        <div class="flex flex-col gap-1">
                            <div
                                v-for="(section, index) in sidebarOrder"
                                :key="section"
                                class="flex items-center justify-between bg-base-200 rounded px-3 py-2"
                            >
                                <span class="text-sm">{{ sectionLabels[section] }}</span>
                                <div class="flex gap-1">
                                    <button
                                        @click="settingsStore.moveSectionUp(index)"
                                        :disabled="index === 0"
                                        :aria-label="`Move ${sectionLabels[section]} up`"
                                        class="btn btn-xs btn-ghost btn-circle"
                                    >
                                        <Icon name="lucide:chevron-up" class="w-4 h-4" />
                                    </button>
                                    <button
                                        @click="settingsStore.moveSectionDown(index)"
                                        :disabled="index === sidebarOrder.length - 1"
                                        :aria-label="`Move ${sectionLabels[section]} down`"
                                        class="btn btn-xs btn-ghost btn-circle"
                                    >
                                        <Icon name="lucide:chevron-down" class="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
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
import { useSettingsStore } from '~/stores/settings'
import Search from '~/components/Search.vue'
import TheIssueList from '~/components/TheIssueList.vue'
import TheTopBar from '~/components/TheTopBar.vue'
import IssuesAssignedToMe from '~/components/IssuesAssignedToMe.vue'
import IssuesPlannedToday from '~/components/IssuesPlannedToday.vue'
import IssuePicker from '~/components/IssuePicker.vue'
import ThemeSwitch from '~/components/ThemeSwitch.vue'

definePageMeta({
    middleware: 'auth'
})

// Stores
const bookmarksStore = useBookmarksStore()
const issuesStore = useIssuesStore()
const settingsStore = useSettingsStore()

// Reaktive Daten
const refreshAssignedTickets = ref(0)
const refreshPlannedTickets = ref(0)

// Computed Properties
const bookmarkedIssues = computed(() => bookmarksStore.list)

const sidebarOrder = computed(() => settingsStore.validatedSidebarOrder)

const sectionLabels = {
    bookmarks: 'Bookmarks',
    assigned: 'Assigned Tickets',
    planned: 'Planned Today'
}

// Methoden
function select(issue) {
    issuesStore.add(issue)
}

function selectProject(projectKey) {
    issuesStore.add({
        key: 'CUSTOM',
        name: new Date().getTime(),
        pendingAssignProjectKey: projectKey
    })
}
</script>