<template>
    <div>
        <div class="relative" v-for="issue in issues" :key="issue.key">
            <div v-if="bookmarkable" class="absolute z-10 -top-1 right-5 tooltip tooltip-left tooltip-primary" :data-tip="checkIsBookmarked(issue) ? 'Remove from Bookmarks' : 'Bookmark this ticket'">
                <Icon
                    v-if="!checkIsBookmarked(issue)"
                    @click.stop="bookmarkIssue(issue)"
                    name="lucide:bookmark"
                    class="w-6 h-6 text-primary hover:text-accent cursor-pointer"
                />
                <Icon
                    v-else
                    @click.stop="unBookmarkIssue(issue)"
                    name="lucide:bookmark"
                    class="w-6 h-6 text-primary hover:text-error cursor-pointer"
                />
            </div>
            <div
                class="relative group w-full grid grid-cols-6 justify-between items-center gap-4 border rounded py-4 px-5 hover:shadow-md cursor-pointer transition"
                @click="addIssue(issue)"
            >
                <div class="col-span-5 flex flex-col max-w-[280px]">
                    <div class="text-primary font-bold">{{ issue.key }}</div>
                    <div v-if="issue.fields?.summary != null" class="text-truncate text-sm text-neutral-content">{{ issue.fields.summary }}</div>
                </div>
                <div class="col-span-1 text-primary justify-self-end">
                    <Icon name="lucide:plus-circle" class="w-6 h-6 stroke-primary group-hover:text-accent" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useBookmarksStore } from '~/stores/bookmarks'

const props = defineProps({
    issues: {
        required: true,
        type: Array
    },
    bookmarkable: {
        required: false,
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['select-issue'])

const bookmarksStore = useBookmarksStore()

const bookmarkedIssues = computed(() => bookmarksStore.list)

function addIssue(issue) {
    emit('select-issue', issue)
}

function bookmarkIssue(issue) {
    bookmarksStore.add(issue)
}

function unBookmarkIssue(issue) {
    bookmarksStore.remove(issue)
}

function checkIsBookmarked(issue) {
    return bookmarkedIssues.value.find((storeIssue) => storeIssue.id === issue.id)
}
</script>