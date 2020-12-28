<template>
    <b-button
        variant="success"
        class="login-content__sign-in-btn py-2"
        :class="{
            'mr-1': $mq === 'md' || $mq === 'lg',
            'px-5': $mq === 'md' || $mq === 'mdp' || $mq === 'plg'
        }"
        v-b-modal="'confirm-push-time'"
        v-b-tooltip.hover title="Push all your tasks"
    >
        <send-icon />
        <span class="pl-1" v-if="$mq === 'lg' || $mq === 'sm'">Push all your tasks</span>

        <b-modal :id="'confirm-push-time'" centered>
            <template v-slot:modal-header="{ close }">
                <div class="d-flex justify-content-between align-items-center w-100 modal__top-bar">
                    <h3 class="primary">Push Time?</h3>
                    <span>
                        <x-icon @click="resetStateAndCloseModal" /> <!-- todo -->
                    </span>
                </div>
            </template>
            <template v-slot:default>
                <div class="modal__main-container">
                    <div class="modal__main-container__main-text">Are you sure you want to book tracked time?</div>

                    <b-form-checkbox
                        v-if="!onABreak && (accumulatedBreakTime != '00:00:00')"
                        v-model="resetTrackedBreakTime"
                        aria-label="reset break tracker"
                        class="checkbox--resetBreakTime"
                    >
                        Reset Break Tracker
                    </b-form-checkbox>
                </div>
            </template>
            <template v-slot:modal-footer="{ ok, cancel }">
                <div class="d-flex justify-content-between w-100 modal__actions">
                    <b-button
                        class="font-weight-bold modal__cancel-btn"
                        @click.prevent="resetStateAndCloseModal"
                    >
                        Cancel
                    </b-button> <!-- todo -->
                    <b-button
                        variant="primary"
                        class="font-weight-bold modal__save-btn"
                        @click.prevent="saveWorklogs()"
                    >
                        Push Time
                    </b-button>
                </div>
            </template>
        </b-modal>
    </b-button>
</template>

