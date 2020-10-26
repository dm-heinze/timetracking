<template>
    <div class="selected-tickets__container">
        <h4>Selected Tasks</h4>
        <div v-if="selectedTasks.length !== 0">
            <div v-if="totalTime">worked so far: {{ totalTime }}</div>
            <ul>
                <li>
                    <SelectedTask
                        v-for="selectedTask in selectedTasks"
                        :key="selectedTask.key"
                        :taskKey="selectedTask.key"
                        :taskDirectLink="selectedTask.assignedToTicket ? selectedTask.issueLink : ''"
                        :taskSummary="selectedTask.assignedToTicket ? selectedTask.summary : ''"
                        :taskWorklogComment="selectedTask.comment"
                        :timeSpent="selectedTask.timeSpent"
                        :startedAt="selectedTask.startTime"
                        :endedAt="selectedTask.endTime"
                        :assigned-to-ticket="selectedTask.assignedToTicket"
                        :booked="selectedTask.booked"
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
            }),
            totalTime() {
                let sumOfWorkedTime = 0;
                if (this.selectedTasks.length !== 0) {
                    const allSelectedTasksTimes = this.selectedTasks.map((__selectedTask) => {
                        if (__selectedTask.timeSpent !== '0') return __selectedTask.timeSpent;
                    })

                    for (let timeSpentOnIndividualSelectedTask of allSelectedTasksTimes) {
                        sumOfWorkedTime += timeSpentOnIndividualSelectedTask
                    }
                }

                const dateFromTotalWorkTime = new Date(0, 0, 0, 0, 0,0, sumOfWorkedTime);  // todo

                return dateFromTotalWorkTime.toTimeString().slice(0, 8);
            }
        }
    }
</script>
