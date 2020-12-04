<template>
    <div class="selected-ticket__container" :class="{ 'currently-active': markedAsActive, 'already-booked': booked }">
        <div class="selected-ticket__heading mb-2" :class="{ 'flex-column align-items-start': $mq === 'md', 'flex-column align-items-center': $mq === 'sm', 'align-items-center': ($mq === 'lg' && assignedToTicket) || ($mq === 'plg' && assignedToTicket), 'flex-column': $mq === 'mdp' || !assignedToTicket }">
            <a :href="taskDirectLink ? taskDirectLink : '#'" :target="taskDirectLink ? '_blank' : ''" rel="noopener" class="col-sm-12" :class="{ 'col-12': $mq === 'mdp' || !assignedToTicket, 'col-lg-4': assignedToTicket, 'notALink': !assignedToTicket }" v-if="!editingName">
                <div class="pb-2" :class="{ 'd-flex flex-column align-items-center justify-content-center': $mq === 'sm' }">
                    <div class="font-weight-bold">{{ taskKey }}</div>
                    <div class="selected-ticket__heading__summary text-truncate">{{ taskSummary }}</div>
                </div>
            </a>
            <div v-else-if="editingName">
                <input type="text" :value="taskKey" @input="saveEditedCustomTaskName" @keyup.esc="toggleNameEditingClassic(true)" @keyup.enter.prevent="toggleNameEditingClassic()" :name="`customNameEditField-${uniqueId}`">
            </div>

            <div class="selected-ticket__heading__controls d-flex" :class="{ 'w-100 justify-content-between': $mq === 'md' || $mq === 'sm', 'flex-row': $mq === 'md' || 'lg', 'flex-column': $mq === 'sm', 'justify-content-between': $mq === 'mdp' || !assignedToTicket }" v-if="!booked">
                <div v-if="!booked" class="selected-ticket__heading__assignments d-flex" :class="[flexDirection]">
                    <b-button size="sm" v-if="!assignedToTicket" pill :variant="editingName ? 'success' : 'light-grey'" type="button" class="login-content__sign-in-btn pt-2 pb-2" :class="{ 'mb-2': $mq === 'sm', 'mr-3': $mq === 'md' || $mq === 'lg' || $mq === 'mdp' || $mq === 'plg' }" @click.prevent="toggleNameEditingClassic()" v-click-outside="toggleNameEditing">
                        <edit2-icon v-if="!editingName" />
                        <save-icon v-else />
                        <span class="pl-1">{{ editingName ? 'Save' : 'Edit' }} Name</span>
                    </b-button>
                    <ticket-assignment :unique-id="uniqueId" />
                </div>


                <div class="ticket-trackers d-flex flex-row" :class="{ 'align-self-center': $mq === 'sm' }">
                    <button @click.prevent="updateIsTimerActiveState(uniqueId)"
                            :disabled="(isTimerActive && (activeTicket === uniqueId))"
                            class="px-2"
                            :class="{'disabled': (isTimerActive && (activeTicket === uniqueId)) }">
                        <play-circle-icon />
                    </button>

                    <button @click.prevent="updateIsTimerActiveState(uniqueId)"
                            :disabled="(!isTimerActive && (activeTicket !== uniqueId)) || (isTimerActive && (activeTicket !== uniqueId)) || !isTimerActive"
                            class="px-2"
                            :class="{'disabled': (!isTimerActive && (activeTicket !== uniqueId)) || (isTimerActive && (activeTicket !== uniqueId)) || !isTimerActive}">
                        <pause-circle-icon />
                    </button>

                    <push-single-task :task-key="taskKey" :task-worklog-comment="taskWorklogComment" :time-spent="timeSpent" :assigned-to-ticket="assignedToTicket" :booked="booked" :unique-id="uniqueId" />

                    <ticket-deletion :unique-id="uniqueId" :task-summary="taskSummary" :task-key="taskKey" :assigned-to-ticket="assignedToTicket" />

                    <div class="selected-ticket__tracked-time d-flex align-items-center justify-content-between">
                        <div class="font-weight-bold pr-1">Total:</div>
                        <div v-if="!editingTrackedTime" class="selected-ticket__tracked-time__displayed">{{ parsedTimeSpent }}</div>
                        <div v-else class="selected-ticket__tracked-time__editing pl-2">
                            <input type="time" step="1" :value="parsedTimeSpent" @input="saveEditedWorklogTimeSpent" @keyup.enter.prevent="activateEditModeForTrackedTime">
                        </div>
                        <button v-if="!booked"
                                class="btn--edit"
                                :class="{ 'disabled': (isTimerActive && (activeTicket === uniqueId)) }"
                                :disabled="(isTimerActive && (activeTicket === uniqueId))"
                                @click.prevent="activateEditModeForTrackedTime">
                            <edit2-icon v-if="!editingTrackedTime" />
                            <check-icon v-else />
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="d-flex flex-row" :class="{ 'justify-content-between': (showErrorMessages && !assignedToTicket && !timeSpent) || (showErrorMessages && !assignedToTicket), 'justify-content-end': showErrorMessages && !timeSpent && assignedToTicket }">
            <div v-if="showErrorMessages && !assignedToTicket" class="message--error">Unassigned Custom Task</div>
            <div v-if="showErrorMessages && !timeSpent" class="message--error">No Tracked Time</div>
        </div>

        <ticket-comment :unique-id="uniqueId" :task-worklog-comment="taskWorklogComment" :booked="booked" />
    </div>
