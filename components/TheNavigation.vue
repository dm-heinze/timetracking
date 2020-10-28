<template>
    <div class="nav big-icons">
        <div v-b-toggle.sidebar-search @click.prevent="requestPrefill" class="icon-search navigation__icon">Search</div>
        <b-sidebar id="sidebar-search" title="Ticket Search" shadow backdrop :width="'500px'">
            <the-search class="px-4" />
        </b-sidebar>
        <div v-b-toggle.sidebar-settings class="icon-settings navigation__icon">Settings</div>
        <b-sidebar id="sidebar-settings" title="Settings" shadow backdrop :width="'500px'">
            <div class="px-4">
                <button @click.prevent="removeCurrentSession">LOGOUT</button>
            </div>
        </b-sidebar>
        <nuxt-link :to="'/'" class="icon-calendar">Calendar</nuxt-link>
        <button
            class="icon-add-task navigation__icon"
            v-b-modal="'add-custom-task'"
        >Custom task</button>
        <b-modal :id="'add-custom-task'" centered title="Add Custom Task">
            <div>Do you want to add a custom name? Otherwise a random name will be set. You can edit the name later regardless.</div>
            <input type="text" v-model="customNameCustomTask" placeholder="Add Custom Name">
            <template v-slot:modal-footer="{ ok }">
                <button @click.prevent="startNewCustomTask()" class="icon-send">Add Custom Task</button>
            </template>
        </b-modal>


        <div class="icon-coffee navigation__icon" :class="{'breakActive': onABreak}" @click.prevent="toggleBreak">Break</div>
        <button
            class="icon-send navigation__icon"
            v-b-modal="'confirm-push-time'"
            :disabled="selectedTasks.length===0 || everythingBookedAlready || !noMissingComments"
            :class="{ 'disabled': selectedTasks.length===0 || everythingBookedAlready || !noMissingComments }"
        >Push Time</button>
        <b-modal :id="'confirm-push-time'" centered title="Push Time?">
            <div>Are you sure you want to book tracked time?</div>
            <template v-slot:modal-footer="{ ok }">
                <button @click.prevent="saveWorklogs()" class="icon-send">Push Time</button>
            </template>
        </b-modal>
        <div>{{ accumulatedBreakTime }}</div>

        <button class="icon-trash navigation__icon"
                v-b-modal="'confirm-revert-trackers'"
                :disabled="selectedTasks.length===0 && accumulatedBreakTime == '00:00:00'"
                :class="{ 'disabled': selectedTasks.length===0 && accumulatedBreakTime == '00:00:00' }"
        >Revert Trackers
        </button>
        <b-modal :id="'confirm-revert-trackers'" centered title="Revert Trackers?">
            <div>Are you sure you want to revert all trackers & remove selectedTasks?</div> <!-- todo -->
            <template v-slot:modal-footer="{ ok }">
                <b-button variant="danger" @click.prevent="revertAllTrackers()" class="icon-trash">Yes, revert all</b-button>
            </template>
        </b-modal>
    </div>
</template>

