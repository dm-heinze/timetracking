<template>
    <button
        class="px-2"
        v-b-modal="`confirm-push-time-singleTaskOnly-${uniqueId}`"
        :disabled="(isTimerActive && activeTicket === uniqueId) || !taskWorklogComment || !timeSpent || booked || !assignedToTicket"
    >
        <send-icon />

        <b-modal :id="`confirm-push-time-singleTaskOnly-${uniqueId}`" centered>
            <template v-slot:modal-header="{ close }">
                <div class="d-flex justify-content-between align-items-center w-100 modal__top-bar">
                    <h3 class="primary">Push Single Task?</h3>
                    <span>
                        <x-icon @click="close()" />
                    </span>
                </div>
            </template>
            <template v-slot:default>
                <div class="modal__main-container">
                    <div class="modal__main-container__main-text">
                        Are you sure you want to book tracked time for <span class="font-weight-bold">{{ taskKey }}</span>?
                    </div>
                </div>
            </template>
            <template v-slot:modal-footer="{ ok, cancel }">
                <div class="d-flex justify-content-between w-100 modal__actions">
                    <b-button
                        class="font-weight-bold modal__cancel-btn"
                        @click.prevent="cancel()"
                    >
                        Cancel
                    </b-button>
                    <b-button
                        variant="primary"
                        class="font-weight-bold modal__save-btn"
                        @click.prevent="bookSingleTaskOnly()"
                    >
                        Push Time
                    </b-button>
                </div>
            </template>
        </b-modal>
    </button>
</template>

<script>
    import { mapState, mapActions } from 'vuex';
    import { XIcon, SendIcon } from 'vue-feather-icons';

	export default {
		name: "PushSingleTask",
        components: { XIcon, SendIcon },
        props: {
            taskKey: {
                required: true
            },
            taskWorklogComment: {
                type: String,
                required: true
            },
            timeSpent: {
                required: true
            },
            assignedToTicket: {
                required: true
            },
            booked: {
                required: true
            },
            uniqueId: {
                required: true
            }
        },
        computed: {
            ...mapState({
                isTimerActive: state => state.moduleUser.isTimerActive,
                activeTicket: state => state.moduleUser.activeTicket
            })
        },
        methods: {
            ...mapActions({
                requestSavingSingleWorklog: 'moduleBooking/requestSavingSingleWorklog',
                resetState: 'moduleUser/resetState'
            }),
            bookSingleTaskOnly() {
                this.$bvModal.hide(`confirm-push-time-singleTaskOnly-${this.uniqueId}`); // any cancel event needed?

                this.requestSavingSingleWorklog({
                    comment: this.taskWorklogComment,
                    timeSpentSeconds: this.timeSpent,
                    ticketId: this.taskKey,
                    uniqueId: this.uniqueId
                })
                    .then(() => {
                        this.$bvModal.msgBoxOk('Worklog was successfully booked', {
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
                    })
            }
        }
	}
</script>