</template>

<script>
    import _ from "lodash";
    import { mapState, mapMutations, mapActions } from 'vuex';
    import { Edit2Icon, SaveIcon, PlayCircleIcon, PauseCircleIcon, CheckIcon } from 'vue-feather-icons';
    import TicketAssignment from "~/components/main/tasks/task/TicketAssignment";
    import TicketDeletion from "~/components/main/tasks/task/TicketDeletion";
    import TicketComment from "~/components/main/tasks/task/TicketComment";
    import PushSingleTask from "~/components/main/tasks/task/PushSingleTask";
    import Vue from 'vue';
    import vClickOutside from 'v-click-outside';
    Vue.use(vClickOutside);


    export default {
        name: "SelectedTask",
        components: {
            TicketComment,
            PushSingleTask, TicketDeletion, TicketAssignment,
            SaveIcon, Edit2Icon, PlayCircleIcon, PauseCircleIcon, CheckIcon
        },
        props: {
            taskKey: {
                required: true
            },
            taskDirectLink: {
                type: String,
                required: true
            },
            taskSummary: {
                type: String,
                required: true
            },
            taskWorklogComment: {
                type: String,
                required: true
            },
            timeSpent: {
                required: true
            },
            startedAt: {
                required: true
            },
            endedAt: {
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
        data() {
            return {
                timeRightNow: 0,
                runningTimer: '',
                startTime: '',
                endTime: '',
                editingTrackedTime: false,
                markedAsActive: false,
                editingName: false,
                localEditedName: '',
                initialTimeSpent: 0
            };
        },
        computed: {
            ...mapState({
                selectedTasks: state => state.moduleUser.selectedTasks,
                isTimerActive: state => state.moduleUser.isTimerActive,
                activeTicket: state => state.moduleUser.activeTicket,
                onABreak: state => state.moduleUser.onABreak,
                lastTicket: state => state.moduleUser.lastTicket,
                showErrorMessages: state => state.moduleUser.showErrorMessages,
                editingCustomTask: state => state.moduleUser.editingCustomTask,
                logoutInProgress: state => state.moduleUser.logoutInProgress
            }),
            parsedStartTime () { // currently not part of the UI
                if (this.startTime !== '') return this.startTime.toTimeString().slice(0, 8);
                else if (this.startedAt !== '') return this.startedAt.slice(0, 8);
                else return '00:00:00';
            },
            parsedEndTime () { // currently not part of the UI
                if (this.activeTicket === this.uniqueId && this.isTimerActive) return 'ongoing...';
                else if (this.endTime !== '') return this.endTime.toTimeString().slice(0, 8);
                else if (this.endedAt !== '') return this.endedAt.slice(0, 8);
                else if (this.endTime === '') return '00:00:00';
            },
            parsedTimeSpent () {
                const helperDate = new Date();

                // timeSpent is saved in milliseconds to the localStorage
                // Date object used to automatically get the correct calculation for the hh:mm:ss representation of milliseconds value
                const dateFromTimeSpentValue = new Date(helperDate.getFullYear(), helperDate.getMonth(), helperDate.getDate(), 0, 0,0, this.timeSpent);

                const dateFromTimeSpentValueTimeTimeString =  dateFromTimeSpentValue.toTimeString();

                // remove the date portion
                return dateFromTimeSpentValueTimeTimeString.slice(0, 8);
            },
            flexDirection () {
                return `flex-${this.$mq === 'sm' ? 'column' : 'row'}`
            }
        },
        methods: {
            ...mapMutations({
                setIsTimerActive: 'moduleUser/setIsTimerActive',
                saveTimeSpentOnTask: 'moduleUser/saveTimeSpentOnTask',
                setActiveTicket: 'moduleUser/setActiveTicket',
                saveTaskStartTime: 'moduleUser/saveTaskStartTime',
                saveTaskEndTime: 'moduleUser/saveTaskEndTime',
                toggleBreakMutation: 'moduleUser/toggleBreak',
                setLastTicket: 'moduleUser/setLastTicket',
                assignNameToCustomTask: 'moduleUser/assignNameToCustomTask',
                updateEditingCustomTask: 'moduleUser/updateEditingCustomTask'
            }),
            ...mapActions({
                saveSelectedTasksToStorage: 'moduleUser/saveSelectedTasksToStorage'
            }),
            saveEditedStartTime: _.debounce(function (event) { // as parsedStartTime & parsedEndTime are currently not part of the UI this method is currently not used
                const editedStartTime = event.target.value;
                const editedStartTimeTimeStringArray = editedStartTime.split(":");
                const endTimeTimeStringArray = this.parsedEndTime.split(":");

                const helperDate = new Date();
                const endTimeTimeAsDate = new Date(helperDate.getFullYear(), helperDate.getMonth(), helperDate.getDate(), Number(endTimeTimeStringArray[0]), Number(endTimeTimeStringArray[1]), Number(endTimeTimeStringArray[2]) ? Number(endTimeTimeStringArray[2]) : '00', 0);
                const editedStartTimeAsDate = new Date(helperDate.getFullYear(), helperDate.getMonth(), helperDate.getDate(), Number(editedStartTimeTimeStringArray[0]), Number(editedStartTimeTimeStringArray[1]), Number(editedStartTimeTimeStringArray[2]) ? Number(editedStartTimeTimeStringArray[2]) : '00', 0);

                // do not update endTime & timeSpent if endTime does not have a tracked value
                if (this.parsedEndTime !== '00:00:00') {
                    const updatedTimeDifference = endTimeTimeAsDate.getTime() - editedStartTimeAsDate.getTime();
                    this.saveTimeSpentOnTask({ uniqueId: this.uniqueId, timeSpent: updatedTimeDifference });
                }

                this.startTime = editedStartTimeAsDate;
                this.saveTaskStartTime({ uniqueId: this.uniqueId, startTime: editedStartTimeAsDate.toTimeString() });
                this.saveSelectedTasksToStorage();
            }, 1000),
            saveEditedEndTime: _.debounce(function (event) { // as parsedStartTime & parsedEndTime are currently not part of the UI this method is currently not used
                const editedEndTime = event.target.value;
                const editedEndTimeTimeStringArray = editedEndTime.split(":");
                const startTimeTimeStringArray = this.parsedStartTime.split(":");

                const helperDate = new Date();
                const editedNewEndTimeAsDate = new Date(helperDate.getFullYear(), helperDate.getMonth(), helperDate.getDate(), Number(editedEndTimeTimeStringArray[0]), Number(editedEndTimeTimeStringArray[1]), Number(editedEndTimeTimeStringArray[2] ? startTimeTimeStringArray[2] : '00'), 0);
                const startTimeAsDate = new Date(helperDate.getFullYear(), helperDate.getMonth(), helperDate.getDate(), Number(startTimeTimeStringArray[0]), Number(startTimeTimeStringArray[1]), Number(startTimeTimeStringArray[2] ? startTimeTimeStringArray[2] : '00'), 0);

                const updatedTimeDifference = editedNewEndTimeAsDate.getTime() - startTimeAsDate.getTime();

                this.endTime = editedNewEndTimeAsDate;
                this.saveTaskEndTime({ uniqueId: this.uniqueId, endTime: editedNewEndTimeAsDate.toTimeString() });
                this.saveTimeSpentOnTask({ uniqueId: this.uniqueId, timeSpent: updatedTimeDifference });
                this.saveSelectedTasksToStorage();
            }, 1000),
            saveEditedWorklogTimeSpent: _.debounce(function (event) {
                const editedTimeSpent = event.target.value; // received val may be string of shape hh:mm or hh:mm:ss

                let editedTimeSpentTimeStringArray = editedTimeSpent.split(":");
                let startTimeTimeStringArray = this.parsedStartTime.split(":");

                const helperDate = new Date();

                // if milliseconds === 00, then the received event.target.value is of shape hh:mm only
                editedTimeSpentTimeStringArray[2] = Number(editedTimeSpentTimeStringArray[2]) ? Number(editedTimeSpentTimeStringArray[2]) : Number('00');
                startTimeTimeStringArray[2] = startTimeTimeStringArray[2] ? startTimeTimeStringArray[2] : Number('00');

                const dateFromParsedStartTime = new Date(helperDate.getFullYear(), helperDate.getMonth(), helperDate.getDate(), Number(startTimeTimeStringArray[0]), Number(startTimeTimeStringArray[1]), Number(startTimeTimeStringArray[2]), 0);

                const summedUpTimeSpentAndStartTime = _.zipWith(editedTimeSpentTimeStringArray, startTimeTimeStringArray, (a, b) => Number(a) + Number(b));

                const dateFromSummedUpArrayAndHelper = new Date(helperDate.getFullYear(), helperDate.getMonth(), helperDate.getDate(), summedUpTimeSpentAndStartTime[0], summedUpTimeSpentAndStartTime[1], summedUpTimeSpentAndStartTime[2], 0);

                // update state & vuex store & localStorage
                // endTime should not be 'updated'/set when there was no startTime
                if (!(this.parsedStartTime === '00:00:00')) {
                    this.endTime = dateFromSummedUpArrayAndHelper;
                    this.saveTaskEndTime({ uniqueId: this.uniqueId, endTime: dateFromSummedUpArrayAndHelper.toTimeString() });
                }
                this.saveTimeSpentOnTask({ uniqueId: this.uniqueId, timeSpent: dateFromSummedUpArrayAndHelper.getTime() - dateFromParsedStartTime.getTime() });
                this.saveSelectedTasksToStorage();
            }, 1000),
            activateEditModeForTrackedTime: function () {
                this.editingTrackedTime = !this.editingTrackedTime;
            },
            toggleNameEditingClassic: function (cancelEdit = false) {
                if (cancelEdit === false) this.updateEditingCustomTask({ activeTaskId: this.uniqueId });

                this.editingName = !this.editingName;

                if (cancelEdit) {
                    // on cancel revert to initial state
                    this.localEditedName = '';
                    this.updateEditingCustomTask({ activeTaskId: '' });
                }
                if (!this.editingName && (this.uniqueId !== this.localEditedName) && !_.isEmpty(this.localEditedName) && !cancelEdit) {
                    this.assignNameToCustomTask({ assignedTaskKey: this.localEditedName, currentTaskKey: this.uniqueId });
                    this.saveSelectedTasksToStorage();
                    this.localEditedName = '';
                    this.updateEditingCustomTask({ activeTaskId: '' });
                }
            },
            // any click outside the input field & outside the save button should reset any changes
            toggleNameEditing: function (event) {
                if (this.editingCustomTask === this.uniqueId) {
                    if (!this.editingName) this.editingName = !this.editingName;

                    if (event !== undefined && this.editingName && (event.target.name !== `customNameEditField-${this.uniqueId}`)) {
                        this.editingName = !this.editingName;
                        this.localEditedName = '';
                        this.updateEditingCustomTask({ activeTaskId: '' });
                    }
                }
            },
            saveEditedCustomTaskName: function (event) {
                if (!_.isEmpty(event.target.value) && (this.localEditedName !== this.uniqueId)) this.localEditedName = event.target.value;
            },
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
