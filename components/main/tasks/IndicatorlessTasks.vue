<template>
    <b-modal
        :id="'confirm-push-time-indicatorless-tasks'"
        centered
        no-close-on-backdrop
        no-close-on-esc
        tall
        :visible="showUnbookedTasksLeftModal && updateMessageShown"
    >
        <template v-slot:modal-header="{ close }">
            <div class="d-flex justify-content-between align-items-center w-100 modal__top-bar">
                <h3 class="primary">Push Time?</h3>
            </div>
        </template>
        <template v-slot:default>
            <div class="modal__main-container">
                <div class="modal__main-container__main-text">
                    <div class="font-weight-bold">You have unbooked tasks</div>
                    <div>
                        <div>You can remove them or otherwise the tasks will be booked for the current day. You can adjust the booking manually afterwards.</div>
                        <div
                            class="font-weight-bold custom-tasks-available pt-4"
                            v-if="hasCustomTasks.length"
                        >
                            You have custom tasks that need to get booked and removed manually.
                        </div>
                    </div>
                </div>

                <b-list-group>
                    <b-list-group-item
                        v-for="task in doesNotHaveFieldDayAdded"
                        :key="task.uniqueId"
                        class="d-flex justify-content-between align-items-start pt-4"
                    >
                        <div class="ticket__info col-10">
                            <span class="ticket__info__key font-weight-bold d-flex align-items-start">
                                {{ task.key }}
                                <b-badge v-if="!task.assignedToTicket" variant="warning" class="ml-2 px-2 mt-1">Custom Task</b-badge>
                            </span>
                            <div class="ticket__info__summary text-truncate">{{ task.summary }}</div>
                            <div class="d-flex flex-row align-items-center">
                                <div v-if="!editingTrackedTime || (editingTrackedTime && (currentEditedTasksUniqueId !== task.uniqueId))">
                                    {{ parsedTimeSpent(task.timeSpent) }}
                                </div>

                                <input
                                    v-else
                                    type="time"
                                    step="1"
                                    :value="parsedTimeSpent(task.timeSpent)"
                                    @input="saveEditedWorklogTimeSpent"
                                    @keyup.enter.prevent="activateEditModeForTrackedTime"
                                >

                                <button
                                    class="btn--edit"
                                    @click.prevent="activateEditModeForTrackedTime(task.uniqueId)"
                                    :disabled="editingTrackedTime && (currentEditedTasksUniqueId !== task.uniqueId)"
                                    v-if="task.assignedToTicket"
                                >
                                    <edit2-icon v-if="!editingTrackedTime || (editingTrackedTime && (currentEditedTasksUniqueId !== task.uniqueId))" />
                                    <check-icon v-else-if="editingTrackedTime && (currentEditedTasksUniqueId === task.uniqueId)" />
                                </button>
                            </div>
                            <textarea rows="2" class="mt-2" :value="task.comment" @input="saveCommentToStore" :disabled="task.booked || !task.assignedToTicket" :name="task.uniqueId"></textarea>
                        </div>

                        <div class="ticket__actions">
                            <trash2-icon
                                class="ticket__icon align-self-center ticket__icon--selectable"
                                @click="removeFromDoesNotHaveFieldDayAdded({ uniqueIdOfTaskToDelete: task.uniqueId })"
                            />
                        </div>
                    </b-list-group-item>
                </b-list-group>
            </div>
        </template>
        <template v-slot:modal-footer="{ ok, cancel }">
            <div class="d-flex justify-content-end w-100 modal__actions">
                <b-button
                    pill
                    variant="primary"
                    class="font-weight-bold modal__save-btn"
                    @click.prevent="saveWorklogs()"
                    :disabled="!!hasCustomTasks.length"
                >
                    Push Time
                </b-button>
            </div>
        </template>
    </b-modal>
</template>

