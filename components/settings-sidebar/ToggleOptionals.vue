<template>
    <div class="pb-5">
        <h3>Main Sidebar Settings</h3>
        <div class="pb-3">Toggle the following groups visibility on the main sidebar</div>
        <b-list-group-item class="d-flex justify-content-between pt-3">
            <div class="ticket__info col-10">
                <div class="ticket__info__key font-weight-bold">Suggestions</div>
            </div>
            <div class="toggle-listing">
                <toggle-right-icon class="ticket__icon align-self-center toggle-listing--show" @click="toggleSuggestions" v-if="showSuggestions" />
                <toggle-left-icon class="ticket__icon align-self-center toggle-listing--hide" @click="toggleSuggestions" v-else />
            </div>
        </b-list-group-item>
    </div>
</template>

<script>
    import { mapState, mapMutations } from 'vuex';
    import { ToggleLeftIcon, ToggleRightIcon } from 'vue-feather-icons';
    import { BListGroupItem } from "bootstrap-vue";

    export default {
        name: "ToggleOptionals",
        components: {
            ToggleLeftIcon, ToggleRightIcon,
            BListGroupItem
        },
        directives: { 'b-list-group-item': BListGroupItem },
        computed: {
            ...mapState({
                showSuggestions: state => state.moduleUser.showSuggestions
            })
        },
        methods: {
            ...mapMutations({
                toggleSuggestions: 'moduleUser/toggleSuggestions'
            })
        }
    }
</script>