<script>
    import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';
    import { SendIcon, XIcon } from 'vue-feather-icons';
    import { BFormCheckbox } from 'bootstrap-vue'; // todo

	export default {
		name: "PushTotalTime",
        components: { SendIcon, XIcon, BFormCheckbox },
        data() {
            return {
                resetTrackedBreakTime: false
            }
        },
        computed: {
            ...mapState({
                selectedTasks: state => state.moduleTask.selectedTasks,
                showErrorMessages: state => state.moduleTask.showErrorMessages,
                isTimerActive: state => state.moduleUser.isTimerActive,
                onABreak: state => state.moduleBreak.onABreak,
                accumulatedBreakTime: state => state.moduleBreak.accumulatedBreakTime,
                showUnbookedTasksNotOfTheDay: state => state.moduleTask.showUnbookedTasksNotOfTheDay
            }),
            ...mapGetters({
                everythingBookedAlready: 'moduleTask/everythingBookedAlready',
                noMissingComments: 'moduleTask/noMissingComments',
                noUnassignedCustomTasks: 'moduleTask/noUnassignedCustomTasks',
                noUntrackedTasks: 'moduleTask/noUntrackedTasks'
            })
        },
        methods: {
		    ...mapMutations({
                toggleShowErrorMessages: 'moduleTask/toggleShowErrorMessages',
                updateTotalBreakTime: 'moduleBreak/updateTotalBreakTime'
            }),
            ...mapActions({
                requestSavingWorklogs: 'moduleBooking/requestSavingWorklogs',
                saveBreaksToStorage: 'moduleBreak/saveBreaksToStorage'
            }),
            resetStateAndCloseModal: function () {
                this.$bvModal.hide(`confirm-push-time`);

                this.resetTrackedBreakTime = false; // de-selects checkbox that resets break tracker
            },
            saveWorklogs: function () {
                this.$bvModal.hide('confirm-push-time'); // any cancel event needed?

                // prevent booking when active tracker exists
                if (this.isTimerActive) {
                    this.$bvModal.msgBoxOk('Tasks cannot be booked while there are active task trackers.', {
                        centered: true,
                        okVariant: 'danger rounded-pill',
                        okTitle: 'Okay',
                        bodyClass: 'modal__main-container',
                        footerClass: 'modal__main-container modal__actions modal__feedback__footer'
                    })

                    if (this.resetTrackedBreakTime) this.resetTrackedBreakTime = false; // de-selects checkbox that resets break tracker
                } else if (this.showUnbookedTasksNotOfTheDay) { // todo
                    this.$bvModal.msgBoxOk('Tasks from previous days can only be booked one by one.', {
                        centered: true,
                        okVariant: 'danger rounded-pill',
                        okTitle: 'Okay',
                        bodyClass: 'modal__main-container',
                        footerClass: 'modal__main-container modal__actions modal__feedback__footer'
                    })

                    if (this.resetTrackedBreakTime) this.resetTrackedBreakTime = false; // de-selects checkbox that resets break tracker
                } else {
                    // show error message if not all conditions (should exist: selectedTasks, every selectedTask should have a comment, tracked time & should not be a custom task) for booking are met
                    // todo
                    if (this.selectedTasks.length===0 || this.everythingBookedAlready || !this.noMissingComments || !this.noUnassignedCustomTasks || !this.noUntrackedTasks) {
                        // toggle error messages below the fields that are affected
                        this.toggleShowErrorMessages({ show: true });

                        this.$bvModal.msgBoxOk('Tasks cannot be booked. Please check the error messages.', {
                            centered: true,
                            okVariant: 'danger rounded-pill',
                            okTitle: 'Okay',
                            bodyClass: 'modal__main-container',
                            footerClass: 'modal__main-container modal__actions modal__feedback__footer'
                        })

                        if (this.resetTrackedBreakTime) this.resetTrackedBreakTime = false; // de-selects checkbox that resets break tracker
                    } else {
                        // toggle off visibility of error messages from any previous booking request that toggled on the visibility
                        // todo
                        if (this.showErrorMessages && this.selectedTasks.length!==0 && !this.everythingBookedAlready && this.noMissingComments && this.noUnassignedCustomTasks && this.noUntrackedTasks) this.toggleShowErrorMessages({ show: false });

                        // make API request to book each task
                        this.requestSavingWorklogs()
                            .then(() => {
                                if (this.resetTrackedBreakTime) this.updateTotalBreakTime({ totalBreakTime: '00:00:00' }); // todo

                                this.$bvModal.msgBoxOk('Worklogs were successfully booked', {
                                    centered: true,
                                    okVariant: 'success rounded-pill',
                                    okTitle: 'Okay',
                                    bodyClass: 'modal__main-container',
                                    footerClass: 'modal__main-container modal__actions modal__feedback__footer'
                                })

                                if (this.resetTrackedBreakTime) this.saveBreaksToStorage().then(() => this.resetTrackedBreakTime = false); // todo: msgBoxOk?
                            })
                            .catch((err) => {
                                if (err.response && (err.response.status === 401)) {
                                    this.$bvModal.msgBoxOk('The session has expired. Booking was not successful!', {
                                        centered: true,
                                        okVariant: 'danger rounded-pill',
                                        okTitle: 'Okay',
                                        bodyClass: 'modal__main-container',
                                        footerClass: 'modal__main-container modal__actions modal__feedback__footer'
                                    }).then(() => {
                                        this.$router.push('/customer/login')
                                    })
                                } else {
                                    this.$bvModal.msgBoxOk('There has been an error. Booking was not successful!', {
                                        centered: true,
                                        okVariant: 'danger rounded-pill',
                                        okTitle: 'Okay',
                                        bodyClass: 'modal__main-container',
                                        footerClass: 'modal__main-container modal__actions modal__feedback__footer'
                                    })
                                }
                            });
                    }
                }
            }
        }
	}
</script>
