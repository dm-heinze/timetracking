<template>
    <div class="selected-ticket__container" :class="{ 'selected-ticket--activated': markedAsActive, 'already-booked': booked }">
        <div class="selected-ticket__heading">
            <a :href="taskDirectLink" v-if="!editingName">
                <li>
                    {{ taskSummary }} - {{ taskKey }}
                </li>
            </a>
            <div v-else-if="editingName">
                <input type="text" :value="taskKey" @input="saveEditedCustomTaskName">
            </div>
            <div v-if="!booked">
                <button v-if="!assignedToTicket" :class="{ 'icon-pencil': !editingName, 'icon-check': editingName }" @click.prevent="toggleNameEditing()">Edit Name</button>
                <button v-if="!assignedToTicket && editingName" class="icon-close" @click.prevent="toggleNameEditing(true)">Cancel</button>
                <button :class="{ 'icon-pencil': !showSelection, 'icon-check': showSelection, 'disabled': showSelection && (selectedTicket === '')}" class="navigation__icon" @click.prevent="toggleTicketAssignment()" :disabled="showSelection && (selectedTicket === '')">Assign Ticket</button>
                <div v-if="showSelection">
                    <button class="icon-close" @click.prevent="toggleTicketAssignment(true)">Cancel</button>
                    <select v-model="selectedProject">
                        <option v-if="!allExistingProjects.length" disabled value="">Loading Projects...</option>
                        <option v-else disabled value="">Select a project</option>
                        <option
                            v-for="existingProject in allExistingProjects"
                            :value="existingProject.id"
                        >{{ existingProject.name }}</option>
                    </select>

                    <select v-model="selectedTicket" v-if="selectedProject !== ''">
                        <option v-if="!relatedTickets.length" disabled value="">Loading Related Tickets...</option>
                        <option v-else disabled value="">Select a ticket</option>
                        <option
                            v-for="relatedTicket in relatedTickets"
                            :value="relatedTicket.key"
                        >{{ relatedTicket.key }}: {{ relatedTicket.summary }}</option>
                    </select>
                </div>
            </div>

            <div class="selected-ticket__controls" v-if="!booked">
                <button @click.prevent="updateIsTimerActiveState(uniqueId)"
                        class="icon-play"
                        :disabled="(isTimerActive && (activeTicket === uniqueId))"
                        :class="{'disabled': (isTimerActive && (activeTicket === uniqueId)) }">
                </button>
                <button @click.prevent="updateIsTimerActiveState(uniqueId)"
                        class="icon-pause"
                        :disabled="(!isTimerActive && (activeTicket !== uniqueId)) || (isTimerActive && (activeTicket !== uniqueId)) || !isTimerActive"
                        :class="{'disabled': (!isTimerActive && (activeTicket !== uniqueId)) || (isTimerActive && (activeTicket !== uniqueId)) || !isTimerActive}">
                </button>

                <button @click.prevent="bookSingleTaskOnly()"
                        class="icon-flash"
                        :disabled="isTimerActive || !taskWorklogComment || !timeSpent || booked || !assignedToTicket"
                        :class="{'disabled':  isTimerActive || !taskWorklogComment || !timeSpent || booked || !assignedToTicket }">
                </button>


                <button v-b-modal="`confirm-deletion-modal-${uniqueId}`" class="icon-trash"></button>
                <b-modal :id="`confirm-deletion-modal-${uniqueId}`" centered title="Delete Task?">
                    <div>Delete tracker for {{ taskKey }}: {{ taskSummary }}?</div>
                    <template v-slot:modal-footer="{ ok }">
                        <button @click.prevent="removeTicketFromSelectedTickets(uniqueId)" class="icon-trash">Delete</button>
                    </template>
                </b-modal>

            </div>
        </div>
        <button v-b-toggle="`selected-task-${uniqueId}`" class="time-collapse"></button>
        <b-collapse :id="`selected-task-${uniqueId}`" visible class="selected-ticket__content">
            <textarea rows="4" :value="taskWorklogComment" @input="saveCommentToStore" :disabled="booked"></textarea>

            <div class="selected-ticket__tracked-time">
                <div v-if="!editingTrackedTime" class="selected-ticket__tracked-time__displayed"><div>{{ parsedStartTime }}</div> - <div>{{ parsedEndTime }}</div> = <div>{{ parsedTimeSpent }}</div></div>
                <div v-else class="selected-ticket__tracked-time__editing">
                    <input type="time" step="1" :value="parsedStartTime" @input="saveEditedStartTime"> - <input type="time" step="1" :value="parsedEndTime" @input="saveEditedEndTime"> timeSpent <input type="time" step="1" :value="parsedTimeSpent" @input="saveEditedWorklogTimeSpent">
                </div>
                <button v-if="!booked" :class="{ 'icon-pencil': !editingTrackedTime, 'icon-check': editingTrackedTime }" class="navigation__icon" @click.prevent="activateEditModeForTrackedTime"></button>
            </div>
        </b-collapse>
    </div>
