<template>
    <div>
      <div>Assigned Tickets</div>
      <b-list-group>
        <b-list-group-item
          v-for="assignedTicket in assignedTickets"
          :key="assignedTicket.key"
          @click="addToSelectedIssues(assignedTicket)"
          v-b-toggle.sidebar-search
        >
          {{ assignedTicket.key }}
        </b-list-group-item>
      </b-list-group>


      <h4>Search Results</h4>
      <div v-if="searchResults.length !== 0">
        <b-list-group>
          <b-list-group-item
            v-for="searchResult in searchResults"
            :key="searchResult.key"
            @click="addToSelectedIssues(searchResult)"
            v-b-toggle.sidebar-search
          >
            {{ searchResult.key }}
          </b-list-group-item>
        </b-list-group>
      </div>
      <div v-else>No Search Results for This Query</div>
    </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex';
import _ from "lodash";

export default {
    name: "SearchResults",
    computed: {
      ...mapState({
          searchResults: state => state.moduleUser.searchResults,
          selectedIssues: state => state.moduleUser.selectedIssues,
          selectedTasks: state => state.moduleUser.selectedTasks,
          prefilledSearchSuggestions: state => state.moduleUser.prefilledSearchSuggestions,
          currentUser: state => state.moduleUser.currentUser.name
      }),
      assignedTickets () {
           return this.prefilledSearchSuggestions.filter((__ticket) => __ticket.assignee === this.currentUser)
      }
    },
    methods: {
      ...mapMutations({
          addSelectedIssue: 'moduleUser/addSelectedIssue',
          addSelectedTask: 'moduleUser/addSelectedTask',
      }),
      ...mapActions({
          saveSelectedTicketsToStorage: 'moduleUser/saveSelectedTicketsToStorage',
          saveSelectedTasksToStorage: 'moduleUser/saveSelectedTasksToStorage',
          flashMessage: 'moduleFlashMessage/flashMessage'
      }),
      addToSelectedIssues: function (selectedSearchResult) {
          const tasksByKey = this.selectedTasks.map((__task) => __task.key);

          if (!_.includes(tasksByKey, selectedSearchResult.key)) {
              this.addSelectedTask(selectedSearchResult);

              this.saveSelectedTasksToStorage();
          } else {
              this.flashMessage({ message: `You are already working on ${selectedSearchResult.key}`, status: 'primary' });
          }
      }
    }
}
</script>
