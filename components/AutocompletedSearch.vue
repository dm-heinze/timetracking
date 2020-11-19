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
            <b-list-group>
                <b-list-group-item
                    v-for="searchResult in searchResultList"
                    :key="searchResult.key"
                    class="d-flex justify-content-between"
                    @click="addTicketToSelectedTasks(searchResult)"
                >
                    <div class="ticket__info col-11">
                        <div class="ticket__info__key font-weight-bold">{{ searchResult.key }}</div>
                        <div class="ticket__info__summary text-truncate">{{ searchResult.summary }}</div>
                    </div>
                    <div class="ticket__actions">
                        <plus-circle-icon  class="ticket__icon align-self-center ticket__icon--selectable" />
                    </div>
                </b-list-group-item>
            </b-list-group>
        </div>
        <div v-if="$nuxt.isOffline">No network connection available. You can track your time with a custom task instead.</div>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapActions } from 'vuex';
    import _ from "lodash";
    import { SearchIcon, XIcon, PlusCircleIcon } from 'vue-feather-icons';
    import { regexForTicketKeys } from "~/utility/constants";
    import { searchAriaLabelMixin } from "~/utility/mixins";

    export default {
        name: "AutocompletedSearch",
        components: { SearchIcon, XIcon, PlusCircleIcon },
        mixins: [searchAriaLabelMixin],
        data() {
            return {
                searchTerm: '',
                searchLoading: false,
                alreadyExists: false
            }
        },
        computed: {
            ...mapState({
                prefilledSearchSuggestions: state => state.moduleUser.prefilledSearchSuggestions,
                searchResults: state => state.moduleUser.searchResults,
                selectedTasks: state => state.moduleUser.selectedTasks,
                isTimerActive: state => state.moduleUser.isTimerActive
            }),
            searchResultList () {
                if (!this.alreadyExists) {
                    let resultsToBeDisplayed = _.cloneDeep(this.searchResults);
                    let keyOfResultsToBeDisplayed = resultsToBeDisplayed.map((__resultToBeDisplayed) => __resultToBeDisplayed.key);

                    this.prefilledSearchSuggestions.forEach((__prefilledSuggestion) => {
                        if (!_.includes(keyOfResultsToBeDisplayed, __prefilledSuggestion.key)) resultsToBeDisplayed.push(__prefilledSuggestion);
                    })

                    return resultsToBeDisplayed;
                }

                if (this.alreadyExists) {
                    const __searchTerm = this.searchTerm;

                    const __sorted = _.orderBy(this.prefilledSearchSuggestions, [function (__searchResult) {
                        return _.isEqual(__searchResult.key, __searchTerm.toUpperCase());
                    }])

                    return _.reverse(__sorted);
                }
            }
        },
        methods: {
            ...mapMutations({
                setSearchResult: 'moduleUser/setSearchResult', // todo
                addSelectedTask: 'moduleUser/addSelectedTask',
                setIsTimerActive: 'moduleUser/setIsTimerActive',
                setActiveTicket: 'moduleUser/setActiveTicket'
            }),
            ...mapActions({
                getIssue: 'moduleUser/getIssue',
                saveSelectedTasksToStorage: 'moduleUser/saveSelectedTasksToStorage',
                resetState: 'moduleUser/resetState'
            }),
            resetSearch: function () { // todo
                this.searchTerm = '';
                this.setSearchResult([]);
            },
            requestSearch: _.debounce(function () {
                if (!_.isEmpty(this.searchTerm)) {
                    let isAlreadyInSuggestions = 0;
                    if(this.searchTerm.match(regexForTicketKeys)) isAlreadyInSuggestions = this.prefilledSearchSuggestions.filter((__searchSuggestion) => __searchSuggestion.key === this.searchTerm.toUpperCase()).length;
                    if (isAlreadyInSuggestions === 0) {
                        this.searchLoading = true;

                        this.getIssue({ searchTerm: this.searchTerm })
                            .then(() => this.searchLoading = false)
                            .catch((err) => {
                                if (err.response.status === 401) { // todo
                                    this.resetState()
                                        .then(() => {
                                            this.searchLoading = false;

                                            if (this.isTimerActive) { // todo
                                                this.setActiveTicket('');

                                                this.setIsTimerActive();
                                            }

                                            this.$router.push('/customer/login');
                                        })
                                }
                            })
                    } else {
                        this.alreadyExists = true;
                    }
                }
            }, 1100),
            addTicketToSelectedTasks: function (selection) {
                let __selection = _.cloneDeep(selection);
                __selection.uniqueId = _.now();
                this.addSelectedTask(__selection);
                this.saveSelectedTasksToStorage();
                // this.searchTerm = ''; // toggles visibility of search results
                this.alreadyExists = false;
            }
        }
    }
</script>

<style scoped>
    .fade-enter-active, .fade-leave-active {
        transition: all .3s ease;
    }

    .fade-enter, .fade-leave-to {
        opacity: 0;
    }

    .fade-enter-to, .fade-leave {
        opacity: 1;
    }
</style>
