<template>
    <div class="selected-ticket__container">
        <div class="selected-ticket__heading" :class="{ 'flex-row  align-items-start': $mq === 'md', 'flex-column align-items-center': $mq === 'sm', 'align-items-center': $mq === 'lg' || $mq === 'plg', 'flex-row': $mq === 'mdp' }">
            <a :href="'#'" class="col-sm-9 notALink" :class="{ 'col-9': $mq === 'mdp' }">
                <div :class="{ 'd-flex flex-column align-items-center justify-content-center': $mq === 'sm' }">
                    <div class="font-weight-bold">Break</div>
                </div>
            </a>

            <div class="selected-ticket__heading__controls d-flex" :class="{ 'w-100 justify-content-between': $mq === 'md' || $mq === 'sm', 'flex-row': $mq === 'md' || 'lg', 'flex-column': $mq === 'sm', 'justify-content-between': $mq === 'mdp' }">
                <div class="ticket-trackers d-flex flex-row" :class="{ 'align-self-center': $mq === 'sm' }">
                    <ticket-time-spent :of-type-break="true" :time-spent="accumulatedBreakTimeInMilliSeconds" unique-id="breakTask" :booked="false" />

                    <client-only>
                        <button
                            v-b-modal="`confirm-reset-break-modal`"
                            class="btn--resetBreak pb-1"
                            v-b-tooltip.hover
                            title="Reset Break Tracker"
                            ref="resetBreakButton"
                            id="resetTrackedBreakTime"
                            v-if="!onABreak && (accumulatedBreakTime != '00:00:00')"
                        >
                            <rotate-ccw-icon />
                        </button>

                        <b-modal :id="`confirm-reset-break-modal`" centered>
                            <template v-slot:modal-header="{ close }">
                                <div class="d-flex justify-content-between align-items-center w-100 modal__top-bar">
                                    <h3 class="primary">Reset Tracked Break Time?</h3>
                                    <span>
                                        <x-icon @click="close()" />
                                    </span>
                                </div>
                            </template>
                            <template v-slot:default>
                                <div class="modal__main-container">
                                    <div class="modal__main-container__main-text">Do you want to delete the tracked break time of <span>{{ accumulatedBreakTime }}</span>?</div>
                                </div>
                            </template>
                            <template v-slot:modal-footer="{ ok, cancel }">
                                <div class="d-flex justify-content-between w-100 modal__actions">
                                    <b-button pill class="font-weight-bold modal__cancel-btn" @click.prevent="cancel()">Cancel</b-button>
                                    <b-button pill variant="primary" class="font-weight-bold modal__save-btn" @click.prevent="resetBreakTracker">Delete</b-button>
                                </div>
                            </template>
                        </b-modal>
                    </client-only>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapActions, mapMutations, mapState } from 'vuex';
    import TicketTimeSpent from "~/components/main/tasks/task/TicketTimeSpent";
    import { RotateCcwIcon, XIcon } from 'vue-feather-icons';
    import _ from "lodash";


    export default {
        name: "BreakTask",
        components: {
            TicketTimeSpent,
            RotateCcwIcon, XIcon
        },
        computed: {
            ...mapState({
                accumulatedBreakTime: state => state.moduleBreak.accumulatedBreakTime,
                onABreak: state => state.moduleBreak.onABreak
            }),
            flexDirection () { // todo
                return `flex-${this.$mq === 'sm' ? 'column' : 'row'}`
            },
            accumulatedBreakTimeInMilliSeconds () { // todo
                const __dateRightNow = new Date();

                const __clonedVal = _.cloneDeep(this.accumulatedBreakTime);

                // split string of shape hh:mm:ss into array of shape [ 'hh', 'mm', 'ss' ]
                const initialBreakInArrayFormat = __clonedVal.split(":");

                const breakTimeAsDate = new Date(__dateRightNow.getFullYear(), __dateRightNow.getMonth(), __dateRightNow.getDate(), initialBreakInArrayFormat[0], initialBreakInArrayFormat[1], initialBreakInArrayFormat[2] ? initialBreakInArrayFormat[2] : 0, 0);

                const helperDate = new Date(__dateRightNow.getFullYear(), __dateRightNow.getMonth(), __dateRightNow.getDate(), 0, 0, 0, 0);

                return breakTimeAsDate.getTime() - helperDate.getTime();
            },
        },
        methods: {
            ...mapActions({
                saveBreaksToStorage: 'moduleBreak/saveBreaksToStorage'
            }),
            ...mapMutations({
                updateTotalBreakTime: 'moduleBreak/updateTotalBreakTime'
            }),
            resetBreakTracker: function () {
                // update vuex store
                this.updateTotalBreakTime({ totalBreakTime: '00:00:00' });

                // update localStorage & show feedback
                this.saveBreaksToStorage()
                    .then(() => {
                        this.$bvModal.msgBoxOk('Break Tracker was successfully reset to 00:00:00.', {
                            centered: true,
                            okVariant: 'success rounded-pill',
                            okTitle: 'Okay',
                            bodyClass: 'modal__main-container',
                            footerClass: 'modal__main-container modal__actions modal__feedback__footer'
                        })
                    })
                    .catch(() => {
                        this.$bvModal.msgBoxOk('There has been an error. Break Tracker could not be reset.', {
                            centered: true,
                            okVariant: 'danger rounded-pill',
                            okTitle: 'Okay',
                            bodyClass: 'modal__main-container',
                            footerClass: 'modal__main-container modal__actions modal__feedback__footer'
                        })
                    });
            }
        }
    }
</script>
