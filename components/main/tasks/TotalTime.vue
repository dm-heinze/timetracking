<template>
    <span
        :class="{
            'mr-3': $mq !== 'sm',
            'align-self-center': $mq === 'sm'
        }"
    >
        worked so far: <span class="font-weight-bold">{{ totalTime }}</span>
    </span>
</template>

<script>
	import _ from "lodash";
    import { mapGetters, mapState } from 'vuex';

    export default {
		name: "TotalTime",
        computed: {
            ...mapState({
                selectedTasks: state => state.moduleTask.selectedTasks, // todo
                showAllSelectedTasksOfCurrentDay: state => state.moduleTask.showAllSelectedTasksOfCurrentDay,
                currentDay: state => state.moduleUser.currentDay
            }),
            ...mapGetters({
                getSelectedTasksWithDayIndicator: 'moduleTask/getSelectedTasksWithDayIndicator'
            }),
            tasksOfTheDay () { // todo: getter 'getSelectedTasksOfCurrentDay'
                return this.getSelectedTasksWithDayIndicator.filter((__selectedTasksWithDayIndicator) => __selectedTasksWithDayIndicator.dayAdded === this.currentDay);
            },
            totalTime() { // todo
                let sumOfWorkedTime = 0;
                if (this.tasksOfTheDay.length) {
                    const __selectedTasks = _.cloneDeep(this.tasksOfTheDay);

                    let selectedTasksTimes;
                    if (!this.showAllSelectedTasksOfCurrentDay) {
                        selectedTasksTimes = __selectedTasks
                            .filter((__selected) => !__selected.booked)
                            .filter((__nonBooked) => __nonBooked.timeSpent !== '0' && __nonBooked.timeSpent !== '')
                            .map((__selectedTask) => Number.parseInt(__selectedTask.timeSpent))
                    } else {
                        // todo
                        selectedTasksTimes = __selectedTasks
                            .filter((__nonBooked) => __nonBooked.timeSpent !== '0' && __nonBooked.timeSpent !== '')
                            .map((__selectedTask) => Number.parseInt(__selectedTask.timeSpent))
                    }

                    for (let timeSpentOnIndividualSelectedTask of selectedTasksTimes) {
                        sumOfWorkedTime += timeSpentOnIndividualSelectedTask
                    }
                }

                // sumOfWorkedTime added as milliseconds bc timeSpent val was saved as milliseconds
                const dateFromTotalWorkTime = new Date(0, 0, 0, 0, 0,0, sumOfWorkedTime);  // todo

                return dateFromTotalWorkTime.toTimeString().slice(0, 8); // remove any non-time related information
            }
        }
	}
</script>
