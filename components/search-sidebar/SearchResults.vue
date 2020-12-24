<template>
    <div class="search-results">
        <assigned-tickets />

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
    import AssignedTickets from "~/components/search-sidebar/AssignedTickets"; // handles case if no assignedTickets available
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
                selectedTasks: state => state.moduleTask.selectedTasks,
                showSuggestions: state => state.moduleOptional.showSuggestions,
                suggestionGroups: state => state.moduleOptional.suggestionGroups
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
