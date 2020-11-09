<template>
    <div>
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
            />
            <button :disabled="searchTerm === '' && searchLoading" @click="resetSearch()">
                <search-icon v-if="!searchLoading && searchTerm === ''" />
                <x-icon v-if="!searchLoading && searchTerm !== ''" class="button--close" />
                <b-spinner variant="primary" small v-show="searchLoading"></b-spinner>
            </button>
        </div>
        <transition name="fade">
            <div v-if="!searchLoading && (searchTerm !== '')" class="autocompleted-search__results">
                <ul>
                    <li v-for="searchResult in searchResultList" @click.prevent="addTicketToSelectedTasks(searchResult)" :key="searchResult.key">
                        <div v-b-toggle.sidebar-search><b-badge variant="primary">{{ searchResult.key }}</b-badge> <span>{{ searchResult.summary }}</span></div>
                    </li>
                </ul>
            </div>
            <div v-if="$nuxt.isOffline">No network connection available. You can track your time with a custom task instead.</div>
        </transition>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapActions } from 'vuex';
    import _ from "lodash";
    import { SearchIcon, XIcon } from 'vue-feather-icons';

    export default {
        name: "AutocompletedSearch",
        components: { SearchIcon, XIcon },
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
                selectedTasks: state => state.moduleUser.selectedTasks
            }),
            searchResultList () {
                if (!this.alreadyExists) return this.prefilledSearchSuggestions;
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
                addSelectedTask: 'moduleUser/addSelectedTask'
            }),
            ...mapActions({
                getIssue: 'moduleUser/getIssue',
                saveSelectedTasksToStorage: 'moduleUser/saveSelectedTasksToStorage',
            }),
            resetSearch: function () { // todo
                this.searchTerm = '';
                this.setSearchResult([]);
            },
            requestSearch: _.debounce(function () {
                if (!_.isEmpty(this.searchTerm)) {
                    const isAlreadyInSuggestions = this.prefilledSearchSuggestions.filter((__searchSuggestion) => __searchSuggestion.key === this.searchTerm.toUpperCase());
                    if (isAlreadyInSuggestions.length === 0) {
                        this.searchLoading = true;
                        this.getIssue({ searchTerm: this.searchTerm }).then(() => this.searchLoading = false);
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
                this.searchTerm = '';
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
