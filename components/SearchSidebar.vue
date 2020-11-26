<template>
    <div>
        <h3 class="sidebar__title">Ticket search</h3>
        <the-search />
        <div class="d-flex flex-row group--settings" :style="{ 'outline': 'none' }" @click="toggleSettings">
            <settings-icon class="button--settings" />
            <div class="pl-1 my-auto sidebar__option--settings">Settings</div>
        </div>
    </div>
</template>

<script>
    import { mapMutations } from 'vuex';
    import TheSearch from "~/components/TheSearch";
    import { SettingsIcon } from 'vue-feather-icons';

	export default {
		name: "SearchSidebar",
        components: {
            TheSearch,
            SettingsIcon
        },
        methods: {
		    ...mapMutations({
                toggleSettings: 'moduleUser/toggleSettings'
            })
        }
	}
</script>
