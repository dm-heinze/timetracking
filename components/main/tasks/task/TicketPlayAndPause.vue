<template>
    <button @click.prevent="updateIsTimerActiveState(uniqueId)" class="px-2">
        <pause-circle-icon v-if="(isTimerActive && (activeTicket === uniqueId))" />
        <play-circle-icon v-else />
    </button>
</template>

<script>
    import _ from "lodash";
    import { mapState, mapMutations, mapActions } from 'vuex';
    import { PlayCircleIcon, PauseCircleIcon } from 'vue-feather-icons';

    export default {
		name: "TicketPlayAndPause",
        components: {
            PlayCircleIcon, PauseCircleIcon
        },
        props: {
            timeSpent: {
                required: true
            },
            uniqueId: {
                required: true
            }
        },
        data() {
            return {
                timeRightNow: 0,
                runningTimer: '',
                startTime: '',
                endTime: '',
                initialTimeSpent: 0
            };
        },
        computed: {
            ...mapState({
                isTimerActive: state => state.moduleUser.isTimerActive,
                activeTicket: state => state.moduleUser.activeTicket,
                onABreak: state => state.moduleBreak.onABreak,
                lastTicket: state => state.moduleUser.lastTicket,
                logoutInProgress: state => state.moduleUser.logoutInProgress,
                showStartAndEndTimes: state => state.moduleTask.showStartAndEndTimes
            })
        },
        methods: {
            ...mapMutations({
                setIsTimerActive: 'moduleUser/setIsTimerActive',
                saveTimeSpentOnTask: 'moduleTask/saveTimeSpentOnTask',
                setActiveTicket: 'moduleUser/setActiveTicket',
                saveTaskStartTime: 'moduleTask/saveTaskStartTime',
                saveTaskEndTime: 'moduleTask/saveTaskEndTime',
                toggleBreakMutation: 'moduleBreak/toggleBreak',
                setLastTicket: 'moduleUser/setLastTicket',
                saveToTaskStartAndEndArray: 'moduleTask/saveToTaskStartAndEndArray'
            }),
            ...mapActions({
                saveSelectedTasksToStorage: 'moduleTask/saveSelectedTasksToStorage'
            }),
            currentTimeInSeconds: function () {
                this.timeRightNow = new Date();

                const calculatedDifference = this.timeRightNow.getTime() - this.startTime.getTime();

                let __timeSpent = calculatedDifference; // todo?

                // todo
                if (this.timeSpent !== 0 || this.timeSpent !== '') __timeSpent = this.initialTimeSpent + calculatedDifference;

                this.saveTimeSpentOnTask({ uniqueId: this.uniqueId, timeSpent: __timeSpent }); // update vuex store

                // note: function to save the comment removed from this line as it has its own method - now moved to the TicketComment component

                this.saveSelectedTasksToStorage(); // update localStorage
            },
            startTimer: function () {
                this.initialTimeSpent = this.timeSpent; // needed for sum calculation if tracker is restarted

                this.startTime = new Date();

                this.saveTaskStartTime({ uniqueId: this.uniqueId, startTime: this.startTime.toTimeString() }); // update vuex store

                this.runningTimer = setInterval(() => this.currentTimeInSeconds(), 1000); // calls function that saves current tracked time to vuex store & localStorage every second
            },
            stopTimer: function () {
                this.endTime = new Date();

                clearInterval(this.runningTimer);

                // this.setActiveTicket('');

                this.saveTaskEndTime({ uniqueId: this.uniqueId, endTime: this.endTime.toTimeString() }); // update vuex store

                // only save values to the 'startAndEndTimes' array if time slots got enabled via the settingsSidebar
                // -> by default time slots are disabled
                if (this.showStartAndEndTimes) {
                    const __dateRightNow = this.timeRightNow; // todo: before -> new Date
                    const __duration = new Date(__dateRightNow.getFullYear(), __dateRightNow.getMonth(), __dateRightNow.getDate(), 0, 0, 0, this.endTime.getTime() - this.startTime.getTime()); // todo

                    this.saveToTaskStartAndEndArray({
                        uniqueId: this.uniqueId,
                        entryToAdd: {
                            startTime: this.startTime.toTimeString().slice(0,8),
                            endTime: this.endTime.toTimeString().slice(0, 8),
                            duration: __duration.toTimeString().slice(0, 8),
                            durationInMilliSeconds: this.endTime.getTime() - this.startTime.getTime(), // todo
                            id: _.now()
                        }
                    });
                }

                this.saveSelectedTasksToStorage(); // update localStorage
            },
            // used for play & pause buttons - param: uniqueId of the task
            updateIsTimerActiveState: function (keyOfTicket) {
                // stop break timer if active
                if (this.onABreak) {
                    this.toggleBreakMutation();
                    this.$root.$emit('bv::toggle::collapse', 'breakTracker');
                }

                if (!this.isTimerActive) {
                    this.setActiveTicket(keyOfTicket);
                    this.setIsTimerActive();
                    this.startTimer();
                } else if (this.isTimerActive && (keyOfTicket !== this.activeTicket)) {
                    this.setLastTicket(this.activeTicket);

                    this.setIsTimerActive();

                    this.setActiveTicket(keyOfTicket);

                    this.startTimer();
                } else if (this.isTimerActive && (keyOfTicket === this.activeTicket)) {
                    this.setIsTimerActive();
                    this.stopTimer();
                    this.setActiveTicket('');
                    this.setLastTicket('');
                }
            },
        },
        watch: {
            isTimerActive: function () {
                if ((this.uniqueId === this.lastTicket) && this.onABreak) {
                    this.stopTimer();
                    this.setLastTicket('');
                    this.setActiveTicket('');
                }
                if (this.uniqueId === this.lastTicket) {
                    this.stopTimer();
                    this.setLastTicket('');
                    if (!this.logoutInProgress) this.setIsTimerActive();
                }
            }
        }
	}
</script>
