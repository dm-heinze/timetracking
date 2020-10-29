<template>
    <div class="search-results">
        <div>Assigned Tickets</div>
        <b-list-group>
            <b-list-group-item
                v-for="assignedTicket in assignedTickets"
                :key="assignedTicket.uniqueId"
            >
                {{ assignedTicket.key }}: {{ assignedTicket.summary }}
                <b-icon class="h4 mb-2 tickets__icon" icon="bookmark-check-fill" variant="success" @click="toggleBookmarked(assignedTicket.key)" v-if="bookmarked.find((marked) => marked.key === assignedTicket.key)"></b-icon>
                <b-icon class="h4 mb-2 tickets__icon" icon="bookmark" variant="primary" @click="toggleBookmarked(assignedTicket.key, assignedTicket.summary)" v-else></b-icon>
                <b-icon class="h4 mb-2 tickets__icon" icon="plus-square" variant="primary"  @click="addToSelectedIssues(assignedTicket)" v-b-toggle.sidebar-search></b-icon>
            </b-list-group-item>
        </b-list-group>


        <h4>Suggestions</h4>
        <div v-if="smartPickedSuggestions.length !== 0">
            <b-list-group>
                <b-list-group-item
                    v-for="searchResult in smartPickedSuggestions"
                    :key="searchResult.key"
                    @click="addToSelectedIssues(searchResult)"
                    v-b-toggle.sidebar-search
                >
                    {{ searchResult.key }}: {{ searchResult.summary }}
                    <b-icon icon="bookmark" variant="primary" @click="toggleBookmarked(searchResult.key, searchResult.summary)" v-if="bookmarked.find((marked) => marked.key === searchResult.key)"></b-icon>
                </b-list-group-item>
            </b-list-group>
        </div>
        <div v-else>No Search Results for This Query</div>



        <h4>Bookmarks</h4>
        <div v-if="bookmarked.length !== 0">
            <b-list-group>
                <b-list-group-item
                    v-for="bookmarkedTicket in bookmarked"
                    :key="bookmarkedTicket.key"
                >
                    {{ bookmarkedTicket.key }}
                    <b-icon class="h4 mb-2 tickets__icon" icon="bookmark-check-fill" variant="success" @click="toggleBookmarked(bookmarkedTicket.key)"></b-icon>
                    <b-icon class="h4 mb-2 tickets__icon" icon="plus-square" variant="primary"  @click="addToSelectedIssues(bookmarkedTicket, false)" v-b-toggle.sidebar-search></b-icon>
                </b-list-group-item>
            </b-list-group>
        </div>
        <div v-else>No Bookmarks Saved.</div>
    </div>
</template>

<script>
    import { mapState, mapMutations, mapActions } from 'vuex';
    import { BIcon, BIconBookmark, BIconBookmarkCheckFill, BIconPlusSquare } from 'bootstrap-vue';
    import _ from "lodash";

    export default {
        name: "SearchResults",
        components: {
            BIcon, BIconBookmark, BIconBookmarkCheckFill, BIconPlusSquare
        },
        computed: {
            ...mapState({
                searchResults: state => state.moduleUser.searchResults,
                selectedTasks: state => state.moduleUser.selectedTasks,
                prefilledSearchSuggestions: state => state.moduleUser.prefilledSearchSuggestions,
                currentUser: state => state.moduleUser.currentUser.name,
                bookmarked: state => state.moduleUser.bookmarked
            }),
            assignedTickets () {
                return this.prefilledSearchSuggestions.filter((__ticket) => __ticket.assignee === this.currentUser)
            },
            smartPickedSuggestions () {
                return _.slice(this.prefilledSearchSuggestions.filter((__ticket) => __ticket.assignee !== this.currentUser), 0, 5) // end excluded
            }
        },
        methods: {
            ...mapMutations({
                addSelectedTask: 'moduleUser/addSelectedTask',
                updateBookmarks: 'moduleUser/updateBookmarks'
            }),
            ...mapActions({
                saveSelectedTasksToStorage: 'moduleUser/saveSelectedTasksToStorage',
                saveBookmarksToStorage: 'moduleUser/saveBookmarksToStorage'
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
            },
            toggleBookmarked: function (searchResultToBeToggled, summary = '') { // todo
                this.updateBookmarks({ bookmark: searchResultToBeToggled, summary });

                this.saveBookmarksToStorage();
            }
        }
    }
</script>
