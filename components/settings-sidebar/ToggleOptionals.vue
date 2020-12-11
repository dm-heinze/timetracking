<template>
    <div class="wrapper--toggleOptionals">
        <h3 class="sidebar__title">Main Sidebar Settings</h3>
        <div class="pb-3">Toggle the following groups visibility on the main sidebar or reorder them</div>
        <draggable v-model="groups">
            <b-list-group-item class="d-flex justify-content-between pt-3" v-for="group in groups" :key="group" :disabled="group === 'Assigned Tickets'">
                <div class="ticket__info col-10">
                    <div class="ticket__info__key font-weight-bold">{{ group }}</div>
                </div>
                <div class="toggle-listing" v-if="group === 'Suggestions'">
                    <toggle-right-icon class="ticket__icon align-self-center toggle-listing--show" @click="updateSelectionForSuggestions" v-if="showSuggestions" />
                    <toggle-left-icon class="ticket__icon align-self-center toggle-listing--hide" @click="updateSelectionForSuggestions" v-else />
                </div>
            </b-list-group-item>
        </draggable>
    </div>
</template>

<script>
    import { mapState, mapMutations, mapActions } from 'vuex';
    import { ToggleLeftIcon, ToggleRightIcon } from 'vue-feather-icons';
    import { BListGroupItem } from "bootstrap-vue";
    import draggable from 'vuedraggable';

    export default {
        name: "ToggleOptionals",
        components: {
            ToggleLeftIcon, ToggleRightIcon,
            BListGroupItem,
            draggable
        },
        directives: { 'b-list-group-item': BListGroupItem },
        computed: {
            ...mapState({
                showSuggestions: state => state.moduleUser.showSuggestions,
                suggestionGroups: state => state.moduleUser.suggestionGroups
            }),
            groups: {
                get () {
                    return this.suggestionGroups;
                },

                set (value) { // value param represents reordered array
                    // update vuex store
                    this.setSuggestionGroups(value);

                    // synchronize localStorage // todo: as cookie instead?
                    this.saveSuggestionGroupsToStorage();
                }
            }
        },
        methods: {
            ...mapMutations({
                setSuggestionGroups: 'moduleUser/setSuggestionGroups'
            }),
            ...mapActions({
                updateSelectionForSuggestions: 'moduleUser/updateSelectionForSuggestions',
                saveSuggestionGroupsToStorage: 'moduleUser/saveSuggestionGroupsToStorage'
            })
        }
    }
</script>
