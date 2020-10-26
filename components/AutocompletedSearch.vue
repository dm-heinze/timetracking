<template>
    <div>
        <div class="autocompleted-search__container">
            <input v-model="searchTerm" @input="requestSearch" placeholder="Search...">
            <button :class="{ 'icon-close': !searchLoading && searchTerm !== '', 'icon-search': !searchLoading || searchTerm === '' }" :disabled="searchTerm === '' && searchLoading" @click="resetSearch()">
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
        </transition>
    </div>
</template>

<script>
  import { mapMutations, mapState, mapActions } from 'vuex';
  import _ from "lodash";

	export default {
		name: "AutocompletedSearch",
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
            setSearchResult: 'moduleUser/setSearchResult',
            addSelectedTask: 'moduleUser/addSelectedTask'
        }),
        ...mapActions({
            getIssue: 'moduleUser/getIssue',
            saveSelectedTasksToStorage: 'moduleUser/saveSelectedTasksToStorage',
            flashMessage: 'moduleFlashMessage/flashMessage'
        }),
        resetSearch: function () {
            this.searchTerm = '';
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
            const alreadyIncludedInSelectedTasks = this.selectedTasks.filter((__selectedTask) => __selectedTask.key === selection.key.toUpperCase()).length !== 0; // todo
            if (!alreadyIncludedInSelectedTasks) { // todo
                this.addSelectedTask(selection);
                this.saveSelectedTasksToStorage();
                this.searchTerm = '';
                this.alreadyExists = false;
            } else {
                this.flashMessage({ message: `You are already working on ${selection.key}`, status: 'primary' });
            }
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