<script>
    import { mapActions, mapMutations, mapState } from 'vuex';
    import _ from 'lodash';

    export default {
        name: "TheNavigation",
        components: {
            TheSearch: () => import('./TheSearch'),
        },
        data() {
            return {
                timeRightNow: 0,
                runningTimer: '',
                startTime: '',
                endTime: '',
                initialLoggedBreak: '',
                customNameCustomTask: ''
            };
        },
        computed: {
            ...mapState({
                accumulatedBreakTime: state => state.moduleUser.accumulatedBreakTime,
                selectedTasks: state => state.moduleUser.selectedTasks,
                onABreak: state => state.moduleUser.onABreak,
                isTimerActive: state => state.moduleUser.isTimerActive,
                allExistingProjects: state => state.moduleUser.allExistingProjects,
                activeTicket: state => state.moduleUser.activeTicket
            }),
            everythingBookedAlready () {
                return this.selectedTasks.filter((__selectedTask) => !__selectedTask.booked).length === 0;
            },
            noMissingComments () {
                return this.selectedTasks.filter((__selectedTask) => !__selectedTask.comment).length === 0;
            }
        },
        watch: {
            onABreak: function(newValue) {
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
            }
        },
        methods: {
            ...mapActions({
                requestSavingWorklogs: 'moduleUser/requestSavingWorklogs',
                saveSelectedTasksToStorage: 'moduleUser/saveSelectedTasksToStorage',
                requestSessionRemoval: 'moduleUser/requestSessionRemoval',
                saveBreaksToStorage: 'moduleUser/saveBreaksToStorage',
                requestAllProjects: 'moduleUser/requestAllProjects',
                requestPrefillAction: 'moduleUser/requestPrefill'
            }),
            ...mapMutations({
                addSelectedTask: 'moduleUser/addSelectedTask',
                addBreak: 'moduleUser/addBreak',
                toggleBreakMutation: 'moduleUser/toggleBreak',
                updateTotalBreakTime: 'moduleUser/updateTotalBreakTime',
                setIsTimerActive: 'moduleUser/setIsTimerActive',
                setLastTicket: 'moduleUser/setLastTicket',
                removeAllSelectedTasks: 'moduleUser/removeAllSelectedTasks'
            }),
            removeCurrentSession: function () {
                this.requestSessionRemoval()
                    .then(() => this.$router.push('/customer/login'))
                    .catch(() => console.log("err occurred"));
            },
            saveWorklogs: function () {
                this.$bvModal.hide('confirm-push-time'); // any cancel event needed?
                this.requestSavingWorklogs()
                    .then(() => {
                        this.$bvModal.msgBoxOk('Worklogs were successfully booked', {
                            centered: true,
                            okVariant: 'success'
                        })
                    })
                    .catch((__res) => {
                        if (__res === 'hasUnassignedCustomTasks') {
                            this.$bvModal.msgBoxOk('There are unassigned custom tasks. Either assign them to tickets or remove before booking.', {
                                centered: true,
                                okVariant: 'danger'
                            })
                        } else if ('hasNonTrackedTasks') {
                            this.$bvModal.msgBoxOk('There are tasks with no tracked time. Please remove or edit before booking.', {
                                centered: true,
                                okVariant: 'danger'
                            })
                        } else {
                            this.$bvModal.msgBoxOk('There has been an error. Booking was not successful!', {
                                centered: true,
                                okVariant: 'danger'
                            })
                        }
                    });
            },
            startNewCustomTask: function () {
                const newCustomTask = {
                    assignedToTicket: false,
                    uniqueId: _.now(),
                    key: this.customNameCustomTask ? this.customNameCustomTask : `New custom task ${_.now()}`, // todo
                    issueLink: '',
                    summary: '',
                    comment: '',
                    timeSpent: 0,
                    startTime: '',
                    endTime: '',
                    booked: false // todo
                };

                this.addSelectedTask(newCustomTask);

                this.$bvModal.hide('add-custom-task'); // any cancel event needed?

                this.saveSelectedTasksToStorage();

                if (this.allExistingProjects.length === 0) this.requestAllProjects();
            },
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

                // this.toggleBreakMutation();
                this.startTime = new Date();
            },
            currentTimeInSeconds: function () {
                const __dateRightNow = new Date();

                this.timeRightNow = __dateRightNow;

                const calculatedDifference = this.timeRightNow.getTime() - this.startTime.getTime();

                let breakTimeAsDate = new Date(__dateRightNow.getFullYear(), __dateRightNow.getMonth(), __dateRightNow.getDate(), 0, 0, 0, calculatedDifference);


                if (this.accumulatedBreakTime != '00:00:00') {
                    const initialBreakInArrayFormat = this.initialLoggedBreak.split(":");

                    const currentBreakTimeInArrayFormat = breakTimeAsDate.toTimeString().slice(0, 8).split(":");

                    const summedUpInitialAndNewBreak = _.zipWith(initialBreakInArrayFormat, currentBreakTimeInArrayFormat, (a, b) => Number(a) + Number(b));

                    breakTimeAsDate = new Date(__dateRightNow.getFullYear(), __dateRightNow.getMonth(), __dateRightNow.getDate(), summedUpInitialAndNewBreak[0], summedUpInitialAndNewBreak[1], summedUpInitialAndNewBreak[2], 0);
                }

                // update vuex store with totalBreakTime
                this.updateTotalBreakTime({ totalBreakTime:  breakTimeAsDate.toTimeString().slice(0, 8) });

                // save to localStorage
                this.saveBreaksToStorage();
            },
            requestPrefill: function () {
                this.requestPrefillAction()
            },
            revertAllTrackers: function () {
                this.updateTotalBreakTime({ totalBreakTime: '00:00:00'});

                this.removeAllSelectedTasks();

                this.$bvModal.hide('confirm-revert-trackers'); // any cancel event needed?

                // synchronize localStorage
                this.saveBreaksToStorage();
                this.saveSelectedTasksToStorage();
            }
        }
    }
</script>
