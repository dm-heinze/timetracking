<template>
    <div
        class="d-flex flex-row"
        :class="{
            'justify-content-between': (showErrorMessages && !assignedToTicket && !timeSpent) || (showErrorMessages && !assignedToTicket),
            'justify-content-end': showErrorMessages && !timeSpent && assignedToTicket
        }"
    >
        <div v-if="showErrorMessages && !assignedToTicket" class="message--error">Unassigned Custom Task</div>
        <div v-if="showErrorMessages && !timeSpent" class="message--error">No Tracked Time</div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';

	export default {
		name: "TicketErrorMessages",
        props: {
            timeSpent: {
                required: true
            },
            assignedToTicket: {
                required: true
            }
        },
        computed: {
            ...mapState({
                showErrorMessages: state => state.moduleTask.showErrorMessages
            })
        }
	}
</script>
