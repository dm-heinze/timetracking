<template>
    <div>
        <div class="autocompleted-search__container">
            <b-form-input
                @input="requestSearch"
                :value="searchTerm"
                placeholder="Search for Tickets to Bookmark"
                :disabled="$nuxt.isOffline"
                :class="{ 'disabled': $nuxt.isOffline }"
                class="form-control rounded-pill pt-4 pl-4 pb-4"
                @keyup.esc="resetSearch()"
                aria-label="search for tickets for bookmarking"
            />
            <button :disabled="searchTerm == '' && searchLoading" @click="resetSearch()" :aria-label="searchFieldButtonAriaLabel">
                <search-icon v-if="!searchLoading && searchTerm == ''" />
                <x-icon v-if="!searchLoading && searchTerm != ''" class="button--close" />
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
    </div>
</template>

<script>
    import { mapState, mapActions, mapMutations } from 'vuex';
    import _ from "lodash";
    import { regexForTicketKeys } from "~/utility/constants";
    import { BFormInput, BListGroup, BListGroupItem } from "bootstrap-vue";
    import { BookmarkIcon, PlusCircleIcon, SearchIcon, XIcon } from "vue-feather-icons";
    import { searchAriaLabelMixin, addTaskMixin, toggleBookmarkedMixin, resetSearchMixin } from "~/utility/mixins";

	export default {
		name: "Search",
        components: {
            XIcon, SearchIcon, BookmarkIcon, PlusCircleIcon,
		    BListGroup, BListGroupItem, BFormInput
        },
        directives: { 'b-list-group': BListGroup, 'b-list-group-item': BListGroupItem, 'b-form-input': BFormInput },
        mixins: [searchAriaLabelMixin, addTaskMixin, toggleBookmarkedMixin, resetSearchMixin],
        computed: {
            ...mapState({
                searchResults: state => state.moduleUser.searchResults,
                bookmarked: state => state.moduleUser.bookmarked,
                prefilledSearchSuggestions: state => state.moduleUser.prefilledSearchSuggestions,
                searchTerm: state => state.moduleUser.searchTerm,
                searchLoading: state => state.moduleUser.searchLoading
            })
        },
        methods: {
		    ...mapMutations({
                setSearchTerm: 'moduleUser/setSearchTerm',
                updateBookmarks: 'moduleUser/updateBookmarks',
                addSelectedTask: 'moduleUser/addSelectedTask',
                toggleSettings: 'moduleUser/toggleSettings',
                setSearchResult: 'moduleUser/setSearchResult',
                setSearchLoading: 'moduleUser/setSearchLoading'
            }),
            ...mapActions({
                saveBookmarksToStorage: 'moduleUser/saveBookmarksToStorage',
                saveSelectedTasksToStorage: 'moduleUser/saveSelectedTasksToStorage',
                getIssue: 'moduleUser/getIssue',
            }),
            requestSearch: _.debounce(function (value) {
                if (!_.isEmpty(value)) {
                    this.setSearchTerm(value);

                    let isAlreadyInSuggestions = 0;
                    let filteredSearchSuggestions;
                    if(this.searchTerm.match(regexForTicketKeys)) {
                        filteredSearchSuggestions = this.prefilledSearchSuggestions.filter((__searchSuggestion) => __searchSuggestion.key === this.searchTerm.toUpperCase());
                        isAlreadyInSuggestions = filteredSearchSuggestions.length;
                    }
                    if (isAlreadyInSuggestions !== 0) this.setSearchResult(filteredSearchSuggestions);
                    if (isAlreadyInSuggestions === 0) {
                        this.setSearchLoading(true);
                        this.getIssue({ searchTerm: this.searchTerm }).then(() => this.setSearchLoading(false));
                    }
                }
            }, 1100)
        }
	}
</script>
