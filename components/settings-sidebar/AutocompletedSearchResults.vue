<template>
	<div>
        <div v-if="searchLoading">Loading Search Results...</div>
        <div v-if="errorOccurred" class="error-message--inline">An error occurred</div>
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
                            @click="toggleBookmarked({ searchResultToBeToggled: searchResult.key, summary: searchResult.summary })"
                        />
                        <bookmark-icon
                            v-else
                            class="ticket__icon align-self-center ticket__icon--not-bookmarked"
                            @click="toggleBookmarked({ searchResultToBeToggled: searchResult.key, summary: searchResult.summary })"
                        />
                        <plus-circle-icon class="ticket__icon align-self-center ticket__icon--selectable" @click="addToSelectedIssues({ selectedTicket: searchResult, fromSearchResults: true })" />
                    </div>
                </b-list-group-item>
            </b-list-group>
        </div>
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex';
    import { BListGroup, BListGroupItem} from "bootstrap-vue";
    import { BookmarkIcon, PlusCircleIcon } from "vue-feather-icons";

	export default {
		name: "AutocompletedSearchResults",
        components: {
            BookmarkIcon, PlusCircleIcon,
            BListGroup, BListGroupItem
        },
        directives: { 'b-list-group': BListGroup, 'b-list-group-item': BListGroupItem },
        computed: {
            ...mapState({
                searchResults: state => state.moduleUser.searchResults,
                bookmarked: state => state.moduleUser.bookmarked,
                searchLoading: state => state.moduleUser.searchLoading,
                errorOccurred: state => state.moduleUser.errorOccurred
            })
        },
        methods: {
            ...mapActions({
                toggleBookmarked: 'moduleUser/toggleBookmarked',
                addToSelectedIssues: 'moduleUser/addToSelectedIssues'
            })
        }
	}
</script>
