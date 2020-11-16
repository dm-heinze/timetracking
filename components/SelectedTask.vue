<template>
    <div class="selected-ticket__container" :class="{ 'currently-active': markedAsActive, 'already-booked': booked }">
        <div class="selected-ticket__heading" :class="{ 'flex-column align-items-start': $mq === 'md', 'flex-column align-items-center': $mq === 'sm', 'align-items-center': $mq === 'lg' }">
            <a :href="taskDirectLink" target="_blank" class="col-5" v-if="!editingName">
                <div class="pb-2" :class="{ 'd-flex flex-column align-items-center justify-content-center': $mq === 'sm' }">
                    <div class="font-weight-bold">{{ taskKey }}</div>
                    <div class="selected-ticket__heading__summary text-truncate">{{ taskSummary }}</div>
                </div>
            </a>
            <div v-else-if="editingName">
                <input type="text" :value="taskKey" @input="saveEditedCustomTaskName" @keyup.esc="toggleNameEditingClassic(true)" @keyup.enter.prevent="toggleNameEditingClassic()" name="customNameEditField">
            </div>

            <div class="selected-ticket__heading__controls d-flex" :class="{ 'w-100 justify-content-between': $mq === 'md' || $mq === 'sm', 'flex-row': $mq === 'md' || 'lg', 'flex-column': $mq === 'sm' }" v-if="!booked">
                <div v-if="!booked" class="selected-ticket__heading__assignments d-flex" :class="[flexDirection]">
                    <b-button size="sm" v-if="!assignedToTicket" pill :variant="editingName ? 'success' : 'light-grey'" type="button" class="login-content__sign-in-btn pt-2 pb-2" :class="{ 'mb-2': $mq === 'sm', 'mr-3': $mq === 'md' || $mq === 'lg' }" @click.prevent="toggleNameEditingClassic()" v-click-outside="toggleNameEditing">
                        <edit2-icon v-if="!editingName" />
                        <save-icon v-else />
                        <span class="pl-1">{{ editingName ? 'Save' : 'Edit' }} Name</span>
                    </b-button>

                    <b-button pill variant="light-grey" type="button" class="login-content__sign-in-btn pt-2 pb-2" :class="{ 'mb-2': $mq === 'sm', 'mr-3': $mq === 'md' || $mq === 'lg' }" @click.prevent="toggleTicketAssignment()">
                        <plus-circle-icon />
                        <span class="pl-1">Assign Ticket</span>
                    </b-button>
                    <b-modal :id="`ticket-assignment-${uniqueId}`" centered>
                        <template v-slot:modal-header="{ close }">
                            <div class="d-flex justify-content-between align-items-center w-100 modal__top-bar">
                                <h3 class="primary">Assign Ticket</h3>
                                <span>
                                <x-icon @click="toggleTicketAssignment(true)" />
                            </span>
                            </div>
                        </template>
                        <template v-slot:default>
                            <div class="modal__main-container">
                                <div class="select__container mb-3">
                                    <b-form-select v-model="selectedProject" class="rounded-pill pl-4 pr-5">
                                        <b-form-select-option v-if="!allExistingProjects.length" disabled value="">Loading Projects...</b-form-select-option>
                                        <b-form-select-option v-else disabled value="">Select a project</b-form-select-option>
                                        <b-form-select-option
                                            v-for="existingProject in allExistingProjects"
                                            :value="existingProject.id"
                                            :key="existingProject.id"
                                        >{{ existingProject.name }}</b-form-select-option>
                                    </b-form-select>
                                    <chevron-down-icon class="select__icon" />
                                </div>

                                <div class="select__container mb-3">
                                    <b-form-select  v-model="selectedTicket" :disabled="selectedProject === ''" class="rounded-pill pl-4 pr-5">
                                        <b-form-select-option v-if="!relatedTickets.length && selectedProject !== ''" disabled value="">Loading Related Tickets...</b-form-select-option>
                                        <b-form-select-option v-else disabled value="">Select a ticket</b-form-select-option>
                                        <b-form-select-option
                                            v-for="relatedTicket in relatedTickets"
                                            :value="relatedTicket.key"
                                            :key="relatedTicket.key"
                                        >{{ relatedTicket.key }}: {{ relatedTicket.summary }}</b-form-select-option>
                                    </b-form-select>
                                    <chevron-down-icon class="select__icon" />
                                </div>
                            </div>
                        </template>
                        <template v-slot:modal-footer="{ ok, cancel }">
                            <div class="d-flex justify-content-between w-100 modal__actions">
                                <b-button pill class="font-weight-bold modal__cancel-btn" @click.prevent="toggleTicketAssignment(true)">Cancel</b-button>
                                <b-button pill variant="primary" class="font-weight-bold modal__save-btn" :disabled="selectedTicket === ''" @click.prevent="toggleTicketAssignment()">Save</b-button>
                            </div>
                        </template>
                    </b-modal>
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

                    <button v-b-modal="`confirm-push-time-singleTaskOnly-${uniqueId}`"
                            :disabled="isTimerActive || !taskWorklogComment || !timeSpent || booked || !assignedToTicket"
                            class="px-2"
                            :class="{'disabled':  isTimerActive || !taskWorklogComment || !timeSpent || booked || !assignedToTicket }">
                        <upload-cloud-icon />

                        <b-modal :id="`confirm-push-time-singleTaskOnly-${uniqueId}`" centered>
                            <template v-slot:modal-header="{ close }">
                                <div class="d-flex justify-content-between align-items-center w-100 modal__top-bar">
                                    <h3 class="primary">Push Single Task?</h3>
                                    <span>
                                        <x-icon @click="close()" />
                                    </span>
                                </div>
                            </template>
                            <template v-slot:default>
                                <div class="modal__main-container">
                                    <div class="modal__main-container__main-text">Are you sure you want to book tracked time for {{ taskKey }}?</div>
                                </div>
                            </template>
                            <template v-slot:modal-footer="{ ok, cancel }">
                                <div class="d-flex justify-content-between w-100 modal__actions">
                                    <b-button pill class="font-weight-bold modal__cancel-btn" @click.prevent="cancel()">Cancel</b-button>
                                    <b-button pill variant="primary" class="font-weight-bold modal__save-btn" @click.prevent="bookSingleTaskOnly()">Push Time</b-button>
                                </div>
                            </template>
                        </b-modal>
                    </button>

                    <button v-b-modal="`confirm-deletion-modal-${uniqueId}`" class="px-2">
                        <trash2-icon />
                    </button>
                    <b-modal :id="`confirm-deletion-modal-${uniqueId}`" centered>
                        <template v-slot:modal-header="{ close }">
                            <div class="d-flex justify-content-between align-items-center w-100 modal__top-bar">
                                <h3 class="primary">Delete Task?</h3>
                                <span>
                                    <x-icon @click="close()" />
                                </span>
                            </div>
                        </template>
                        <template v-slot:default>
                            <div class="modal__main-container">
                                <div class="modal__main-container__main-text">Delete tracker for {{ optionalTaskKey }} {{ taskSummary }}?</div>
                            </div>
                        </template>
                        <template v-slot:modal-footer="{ ok, cancel }">
                            <div class="d-flex justify-content-between w-100 modal__actions">
                                <b-button pill class="font-weight-bold modal__cancel-btn" @click.prevent="cancel()">Cancel</b-button>
                                <b-button pill variant="primary" class="font-weight-bold modal__save-btn" @click.prevent="removeTicketFromSelectedTickets(uniqueId)">Delete</b-button>
                            </div>
                        </template>
                    </b-modal>

                    <div class="selected-ticket__tracked-time d-flex align-items-center justify-content-between">
                        <div class="font-weight-bold pr-1">Total:</div>
                        <div v-if="!editingTrackedTime" class="selected-ticket__tracked-time__displayed">{{ parsedTimeSpent }}</div>
                        <div v-else class="selected-ticket__tracked-time__editing pl-2">
                            <input type="time" step="1" :value="parsedTimeSpent" @input="saveEditedWorklogTimeSpent" @keyup.enter.prevent="activateEditModeForTrackedTime">
                        </div>
                        <button v-if="!booked"
                                class="btn--edit"
                                @click.prevent="activateEditModeForTrackedTime">
                            <edit2-icon v-if="!editingTrackedTime" />
                            <check-icon v-else />
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="d-flex flex-row justify-content-between">
            <div v-if="showErrorMessages && !assignedToTicket" class="message--error">Unassigned Custom Task</div>
            <div v-if="showErrorMessages && !timeSpent" class="message--error">No Tracked Time</div>
        </div>
        <b-collapse :id="`selected-task-${uniqueId}`" visible class="selected-ticket__content">
            <textarea rows="4" :value="taskWorklogComment" @input="saveCommentToStore" :disabled="booked"></textarea>
            <div v-if="showErrorMessages && !taskWorklogComment " class="message--error">No Comment</div>
        </b-collapse>
        <div class="d-flex justify-content-center selected-ticket__toggle-btn">
            <button v-b-toggle="`selected-task-${uniqueId}`" @click="toggleChevronsIcon()">
                <chevrons-down-icon v-if="!chevronsUp"/>
                <chevrons-up-icon v-else />
            </button>
        </div>
    </div>
