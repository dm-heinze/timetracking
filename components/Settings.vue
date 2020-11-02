<template>
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
</template>

<script>
    import { mapState, mapActions, mapMutations } from 'vuex';
    import { BIcon, BIconBookmark, BIconBookmarkCheckFill, BIconPlusSquare } from 'bootstrap-vue';
    import _ from "lodash";

	export default {
		name: "Settings",
        components: { BIcon, BIconBookmark, BIconBookmarkCheckFill, BIconPlusSquare },
        data () {
            return {
                searchTerm: '',
                searchLoading: false
            }
        },
        computed: {
            ...mapState({
                searchResults: state => state.moduleUser.searchResults,
                bookmarked: state => state.moduleUser.bookmarked
            })
        },
        methods: {
            ...mapActions({
                requestSessionRemoval: 'moduleUser/requestSessionRemoval',
                saveBookmarksToStorage: 'moduleUser/saveBookmarksToStorage',
                getIssue: 'moduleUser/getIssue'
            }),
            ...mapMutations({
                updateBookmarks: 'moduleUser/updateBookmarks',
                setSearchResult: 'moduleUser/setSearchResult'
            }),
            removeCurrentSession: function () {
                this.requestSessionRemoval()
                    .then(() => this.$router.push('/customer/login'))
                    .catch(() => console.log("err occurred"));
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

<style scoped>

</style>
