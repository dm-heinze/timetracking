<template>
	<div>
        <h3 class="sidebar__title title--bookmarks">Bookmarks</h3>
        <client-only>
            <div v-if="bookmarked.length !== 0">
                <b-list-group> <!-- todo: dynamically import -->
                    <b-list-group-item
                        v-for="bookmarkedTicket in bookmarked"
                        :key="bookmarkedTicket.key"
                        class="d-flex justify-content-between"
                        @click="addToSelectedIssues({ selectedTicket: bookmarkedTicket, fromSearchResults: false })"
                    >
                        <div class="ticket__info col-11">
                            <div class="ticket__info__key font-weight-bold">{{ bookmarkedTicket.key }}</div>
                            <div class="ticket__info__summary text-truncate">{{ bookmarkedTicket.summary }}</div>
                        </div>
                        <plus-circle-icon class="ticket__icon align-self-center" />
                    </b-list-group-item>
                </b-list-group>
            </div>
            <div v-else>No Bookmarks Saved.</div>
        </client-only>
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex';
    import { PlusCircleIcon } from "vue-feather-icons";
    import { BListGroup, BListGroupItem } from "bootstrap-vue";

    export default {
		name: "BookmarksSelectable",
        components: { PlusCircleIcon, BListGroupItem, BListGroup },
        directives: { 'b-list-group': BListGroup, 'b-list-group-item': BListGroupItem },
        computed: {
            ...mapState({
                bookmarked: state => state.moduleBookmark.bookmarked
            })
        },
        methods: {
            ...mapActions({
                addToSelectedIssues: 'moduleUser/addToSelectedIssues'
            })
        }
	}
</script>
