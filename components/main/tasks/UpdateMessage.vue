<template>
    <b-modal
        :id="'update-available-modal'"
        centered
        no-close-on-backdrop
        no-close-on-esc
        tall
        :visible="showUnbookedTasksLeftModal && !updateMessageShown"
    >
        <template v-slot:modal-header="{ close }">
            <div class="d-flex justify-content-between align-items-center w-100 modal__top-bar">
                <h3 class="primary">Release Notes</h3>
            </div>
        </template>
        <template v-slot:default>
            <div class="modal__main-container">
                <div class="modal__main-container__main-text d-flex flex-column align-items-center">
                    <div class="font-weight-bold pb-3">Welcome to the updated version!</div>
                    <div class="d-flex flex-column align-items-center div--wrapper">
                        <div class="div--hi font-weight-bold">Hi</div>
                        <img src="~/assets/images/update.png" alt="illustration">
                        <div class="pt-3">To make the new functionalities available to you it is necessary to remove currently unbooked tasks from your local list. You can either book or remove them.</div>
                    </div>
                </div>
            </div>
        </template>
        <template v-slot:modal-footer="{ ok, cancel }">
            <div class="d-flex justify-content-end w-100 modal__actions">
                <b-button
                    pill
                    variant="primary"
                    class="font-weight-bold modal__save-btn"
                    @click.prevent="updateUpdateMessageShown(true)"
                >
                    Next
                </b-button>
            </div>
        </template>
    </b-modal>
</template>

<script>
    import { mapState, mapMutations } from 'vuex';

    export default {
        name: "UpdateMessage",
        computed: {
            ...mapState({
                doesNotHaveFieldDayAdded: state => state.moduleUpdate.doesNotHaveFieldDayAdded, // todo
                showUnbookedTasksLeftModal: state => state.moduleUpdate.showUnbookedTasksLeftModal,
                updateMessageShown: state => state.moduleUpdate.updateMessageShown
            })
        },
        methods: {
            ...mapMutations({
                updateUpdateMessageShown: 'moduleUpdate/updateUpdateMessageShown'
            })
        }
    }
</script>
