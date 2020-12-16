<template>
    <div class="search-results">
        <div v-if="assignedTickets.length !== 0">
            <assigned-tickets />
        </div>

        <client-only> <!-- todo -->
            <bookmarks-selectable v-if="showBookmarksFirst" />
        </client-only>

        <client-only>
            <div v-if="showSuggestions && smartPickedSuggestions.length !== 0">
                <suggestions />
            </div>
        </client-only>
        <client-only>
            <div v-if="showSuggestions && smartPickedSuggestions.length === 0">No Search Results for This Query</div> <!-- todo: move to comp Suggestions.vue -->
        </client-only>

        <client-only> <!-- todo -->
            <bookmarks-selectable v-if="!showBookmarksFirst" />
        </client-only>
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
                showSuggestions: state => state.moduleUser.showSuggestions,
                suggestionGroups: state => state.moduleUser.suggestionGroups,
                assignedTickets: state => state.moduleUser.assignedTickets
            }),
            ...mapGetters({
                smartPickedSuggestions: 'moduleUser/getSmartPickedSuggestions'
            }),
            showBookmarksFirst () { // todo
                return [...this.suggestionGroups].pop() !== 'Bookmarks';
            }
        }
    }
</script>
