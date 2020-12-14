<template>
    <div class="selected-ticket__container" :class="{ 'currently-active': markedAsActive, 'already-booked': booked, 'currentlyDraggable': !isTimerActive }">
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
                    <b-button size="sm" v-if="!assignedToTicket" pill :variant="editingName ? 'success' : 'light-grey'" type="button" :disabled="isTimerActive && (activeTicket === uniqueId)" class="login-content__sign-in-btn button--customTaskName pt-2 pb-2" :class="{ 'disabled': isTimerActive && (activeTicket === uniqueId), 'mb-2': $mq === 'sm', 'mr-3': $mq === 'md' || $mq === 'lg' || $mq === 'mdp' || $mq === 'plg' }" @click.prevent="toggleNameEditingClassic()" v-click-outside="toggleNameEditing">
                        <edit2-icon v-if="!editingName" />
                        <save-icon v-else />
                        <span class="pl-1">{{ editingName ? 'Save' : 'Edit' }} Name</span>
                    </b-button>
                    <ticket-assignment :unique-id="uniqueId" />
                </div>


                <div class="ticket-trackers d-flex flex-row" :class="{ 'align-self-center': $mq === 'sm' }">
                    <button @click.prevent="updateIsTimerActiveState(uniqueId)" class="px-2">
                        <pause-circle-icon v-if="(isTimerActive && (activeTicket === uniqueId))" />
                        <play-circle-icon v-else />
                    </button>

                    <push-single-task :task-key="taskKey" :task-worklog-comment="taskWorklogComment" :time-spent="timeSpent" :assigned-to-ticket="assignedToTicket" :booked="booked" :unique-id="uniqueId" />

                    <ticket-deletion :unique-id="uniqueId" :task-summary="taskSummary" :task-key="taskKey" :assigned-to-ticket="assignedToTicket" />

                    <ticket-time-spent :time-spent="timeSpent" :unique-id="uniqueId" :booked="booked" />
                </div>
            </div>
        </div>

        <ticket-error-messages :unique-id="uniqueId" :task-key="taskKey" :time-spent="timeSpent" :assigned-to-ticket="assignedToTicket" />

        <ticket-comment :unique-id="uniqueId" :task-worklog-comment="taskWorklogComment" :booked="booked" />

        <ul>
            <li v-for="startAndEndTime in startAndEndTimesArray" :key="startAndEndTime.id"> {{ startAndEndTime.startTime }} - {{ startAndEndTime.endTime }} = {{ startAndEndTime.duration }}</li>
        </ul>

        <div v-if="startTime">
            <div>{{ parsedCurrentStartTime }} - {{ parsedCurrentEndTime }}</div>
        </div>
    </div>
</template>

<script>
    import _ from "lodash";
    import { mapState, mapMutations, mapActions } from 'vuex';
    import { Edit2Icon, SaveIcon, PlayCircleIcon, PauseCircleIcon } from 'vue-feather-icons';
    import TicketAssignment from "~/components/main/tasks/task/TicketAssignment";
    import TicketDeletion from "~/components/main/tasks/task/TicketDeletion";
    import TicketComment from "~/components/main/tasks/task/TicketComment";
    import TicketErrorMessages from "~/components/main/tasks/task/TicketErrorMessages";
    import PushSingleTask from "~/components/main/tasks/task/PushSingleTask";
    import TicketTimeSpent from "~/components/main/tasks/task/TicketTimeSpent";
    import Vue from 'vue';
    import vClickOutside from 'v-click-outside';
    Vue.use(vClickOutside);


    export default {
        name: "SelectedTask",
        components: {
            TicketTimeSpent, TicketErrorMessages, TicketComment, TicketDeletion, TicketAssignment, PushSingleTask,
            SaveIcon, Edit2Icon, PlayCircleIcon, PauseCircleIcon
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
            },
            startAndEndTimesArray: { // may not be set - todo
                required: false,
                default: () => []
            },
        },
        data() {
            return {
                timeRightNow: 0,
                runningTimer: '',
                startTime: '',
                endTime: '',
                markedAsActive: false,
                editingName: false,
                localEditedName: '',
                initialTimeSpent: 0,
                startAndEndTimes: []
            };
        },
        computed: {
            ...mapState({
                selectedTasks: state => state.moduleUser.selectedTasks,
                isTimerActive: state => state.moduleUser.isTimerActive,
                activeTicket: state => state.moduleUser.activeTicket,
                onABreak: state => state.moduleUser.onABreak,
                lastTicket: state => state.moduleUser.lastTicket,
                editingCustomTask: state => state.moduleUser.editingCustomTask,
                logoutInProgress: state => state.moduleUser.logoutInProgress
            }),
            flexDirection () {
                return `flex-${this.$mq === 'sm' ? 'column' : 'row'}`
            },
            parsedCurrentStartTime () {
                return this.startTime !== '' ? this.startTime.toTimeString().slice(0, 8) : ''
            },
            parsedCurrentEndTime () {
                return this.endTime !== '' ? this.endTime.toTimeString().slice(0, 8) : 'Ongoing...'
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
                updateEditingCustomTask: 'moduleUser/updateEditingCustomTask',
                saveToTasksStartAndEndTimeArray: 'moduleUser/saveToTasksStartAndEndTimeArray'
            }),
            ...mapActions({
                saveSelectedTasksToStorage: 'moduleUser/saveSelectedTasksToStorage'
            }),
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


                const __dateRightNow = new Date(); // todo: this.timeRightNow
                const __duration = new Date(__dateRightNow.getFullYear(), __dateRightNow.getMonth(), __dateRightNow.getDate(), 0, 0, 0, this.endTime.getTime() - this.startTime.getTime());

                const __newStartAndEndTime = {
                    startTime: this.startTime.toTimeString().slice(0, 8),
                    endTime: this.endTime.toTimeString().slice(0, 8),
                    duration: __duration.toTimeString().slice(0, 8),
                    id: _.now()
                }

                this.saveToTasksStartAndEndTimeArray({ entryToAdd: __newStartAndEndTime, uniqueId: this.uniqueId });

                this.startTime = '';
                this.endTime = '';


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
