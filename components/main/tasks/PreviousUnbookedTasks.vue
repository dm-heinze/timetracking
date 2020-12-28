<template>
	<div>
        <div class="previous-day-unbooked-warning font-weight-bold mb-4">
            Any of these unbooked tasks will be booked for the current day if you push. You need to correct the date manually afterwards.
        </div>
        <SelectedTask
            v-for="selectedTask in unbookedTasksNotOfTheDay"
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
    </div>
</template>

<script>
    import SelectedTask from "~/components/main/tasks/task/SelectedTask";

	export default {
		name: "PreviousUnbookedTasks",
        components: {
            SelectedTask
        },
        props: {
            unbookedTasksNotOfTheDay: {
                required: true
            }
        }
	}
</script>
