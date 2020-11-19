<template>
    <div id="sidebar-settings">
        <div class="sidebar-settings__header d-flex flex-row justify-content-between">
            <h3 class="sidebar__title">Settings</h3>
            <button @click.prevent="resetSearch(true)" class="button--close"><x-circle-icon /></button>
        </div>
        <div class="autocompleted-search__container">
            <b-form-input
                v-model="searchTerm"
                @input="requestSearch"
                placeholder="Search for Tickets to Bookmark"
                :disabled="$nuxt.isOffline"
                :class="{ 'disabled': $nuxt.isOffline }"
                class="form-control rounded-pill pt-4 pl-4 pb-4"
                @keyup.esc="resetSearch()"
                aria-label="search for tickets for bookmarking"
            />
            <button :disabled="searchTerm === '' && searchLoading" @click="resetSearch()" :aria-label="searchFieldButtonAriaLabel">
                <search-icon v-if="!searchLoading && searchTerm === ''" />
                <x-icon v-if="!searchLoading && searchTerm !== ''" class="button--close" />
                <b-spinner variant="primary" small v-show="searchLoading"></b-spinner>
            </button>
        </div>

        <div v-if="searchLoading">Loading Search Results...</div>
        <div v-if="searchResults.length !== 0" class="search-results--settings">
            <b-list-group>
                <b-list-group-item
                    v-for="searchResult in searchResults"
                    :key="searchResult.key"
                    class="d-flex justify-content-between"
                >
                    <div class="ticket__info col-10">
                        <div class="ticket__info__key font-weight-bold">{{ searchResult.key }}</div>
                        <div class="ticket__info__summary text-truncate">{{ searchResult.summary }}</div>
                    </div>
                    <div class="ticket__actions">
                        <bookmark-icon
                            v-if="bookmarked.find((marked) => marked.key === searchResult.key)"
                            class="ticket__icon align-self-center ticket__icon--bookmarked"
                            @click="toggleBookmarked(searchResult.key, searchResult.summary)"
                        />
                        <bookmark-icon
                            v-else
                            class="ticket__icon align-self-center ticket__icon--not-bookmarked"
                            @click="toggleBookmarked(searchResult.key, searchResult.summary)"
                        />
                        <plus-circle-icon  class="ticket__icon align-self-center ticket__icon--selectable" @click="addToSelectedIssues(searchResult)" />
                    </div>
                </b-list-group-item>
            </b-list-group>
        </div>

        <h3 class="sidebar__title sidebar__title--bookmarks">Bookmarks</h3>
        <div v-if="bookmarked.length !== 0">
            <b-list-group>
                <b-list-group-item
                    v-for="bookmarkedTicket in bookmarked"
                    :key="bookmarkedTicket.key"
                    class="d-flex justify-content-between"
                >
                    <div class="ticket__info col-10">
                        <div class="ticket__info__key font-weight-bold">{{ bookmarkedTicket.key }}</div>
                        <div class="ticket__info__summary text-truncate">{{ bookmarkedTicket.summary }}</div>
                    </div>
                    <div class="ticket__actions">
                        <bookmark-icon class="ticket__icon align-self-center ticket__icon--bookmarked" @click="toggleBookmarked(bookmarkedTicket.key)" />
                        <plus-circle-icon  class="ticket__icon align-self-center ticket__icon--selectable" @click="addToSelectedIssues(bookmarkedTicket, false)" />
                    </div>
                </b-list-group-item>
            </b-list-group>
        </div>
        <div v-else class="sidebar__title sidebar__title--no-bookmarks">No Bookmarks Saved.</div>

        <b-button pill variant="danger" @click.prevent="removeCurrentSession" type="button" class="login-content__sign-in-btn button--logout pt-2 pb-2 mr-1 w-100">
            <log-out-icon />
            <span class="pl-1">Logout</span>
        </b-button>
    </div>
</template>

<script>
    import { mapState, mapActions, mapMutations } from 'vuex';
    import { XIcon, XCircleIcon, LogOutIcon, SearchIcon, BookmarkIcon, PlusCircleIcon } from 'vue-feather-icons';
    import _ from "lodash";
    import { regexForTicketKeys } from "../utility/constants";
    import { searchAriaLabelMixin } from "~/utility/mixins";

	export default {
		name: "Settings",
        components: { XIcon, XCircleIcon, LogOutIcon, SearchIcon, BookmarkIcon, PlusCircleIcon },
        mixins: [searchAriaLabelMixin],
        data () {
            return {
                searchTerm: '',
                searchLoading: false
            }
        },
        computed: {
            ...mapState({
                searchResults: state => state.moduleUser.searchResults,
                bookmarked: state => state.moduleUser.bookmarked,
                prefilledSearchSuggestions: state => state.moduleUser.prefilledSearchSuggestions
            })
        },
        methods: {
            ...mapActions({
                requestSessionRemoval: 'moduleUser/requestSessionRemoval',
                saveBookmarksToStorage: 'moduleUser/saveBookmarksToStorage',
                getIssue: 'moduleUser/getIssue',
                saveSelectedTasksToStorage: 'moduleUser/saveSelectedTasksToStorage'
            }),
            ...mapMutations({
                updateBookmarks: 'moduleUser/updateBookmarks',
                setSearchResult: 'moduleUser/setSearchResult',
                toggleSettings: 'moduleUser/toggleSettings',
                addSelectedTask: 'moduleUser/addSelectedTask'
            }),
            removeCurrentSession: function () {
                this.toggleSettings();

                this.requestSessionRemoval()
                    .then(() => this.$router.push('/customer/login'))
                    .catch(() => console.log("err occurred"));
            },
            requestSearch: _.debounce(function () {
                if (!_.isEmpty(this.searchTerm)) {
                    let isAlreadyInSuggestions = 0;
                    let filteredSearchSuggestions;
                    if(this.searchTerm.match(regexForTicketKeys)) {
                        filteredSearchSuggestions = this.prefilledSearchSuggestions.filter((__searchSuggestion) => __searchSuggestion.key === this.searchTerm.toUpperCase());
                        isAlreadyInSuggestions = filteredSearchSuggestions.length;
                    }
                    if (isAlreadyInSuggestions !== 0) this.setSearchResult(filteredSearchSuggestions);
                    if (isAlreadyInSuggestions === 0) {
                        this.searchLoading = true;
                        this.getIssue({ searchTerm: this.searchTerm }).then(() => this.searchLoading = false);
                    }
                }
            }, 1100),
            toggleBookmarked: function (searchResultToBeToggled, summary = '') { // todo
                this.updateBookmarks({ bookmark: searchResultToBeToggled, summary });

                this.saveBookmarksToStorage();
            },
            resetSearch: function (close = false) { // todo
                this.searchTerm = '';

                this.setSearchResult([]);

                if (close) this.toggleSettings();
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
