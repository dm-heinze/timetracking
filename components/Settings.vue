<template>
    <div id="sidebar-settings">
        <div class="sidebar-settings__header d-flex flex-row justify-content-between">
            <h3 class="sidebar__title">Settings</h3>
            <button @click.prevent="resetSearch(true)" class="button--close"><x-circle-icon /></button>
        </div>

        <search />

        <h3 class="sidebar__title sidebar__title--bookmarks">Bookmarks</h3>
        <div v-if="bookmarked.length !== 0"> <!-- todo: dynamically import template block if true -->
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
                        <bookmark-icon class="ticket__icon align-self-center ticket__icon--bookmarked" @click="toggleBookmarked(bookmarkedTicket.key)" />
                        <plus-circle-icon  class="ticket__icon align-self-center ticket__icon--selectable" @click="addToSelectedIssues(bookmarkedTicket, false)" />
                    </div>
                </b-list-group-item>
            </b-list-group>
        </div>
        <div v-else class="sidebar__title sidebar__title--no-bookmarks">No Bookmarks Saved.</div>

        <logout />
    </div>
</template>

<script>
    import { mapState, mapActions, mapMutations } from 'vuex';
    import { XCircleIcon, BookmarkIcon, PlusCircleIcon } from 'vue-feather-icons';
    import { BListGroup, BListGroupItem } from 'bootstrap-vue';
    import _ from "lodash"; // todo
    import Logout from '~/components/Logout';
    import Search from "~/components/Search";
    import { addTaskMixin, toggleBookmarkedMixin, resetSearchMixin } from "~/utility/mixins";

	export default {
		name: "Settings",
        components: {
            Search,
		    XCircleIcon, BookmarkIcon, PlusCircleIcon,
            BListGroup, BListGroupItem,
            Logout
        },
        directives: { 'b-list-group': BListGroup, 'b-list-group-item': BListGroupItem },
        mixins: [addTaskMixin, toggleBookmarkedMixin, resetSearchMixin],
        computed: {
            ...mapState({
                bookmarked: state => state.moduleUser.bookmarked
            })
        },
        methods: {
            ...mapActions({
                saveBookmarksToStorage: 'moduleUser/saveBookmarksToStorage',
                saveSelectedTasksToStorage: 'moduleUser/saveSelectedTasksToStorage'
            }),
            ...mapMutations({
                updateBookmarks: 'moduleUser/updateBookmarks',
                setSearchResult: 'moduleUser/setSearchResult',
                toggleSettings: 'moduleUser/toggleSettings',
                addSelectedTask: 'moduleUser/addSelectedTask',
                setSearchTerm: 'moduleUser/setSearchTerm'
            })
        }
	}
</script>