</template>

<script>
    import { mapState, mapMutations, mapActions } from 'vuex';
    import _ from "lodash";

    export default {
        name: "SelectedTask",
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
                selectedProject: '',
                selectedTicket: '',
                lastSelectedTicket: '',
                editingTrackedTime: false,
                showSelection: false,
                markedAsActive: false,
                editingName: false,
                localEditedName: '',
                initialTimeSpent: 0,
                updatedComment: ''
            };
        },
        computed: {
            ...mapState({
                selectedTasks: state => state.moduleUser.selectedTasks,
                isTimerActive: state => state.moduleUser.isTimerActive,
                activeTicket: state => state.moduleUser.activeTicket,
                allExistingProjects: state => state.moduleUser.allExistingProjects,
                relatedTickets: state => state.moduleUser.relatedTickets,
                onABreak: state => state.moduleUser.onABreak,
                lastTicket: state => state.moduleUser.lastTicket,
            }),
            parsedStartTime () {
                if (this.startTime !== '') return this.startTime.toTimeString().slice(0, 8);
                else if (this.startedAt !== '') return this.startedAt.slice(0, 8);
                else return '00:00:00';
            },
            parsedEndTime () {
                if (this.activeTicket === this.uniqueId && this.isTimerActive) return 'ongoing...';
                else if (this.endTime !== '') return this.endTime.toTimeString().slice(0, 8);
                else if (this.endedAt !== '') return this.endedAt.slice(0, 8);
                else if (this.endTime === '') return '00:00:00';
            },
            parsedTimeSpent () {
                const helperDate = new Date();
                const dateFromTimeSpentValue = new Date(helperDate.getFullYear(), helperDate.getMonth(), helperDate.getDate(), 0, 0,0, this.timeSpent);

                const dateFromTimeSpentValueTimeTimeString =  dateFromTimeSpentValue.toTimeString();

                return dateFromTimeSpentValueTimeTimeString.slice(0, 8);
            }
        },
        methods: {
            ...mapMutations({
                removeSelectedTask: 'moduleUser/removeSelectedTask',
                saveTaskComment: 'moduleUser/saveTaskComment',
                setIsTimerActive: 'moduleUser/setIsTimerActive',
                saveTimeSpentOnTask: 'moduleUser/saveTimeSpentOnTask',
                setActiveTicket: 'moduleUser/setActiveTicket',
                saveTaskStartTime: 'moduleUser/saveTaskStartTime',
                saveTaskEndTime: 'moduleUser/saveTaskEndTime',
                setSelectedProject: 'moduleUser/setSelectedProject',
                assignToTicket: 'moduleUser/assignToTicket',
                toggleBreakMutation: 'moduleUser/toggleBreak',
                setLastTicket: 'moduleUser/setLastTicket',
                assignNameToCustomTask: 'moduleUser/assignNameToCustomTask'
            }),
            ...mapActions({
                saveSelectedTasksToStorage: 'moduleUser/saveSelectedTasksToStorage',
                requestAllProjects: 'moduleUser/requestAllProjects',
                requestRelatedTickets: 'moduleUser/requestRelatedTickets',
                requestSavingSingleWorklog: 'moduleUser/requestSavingSingleWorklog'
            }),
            bookSingleTaskOnly() {
                this.requestSavingSingleWorklog({ comment: this.taskWorklogComment, timeSpentSeconds: this.timeSpent, ticketId: this.taskKey, uniqueId: this.uniqueId })
                    .then(() => {
                        this.$bvModal.msgBoxOk('Worklog was successfully booked', {
                            centered: true,
                            okVariant: 'success'
                        })
                    })
                    .catch(() => {
                        this.$bvModal.msgBoxOk('There has been an error. Booking was not successful!', {
                            centered: true,
                            okVariant: 'danger'
                        })
                    })
            },
            saveEditedStartTime: _.debounce(function (event) {
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
            saveEditedEndTime: _.debounce(function (event) {
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
                const editedTimeSpent = event.target.value;

                let editedTimeSpentTimeStringArray = editedTimeSpent.split(":");
                let startTimeTimeStringArray = this.parsedStartTime.split(":");

                const helperDate = new Date();

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
            toggleNameEditing: function (cancelEdit = false) {
                this.editingName = !this.editingName;

                if (cancelEdit) this.localEditedName = ''; // on cancel revert to initial state

                if (!this.editingName && (this.uniqueId !== this.localEditedName) && !_.isEmpty(this.localEditedName) && !cancelEdit) {
                    this.assignNameToCustomTask({ assignedTaskKey: this.localEditedName, currentTaskKey: this.uniqueId }); //todo

                    this.saveSelectedTasksToStorage();
                }
            },
            saveEditedCustomTaskName: _.debounce(function (event) {
                if (!_.isEmpty(event.target.value) && (this.localEditedName !== this.uniqueId)) this.localEditedName = event.target.value;
            }, 1500),
            toggleTicketAssignment: function (cancelAssignment = false) {
                this.showSelection = !this.showSelection;

                if (this.showSelection && this.allExistingProjects.length === 0) this.requestAllProjects(); // if search offCanvas was not opened yet allExistingProjects is empty
                if (this.showSelection) this.lastSelectedTicket = this.selectedTicket;

                if (cancelAssignment) this.selectedTicket = this.lastSelectedTicket; this.selectedProject = ''; // on cancel revert to initial state

                // saving to vuex store/localStorage only needed if there was a change in the assigned ticket
                // if cancelBtn was used: do not save
                if (!this.showSelection && (cancelAssignment === false) && (this.lastSelectedTicket !== this.selectedTicket)) {
                    // step 1: update vuex store
                    this.assignToTicket({ uniqueId: this.uniqueId,  assignedTicketKey: this.selectedTicket }); // todo

                    // step 2: update localStorage
                    this.saveSelectedTasksToStorage();
                }
            },
            removeTicketFromSelectedTickets: function (ticketToRemoveFromSelectedTickets) {
                this.removeSelectedTask(ticketToRemoveFromSelectedTickets);

                this.saveSelectedTasksToStorage();
            },
            saveCommentToStore: function (event) {
                this.updatedComment = event.target.value;
                this.saveTaskComment({ uniqueId: this.uniqueId, comment: event.target.value });
                this.saveSelectedTasksToStorage();
            },
            currentTimeInSeconds: function () {
                this.timeRightNow = new Date();

                const calculatedDifference = this.timeRightNow.getTime() - this.startTime.getTime();

                let __timeSpent = calculatedDifference; // todo?

                if (this.timeSpent !== 0 || this.timeSpent !== '') __timeSpent = this.initialTimeSpent + calculatedDifference; // todo?

                this.saveTimeSpentOnTask({ uniqueId: this.uniqueId, timeSpent: __timeSpent });

                this.saveTaskComment({ uniqueId: this.uniqueId, comment: this.updatedComment });

                this.saveSelectedTasksToStorage();
            },
            startTimer: function () {
                // mark the current activeTicket
                this.markedAsActive = true;

                this.initialTimeSpent = this.timeSpent;

                this.startTime = new Date();

                this.saveTaskStartTime({ uniqueId: this.uniqueId, startTime: this.startTime.toTimeString() });

                this.runningTimer = setInterval(() => this.currentTimeInSeconds(), 1000);
            },
            stopTimer: function () {
                this.markedAsActive = false;

                this.endTime = new Date();

                clearInterval(this.runningTimer);

                // this.setActiveTicket('');

                this.saveTaskEndTime({ uniqueId: this.uniqueId, endTime: this.endTime.toTimeString() });

                this.saveSelectedTasksToStorage();
            },

            updateIsTimerActiveState: function (keyOfTicket) {
                // stop break timer if active
                if (this.onABreak) this.toggleBreakMutation();

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
                    this.setIsTimerActive();
                }
            },
            selectedProject: function (newValue) {
                if (newValue) {
                    this.setSelectedProject(this.selectedProject);
                    this.requestRelatedTickets();
                }
            }
        },
        created () {
            this.updatedComment = this.taskWorklogComment;
        }
    }
</script>
<style scoped>
    .selected-ticket--activated {
        background: #4cffbf;
    }
</style>
