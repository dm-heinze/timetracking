<template>
    <div class="overview">
        <div class="w-100">
            <b-row>
                <b-col cols="12" lg="4" class="container--left">
                    <div class="login-content__titles" :style="marginBottomTitle">
                        <h3>Ticket search</h3>
                        <the-search />
                        <h5 v-b-toggle.sidebar-settings>Settings</h5>
                        <settings />
                    </div>
                </b-col>
                <b-col cols="12" lg="8" class="container--right">
                    <div class="row d-flex justify-content-between container--right__main-actions">
                        <div class="d-flex flex-row">
                            <b-button pill variant="primary" type="button" class="login-content__sign-in-btn pt-2 pb-2 mr-3" v-b-modal="'add-custom-task'">
                                <plus-circle-icon />
                                <span class="pl-1">Add Custom task</span>
                                <b-modal :id="'add-custom-task'" centered title="Add Custom Task">
                                    <div>Do you want to add a custom name? Otherwise a random name will be set. You can edit the name later regardless.</div>
                                    <input type="text" v-model="customNameCustomTask" placeholder="Add Custom Name">
                                    <template v-slot:modal-footer="{ ok }">
                                        <button @click.prevent="startNewCustomTask()" class="icon-send">Add Custom Task</button>
                                    </template>
                                </b-modal>
                            </b-button>
                            <b-button pill @click.prevent="" type="button" class="login-content__sign-in-btn pt-2 pb-2 mr-1">
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
                                <b-modal :id="'confirm-push-time'" centered title="Push Time?">
                                    <div>Are you sure you want to book tracked time?</div>
                                    <template v-slot:modal-footer="{ ok }">
                                        <button @click.prevent="saveWorklogs()" class="icon-send">Push Time</button>
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
    import { PlusCircleIcon, CoffeeIcon, SendIcon } from 'vue-feather-icons';
    import SelectedTasks from "../components/SelectedTasks";
    import TheSearch from "../components/TheSearch";
    import _ from "lodash";

    export default {
        name: 'Index',
        components: { TheSearch, SelectedTasks, PlusCircleIcon, CoffeeIcon, SendIcon, Settings: () => import('../components/Settings') },
        data () {
            return {
                customNameCustomTask: '',
            }
        },
        computed: {
            ...mapState({
                selectedTasks: state => state.moduleUser.selectedTasks,
                allExistingProjects: state => state.moduleUser.allExistingProjects
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
        methods: {
            ...mapActions({
                requestAllProjects: 'moduleUser/requestAllProjects',
                saveSelectedTasksToStorage: 'moduleUser/saveSelectedTasksToStorage',
                requestSavingWorklogs: 'moduleUser/requestSavingWorklogs'
            }),
            ...mapMutations({
                    addSelectedTask: 'moduleUser/addSelectedTask'
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

                this.$bvModal.hide('add-custom-task'); // any cancel event needed?

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
            }
        },
        middleware ({ store }) {
            return new Promise((resolve) => {
                store.dispatch('moduleUser/requestPrefill').then(() => resolve())
            })
        }
    }
</script>
