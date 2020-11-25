<template>
    <div class="search-results">
        <div v-if="assignedTickets.length !== 0">
            <assigned-tickets @updateSelectedIssues="addToSelectedIssues" />
        </div>


        <h3 class="sidebar__title">Suggestions</h3>
        <div v-if="smartPickedSuggestions.length !== 0"> <!-- todo: update condition if visibility configurable -->
            <suggestions @updateSelectedIssues="addToSelectedIssues" />
        </div>
        <div v-else>No Search Results for This Query</div>


        <bookmarks-selectable @updateSelectedIssues="addToSelectedIssues" />
    </div>
</template>

<script>
    import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
    import _ from "lodash";
    import Suggestions from "~/components/Suggestions"; // todo: dynamically import if visibility configurable
    import AssignedTickets from "~/components/AssignedTickets"; // todo: dynamically import
    import BookmarksSelectable from "~/components/BookmarksSelectable"; // todo

    export default {
        name: "SearchResults",
        components: { AssignedTickets, Suggestions, BookmarksSelectable },
        computed: {
            ...mapState({
                searchResults: state => state.moduleUser.searchResults,
                selectedTasks: state => state.moduleUser.selectedTasks
            }),
            ...mapGetters({
                assignedTickets: 'moduleUser/getAssignedTickets',
                smartPickedSuggestions: 'moduleUser/getSmartPickedSuggestions'
            })
        },
        methods: {
            ...mapMutations({
                addSelectedTask: 'moduleUser/addSelectedTask'
            }),
            ...mapActions({
                saveSelectedTasksToStorage: 'moduleUser/saveSelectedTasksToStorage'
            }),
            addToSelectedIssues: function (selectedTicket,  fromSearchResults = true) { // todo
                let __selection;

                if (fromSearchResults) {
                    __selection = _.cloneDeep(selectedTicket);
                    __selection.uniqueId = _.now();
                } else {
                    __selection = {
                        assignedToTicket: true,
                        uniqueId: _.now(),
                        key: selectedTicket.key,
                        issueLink: process.env.BASE_DOMAIN + process.env.ENDPOINT_BROWSE + selectedTicket.key,
                        summary: selectedTicket.summary,
                        comment: '',
                        timeSpent: 0,
                        startTime: '',
                        endTime: '',
                        booked: false
                    };
                }

                this.addSelectedTask(__selection);

                this.saveSelectedTasksToStorage();
            }
        }
    }
</script>
