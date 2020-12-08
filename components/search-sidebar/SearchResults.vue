<template>
    <div class="search-results">
        <div v-if="assignedTickets.length !== 0">
            <assigned-tickets />
        </div>


        <div v-if="showSuggestions && smartPickedSuggestions.length !== 0">
            <suggestions />
        </div>
        <div v-if="showSuggestions && smartPickedSuggestions.length === 0">No Search Results for This Query</div>


        <bookmarks-selectable />
    </div>
</template>

<script>
    import { mapState, mapGetters } from 'vuex';
    import AssignedTickets from "~/components/search-sidebar/AssignedTickets"; // todo: dynamically import
    import BookmarksSelectable from "~/components/search-sidebar/BookmarksSelectable"; // todo

    export default {
        name: "SearchResults",
        components: {
            AssignedTickets,
            Suggestions: () => import(/* webpackPrefetch: true */ '~/components/search-sidebar/Suggestions'), // pre-fetch when idle - todo
            BookmarksSelectable
        },
        computed: {
            ...mapState({
                searchResults: state => state.moduleUser.searchResults,
                selectedTasks: state => state.moduleUser.selectedTasks,
                showSuggestions: state => state.moduleUser.showSuggestions
            }),
            ...mapGetters({
                assignedTickets: 'moduleUser/getAssignedTickets',
                smartPickedSuggestions: 'moduleUser/getSmartPickedSuggestions'
            })
        }
    }
</script>
