<template>
    <div class="selected-ticket__tracked-time d-flex align-items-center justify-content-between">
        <div class="font-weight-bold pr-1">Total:</div>
        <div v-if="!editingTrackedTime" class="selected-ticket__tracked-time__displayed">{{ parsedTimeSpent }}</div>
        <div v-else class="selected-ticket__tracked-time__editing pl-2">
            <input
                type="time"
                step="1"
                :value="parsedTimeSpent"
                @input="saveEditedWorklogTimeSpent"
                @keyup.enter.prevent="activateEditModeForTrackedTime"
            >
        </div>
        <button
            v-if="!booked && !ofTypeBreak"
            class="btn--edit"
            :disabled="(isTimerActive && (activeTicket === uniqueId)) || (showStartAndEndTimes && (startAndEndTimesArray.length !== 0))"
            @click.prevent="activateEditModeForTrackedTime"
        >
            <edit2-icon v-if="!editingTrackedTime" />
            <check-icon v-else />
        </button>
    </div>
</template>

<script>
	import _ from "lodash";
    import { mapState, mapMutations, mapActions } from 'vuex';
    import { Edit2Icon, CheckIcon } from "vue-feather-icons";

    export default {
		name: "TicketTimeSpent",
        components: {
            CheckIcon, Edit2Icon
        },
        props: {
            timeSpent: {
                required: true
            },
            uniqueId: {
                required: true
            },
            booked: {
                required: true
            },
            ofTypeBreak: {
                type: Boolean,
                required: false,
                default: false
            },
            startAndEndTimesArray: {
                required: false,
                default: () => []
            }
        },
        data() {
            return {
                editingTrackedTime: false
            }
		},
        computed: {
            ...mapState({
                isTimerActive: state => state.moduleUser.isTimerActive,
                activeTicket: state => state.moduleUser.activeTicket,
                showStartAndEndTimes: state => state.moduleTask.showStartAndEndTimes
            }),
            parsedTimeSpent () {
                const helperDate = new Date();

                // timeSpent is saved in milliseconds to the localStorage
                // Date object used to automatically get the correct calculation for the hh:mm:ss representation of milliseconds value
                const dateFromTimeSpentValue = new Date(helperDate.getFullYear(), helperDate.getMonth(), helperDate.getDate(), 0, 0,0, this.timeSpent);

                const dateFromTimeSpentValueTimeTimeString =  dateFromTimeSpentValue.toTimeString();

                // remove the date portion
                return dateFromTimeSpentValueTimeTimeString.slice(0, 8);
            }
        },
        methods: {
            ...mapMutations({
                saveTimeSpentOnTask: 'moduleTask/saveTimeSpentOnTask',
                saveToTaskStartAndEndArray: 'moduleTask/saveToTaskStartAndEndArray'
            }),
            ...mapActions({
                saveSelectedTasksToStorage: 'moduleTask/saveSelectedTasksToStorage'
            }),
            saveEditedWorklogTimeSpent: _.debounce(function (event) {
                const editedTimeSpent = event.target.value; // received val may be string of shape hh:mm or hh:mm:ss

                let editedTimeSpentTimeStringArray = editedTimeSpent.split(":");

                const helperDate = new Date();

                // if milliseconds === 00, then the received event.target.value is of shape hh:mm only
                editedTimeSpentTimeStringArray[2] = Number(editedTimeSpentTimeStringArray[2]) ? Number(editedTimeSpentTimeStringArray[2]) : 0;

                const dateFromParsedStartTime = new Date(helperDate.getFullYear(), helperDate.getMonth(), helperDate.getDate(), 0, 0, 0, 0); // todo: rename dateFromParsedStartTime

                const dateFromEditedTimeSpentTimeStringArray = new Date(helperDate.getFullYear(), helperDate.getMonth(), helperDate.getDate(), editedTimeSpentTimeStringArray[0], editedTimeSpentTimeStringArray[1], editedTimeSpentTimeStringArray[2], 0);


                if (this.showStartAndEndTimes) {
                    // if timeSpent === 0 add it to the startAndEndTimesArray as the first element so after any time slot edits, the val can be retained
                    if (!this.timeSpent) {
                        this.saveToTaskStartAndEndArray({
                            uniqueId: this.uniqueId,
                            entryToAdd: {
                                startTime: "00:00:00",
                                endTime: "00:00:00",
                                duration: dateFromEditedTimeSpentTimeStringArray.toTimeString().slice(0, 8),
                                durationInMilliSeconds: dateFromEditedTimeSpentTimeStringArray.getTime() - dateFromParsedStartTime.getTime(), // todo
                                id: _.now()
                            }
                        });
                    }
                }

                // update state & vuex store & localStorage
                this.saveTimeSpentOnTask({ uniqueId: this.uniqueId, timeSpent: dateFromEditedTimeSpentTimeStringArray.getTime() - dateFromParsedStartTime.getTime() }); // todo: rename dateFromParsedStartTime
                this.saveSelectedTasksToStorage();
            }, 1000),
            activateEditModeForTrackedTime: function () {
                this.editingTrackedTime = !this.editingTrackedTime;
            }
        }
	}
</script>
