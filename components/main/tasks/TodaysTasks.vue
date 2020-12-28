<template>
    <div>
        <div v-if="tasksOfTheDay.length !== 0 && !showUnbookedTasksNotOfTheDay"> <!-- todo -->
            <ul>
                <li>
                    <draggable v-model="tasksOfTheDay" :disabled="isTimerActive">
                        <SelectedTask
                            v-for="selectedTask in tasksOfTheDay"
                            :key="selectedTask.uniqueId"
                            :taskKey="selectedTask.key"
                            :taskDirectLink="selectedTask.assignedToTicket ? selectedTask.issueLink : ''"
                            :taskSummary="selectedTask.assignedToTicket ? selectedTask.summary : ''"
                            :taskWorklogComment="selectedTask.comment"
                            :timeSpent="selectedTask.timeSpent"
                            :startedAt="selectedTask.startTime"
                            :endedAt="selectedTask.endTime"
                            :assigned-to-ticket="selectedTask.assignedToTicket"
                            :booked="selectedTask.booked"
                            :uniqueId="selectedTask.uniqueId"
                            :start-and-end-times-array="selectedTask.startAndEndTimesArray"
                        />
                    </draggable>
                </li>
            </ul>
        </div>
        <div v-else-if="!tasksOfTheDay.length && !showUnbookedTasksNotOfTheDay">There are no selected issues</div> <!-- todo -->
        <div v-if="showErrorMessages && (tasksOfTheDay.length === 0)" class="message--error">No selected issues</div>
    </div>
</template>

<script>
    import { mapActions, mapGetters, mapMutations, mapState } from "vuex";
    import draggable from 'vuedraggable';

    export default {
		name: "TodaysTasks",
        props: {
            tasksNotOfTheDay: {
                required: true
            }
        },
        components: {
            // added prefetch directive for webpack for case: adding a custom task w/ no network connection & no selectedTasks
            SelectedTask: () => import(/* webpackPrefetch: true */ '~/components/main/tasks/task/SelectedTask'),
            draggable
        },
        computed: {
            ...mapState({
                selectedTasks: state => state.moduleTask.selectedTasks,
                showErrorMessages: state => state.moduleTask.showErrorMessages,
                isTimerActive: state => state.moduleUser.isTimerActive,
                currentDay: state => state.moduleUser.currentDay,
                showAllSelectedTasksOfCurrentDay: state => state.moduleTask.showAllSelectedTasksOfCurrentDay,
                showUnbookedTasksNotOfTheDay: state => state.moduleTask.showUnbookedTasksNotOfTheDay
            }),
            ...mapGetters({
                getSelectedTasksWithDayIndicator: 'moduleTask/getSelectedTasksWithDayIndicator',
                getSelectedTasksWithoutDayIndicator: 'moduleTask/getSelectedTasksWithoutDayIndicator'
            }),
            tasksOfTheDayBooked () {
                return this.getSelectedTasksWithDayIndicator.filter((__task) => __task.dayAdded === this.currentDay).filter((__task) => __task.booked); // todo
            },
            tasksOfTheDay: {
                // 'dayAdded' needs to match the currentDay set in vuex store via nuxtServerInit
                //  not all selectedTasks will have the field dayAdded as this field was added later on
                get () {
                    // booked & non-booked of the day
                    if (this.showAllSelectedTasksOfCurrentDay) {
                        return this.getSelectedTasksWithDayIndicator.filter((__task) => __task.dayAdded === this.currentDay); // todo
                    } else {
                        // only non-booked of the day
                        return this.getSelectedTasksWithDayIndicator.filter((__task) => !__task.booked).filter((__task) => __task.dayAdded === this.currentDay); // todo
                    }
                },
                set (value) {
                    if (!this.isTimerActive) {
                        let __selectedTasks;
                        if (this.showAllSelectedTasksOfCurrentDay) {
                            // tasks today booked & unbooked  +  tasks not today w/ indicator  +  tasks not today w/ no indicator
                            __selectedTasks = [...value, ...this.tasksNotOfTheDay, ...this.getSelectedTasksWithoutDayIndicator];
                        } else {
                            // today & booked  +  today & non-booked  +  not today & booked & non-booked   +  tasks not today w/ no indicator
                            __selectedTasks = [...value, ...this.tasksOfTheDayBooked, ...this.tasksNotOfTheDay, ...this.getSelectedTasksWithoutDayIndicator];
                        }

                        // set vuex store state
                        this.setSelectedTasks(__selectedTasks);

                        // todo
                        // synchronize localStorage & vuex store state
                        this.saveSelectedTasksToStorage();
                    }
                }
            }
        },
        methods: {
            ...mapMutations({
                setSelectedTasks: 'moduleTask/setSelectedTasks'
            }),
            ...mapActions({
                saveSelectedTasksToStorage: 'moduleTask/saveSelectedTasksToStorage'
            })
        }
	}
</script>
