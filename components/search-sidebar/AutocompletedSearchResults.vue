<template>
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
</template>

<script>
    import { mapState, mapMutations, mapActions } from 'vuex';
	import _ from "lodash";
    import { BListGroup, BListGroupItem } from "bootstrap-vue";
    import { PlusCircleIcon } from "vue-feather-icons";

    export default {
		name: "AutocompletedSearchResults",
        components: { BListGroupItem, BListGroup, PlusCircleIcon },
        directives: { 'b-list-group': BListGroup, 'b-list-group-item': BListGroupItem },
        props: {
            searchTerm: {
                type: String,
                required: true
            },
            alreadyExists: {
                type: Boolean,
                required: true
            }
        },
        computed: {
            ...mapState({
                prefilledSearchSuggestions: state => state.moduleUser.prefilledSearchSuggestions,
                searchResults: state => state.moduleUser.searchResults,
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
                addSelectedTask: 'moduleUser/addSelectedTask',
            }),
            ...mapActions({
                saveSelectedTasksToStorage: 'moduleUser/saveSelectedTasksToStorage',
            }),
            addTicketToSelectedTasks: function (selection) {
                let __selection = _.cloneDeep(selection);
                __selection.uniqueId = _.now();

                // update store & localStorage
                this.addSelectedTask(__selection);
                this.saveSelectedTasksToStorage();

                // this.searchTerm = ''; // toggles visibility of search results // searchTerm now a prop

                this.$emit('updateAlreadyExists', false)
            }
        }
	}
</script>
