<template>
    <div id="sidebar-settings">
        <div class="sidebar-settings__header d-flex flex-row justify-content-between">
            <h3 class="sidebar__title">Settings</h3>
            <button @click.prevent="resetSearch({ close: true })" class="button--close"><x-circle-icon /></button>
        </div>

        <autocompleted-search />

        <h3 class="sidebar__title sidebar__title--bookmarks">Bookmarks</h3>
        <div v-if="bookmarked.length !== 0">
            <bookmarks-editable />
        </div>
        <div v-else class="sidebar__title sidebar__title--no-bookmarks">No Bookmarks Saved.</div>

        <logout />
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex';
    import { XCircleIcon } from 'vue-feather-icons';
    import Logout from '~/components/settings-sidebar/Logout';
    import AutocompletedSearch from "~/components/settings-sidebar/AutocompletedSearch";

	export default {
		name: "Settings",
        components: {
            AutocompletedSearch,
            XCircleIcon,
            BookmarksEditable: () => import('~/components/settings-sidebar/BookmarksEditable'),
            Logout
        },
        computed: {
            ...mapState({
                bookmarked: state => state.moduleUser.bookmarked
            })
        },
        methods: {
            ...mapActions({
                resetSearch: 'moduleUser/resetSearch'
            })
        }
	}
</script>
