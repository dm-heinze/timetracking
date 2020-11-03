<template>
    <div class="nav big-icons">
        <div v-b-toggle.sidebar-settings class="icon-settings navigation__icon">Settings</div>
        <b-sidebar id="sidebar-settings" title="Settings" shadow backdrop :width="'500px'" @hidden="resetSearch">
            <div class="px-4">
                <button @click.prevent="removeCurrentSession">LOGOUT</button>

                <div class="autocompleted-search__container">
                    <input v-model="searchTerm" @input="requestSearch" placeholder="Search for Tickets to Bookmark" :disabled="$nuxt.isOffline" :class="{ 'disabled': $nuxt.isOffline }">
                    <button :class="{ 'icon-close': !searchLoading && searchTerm !== '', 'icon-search': !searchLoading || searchTerm === '' }" :disabled="searchTerm === '' && searchLoading" @click="resetSearch()">
                        <b-spinner variant="primary" small v-show="searchLoading"></b-spinner>
                    </button>
                </div>

                <div v-if="searchLoading">Loading Search Results...</div>
                <div v-if="searchResults.length !== 0">
                    <b-list-group>
                        <b-list-group-item
                            v-for="searchResult in searchResults"
                            :key="searchResult.key"
                        >
                            {{ searchResult.key }}: {{ searchResult.summary }}
                            <b-icon class="h4 mb-2 tickets__icon" icon="bookmark-check-fill" variant="success" @click="toggleBookmarked(searchResult.key)" v-if="bookmarked.find((marked) => marked.key === searchResult.key)"></b-icon>
                            <b-icon class="h4 mb-2 tickets__icon" icon="bookmark" variant="primary" @click="toggleBookmarked(searchResult.key, searchResult.summary)" v-else></b-icon>
                            <b-icon class="h4 mb-2 tickets__icon" icon="plus-square" variant="primary"  @click="addToSelectedIssues(searchResult)" v-b-toggle.sidebar-settings></b-icon>
                        </b-list-group-item>
                    </b-list-group>
                </div>

                <h4>Bookmarks</h4>
                <div v-if="bookmarked.length !== 0">
                    <b-list-group>
                        <b-list-group-item
                            v-for="bookmarkedTicket in bookmarked"
                            :key="bookmarkedTicket.key"
                        >
                            {{ bookmarkedTicket.key }}: {{ bookmarkedTicket.summary }}
                            <b-icon class="h4 mb-2 tickets__icon" icon="bookmark-check-fill" variant="success" @click="toggleBookmarked(bookmarkedTicket.key)"></b-icon>
                            <b-icon class="h4 mb-2 tickets__icon" icon="plus-square" variant="primary"  @click="addToSelectedIssues(bookmarkedTicket, false)" v-b-toggle.sidebar-settings></b-icon>
                        </b-list-group-item>
                    </b-list-group>
                </div>
                <div v-else>No Bookmarks Saved.</div>
            </div>
        </b-sidebar>
        <nuxt-link :to="'/'" class="icon-calendar">Calendar</nuxt-link>

        <button class="icon-trash navigation__icon"
                v-b-modal="'confirm-revert-trackers'"
                :disabled="selectedTasks.length===0 && accumulatedBreakTime == '00:00:00'"
                :class="{ 'disabled': selectedTasks.length===0 && accumulatedBreakTime == '00:00:00' }"
        >Revert Trackers
        </button>
        <b-modal :id="'confirm-revert-trackers'" centered title="Revert Trackers?">
            <div>Are you sure you want to revert all trackers & remove selectedTasks?</div> <!-- todo -->
            <template v-slot:modal-footer="{ ok }">
                <b-button variant="danger" @click.prevent="revertAllTrackers()" class="icon-trash">Yes, revert all</b-button>
            </template>
        </b-modal>
    </div>
</template>

<script>
    import { mapActions, mapMutations, mapState } from 'vuex';
    import _ from 'lodash';
    import {BIcon, BIconBookmark, BIconBookmarkCheckFill, BIconPlusSquare } from 'bootstrap-vue';

    export default {
        name: "TheNavigation",
        components: {
            TheSearch: () => import('./TheSearch'),
            BIcon,
            BIconBookmark,
            BIconBookmarkCheckFill,
            BIconPlusSquare
        },
        data() {
            return {
                searchTerm: '',
                searchLoading: false
            };
        },
        computed: {
            ...mapState({
                selectedTasks: state => state.moduleUser.selectedTasks,
                allExistingProjects: state => state.moduleUser.allExistingProjects,
                searchResults: state => state.moduleUser.searchResults,
                bookmarked: state => state.moduleUser.bookmarked
            })
        },
        methods: {
            ...mapActions({
                saveSelectedTasksToStorage: 'moduleUser/saveSelectedTasksToStorage',
                requestSessionRemoval: 'moduleUser/requestSessionRemoval',
                requestAllProjects: 'moduleUser/requestAllProjects',
                saveBookmarksToStorage: 'moduleUser/saveBookmarksToStorage',
                getIssue: 'moduleUser/getIssue'
            }),
            ...mapMutations({
                addSelectedTask: 'moduleUser/addSelectedTask',
                removeAllSelectedTasks: 'moduleUser/removeAllSelectedTasks',
                updateBookmarks: 'moduleUser/updateBookmarks',
                setSearchResult: 'moduleUser/setSearchResult'
            }),
            removeCurrentSession: function () {
                this.requestSessionRemoval()
                    .then(() => this.$router.push('/customer/login'))
                    .catch(() => console.log("err occurred"));
            },
            revertAllTrackers: function () {
                this.updateTotalBreakTime({ totalBreakTime: '00:00:00'});

                this.removeAllSelectedTasks();

                this.$bvModal.hide('confirm-revert-trackers'); // any cancel event needed?

                // synchronize localStorage
                this.saveBreaksToStorage();
                this.saveSelectedTasksToStorage();
            },
            requestSearch: _.debounce(function () {
                if (!_.isEmpty(this.searchTerm)) {
                    this.searchLoading = true;
                    this.getIssue({ searchTerm: this.searchTerm }).then(() => this.searchLoading = false);
                }
            }, 1100),
            toggleBookmarked: function (searchResultToBeToggled, summary = '') { // todo
                this.updateBookmarks({ bookmark: searchResultToBeToggled, summary });

                this.saveBookmarksToStorage();
            },
            resetSearch: function () { // todo
                this.searchTerm = '';

                this.setSearchResult([]);
            },
            addToSelectedIssues: function (selectedTicket, fromSearchResults = true) { // todo
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
