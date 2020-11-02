<template>
    <div class="selected-tickets__container">
        <div v-if="selectedTasks.length !== 0">
            <ul>
                <li>
                    <SelectedTask
                        v-for="selectedTask in selectedTasks"
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
                </li>
            </ul>
        </div>
        <div v-else>There are no selected issues</div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';

    export default {
        name: "SelectedTasks",
        components: {
            SelectedTask: () => import('./SelectedTask')
        },
        computed: {
            ...mapState({
                selectedTasks: state => state.moduleUser.selectedTasks
            })
        }
    }
</script>
