<template>
  <div>
    <div class="relative" v-for="issue in issues" :key="issue.key">
      <div v-if="bookmarkable" class="absolute z-10 -top-1 right-5 tooltip tooltip-left tooltip-primary" :data-tip="checkIsBookmarked(issue) ? 'Remove from Bookmarks' : 'Bookmark this ticket'">
        <BookmarkIcon v-if="!checkIsBookmarked(issue)" @click="bookmarkIssue(issue)" class=" w-6 h-6 stroke-primary hover:fill-accent cursor-pointer" />
        <BookmarkIcon v-else @click="unBookmarkIssue(issue)" class=" w-6 h-6 stroke-primary hover:fill-error cursor-pointer" />
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
          <plus-circle-icon  class="w-6 h-6 stroke-primary group-hover:fill-accent" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { PlusCircleIcon, BookmarkIcon } from 'vue-feather-icons'
export default {
  name: 'IssuePicker',
  components: { PlusCircleIcon, BookmarkIcon },
  props: {
    issues: {
      required: true,
      type: Array
    },
    bookmarkable: {
      required: false,
      type: Boolean,
      default: false
    }
  },
  computed: {
    bookmarkedIssues: function () {
      return this.$store.state.bookmarks.list
    }
  },
  methods: {
    addIssue: function (issue) {
      this.$emit('select-issue', issue)
    },
    bookmarkIssue: function (issue) {
      this.$store.commit('bookmarks/add', issue)
    },
    unBookmarkIssue: function (issue) {
      this.$store.commit('bookmarks/remove', issue)
    },
    checkIsBookmarked: function (issue) {
      return this.bookmarkedIssues.find((storeIssue) => storeIssue.id === issue.id)
    }
  }
}
</script>
