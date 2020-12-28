<template>
    <div class="selected-tickets__container">
        <client-only>
            <b-collapse :visible="!onABreak && (accumulatedBreakTime != '00:00:00')" id="breakTask">
                <BreakTask v-if="(accumulatedBreakTime != '00:00:00') && !onABreak" />
            </b-collapse>

            <control-shown-subsets :unbooked-tasks-not-of-the-day="unbookedTasksNotOfTheDay" />

            <todays-tasks :tasks-not-of-the-day="tasksNotOfTheDay" />

            <div v-if="unbookedTasksNotOfTheDay.length && showUnbookedTasksNotOfTheDay"> <!-- todo -->
                <previous-unbooked-tasks :unbooked-tasks-not-of-the-day="unbookedTasksNotOfTheDay" />
            </div>
        </client-only>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapGetters } from 'vuex';
    import { BCollapse } from "bootstrap-vue";
    import ControlShownSubsets from "~/components/main/tasks/ControlShownSubsets";
    import TodaysTasks from "~/components/main/tasks/TodaysTasks";

    export default {
        name: "SelectedTasks",
        components: {
            TodaysTasks,
            ControlShownSubsets,
            BCollapse,
            BreakTask: () => import(/* webpackPrefetch: true */ '~/components/main/tasks/BreakTask'),
            // currently there's no need to prefetch this comp
            // -> bc if there are no unbooked tasks from previous days -> the condition to render this comp will never be met
            PreviousUnbookedTasks: () => import('~/components/main/tasks/PreviousUnbookedTasks')
        },
        directives: { 'b-collapse': BCollapse },
        computed: {
            ...mapState({
                accumulatedBreakTime: state => state.moduleBreak.accumulatedBreakTime,
                onABreak: state => state.moduleBreak.onABreak,
                currentDay: state => state.moduleUser.currentDay,
                showUnbookedTasksNotOfTheDay: state => state.moduleTask.showUnbookedTasksNotOfTheDay
            }),
            ...mapGetters({
                getSelectedTasksWithDayIndicator: 'moduleTask/getSelectedTasksWithDayIndicator'
            }),
            tasksNotOfTheDay () {
                return this.getSelectedTasksWithDayIndicator.filter((__task) => __task.dayAdded !== this.currentDay); // field 'dayAdded' may not exist
            },
            unbookedTasksNotOfTheDay () {
                return this.tasksNotOfTheDay.filter((__task) => !__task.booked);
            }
        },
        methods: {
            ...mapMutations({
                toggleUnbookedTasksNotOfTheDay: 'moduleTask/toggleUnbookedTasksNotOfTheDay'
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
