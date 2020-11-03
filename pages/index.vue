<template>
    <div class="overview">
        <div class="w-100">
            <b-collapse is-nav id="breakTracker">
                <b-navbar-nav class="d-flex flex-row justify-content-center align-items-center stickyBreakTracker">
                    <coffee-icon class="mr-2" />
                    You are currently on a break for
                    <span class="font-weight-bold mr-3 ml-1" :style="{ width: '80px' }">{{ accumulatedBreakTime }}</span>
                    <b-button pill @click.prevent="toggleBreak" v-b-toggle.breakTracker type="button" class="login-content__sign-in-btn pt-2 pb-2 mr-1">
                        <pause-circle-icon />
                        <span class="pl-1">Stop break</span>
                    </b-button>
                </b-navbar-nav>
            </b-collapse>
            <b-row align-v="stretch">
                <b-col cols="12" lg="4" class="container--left vh-100">
                    <div class="login-content__titles" :style="marginBottomTitle">
                        <h3>Ticket search</h3>
                        <the-search />
                        <div class="d-flex flex-row" v-b-toggle.sidebar-settings :style="{ 'outline': 'none' }">
                            <settings-icon/>
                            <h5 class="pl-1">Settings</h5>
                        </div>
                        <settings />
                    </div>
                </b-col>
                <b-col cols="12" lg="8" class="container--right">
                    <div class="row d-flex justify-content-between container--right__main-actions">
                        <div class="d-flex flex-row">
                            <b-button pill variant="primary" type="button" class="login-content__sign-in-btn pt-2 pb-2 mr-3" v-b-modal="'add-custom-task'">
                                <plus-circle-icon />
                                <span class="pl-1">Add Custom task</span>
                                <b-modal :id="'add-custom-task'" centered>
                                    <template v-slot:modal-header="{ close }">
                                        <div class="d-flex justify-content-between align-items-center w-100 modal__top-bar">
                                            <h3 class="primary">Add Custom Task</h3>
                                            <span>
                                                <x-icon @click="resetAndCloseModal()" />
                                            </span>
                                        </div>
                                    </template>
                                    <template v-slot:default>
                                        <div class="modal__main-container">
                                            <div class="modal__main-container__main-text">Do you want to add a custom name? Otherwise a random name will be set. You can edit the name later regardless.</div>
                                            <b-form-input class="form-control rounded-pill pt-4 pl-4 pb-4" type="text" v-model="customNameCustomTask" placeholder="Add Custom Name"></b-form-input>
                                        </div>
                                    </template>
                                    <template v-slot:modal-footer="{ ok, cancel }">
                                        <div class="d-flex justify-content-between w-100 modal__actions">
                                            <b-button pill class="font-weight-bold modal__cancel-btn" @click.prevent="resetAndCloseModal()">Cancel</b-button>
                                            <b-button pill variant="primary" class="font-weight-bold modal__save-btn" @click.prevent="startNewCustomTask()">Save</b-button>
                                        </div>
                                    </template>
                                </b-modal>
                            </b-button>
                            <b-button pill @click.prevent="toggleBreak" v-b-toggle.breakTracker type="button" class="login-content__sign-in-btn pt-2 pb-2 mr-1">
                                <coffee-icon />
                                <span class="pl-1">Take a break</span>
                            </b-button>
                        </div>
                        <div>
                            <span v-if="totalTime" class="mr-3">worked so far: <span class="font-weight-bold">{{ totalTime }}</span></span>
                            <b-button
                                pill
                                variant="success"
                                type="button"
                                class="login-content__sign-in-btn pt-2 pb-2 mr-1"
                                v-b-modal="'confirm-push-time'"
                                :disabled="selectedTasks.length===0 || everythingBookedAlready || !noMissingComments"
                                :class="{ 'disabled': selectedTasks.length===0 || everythingBookedAlready || !noMissingComments }"
                            >
                                <send-icon />
                                <span class="pl-1">Push all your tasks</span>
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
                        </div>
                    </div>
                    <selected-tasks />
                </b-col>
            </b-row>
        </div>
    </div>
</template>

<script>
    import { mapState, mapActions, mapMutations } from 'vuex';
    import { PlusCircleIcon, CoffeeIcon, SendIcon, PauseCircleIcon, SettingsIcon, XIcon } from 'vue-feather-icons';
    import SelectedTasks from "../components/SelectedTasks";
    import TheSearch from "../components/TheSearch";
    import _ from "lodash";

    export default {
        name: 'Index',
        components: { TheSearch, SelectedTasks, PlusCircleIcon, CoffeeIcon, SendIcon, PauseCircleIcon, SettingsIcon, XIcon, Settings: () => import('../components/Settings') },
        data () {
            return {
                customNameCustomTask: '',
                // break
                timeRightNow: 0,
                runningTimer: '',
                startTime: '',
                endTime: '',
                initialLoggedBreak: ''
            }
        },
        computed: {
            ...mapState({
                selectedTasks: state => state.moduleUser.selectedTasks,
                allExistingProjects: state => state.moduleUser.allExistingProjects,
                // break
                accumulatedBreakTime: state => state.moduleUser.accumulatedBreakTime,
                onABreak: state => state.moduleUser.onABreak,
                isTimerActive: state => state.moduleUser.isTimerActive,
                activeTicket: state => state.moduleUser.activeTicket,
            }),
            marginBottomTitle () {
                if (this.$mq === 'sm') return { marginBottom: '80px' }
                if (this.$mq === 'lg') return { marginBottom: '180px' }
                else return { marginBottom: '90px' }
            },
            totalTime() {
                let sumOfWorkedTime = 0;
                if (this.selectedTasks.length !== 0) {
                    const allSelectedTasksTimes = this.selectedTasks.map((__selectedTask) => {
                        if (__selectedTask.timeSpent !== '0') return __selectedTask.timeSpent;
                    })

                    for (let timeSpentOnIndividualSelectedTask of allSelectedTasksTimes) {
                        sumOfWorkedTime += timeSpentOnIndividualSelectedTask
                    }
                }

                const dateFromTotalWorkTime = new Date(0, 0, 0, 0, 0,0, sumOfWorkedTime);  // todo

                return dateFromTotalWorkTime.toTimeString().slice(0, 8);
            },
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
                requestAllProjects: 'moduleUser/requestAllProjects',
                saveSelectedTasksToStorage: 'moduleUser/saveSelectedTasksToStorage',
                requestSavingWorklogs: 'moduleUser/requestSavingWorklogs',
                saveBreaksToStorage: 'moduleUser/saveBreaksToStorage',
            }),
            ...mapMutations({
                addSelectedTask: 'moduleUser/addSelectedTask',
                // break
                toggleBreakMutation: 'moduleUser/toggleBreak',
                updateTotalBreakTime: 'moduleUser/updateTotalBreakTime',
                setIsTimerActive: 'moduleUser/setIsTimerActive',
                setLastTicket: 'moduleUser/setLastTicket',
                addBreak: 'moduleUser/addBreak',
            }),
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

                this.customNameCustomTask = '';

                this.resetAndCloseModal();

                this.saveSelectedTasksToStorage();

                if (this.allExistingProjects.length === 0) this.requestAllProjects();
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
            // break
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
            // modal
            resetAndCloseModal: function () {
                this.$bvModal.hide('add-custom-task');
                this.customNameCustomTask = '';
            }
        },
        middleware ({ store }) {
            return new Promise((resolve) => {
                store.dispatch('moduleUser/requestPrefill').then(() => resolve())
            })
        }
    }
</script>
