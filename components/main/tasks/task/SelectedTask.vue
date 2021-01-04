<template>
    <div
        class="selected-ticket__container"
        :class="{
            'currently-active': isTimerActive && (activeTicket === uniqueId),
            'already-booked': booked,
            'currentlyDraggable': !isTimerActive
        }"
    >
        <div
            class="selected-ticket__heading mb-2"
            :class="{
                'flex-column align-items-start': $mq === 'md',
                'flex-column align-items-center': $mq === 'sm',
                'align-items-center': ($mq === 'lg' && assignedToTicket) || ($mq === 'plg' && assignedToTicket),
                'flex-column': $mq === 'mdp' || !assignedToTicket
            }"
        >
            <a
                v-if="!editingName"
                :href="taskDirectLink ? taskDirectLink : '#'"
                :target="taskDirectLink ? '_blank' : ''"
                rel="noopener"
                class="col-sm-12"
                :class="{
                    'col-12': $mq === 'mdp' || !assignedToTicket,
                    'col-lg-4': assignedToTicket,
                    'notALink': !assignedToTicket
                }"
            >
                <div class="pb-2" :class="{ 'd-flex flex-column align-items-center justify-content-center': $mq === 'sm' }">
                    <div class="font-weight-bold">{{ taskKey }}</div>
                    <div class="selected-ticket__heading__summary text-truncate">{{ taskSummary }}</div>
                </div>
            </a>
            <div v-else-if="editingName">
                <input
                    type="text"
                    :value="taskKey"
                    @input="saveEditedCustomTaskName"
                    @keyup.esc="toggleNameEditingClassic(true)"
                    @keyup.enter.prevent="toggleNameEditingClassic()"
                    :name="`customNameEditField-${uniqueId}`"
                >
            </div>

            <div
                class="selected-ticket__heading__controls d-flex"
                :class="{
                    'w-100 justify-content-between': $mq === 'md' || $mq === 'sm',
                    'flex-row': $mq === 'md' || 'lg',
                    'flex-column': $mq === 'sm',
                    'justify-content-between': $mq === 'mdp' || !assignedToTicket
                }"
            >
                <div v-if="!booked" class="selected-ticket__heading__assignments d-flex" :class="[flexDirection]">
                    <b-button
                        v-if="!assignedToTicket"
                        pill
                        size="sm"
                        :variant="editingName ? 'success' : 'light-grey'"
                        type="button"
                        :disabled="isTimerActive && (activeTicket === uniqueId)"
                        class="login-content__sign-in-btn button--customTaskName pt-2 pb-2"
                        :class="{
                            'mb-2': $mq === 'sm',
                            'mr-3': $mq === 'md' || $mq === 'lg' || $mq === 'mdp' || $mq === 'plg'
                        }"
                        @click.prevent="toggleNameEditingClassic()"
                        v-click-outside="toggleNameEditing"
                    >
                        <edit2-icon v-if="!editingName" />
                        <save-icon v-else />
                        <span class="pl-1">{{ editingName ? 'Save' : 'Edit' }} Name</span>
                    </b-button>
                    <ticket-assignment :unique-id="uniqueId" />
                </div>


                <div class="ticket-trackers d-flex flex-row" :class="{ 'align-self-center': $mq === 'sm' }">
                    <ticket-play-and-pause v-if="!booked && !showUnbookedTasksNotOfTheDay" :time-spent="timeSpent" :unique-id="uniqueId" />

                    <push-single-task v-if="!booked" :task-key="taskKey" :task-worklog-comment="taskWorklogComment" :time-spent="timeSpent" :assigned-to-ticket="assignedToTicket" :booked="booked" :unique-id="uniqueId" />

                    <ticket-deletion v-if="!booked" :unique-id="uniqueId" :task-summary="taskSummary" :task-key="taskKey" :assigned-to-ticket="assignedToTicket" />

                    <ticket-time-spent :time-spent="timeSpent" :unique-id="uniqueId" :booked="booked" :start-and-end-times-array="startAndEndTimesArray" />
                </div>
            </div>
        </div>

        <ticket-error-messages :time-spent="timeSpent" :assigned-to-ticket="assignedToTicket" />

        <b-collapse :id="`selected-task-${uniqueId}`" visible class="selected-ticket__content">
            <ticket-comment :unique-id="uniqueId" :task-worklog-comment="taskWorklogComment" :booked="booked" />
        </b-collapse>
        <ticket-height-toggler :unique-id="uniqueId" />
    </div>
</template>

<script>
    import _ from "lodash";
    import { mapState, mapMutations, mapActions } from 'vuex';
    import { Edit2Icon, SaveIcon } from 'vue-feather-icons';
    import { BCollapse } from "bootstrap-vue";
    import TicketAssignment from "~/components/main/tasks/task/TicketAssignment";
    import TicketDeletion from "~/components/main/tasks/task/TicketDeletion";
    import TicketComment from "~/components/main/tasks/task/TicketComment";
    import TicketErrorMessages from "~/components/main/tasks/task/TicketErrorMessages";
    import PushSingleTask from "~/components/main/tasks/task/PushSingleTask";
    import TicketTimeSpent from "~/components/main/tasks/task/TicketTimeSpent";
    import TicketPlayAndPause from "~/components/main/tasks/task/TicketPlayAndPause";
    import TicketHeightToggler from "~/components/main/tasks/task/TicketHeightToggler";
    import Vue from 'vue';
    import vClickOutside from 'v-click-outside';
    Vue.use(vClickOutside);


    export default {
        name: "SelectedTask",
        components: {
            // standard components
            TicketHeightToggler,
            TicketPlayAndPause,
            TicketTimeSpent,
            TicketErrorMessages,
            TicketComment,
            TicketDeletion,
            TicketAssignment,
            PushSingleTask,

            // vue feather icon components
            SaveIcon, Edit2Icon,

            // vue bootstrap components
            BCollapse
        },
        directives: { 'b-collapse': BCollapse },
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
            }
        },
        data() {
            return {
                editingName: false,
                localEditedName: '',
                initialTimeSpent: 0, // todo
                startAndEndTimes: [] // todo
            };
        },
        computed: {
            ...mapState({
                isTimerActive: state => state.moduleUser.isTimerActive,
                activeTicket: state => state.moduleUser.activeTicket,
                editingCustomTask: state => state.moduleTask.editingCustomTask,
                showUnbookedTasksNotOfTheDay: state => state.moduleTask.showUnbookedTasksNotOfTheDay
            }),
            flexDirection () {
                return `flex-${this.$mq === 'sm' ? 'column' : 'row'}`
            }
        },
        methods: {
            ...mapMutations({
                // saveToTasksStartAndEndTimeArray: 'moduleUser/saveToTasksStartAndEndTimeArray', // todo!
                assignNameToCustomTask: 'moduleTask/assignNameToCustomTask',
                updateEditingCustomTask: 'moduleTask/updateEditingCustomTask'
            }),
            ...mapActions({
                saveSelectedTasksToStorage: 'moduleTask/saveSelectedTasksToStorage'
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
            }
        }
    }
</script>