</template>

<script>
    import { mapState, mapMutations, mapActions } from 'vuex';
    import { XIcon, Edit2Icon, SaveIcon, PlusCircleIcon, PlayCircleIcon, PauseCircleIcon, Trash2Icon, UploadCloudIcon, ChevronDownIcon, CheckIcon, ChevronsDownIcon, ChevronsUpIcon } from 'vue-feather-icons';
    import _ from "lodash";
    import Vue from 'vue';
    import vClickOutside from 'v-click-outside';
    Vue.use(vClickOutside);


    export default {
        name: "SelectedTask",
        components: { XIcon, SaveIcon, Edit2Icon, PlusCircleIcon, PlayCircleIcon, PauseCircleIcon, Trash2Icon, UploadCloudIcon, ChevronDownIcon, CheckIcon, ChevronsDownIcon, ChevronsUpIcon },
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
                updatedComment: '',
                chevronsUp: true
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
                showErrorMessages: state => state.moduleUser.showErrorMessages
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
            },
            optionalTaskKey () {
                if (this.assignedToTicket) return `${this.taskKey}: `;
                else return this.taskKey;
            },
            flexDirection () {
                return `flex-${this.$mq === 'sm' ? 'column' : 'row'}`
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
            toggleChevronsIcon() {
                this.chevronsUp = !this.chevronsUp;
            },
            bookSingleTaskOnly() {
                this.requestSavingSingleWorklog({ comment: this.taskWorklogComment, timeSpentSeconds: this.timeSpent, ticketId: this.taskKey, uniqueId: this.uniqueId })
                    .then(() => {
                        this.$bvModal.msgBoxOk('Worklog was successfully booked', {
                            centered: true,
                            okVariant: 'success rounded-pill',
                            okTitle: 'Okay',
                            bodyClass: 'modal__main-container',
                            footerClass: 'modal__main-container modal__actions modal__feedback__footer'
                        })
                    })
                    .catch(() => {
                        this.$bvModal.msgBoxOk('There has been an error. Booking was not successful!', {
                            centered: true,
                            okVariant: 'danger rounded-pill',
                            okTitle: 'Okay',
                            bodyClass: 'modal__main-container',
                            footerClass: 'modal__main-container modal__actions modal__feedback__footer'
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
            toggleNameEditingClassic: function (cancelEdit = false) {
                this.editingName = !this.editingName;
                if (cancelEdit) this.localEditedName = ''; // on cancel revert to initial state
                if (!this.editingName && (this.uniqueId !== this.localEditedName) && !_.isEmpty(this.localEditedName) && !cancelEdit) {
                    this.assignNameToCustomTask({ assignedTaskKey: this.localEditedName, currentTaskKey: this.uniqueId });
                    this.saveSelectedTasksToStorage();
                }
            },
            toggleNameEditing: function (event) {
                if (!this.editingName) this.editingName = !this.editingName;

                if (event !== undefined && this.editingName && (event.target.name !== 'customNameEditField')) {
                    this.editingName = !this.editingName;
                    this.localEditedName = '';
                }
            },
            saveEditedCustomTaskName: function (event) {
                if (!_.isEmpty(event.target.value) && (this.localEditedName !== this.uniqueId)) this.localEditedName = event.target.value;
            },
            toggleTicketAssignment: function (cancelAssignment = false) {
                this.showSelection = !this.showSelection;

                if (this.showSelection && this.allExistingProjects.length === 0) this.requestAllProjects(); // if search offCanvas was not opened yet allExistingProjects is empty
                if (this.showSelection) {
                    this.lastSelectedTicket = this.selectedTicket;
                    this.$bvModal.show(`ticket-assignment-${this.uniqueId}`);
                }

                if (cancelAssignment) {
                    this.selectedTicket = this.lastSelectedTicket;
                    this.selectedProject = ''; // on cancel revert to initial state
                    this.$bvModal.hide(`ticket-assignment-${this.uniqueId}`);
                }

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
