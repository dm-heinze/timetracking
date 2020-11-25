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



        <h3 class="sidebar__title">Bookmarks</h3>
        <client-only>
            <div v-if="bookmarked.length !== 0">
                <b-list-group>
                    <b-list-group-item
                        v-for="bookmarkedTicket in bookmarked"
                        :key="bookmarkedTicket.key"
                        class="d-flex justify-content-between"
                        @click="addToSelectedIssues(bookmarkedTicket, false)"
                    >
                        <div class="ticket__info col-11">
                            <div class="ticket__info__key font-weight-bold">{{ bookmarkedTicket.key }}</div>
                            <div class="ticket__info__summary text-truncate">{{ bookmarkedTicket.summary }}</div>
                        </div>
                        <plus-circle-icon class="ticket__icon align-self-center" />
                    </b-list-group-item>
                </b-list-group>
            </div>
            <div v-else>No Bookmarks Saved.</div>
        </client-only>
    </div>
</template>

<script>
    import { mapState, mapMutations, mapActions } from 'vuex';
    import { PlusCircleIcon, BookmarkIcon } from 'vue-feather-icons';
    import { BListGroupItem, BListGroup } from 'bootstrap-vue';
    import _ from "lodash";
    import Suggestions from "~/components/Suggestions"; // todo: dynamically import if visibility configurable
    import AssignedTickets from "~/components/AssignedTickets"; // todo: dynamically import
    import { smartPickedIssuesMixin, assignedTicketsMixin } from "~/utility/mixins";

    export default {
        name: "SearchResults",
        components: { AssignedTickets, Suggestions, PlusCircleIcon, BookmarkIcon, BListGroupItem, BListGroup },
        mixins: [smartPickedIssuesMixin, assignedTicketsMixin], // todo: as store getters
        directives: { 'b-list-group': BListGroup, 'b-list-group-item': BListGroupItem },
        computed: {
            ...mapState({
                searchResults: state => state.moduleUser.searchResults,
                selectedTasks: state => state.moduleUser.selectedTasks,
                prefilledSearchSuggestions: state => state.moduleUser.prefilledSearchSuggestions,
                currentUser: state => state.moduleUser.currentUser.name,
                bookmarked: state => state.moduleUser.bookmarked
            })
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
