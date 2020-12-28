<template>
    <div class="selected-tickets__container">
        <client-only>
            <b-collapse :visible="!onABreak && (accumulatedBreakTime != '00:00:00')" id="breakTask">
                <BreakTask v-if="(accumulatedBreakTime != '00:00:00') && !onABreak" />
            </b-collapse>

            <control-shown-subsets :unbooked-tasks-not-of-the-day="unbookedTasksNotOfTheDay" />

            <div v-if="tasksOfTheDay.length !== 0 && !showUnbookedTasksNotOfTheDay">
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
                            />
                        </draggable>
                    </li>
                </ul>
            </div>
            <div v-else-if="!tasksOfTheDay.length && !showUnbookedTasksNotOfTheDay">There are no selected issues</div> <!-- todo -->
            <div v-if="showErrorMessages && (tasksOfTheDay.length === 0)" class="message--error">No selected issues</div>

            <div v-if="unbookedTasksNotOfTheDay.length && showUnbookedTasksNotOfTheDay"> <!-- todo -->
                <previous-unbooked-tasks :unbooked-tasks-not-of-the-day="unbookedTasksNotOfTheDay" />
            </div>
        </client-only>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
    import draggable from 'vuedraggable';
    import { BCollapse } from "bootstrap-vue";
    import ControlShownSubsets from "~/components/main/tasks/ControlShownSubsets";

    export default {
        name: "SelectedTasks",
        components: {
            ControlShownSubsets,
            BCollapse,
            BreakTask: () => import(/* webpackPrefetch: true */ '~/components/main/tasks/BreakTask'),

            // added prefetch directive for webpack for case: adding a custom task w/ no network connection & no selectedTasks
            SelectedTask: () => import(/* webpackPrefetch: true */ '~/components/main/tasks/task/SelectedTask'),
            // currently there's no need to prefetch this comp
            // -> bc if there are no unbooked tasks from previous days -> the condition to render this comp will never be met
            PreviousUnbookedTasks: () => import('~/components/main/tasks/PreviousUnbookedTasks'),
            draggable,
        },
        directives: { 'b-collapse': BCollapse },
        computed: {
            ...mapState({
                selectedTasks: state => state.moduleTask.selectedTasks,
                showErrorMessages: state => state.moduleTask.showErrorMessages,
                isTimerActive: state => state.moduleUser.isTimerActive,
                accumulatedBreakTime: state => state.moduleBreak.accumulatedBreakTime,
                onABreak: state => state.moduleBreak.onABreak,
                currentDay: state => state.moduleUser.currentDay,
                showAllSelectedTasksOfCurrentDay: state => state.moduleTask.showAllSelectedTasksOfCurrentDay,
                showUnbookedTasksNotOfTheDay: state => state.moduleTask.showUnbookedTasksNotOfTheDay
            }),
            ...mapGetters({
                getSelectedTasksWithDayIndicator: 'moduleTask/getSelectedTasksWithDayIndicator',
                getSelectedTasksWithoutDayIndicator: 'moduleTask/getSelectedTasksWithoutDayIndicator'
            }),
            tasksNotOfTheDay () {
                return this.getSelectedTasksWithDayIndicator.filter((__task) => __task.dayAdded !== this.currentDay); // field 'dayAdded' may not exist
            },
            unbookedTasksNotOfTheDay () {
                return this.tasksNotOfTheDay.filter((__task) => !__task.booked);
            },
            tasksOfTheDayBooked () {
                return this.getSelectedTasksWithDayIndicator.filter((__task) => __task.dayAdded === this.currentDay).filter((__task) => __task.booked);
            },
            tasksOfTheDay: {
                // 'dayAdded' needs to match the currentDay set in vuex store via nuxtServerInit
                //  not all selectedTasks will have the field dayAdded as this field was added later on
                get () {
                    // booked & non-booked of the day
                    if (this.showAllSelectedTasksOfCurrentDay) {
                        return this.getSelectedTasksWithDayIndicator.filter((__task) => __task.dayAdded === this.currentDay);
                    } else {
                        // only non-booked of the day
                        return this.getSelectedTasksWithDayIndicator.filter((__task) => !__task.booked).filter((__task) => __task.dayAdded === this.currentDay);
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
                setSelectedTasks: 'moduleTask/setSelectedTasks',
                toggleUnbookedTasksNotOfTheDay: 'moduleTask/toggleUnbookedTasksNotOfTheDay'
            }),
            ...mapActions({
                saveSelectedTasksToStorage: 'moduleTask/saveSelectedTasksToStorage'
            })
        },
        watch: {
            unbookedTasksNotOfTheDay: function (updatedArrayUnbookedTasksNotOfTheDay) { // todo
                if (!updatedArrayUnbookedTasksNotOfTheDay.length) {
                    // when there are no more unbooked tasks left from previous days -> the state should default to 'today'
                    // -> also needed for conditional in 'push all' button
                    if (this.showUnbookedTasksNotOfTheDay) this.toggleUnbookedTasksNotOfTheDay();
                }
            }
        }
    }
</script>
