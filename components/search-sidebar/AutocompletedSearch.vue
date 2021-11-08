<template>
    <div id="sidebar-search">
        <div class="autocompleted-search__container">
            <b-form-input
                v-model="searchTerm"
                @input="requestSearch"
                type="text"
                placeholder="Search..."
                :disabled="$nuxt.isOffline"
                class="form-control rounded-pill pt-4 pl-4 pb-4"
                :class="{ 'disabled': $nuxt.isOffline }"
                @keyup.esc="resetSearch()"
                aria-label="search for tickets"
            />
            <button :disabled="searchTerm === '' && searchLoading" @click="resetSearch()" :aria-label="searchFieldButtonAriaLabel">
                <search-icon v-if="!searchLoading && searchTerm === ''" />
                <x-icon v-if="!searchLoading && searchTerm !== ''" class="button--close" />
                <b-spinner variant="primary" small v-show="searchLoading"></b-spinner>
            </button>
        </div>

        <div v-if="!searchLoading && (searchTerm !== '')" class="autocompleted-search__results">
            <autocompleted-search-results :search-term="searchTerm" />
        </div>
        <div v-if="$nuxt.isOffline">No network connection available. You can track your time with a custom task instead.</div>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapActions } from 'vuex';
    import _ from "lodash";
    import { SearchIcon, XIcon } from 'vue-feather-icons';
    import { BFormInput } from 'bootstrap-vue';
    import { regexForTicketKeys } from "~/utility/constants";
    import { searchAriaLabelMixin } from "~/utility/mixins";

    export default {
        name: "AutocompletedSearch",
        components: { SearchIcon, XIcon, BFormInput, AutocompletedSearchResults: () => import('~/components/search-sidebar/AutocompletedSearchResults') },
        directives: { 'b-form-input': BFormInput },
        mixins: [searchAriaLabelMixin],
        data() {
            return {
                searchTerm: '', // todo
                searchLoading: false, // todo
            }
        },
        computed: {
            ...mapState({
                prefilledSearchSuggestions: state => state.modulePrefill.prefilledSearchSuggestions,
                isTimerActive: state => state.moduleUser.isTimerActive,
                alreadyExists: state => state.moduleSearch.alreadyExists
            })
        },
        methods: {
            ...mapMutations({
                setSearchResult: 'moduleSearch/setSearchResult', // todo
                setIsTimerActive: 'moduleUser/setIsTimerActive',
                setActiveTicket: 'moduleUser/setActiveTicket',
                setAlreadyExists: 'moduleSearch/setAlreadyExists'
            }),
            ...mapActions({
                getIssue: 'moduleSearch/getIssue',
                resetState: 'moduleUser/resetState'
            }),
            resetSearch: function () { // todo
                this.searchTerm = '';
                if (this.alreadyExists) this.setAlreadyExists(false);
                this.setSearchResult([]);
            },
            formatSearchTerm: function () {
                if(!this.searchTerm.includes('https')) {
                    return;
                }

                this.searchTerm = this.searchTerm
                    .replace(process.env.BASE_DOMAIN + process.env.ENDPOINT_BROWSE, '');

                if(!this.searchTerm.includes('?')) {
                    return;
                }

                this.searchTerm = this.searchTerm.substring(0, this.searchTerm.indexOf('?'));
            },
            requestSearch: _.debounce(function () { // todo
                if (!_.isEmpty(this.searchTerm)) {
                    this.formatSearchTerm();
                    let isAlreadyInSuggestions = 0;
                    if(this.searchTerm.match(regexForTicketKeys)) isAlreadyInSuggestions = this.prefilledSearchSuggestions.filter((__searchSuggestion) => __searchSuggestion.key === this.searchTerm.toUpperCase()).length;
                    if (isAlreadyInSuggestions === 0) { // only make request if its a ticketId that does not exist in prefill already or if not a ticketId
                        this.searchLoading = true; // todo

                        this.getIssue({ searchTerm: this.searchTerm })
                            .then(() => this.searchLoading = false) // todo
                            .catch((err) => {
                                this.searchLoading = false; // todo

                                if (err === 401) {
                                    this.resetState()
                                        .then(() => this.$router.push('/customer/login')) // todo
                                } else {
                                    // todo
                                    console.log("error occurred");
                                }
                            })
                    } else {
                        this.setAlreadyExists(true);
                    }
                }
            }, 1100)
        }
    }
</script>
