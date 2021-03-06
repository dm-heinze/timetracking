<template>
    <div class="d-flex" :class="flexDirection">
        <b-button
            class="login-content__sign-in-btn py-2 mr-1"
            :class="{
                'mb-3': $mq === 'sm',
                'px-5': $mq === 'md' || $mq === 'mdp' || $mq === 'plg'
            }"
            v-b-toggle.breakTracker
            v-b-tooltip.hover
            title="Take a break"
            @click.prevent="toggleBreak"
        >
            <coffee-icon />
            <span class="pl-1" v-if="$mq === 'lg' || $mq === 'sm'">Take a break</span>
        </b-button>
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
                runningBreakTimer: '',
                startTime: '',
                endTime: '',
                initialLoggedBreak: ''
            }
        },
        computed: {
            ...mapState({
                accumulatedBreakTime: state => state.moduleBreak.accumulatedBreakTime,
                onABreak: state => state.moduleBreak.onABreak,
                isTimerActive: state => state.moduleUser.isTimerActive,
                activeTicket: state => state.moduleUser.activeTicket
            })
        },
        watch: {
            onABreak: function (newValue) {
                if (newValue) {
                    this.initialLoggedBreak = this.accumulatedBreakTime;

                    this.runningBreakTimer = setInterval(() => this.currentTimeInSeconds(), 1000);
                } else {
                    // stop interval when onABreak is set to false
                    this.endTime = new Date();

                    clearInterval(this.runningBreakTimer);

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
                saveBreaksToStorage: 'moduleBreak/saveBreaksToStorage',
            }),
            ...mapMutations({
                toggleBreakMutation: 'moduleBreak/toggleBreak',
                updateTotalBreakTime: 'moduleBreak/updateTotalBreakTime',
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
            currentTimeInSeconds: function () {
                const __dateRightNow = new Date();

                this.timeRightNow = __dateRightNow;

                const calculatedDifference = this.timeRightNow.getTime() - this.startTime.getTime(); // calling .getTime() on Date object results in milliseconds

                // using Date object bc passed values get formatted/calculated automatically into the correct time format
                let breakTimeAsDate = new Date(__dateRightNow.getFullYear(), __dateRightNow.getMonth(), __dateRightNow.getDate(), 0, 0, 0, calculatedDifference);

                // add previous tracked break time into calculation
                if (this.accumulatedBreakTime != '00:00:00') { // todo
                    // split string of shape hh:mm:ss into array of shape [ 'hh', 'mm', 'ss' ]
                    const initialBreakInArrayFormat = this.initialLoggedBreak.split(":");

                    // remove the date portion & also split this string into array of shape [ 'hh', 'mm', 'ss' ]
                    const currentBreakTimeInArrayFormat = breakTimeAsDate.toTimeString().slice(0, 8).split(":");

                    // sum the respective positions of both arrays by casting them from type string to number
                    // values need to be numbers not strings for correct calculation
                    const summedUpInitialAndNewBreak = _.zipWith(initialBreakInArrayFormat, currentBreakTimeInArrayFormat, (a, b) => Number(a) + Number(b));

                    //  passing resulting sum of the respective position for hh & mm & ss into Date object
                    //  => time values get formatted/calculated automatically into the correct time format
                    //  example: passing 00 (hours), 00 (minutes), 90 (seconds) will result in => 00:01:30 (hh:mm:ss)
                    breakTimeAsDate = new Date(__dateRightNow.getFullYear(), __dateRightNow.getMonth(), __dateRightNow.getDate(), summedUpInitialAndNewBreak[0], summedUpInitialAndNewBreak[1], summedUpInitialAndNewBreak[2], 0);
                }

                // update vuex store with totalBreakTime
                // remove the date portion => resulting string has shape "hh:mm:ss"
                this.updateTotalBreakTime({ totalBreakTime: breakTimeAsDate.toTimeString().slice(0, 8) });

                // save to localStorage
                this.saveBreaksToStorage();
            }
        },
        mounted() {
            // wait for rendering
            this.$nextTick(function () {
                // show tooltip on all viewports as always icon-only
                if (this.$refs.resetBreakButton) this.$root.$emit('bv::enable::tooltip', 'resetTrackedBreakTime');

                // for AssignedTickets.vue - alternative: $root listener on event 'bv::tooltip::disabled' in AssignedTickets.vue
                // watcher in AssignedTickets/call in above watcher for $mq needed for this approach
                // this.$root.$emit('bv::enable::tooltip', 'refreshTooltipTargetButton');
            })
        }
	}
</script>
