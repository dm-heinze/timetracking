<template>
    <div>
        <h3 class="sidebar__title sidebar__title--bookmarks">Bookmarks</h3>
        <template v-if="bookmarked.length">
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
                        <bookmark-icon class="ticket__icon align-self-center ticket__icon--bookmarked" @click="toggleBookmarked({ searchResultToBeToggled: bookmarkedTicket.key })" />
                        <plus-circle-icon class="ticket__icon align-self-center ticket__icon--selectable" @click="addToSelectedIssues({ selectedTicket: bookmarkedTicket, fromSearchResults: false })" />
                    </div>
                </b-list-group-item>
            </b-list-group>
        </template>
        <div v-else class="sidebar__title sidebar__title--no-bookmarks">No Bookmarks Saved.</div>
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex';
    import { BookmarkIcon, PlusCircleIcon } from 'vue-feather-icons';
    import { BListGroup, BListGroupItem } from 'bootstrap-vue';

	export default {
		name: "BookmarksEditable",
        components: {
            BookmarkIcon, PlusCircleIcon,
            BListGroup, BListGroupItem
        },
        directives: { 'b-list-group': BListGroup, 'b-list-group-item': BListGroupItem },
        computed: {
            ...mapState({
                bookmarked: state => state.moduleBookmark.bookmarked
            })
        },
        methods: {
            ...mapActions({
                toggleBookmarked: 'moduleBookmark/toggleBookmarked',
                addToSelectedIssues: 'moduleUser/addToSelectedIssues'
            })
        }
	}
</script>