<script>
    import { mapState, mapMutations, mapActions } from 'vuex';
    import { Trash2Icon, XIcon, Edit2Icon, CheckIcon } from 'vue-feather-icons';
    import { BBadge, BListGroup, BListGroupItem } from 'bootstrap-vue';
    import _ from "lodash";

	export default {
		name: "IndicatorlessTasks",
        components: {
		    Trash2Icon, XIcon, Edit2Icon, CheckIcon,
            BBadge, BListGroup, BListGroupItem
        },
        data() {
            return {
                editingTrackedTime: false, // todo
                currentEditedTasksUniqueId: ''
            }
        },
        directives: { 'b-list-group': BListGroup, 'b-list-group-item': BListGroupItem },
        computed: {
            ...mapState({
                doesNotHaveFieldDayAdded: state => state.moduleUpdate.doesNotHaveFieldDayAdded,
                showUnbookedTasksLeftModal: state => state.moduleUpdate.showUnbookedTasksLeftModal,
                updateMessageShown: state => state.moduleUpdate.updateMessageShown
            }),
            hasCustomTasks () {
                return this.doesNotHaveFieldDayAdded.filter((__task) => !__task.assignedToTicket);
            }
        },
        methods: {
            ...mapActions({
                requestSavingPreviousWorklogs: 'moduleUpdate/requestSavingPreviousWorklogs',
                saveSelectedTasksToStorage: 'moduleTask/saveSelectedTasksToStorage'
            }),
            ...mapMutations({
                removeFromDoesNotHaveFieldDayAdded: 'moduleUpdate/removeFromDoesNotHaveFieldDayAdded',
                saveTimeSpentOnDoesNotHaveFieldDayAddedTask: 'moduleUpdate/saveTimeSpentOnDoesNotHaveFieldDayAddedTask',
                saveTaskComment: 'moduleTask/saveTaskComment',
                saveCommentOfDoesNotHaveFieldDayAddedTask: 'moduleUpdate/saveCommentOfDoesNotHaveFieldDayAddedTask'
            }),
            saveCommentToStore: _.debounce(function (event) {
                this.saveCommentOfDoesNotHaveFieldDayAddedTask({ uniqueId: event.target.name, comment: event.target.value }); // update vuex store

                this.saveSelectedTasksToStorage(); // bc array elements of doesNotHaveFieldDayAdded still are part of selectedTasks
            }, 1000),
            parsedTimeSpent (timespent) {
                const helperDate = new Date();

                // timeSpent is saved in milliseconds to the localStorage
                // Date object used to automatically get the correct calculation for the hh:mm:ss representation of milliseconds value
                const dateFromTimeSpentValue = new Date(helperDate.getFullYear(), helperDate.getMonth(), helperDate.getDate(), 0, 0,0, timespent);

                const dateFromTimeSpentValueTimeTimeString =  dateFromTimeSpentValue.toTimeString();

                // remove the date portion
                return dateFromTimeSpentValueTimeTimeString.slice(0, 8);
            },
            saveEditedWorklogTimeSpent: _.debounce(function (event) {
                const editedTimeSpent = event.target.value; // received val may be string of shape hh:mm or hh:mm:ss

                let editedTimeSpentTimeStringArray = editedTimeSpent.split(":");

                const helperDate = new Date();

                // if milliseconds === 00, then the received event.target.value is of shape hh:mm only
                editedTimeSpentTimeStringArray[2] = Number(editedTimeSpentTimeStringArray[2]) ? Number(editedTimeSpentTimeStringArray[2]) : 0;

                const dateFromParsedStartTime = new Date(helperDate.getFullYear(), helperDate.getMonth(), helperDate.getDate(), 0, 0, 0, 0); // todo: rename dateFromParsedStartTime

                const dateFromEditedTimeSpentTimeStringArray = new Date(helperDate.getFullYear(), helperDate.getMonth(), helperDate.getDate(), editedTimeSpentTimeStringArray[0], editedTimeSpentTimeStringArray[1], editedTimeSpentTimeStringArray[2], 0);

                // update state & vuex store & localStorage
                this.saveTimeSpentOnDoesNotHaveFieldDayAddedTask({ uniqueId: this.currentEditedTasksUniqueId, timeSpent: dateFromEditedTimeSpentTimeStringArray.getTime() - dateFromParsedStartTime.getTime() }); // todo: rename dateFromParsedStartTime
                this.saveSelectedTasksToStorage(); // todo
            }, 0), // todo
            activateEditModeForTrackedTime: function (idOfTask) {
                this.editingTrackedTime = !this.editingTrackedTime;
                if (this.editingTrackedTime) this.currentEditedTasksUniqueId = idOfTask;
                if (!this.editingTrackedTime) this.currentEditedTasksUniqueId = '';
            },
            saveWorklogs: function () {
                this.$bvModal.hide('confirm-push-time-indicatorless-tasks'); // any cancel event needed?

                // make API request to book each task
                this.requestSavingPreviousWorklogs()
                    .then(() => {
                        this.$bvModal.msgBoxOk('Worklogs were successfully booked', {
                            centered: true,
                            okVariant: 'success rounded-pill',
                            okTitle: 'Okay',
                            bodyClass: 'modal__main-container',
                            footerClass: 'modal__main-container modal__actions modal__feedback__footer'
                        })
                    })
                    .catch((err) => {
                        if (err.response && (err.response.status === 401)) {
                            this.$bvModal.msgBoxOk('The session has expired. Booking was not successful!', {
                                centered: true,
                                okVariant: 'danger rounded-pill',
                                okTitle: 'Okay',
                                bodyClass: 'modal__main-container',
                                footerClass: 'modal__main-container modal__actions modal__feedback__footer'
                            }).then(() => {
                                this.$router.push('/customer/login')
                            })
                        } else {
                            this.$bvModal.msgBoxOk('There has been an error. Booking was not successful!', {
                                centered: true,
                                okVariant: 'danger rounded-pill',
                                okTitle: 'Okay',
                                bodyClass: 'modal__main-container',
                                footerClass: 'modal__main-container modal__actions modal__feedback__footer'
                            })
                        }
                    });
            }
        }
    }
</script>
