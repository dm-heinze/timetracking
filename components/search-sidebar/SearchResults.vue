<template>
    <div class="search-results">
        <div v-if="assignedTickets.length !== 0">
            <assigned-tickets />
        </div>


        <h3 class="sidebar__title">Suggestions</h3>
        <div v-if="smartPickedSuggestions.length !== 0"> <!-- todo: update condition if visibility configurable -->
            <suggestions />
        </div>
        <div v-else>No Search Results for This Query</div>


        <bookmarks-selectable />
    </div>
</template>

<script>
    import { mapState, mapGetters } from 'vuex';
    import Suggestions from "~/components/search-sidebar/Suggestions"; // todo: dynamically import if visibility configurable
    import AssignedTickets from "~/components/search-sidebar/AssignedTickets"; // todo: dynamically import
    import BookmarksSelectable from "~/components/search-sidebar/BookmarksSelectable"; // todo

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
        }
    }
</script>
