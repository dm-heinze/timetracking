<template>
    <div>
        <textarea
            rows="4"
            :value="taskWorklogComment"
            @input="saveCommentToStore"
            :disabled="booked"
        ></textarea>
        <div v-if="showErrorMessages && !taskWorklogComment" class="message--error">No Comment</div>
    </div>
</template>

<script>
    import { mapState, mapMutations, mapActions } from 'vuex';

	export default {
		name: "TicketComment",
        props: {
            taskWorklogComment: {
                type: String,
                required: true
            },
            uniqueId: {
                required: true
            },
            booked: {
                required: true
            }
        },
        computed: {
            ...mapState({
                showErrorMessages: state => state.moduleTask.showErrorMessages
            })
		},
        methods: {
            ...mapMutations({
                saveTaskComment: 'moduleTask/saveTaskComment'
            }),
            ...mapActions({
                saveSelectedTasksToStorage: 'moduleTask/saveSelectedTasksToStorage'
            }),
            saveCommentToStore: function (event) {
                this.saveTaskComment({ uniqueId: this.uniqueId, comment: event.target.value }); // update vuex store
                this.saveSelectedTasksToStorage(); // update localStorage
            }
        }
	}
</script>
