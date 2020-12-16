<template>
    <button @click.prevent="updateIsTimerActiveState(uniqueId)" class="px-2">
        <pause-circle-icon v-if="(isTimerActive && (activeTicket === uniqueId))" />
        <play-circle-icon v-else />
    </button>
</template>

<script>
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
                markedAsActive: false,
                initialTimeSpent: 0
            };
        },
        computed: {
            ...mapState({
                isTimerActive: state => state.moduleUser.isTimerActive,
                activeTicket: state => state.moduleUser.activeTicket,
                onABreak: state => state.moduleUser.onABreak,
                lastTicket: state => state.moduleUser.lastTicket,
                logoutInProgress: state => state.moduleUser.logoutInProgress
            })
        },
        methods: {
            ...mapMutations({
                setIsTimerActive: 'moduleUser/setIsTimerActive',
                saveTimeSpentOnTask: 'moduleUser/saveTimeSpentOnTask',
                setActiveTicket: 'moduleUser/setActiveTicket',
                saveTaskStartTime: 'moduleUser/saveTaskStartTime',
                saveTaskEndTime: 'moduleUser/saveTaskEndTime',
                toggleBreakMutation: 'moduleUser/toggleBreak',
                setLastTicket: 'moduleUser/setLastTicket'
            }),
            ...mapActions({
                saveSelectedTasksToStorage: 'moduleUser/saveSelectedTasksToStorage'
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
                // mark the current activeTicket
                this.markedAsActive = true;

                this.initialTimeSpent = this.timeSpent; // needed for sum calculation if tracker is restarted

                this.startTime = new Date();

                this.saveTaskStartTime({ uniqueId: this.uniqueId, startTime: this.startTime.toTimeString() }); // update vuex store

                this.runningTimer = setInterval(() => this.currentTimeInSeconds(), 1000); // calls function that saves current tracked time to vuex store & localStorage every second
            },
            stopTimer: function () {
                this.markedAsActive = false;

                this.endTime = new Date();

                clearInterval(this.runningTimer);

                // this.setActiveTicket('');

                this.saveTaskEndTime({ uniqueId: this.uniqueId, endTime: this.endTime.toTimeString() }); // update vuex store

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
