<template>
    <b-button
        pill
        variant="success"
        type="button"
        class="login-content__sign-in-btn py-2"
        v-b-modal="'confirm-push-time'"
        :class="{ 'mr-1': $mq === 'md' || $mq === 'lg', 'px-5': $mq === 'md' || $mq === 'mdp' || $mq === 'plg' }"
        v-b-tooltip.hover title="Push all your tasks"
    >
        <send-icon />
        <span class="pl-1" v-if="$mq === 'lg' || $mq === 'sm'">Push all your tasks</span>

        <b-modal :id="'confirm-push-time'" centered>
            <template v-slot:modal-header="{ close }">
                <div class="d-flex justify-content-between align-items-center w-100 modal__top-bar">
                    <h3 class="primary">Push Time?</h3>
                    <span>
                        <x-icon @click="close()" />
                    </span>
                </div>
            </template>
            <template v-slot:default>
                <div class="modal__main-container">
                    <div class="modal__main-container__main-text">Are you sure you want to book tracked time?</div>
                </div>
            </template>
            <template v-slot:modal-footer="{ ok, cancel }">
                <div class="d-flex justify-content-between w-100 modal__actions">
                    <b-button pill class="font-weight-bold modal__cancel-btn" @click.prevent="cancel()">Cancel</b-button>
                    <b-button pill variant="primary" class="font-weight-bold modal__save-btn" @click.prevent="saveWorklogs()">Push Time</b-button>
                </div>
            </template>
        </b-modal>
    </b-button>
</template>

<script>
    import { mapState, mapActions, mapMutations } from 'vuex';
    import { SendIcon, XIcon } from 'vue-feather-icons';

	export default {
		name: "PushTotalTime",
        components: { SendIcon, XIcon },
        computed: {
            ...mapState({
                selectedTasks: state => state.moduleUser.selectedTasks,
                showErrorMessages: state => state.moduleUser.showErrorMessages,
                isTimerActive: state => state.moduleUser.isTimerActive
            }),
            everythingBookedAlready () {
                return this.selectedTasks.filter((__selectedTask) => !__selectedTask.booked).length === 0; // todo
            },
            noMissingComments () {
                return this.selectedTasks.filter((__selectedTask) => !__selectedTask.comment).length === 0; // todo
            },
            noUnassignedCustomTasks () {
                return this.selectedTasks.filter((__selectedTask) => !__selectedTask.assignedToTicket).length === 0; // todo
            },
            noUntrackedTasks () {
                return this.selectedTasks.filter((__selectedTask) => !__selectedTask.timeSpent).length === 0; // todo
            }
        },
        methods: {
		    ...mapMutations({
                toggleShowErrorMessages: 'moduleUser/toggleShowErrorMessages'
            }),
            ...mapActions({
                requestSavingWorklogs: 'moduleUser/requestSavingWorklogs',
            }),
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
                } else {
                    // show error message if not all conditions (should exist: selectedTasks, every selectedTask should have a comment, tracked time & should not be a custom task) for booking are met
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
                    } else {
                        // toggle off visibility of error messages from any previous booking request that toggled on the visibility
                        if (this.showErrorMessages && this.selectedTasks.length!==0 && !this.everythingBookedAlready && this.noMissingComments && this.noUnassignedCustomTasks && this.noUntrackedTasks) this.toggleShowErrorMessages({ show: false });

                        // make API request to book each task
                        this.requestSavingWorklogs()
                            .then(() => {
                                this.$bvModal.msgBoxOk('Worklogs were successfully booked', {
                                    centered: true,
                                    okVariant: 'success rounded-pill',
                                    okTitle: 'Okay',
                                    bodyClass: 'modal__main-container',
                                    footerClass: 'modal__main-container modal__actions modal__feedback__footer'
                                })
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