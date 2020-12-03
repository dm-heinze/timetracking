<template>
    <div class="d-flex" :class="flexDirection">
        <b-button pill @click.prevent="toggleBreak" v-b-toggle.breakTracker type="button" class="login-content__sign-in-btn py-2 mr-1" v-b-tooltip.hover title="Take a break" :class="{ 'mb-3': $mq === 'sm', 'px-5': $mq === 'md' || $mq === 'mdp' || $mq === 'plg' }">
            <coffee-icon />
            <span class="pl-1" v-if="$mq === 'lg' || $mq === 'sm'">Take a break</span>
        </b-button>
        <client-only>
            <button  @click.prevent="resetBreakTracker" class="button--resetBreakTracker ml-1 mr-2 px-3" v-b-tooltip.hover title="Reset Break Tracker" ref="resetBreakButton" id="resetTrackedBreakTime" v-if="!onABreak && (accumulatedBreakTime != '00:00:00')">
                <rotate-ccw-icon />
            </button>
        </client-only>
    </div>
</template>

<script>
    import _ from "lodash";
    import { mapState, mapActions, mapMutations } from 'vuex';
    import { CoffeeIcon, RotateCcwIcon } from 'vue-feather-icons';
    import { mainButtonsFlexDirectionMixin } from "~/utility/mixins";

	export default {
		name: "Break",
        components: {
            CoffeeIcon, RotateCcwIcon
        },
        mixins: [mainButtonsFlexDirectionMixin],
        data () {
            return {
                timeRightNow: 0,
                runningTimer: '',
                startTime: '',
                endTime: '',
                initialLoggedBreak: ''
            }
        },
        computed: {
            ...mapState({
                accumulatedBreakTime: state => state.moduleUser.accumulatedBreakTime,
                onABreak: state => state.moduleUser.onABreak,
                isTimerActive: state => state.moduleUser.isTimerActive,
                activeTicket: state => state.moduleUser.activeTicket
            })
        },
        watch: {
            onABreak: function (newValue) {
                if (newValue) {
                    this.initialLoggedBreak = this.accumulatedBreakTime;

                    this.runningTimer = setInterval(() => this.currentTimeInSeconds(), 1000);
                } else {
                    // stop interval when onABreak is set to false
                    this.endTime = new Date();

                    clearInterval(this.runningTimer);

                    // save to localStorage
                    this.saveBreaksToStorage();
                }
            },
            $mq: function () {
                // tooltip for resetBreakButton should always be visible on hover bc no other visible text available for it
                if (this.$refs.resetBreakButton) this.$root.$emit('bv::enable::tooltip', 'resetTrackedBreakTime'); // todo
            }
        },
        methods: {
            ...mapActions({
                saveBreaksToStorage: 'moduleUser/saveBreaksToStorage',
            }),
            ...mapMutations({
                toggleBreakMutation: 'moduleUser/toggleBreak',
                updateTotalBreakTime: 'moduleUser/updateTotalBreakTime',
                setIsTimerActive: 'moduleUser/setIsTimerActive',
                setLastTicket: 'moduleUser/setLastTicket'
            }),
            toggleBreak: function () {
                // todo
                // start a break immediately
                // -> step 1) set onABreak to true

                this.toggleBreakMutation();

                if (this.isTimerActive) {
                    this.setLastTicket(this.activeTicket);

                    // this stops any active timer bc of watcher on isTimerActive in SelectedTask
                    this.setIsTimerActive();
                }

                this.startTime = new Date(); // todo
            },
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
            },
            currentTimeInSeconds: function () {
                const __dateRightNow = new Date();

                this.timeRightNow = __dateRightNow;

                const calculatedDifference = this.timeRightNow.getTime() - this.startTime.getTime();

                let breakTimeAsDate = new Date(__dateRightNow.getFullYear(), __dateRightNow.getMonth(), __dateRightNow.getDate(), 0, 0, 0, calculatedDifference);

                // add previous tracked break time into calculation
                if (this.accumulatedBreakTime != '00:00:00') {
                    const initialBreakInArrayFormat = this.initialLoggedBreak.split(":");

                    const currentBreakTimeInArrayFormat = breakTimeAsDate.toTimeString().slice(0, 8).split(":");

                    const summedUpInitialAndNewBreak = _.zipWith(initialBreakInArrayFormat, currentBreakTimeInArrayFormat, (a, b) => Number(a) + Number(b)); // values need to be numbers not strings for correct calculation

                    breakTimeAsDate = new Date(__dateRightNow.getFullYear(), __dateRightNow.getMonth(), __dateRightNow.getDate(), summedUpInitialAndNewBreak[0], summedUpInitialAndNewBreak[1], summedUpInitialAndNewBreak[2], 0);
                }

                // update vuex store with totalBreakTime
                this.updateTotalBreakTime({totalBreakTime: breakTimeAsDate.toTimeString().slice(0, 8)});

                // save to localStorage
                this.saveBreaksToStorage();
            }
        },
        mounted() {
            // wait for rendering
            this.$nextTick(function () {
                // show tooltip on all viewports as always icon-only
                if (this.$refs.resetBreakButton) this.$root.$emit('bv::enable::tooltip', 'resetTrackedBreakTime');
            })
        }
	}
</script>