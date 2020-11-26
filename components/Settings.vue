<template>
    <div id="sidebar-settings">
        <div class="sidebar-settings__header d-flex flex-row justify-content-between">
            <h3 class="sidebar__title">Settings</h3>
            <button @click.prevent="resetSearch(true)" class="button--close"><x-circle-icon /></button>
        </div>

        <search />

        <h3 class="sidebar__title sidebar__title--bookmarks">Bookmarks</h3>
        <div v-if="bookmarked.length !== 0">
            <bookmarks-editable />
        </div>
        <div v-else class="sidebar__title sidebar__title--no-bookmarks">No Bookmarks Saved.</div>

        <logout />
    </div>
</template>

<script>
    import { mapState, mapMutations } from 'vuex';
    import { XCircleIcon } from 'vue-feather-icons';
    import Logout from '~/components/Logout';
    import Search from "~/components/Search";
    import { resetSearchMixin } from "~/utility/mixins";

	export default {
		name: "Settings",
        components: {
            XCircleIcon,
            Search,
            BookmarksEditable: () => import('~/components/BookmarksEditable'),
            Logout
        },
        mixins: [resetSearchMixin],
        computed: {
            ...mapState({
                bookmarked: state => state.moduleUser.bookmarked
            })
        },
        methods: {
            ...mapMutations({
                setSearchResult: 'moduleUser/setSearchResult',
                toggleSettings: 'moduleUser/toggleSettings',
                setSearchTerm: 'moduleUser/setSearchTerm'
            })
        }
	}
</script>
