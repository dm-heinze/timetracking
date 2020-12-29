<template>
    <div id="sidebar-settings">
        <div class="sidebar-settings__header d-flex flex-row justify-content-between">
            <h3 class="sidebar__title">Settings</h3>
            <button @click.prevent="resetSearch({ close: true })" class="button--close"><x-circle-icon /></button>
        </div>

        <autocompleted-search />

        <bookmarks-editable />

        <toggle-optionals />

        <!-- <toggle-time-slots /> -->

        <logout />
    </div>
</template>

<script>
    import { mapActions } from 'vuex';
    import { XCircleIcon } from 'vue-feather-icons';
    import Logout from '~/components/settings-sidebar/Logout';
    import AutocompletedSearch from "~/components/settings-sidebar/AutocompletedSearch";
    import ToggleOptionals from "~/components/settings-sidebar/ToggleOptionals";
    import BookmarksEditable from "~/components/settings-sidebar/BookmarksEditable"; // handles case 'no bookmarks'
    import ToggleTimeSlots from "~/components/settings-sidebar/ToggleTimeSlots";

	export default {
		name: "SettingsSidebar",
        components: {
            ToggleTimeSlots, ToggleOptionals, AutocompletedSearch, Logout, BookmarksEditable,
            XCircleIcon
        },
        methods: {
            ...mapActions({
                resetSearch: 'moduleSearch/resetSearch'
            })
        }
	}
</script>
