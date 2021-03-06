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
                @keyup.esc="resetSearch({ close: false })"
                aria-label="search for tickets for bookmarking"
            />
            <button :disabled="searchTerm == '' && searchLoading" @click="resetSearch({ close: false })" :aria-label="searchFieldButtonAriaLabel">
                <search-icon v-if="!searchLoading && searchTerm == ''" />
                <x-icon v-if="!searchLoading && searchTerm != ''" class="button--close" />
                <b-spinner variant="primary" small v-show="searchLoading"></b-spinner>
            </button>
        </div>

        <autocompleted-search-results />
    </div>
</template>

<script>
    import { mapState, mapActions, mapMutations } from 'vuex';
    import _ from "lodash";
    import { regexForTicketKeys } from "~/utility/constants";
    import { BFormInput } from "bootstrap-vue";
    import { SearchIcon, XIcon } from "vue-feather-icons";
    import { searchAriaLabelMixin } from "~/utility/mixins";
    import AutocompletedSearchResults from "~/components/settings-sidebar/AutocompletedSearchResults";

	export default {
		name: "AutocompletedSearch",
        components: {
            AutocompletedSearchResults,
            XIcon, SearchIcon,
            BFormInput
        },
        directives: { 'b-form-input': BFormInput },
        mixins: [searchAriaLabelMixin],
        computed: {
            ...mapState({
                prefilledSearchSuggestions: state => state.modulePrefill.prefilledSearchSuggestions,
                searchTerm: state => state.moduleSearch.searchTerm,
                searchLoading: state => state.moduleSearch.searchLoading
            })
        },
        methods: {
		    ...mapMutations({
                setSearchTerm: 'moduleSearch/setSearchTerm',
                toggleSettings: 'moduleUser/toggleSettings',
                setSearchResult: 'moduleSearch/setSearchResult',
                setSearchLoading: 'moduleSearch/setSearchLoading',
                updateErrorOccurred: 'moduleUser/updateErrorOccurred'
            }),
            ...mapActions({
                getIssue: 'moduleSearch/getIssue',
                resetSearch: 'moduleSearch/resetSearch',
                resetState: 'moduleUser/resetState' // todo
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

                    // if searchTerm is a ticketId & can be found in prefill -> there is no API request
                    if (isAlreadyInSuggestions !== 0) this.setSearchResult(filteredSearchSuggestions);
                    if (isAlreadyInSuggestions === 0) {
                        this.setSearchLoading(true);

                        this.getIssue({ searchTerm: this.searchTerm })
                            .then(() => this.setSearchLoading(false))
                            .catch((err) => {
                                this.setSearchLoading(false);

                                if (err === 401) {
                                    this.toggleSettings();

                                    this.resetState()
                                        .then(() => this.$router.push('/customer/login')) // todo
                                } else {
                                    this.updateErrorOccurred(true); // todo
                                }
                            });
                    }
                }
            }, 1100)
        }
	}
</script>
