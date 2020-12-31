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

                const calculatedDifference = this.timeRightNow.getTime() - this.startTime.getTime(); // using .getTime() results in a milliseconds value

                let __timeSpent = calculatedDifference; // todo?

                // the check for different 'falsy' values is due to implementation differences of different ticket types in earlier stages
                if (this.timeSpent !== 0 || this.timeSpent !== '') __timeSpent = this.initialTimeSpent + calculatedDifference;

                this.saveTimeSpentOnTask({ uniqueId: this.uniqueId, timeSpent: __timeSpent }); // update vuex store

                // note: function to save the comment removed from this line as it has its own method - now moved to the TicketComment component

                this.saveSelectedTasksToStorage(); // update localStorage
            },
            startTimer: function () {
                this.initialTimeSpent = this.timeSpent; // needed for sum calculation if tracker is restarted

                this.startTime = new Date();

                this.saveTaskStartTime({ uniqueId: this.uniqueId, startTime: this.startTime.toTimeString() }); // update vuex store // todo: currently not needed

                this.runningTimer = setInterval(() => this.currentTimeInSeconds(), 1000); // calls function that saves current tracked time to vuex store & localStorage every second
            },
            stopTimer: function () {
                this.endTime = new Date();

                clearInterval(this.runningTimer);

                // this.setActiveTicket('');

                this.saveTaskEndTime({ uniqueId: this.uniqueId, endTime: this.endTime.toTimeString() }); // update vuex store // todo: currently not needed

                // only save values to the 'startAndEndTimes' array if time slots got enabled via the settingsSidebar
                // -> by default time slots are disabled
                if (this.showStartAndEndTimes) {
                    const __dateRightNow = this.timeRightNow; // todo: before -> new Date

                    // format to date format so valid values for hours,minutes,seconds gets calculated automatically
                    const __duration = new Date(
                        __dateRightNow.getFullYear(),
                        __dateRightNow.getMonth(),
                        __dateRightNow.getDate(),
                        0,
                        0,
                        0,
                        this.endTime.getTime() - this.startTime.getTime() // calculate duration in milliseconds
                    ); // todo

                    this.saveToTaskStartAndEndArray({
                        uniqueId: this.uniqueId,
                        entryToAdd: {
                            startTime: this.startTime.toTimeString().slice(0,8),
                            endTime: this.endTime.toTimeString().slice(0, 8),
                            duration: __duration.toTimeString().slice(0, 8),
                            durationInMilliSeconds: this.endTime.getTime() - this.startTime.getTime(), // saving milliseconds to use for calculation bc more precise
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

                    // update vuex store so subsequent interactions can reference if there's an active tracker
                    this.setIsTimerActive();

                    this.startTimer();
                } else if (this.isTimerActive && (keyOfTicket !== this.activeTicket)) { // case that while there's already an active ticket another task gets started without directly stopping the other one
                    this.setLastTicket(this.activeTicket);

                    // this will lead to watcher code for isTimerActive being executed which is responsible to stop the "old" interval
                    this.setIsTimerActive();

                    // update activeTicket to the new one clicked
                    this.setActiveTicket(keyOfTicket);

                    this.startTimer();
                } else if (this.isTimerActive && (keyOfTicket === this.activeTicket)) { // case that the already activeTicket play control is clicked again
                    // update vuex store, the watcher will not execute any code in this case
                    this.setIsTimerActive();

                    // as the watcher is triggered but none of its conditions are met the interval will be stopped here instead
                    this.stopTimer();

                    // clear related state
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
                    // stops interval of the 'old' ticket on changing tasks without stopping the previous task
                    this.stopTimer();

                    // clear state
                    this.setLastTicket('');

                    // update vuex store
                    if (!this.logoutInProgress) this.setIsTimerActive();
                }
            }
        }
	}
</script>
