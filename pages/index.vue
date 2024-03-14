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

            <button @click="refreshAssignedTickets++" class="btn btn-ghost">
              <RefreshCwIcon />
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
        <client-only>
          <TheTopBar />
          <TheIssueList />
        </client-only>
      </div>
    </div>
  </div>
</template>

<script>
import Search from '../components/Search.vue'
import TheIssueList from '../components/TheIssueList.vue'
import TheTopBar from '../components/TheTopBar.vue'
import IssuesAssignedToMe from "../components/IssuesAssignedToMe.vue";
import IssuePicker from "../components/IssuePicker.vue";
import ThemeSwitch from "../components/ThemeSwitch.vue";
import { RefreshCwIcon } from 'vue-feather-icons';

export default {
  name: 'IndexPage',
  components: { IssuesAssignedToMe, TheTopBar, Search, TheIssueList, RefreshCwIcon, IssuePicker, ThemeSwitch },
  middleware: 'auth',
  data() {
    return {
      refreshAssignedTickets: 0
    }
  },
  computed: {
    bookmarkedIssues: function () {
      return this.$store.state.bookmarks.list
    }
  },
  methods: {
    select: function (issue) {
      this.$store.commit('issues/add', issue);
    }
  }
}
</script>
