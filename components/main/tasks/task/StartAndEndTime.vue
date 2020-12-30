<template>
    <div class="d-flex time-slot-item">
        <div v-if="!editingTimeSlot">{{ startTime }} - {{ endTime }} = {{ duration }}</div>
        <div v-else class="selected-ticket__tracked-time__editing pl-2">
            <input
                type="time"
                step="1"
                :value="startTime"
                @input="saveEditedStartTime"
                @keyup.enter.prevent="activateEditModeForTimeSlots"
            >
            -
            <input
                type="time"
                step="1"
                :value="endTime"
                @input="saveEditedEndTime"
                @keyup.enter.prevent="activateEditModeForTimeSlots"
            >
            =
            <input
                type="time"
                step="1"
                :value="duration"
                @input="saveEditedDuration"
                @keyup.enter.prevent="activateEditModeForTimeSlots"
            >
        </div>
        <button
            v-if="!booked"
            class="btn--edit"
            :disabled="(isTimerActive && (activeTicket === uniqueId))"
            @click.prevent="activateEditModeForTimeSlots"
        >
            <edit2-icon v-if="!editingTimeSlot" />
            <check-icon v-else />
        </button>
    </div>
</template>

<script>
    import _ from "lodash";
    import { Edit2Icon, CheckIcon } from "vue-feather-icons";
	import { mapState, mapMutations, mapActions } from "vuex";

    export default {
		name: "StartAndEndTime",
        components: { CheckIcon, Edit2Icon },
        props: {
            booked: {
                required: true
            },
            uniqueId: { // which selectedTask this time slot belongs to
                required: true
            },
            id: { // position in startAndEndTimesArray - "which time slot"
                required: true
            },
            startTime: {
                required: true
            },
            endTime: {
                required: true
            },
            duration: { // todo
                required: true
            },
            durationInMilliSeconds: {
                required: true
            }
        },
        data() {
            return {
                editingTimeSlot: false
            }
        },
        computed: {
            ...mapState({
                isTimerActive: state => state.moduleUser.isTimerActive,
                activeTicket: state => state.moduleUser.activeTicket
            })
        },
        methods: {
            ...mapMutations({
                saveUpdatedStartTime: 'moduleTask/saveUpdatedStartTime',
                saveUpdatedEndTime: 'moduleTask/saveUpdatedEndTime',
                saveUpdatedDuration: 'moduleTask/saveUpdatedDuration',
                updateTimeSpentOnTask: 'moduleTask/updateTimeSpentOnTask'
            }),
            ...mapActions({
                saveSelectedTasksToStorage: 'moduleTask/saveSelectedTasksToStorage'
            }),
            activateEditModeForTimeSlots: function () {
                this.editingTimeSlot = !this.editingTimeSlot;
            },
            saveEditedStartTime: _.debounce(function (event) {
                // step 1: transform entered value for startTime & existing endTime value each into an array
                // -> goal: to use them for the calculation of the resulting duration
                const __updatedStartTime = event.target.value;
                const __updatedStartTimeAsArray = __updatedStartTime.split(":");

                const __endTimeAsArray = this.endTime.split(":");


                // use Date object to create a helper that automatically calculates valid time values
                const __helperDate = new Date();

                const __endTimeAsDate = new Date(
                    __helperDate.getFullYear(),
                    __helperDate.getMonth(),
                    __helperDate.getDate(),
                    Number(__endTimeAsArray[0]), // hours
                    Number(__endTimeAsArray[1]), // minutes
                    __endTimeAsArray[2] ? Number(__endTimeAsArray[2]) : 0, // position only available if seconds has non-zero val
                0
                )

                const __updatedStartTimeAsDate = new Date(
                    __helperDate.getFullYear(),
                    __helperDate.getMonth(),
                    __helperDate.getDate(),
                    Number(__updatedStartTimeAsArray[0]), // hours
                    Number(__updatedStartTimeAsArray[1]), // minutes
                    __updatedStartTimeAsArray[2] ? Number(__updatedStartTimeAsArray[2]) : 0, // position only available if seconds has non-zero val
                0
                )


                const __resultingDuration = __endTimeAsDate.getTime() - __updatedStartTimeAsDate.getTime();

                const __resultingDurationAsDate = new Date(
                    __helperDate.getFullYear(),
                    __helperDate.getMonth(),
                    __helperDate.getDate(),
                    0,
                    0,
                    0,
                    __resultingDuration // milliseconds
                )


                // update vuex store
                this.saveUpdatedStartTime({
                    uniqueId: this.uniqueId,
                    id: this.id,
                    updatedStartTime: __updatedStartTimeAsDate.toTimeString().slice(0,8)
                })

                // todo
                // duration should not be updated if there was no endTime
                if (this.endTime !== '00:00:00') {
                    this.saveUpdatedDuration({
                        uniqueId: this.uniqueId,
                        id: this.id,
                        updatedDuration: __resultingDurationAsDate.toTimeString().slice(0,8),
                        updatedDurationInMilliSeconds: __resultingDuration
                    })

                    this.updateTimeSpentOnTask({ uniqueId: this.uniqueId }); // todo
                }

                // update localStorage
                this.saveSelectedTasksToStorage();
            }, 1100),
            saveEditedEndTime: _.debounce(function (event) {
                const __updatedEndTime = event.target.value;
                const __updatedEndTimeAsArray = __updatedEndTime.split(":");

                const __startTimeAsArray = this.startTime.split(":");


                // transforming time values into date format
                // so .getTime() can be used to calculate the resulting duration time in milliseconds
                const __helperDate = new Date();

                const __updatedEndTimeAsDate = new Date(
                    __helperDate.getFullYear(),
                    __helperDate.getMonth(),
                    __helperDate.getDate(),
                    Number(__updatedEndTimeAsArray[0]), // hours
                    Number(__updatedEndTimeAsArray[1]), // minutes
                    __updatedEndTimeAsArray[2] ? Number(__updatedEndTimeAsArray[2]) : 0, // position only available if seconds has non-zero val
                0
                )

                const __startTimeAsDate = new Date(
                    __helperDate.getFullYear(),
                    __helperDate.getMonth(),
                    __helperDate.getDate(),
                    Number(__startTimeAsArray[0]), // hours
                    Number(__startTimeAsArray[1]), // minutes
                    __startTimeAsArray[2] ? Number(__startTimeAsArray[2]) : 0, // position only available if seconds has non-zero val
                0
                )


                const __resultingDuration = __updatedEndTimeAsDate.getTime() - __startTimeAsDate.getTime();

                const __resultingDurationAsDate = new Date(
                    __helperDate.getFullYear(),
                    __helperDate.getMonth(),
                    __helperDate.getDate(),
                    0,
                    0,
                    0,
                    __resultingDuration // milliseconds
                )


                // update vuex store
                this.saveUpdatedEndTime({
                    uniqueId: this.uniqueId,
                    id: this.id,
                    updatedEndTime: __updatedEndTimeAsDate.toTimeString().slice(0,8)
                })

                // if the startTime does not exist the duration should not be updated but the startTime should be calculated & updated
                if (this.startTime !== '00:00:00') {
                    this.saveUpdatedDuration({
                        uniqueId: this.uniqueId,
                        id: this.id,
                        updatedDuration: __resultingDurationAsDate.toTimeString().slice(0,8),
                        updatedDurationInMilliSeconds: __resultingDuration
                    })

                    this.updateTimeSpentOnTask({ uniqueId: this.uniqueId }); // todo
                }

                if (this.startTime === '00:00:00') {
                    // todo the startTime should be calculated & updated (if there's a duration)

                    const __durationAsArray = this.duration.split(":");

                    // [ updatedEnd - duration = start ]  17:40:00 - 00:40:00 = 17:00:00 -> [ start - end = duration ]  17:00:00 - 17:40:00 = 00:40:00
                    const __durationAsDate = new Date(
                        __helperDate.getFullYear(),
                        __helperDate.getMonth(),
                        __helperDate.getDate(),
                        Number(__durationAsArray[0]), // hours
                        Number(__durationAsArray[1]), // minutes
                        __durationAsArray[2] ? Number(__durationAsArray[2]) : 0, // position only available if seconds has non-zero val
                        0
                    )

                    const __resultingStartTimeInMilliseconds = __updatedEndTimeAsDate.getTime() - __durationAsDate.getTime();

                    const __resultingStartTimeAsDate = new Date(
                        __helperDate.getFullYear(),
                        __helperDate.getMonth(),
                        __helperDate.getDate(),
                        0,
                        0,
                        0,
                        __resultingStartTimeInMilliseconds // milliseconds
                    )

                    this.saveUpdatedStartTime({
                        uniqueId: this.uniqueId,
                        id: this.id,
                        updatedStartTime: __resultingStartTimeAsDate.toTimeString().slice(0,8)
                    })
                }

                // update localStorage
                this.saveSelectedTasksToStorage();
            }, 1100),
            saveEditedDuration: _.debounce(function (event) {
                const __updatedTimeSpent = event.target.value;
                const __updatedTimeSpentAsArray = __updatedTimeSpent.split(":");

                const __startTimeAsArray = this.startTime.split(":");

                // todo
                __updatedTimeSpentAsArray[2] = __updatedTimeSpentAsArray[2] ? Number(__updatedTimeSpentAsArray[2]) : 0;
                __startTimeAsArray[2] = __startTimeAsArray[2] ? Number(__startTimeAsArray[2]) : 0;


                const __resultingEndTimeAsArray = _.zipWith(__updatedTimeSpentAsArray, __startTimeAsArray, (duration, start) => Number(duration) + Number(start));


                const __helperDate = new Date();

                const __updatedDurationAsDate = new Date(
                    __helperDate.getFullYear(),
                    __helperDate.getMonth(),
                    __helperDate.getDate(),
                    Number(__updatedTimeSpentAsArray[0]), // hours
                    Number(__updatedTimeSpentAsArray[1]), // minutes
                    __updatedTimeSpentAsArray[2], // seconds position only available if seconds has non-zero val
                    0
                )

                const __resultingEndTimeAsDate = new Date(
                    __helperDate.getFullYear(),
                    __helperDate.getMonth(),
                    __helperDate.getDate(),
                    Number(__resultingEndTimeAsArray[0]), // hours
                    Number(__resultingEndTimeAsArray[1]), // minutes
                    __resultingEndTimeAsArray[2], // seconds
                0
                )

                const __helper = new Date(
                    __helperDate.getFullYear(),
                    __helperDate.getMonth(),
                    __helperDate.getDate(),
                    0,
                    0, // minutes
                    0,
                    0
                )

                const __durationInMilliSeconds = __updatedDurationAsDate.getTime() -  __helper.getTime(); // todo

                // update vuex store
                // todo
                // endTime should not be updated when there was no startTime
                if (this.startTime !== '00:00:00') {
                    this.saveUpdatedEndTime({
                        uniqueId: this.uniqueId,
                        id: this.id,
                        updatedEndTime: __resultingEndTimeAsDate.toTimeString().slice(0,8)
                    })
                }

                this.saveUpdatedDuration({
                    uniqueId: this.uniqueId,
                    id: this.id,
                    updatedDuration: __updatedDurationAsDate.toTimeString().slice(0,8),
                    updatedDurationInMilliSeconds: __durationInMilliSeconds
                })

                this.updateTimeSpentOnTask({ uniqueId: this.uniqueId });

                // update localStorage
                this.saveSelectedTasksToStorage();
            }, 1100)
        }
	}
</script>
