<template>
    <div class="selected-tickets__container">
        <client-only>
            <b-collapse :visible="!onABreak && (accumulatedBreakTime != '00:00:00')" id="breakTask">
                <BreakTask v-if="(accumulatedBreakTime != '00:00:00') && !onABreak" />
            </b-collapse>

            <div class="toggle-show-all pb-2 d-flex flex-row"> <!-- todo -->
                <toggle-right-icon
                    class="toggle-show-all--show"
                    v-b-tooltip.hover
                    title="Toggle Booked"
                    @click="toggleShowAllSelectedTasksOfCurrentDay()"
                    v-if="showAllSelectedTasksOfCurrentDay"
                />
                <toggle-left-icon
                    class="toggle-show-all--hide"
                    v-b-tooltip.hover
                    title="Toggle Booked"
                    @click="toggleShowAllSelectedTasksOfCurrentDay()"
                    v-else
                />
            </div>

            <div v-if="tasksOfTheDay.length !== 0">
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
            <div v-else>There are no selected issues</div>
            <div v-if="showErrorMessages && (tasksOfTheDay.length === 0)" class="message--error">No selected issues</div>
        </client-only>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters, mapActions } from 'vuex';
    import draggable from 'vuedraggable';
    import { BCollapse } from "bootstrap-vue";
    import { ToggleLeftIcon, ToggleRightIcon } from "vue-feather-icons";

    export default {
        name: "SelectedTasks",
        components: {
            BCollapse,
            BreakTask: () => import(/* webpackPrefetch: true */ '~/components/main/tasks/BreakTask'),
            // added prefetch directive for webpack for case: adding a custom task w/ no network connection & no selectedTasks
            SelectedTask: () => import(/* webpackPrefetch: true */ '~/components/main/tasks/task/SelectedTask'),
            draggable,
            ToggleLeftIcon, ToggleRightIcon
        },
        directives: { 'b-collapse': BCollapse },
        computed: {
            ...mapState({
                selectedTasks: state => state.moduleUser.selectedTasks,
                showErrorMessages: state => state.moduleUser.showErrorMessages,
                isTimerActive: state => state.moduleUser.isTimerActive,
                accumulatedBreakTime: state => state.moduleUser.accumulatedBreakTime,
                onABreak: state => state.moduleUser.onABreak,
                currentDay: state => state.moduleUser.currentDay,
                showAllSelectedTasksOfCurrentDay: state => state.moduleUser.showAllSelectedTasksOfCurrentDay
            }),
            ...mapGetters({
                getSelectedTasksWithDayIndicator: 'moduleUser/getSelectedTasksWithDayIndicator',
                getSelectedTasksWithoutDayIndicator: 'moduleUser/getSelectedTasksWithoutDayIndicator'
            }),
            tasksNotOfTheDay () {
                return this.getSelectedTasksWithDayIndicator.filter((__task) => __task.dayAdded !== this.currentDay); // field 'dayAdded' may not exist
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
                setSelectedTasks: 'moduleUser/setSelectedTasks',
                toggleShowAllSelectedTasksOfCurrentDay: 'moduleUser/toggleShowAllSelectedTasksOfCurrentDay'
            }),
            ...mapActions({
                saveSelectedTasksToStorage: 'moduleUser/saveSelectedTasksToStorage'
            })
        }
    }
</script>
