<template>
	<div>
        <b-collapse :id="`selected-task-${uniqueId}`" visible class="selected-ticket__content">
            <textarea rows="4" :value="taskWorklogComment" @input="saveCommentToStore" :disabled="booked"></textarea>
            <div v-if="showErrorMessages && !taskWorklogComment " class="message--error">No Comment</div>
        </b-collapse>
        <div class="d-flex justify-content-center selected-ticket__toggle-btn">
            <button v-b-toggle="`selected-task-${uniqueId}`" @click="toggleChevronsIcon()">
                <chevrons-down-icon v-if="!chevronsUp"/>
                <chevrons-up-icon v-else />
            </button>
        </div>
    </div>
</template>

<script>
    import { mapState, mapMutations, mapActions } from 'vuex';
    import { ChevronsDownIcon, ChevronsUpIcon } from 'vue-feather-icons';
    import { BCollapse } from 'bootstrap-vue';

	export default {
		name: "TicketComment",
        components: {
		    BCollapse,
            ChevronsDownIcon, ChevronsUpIcon,
        },
        directives: { 'b-collapse': BCollapse },
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
        data() {
            return {
                chevronsUp: true,
                updatedComment: ''
            }
        },
        computed: {
            ...mapState({
                showErrorMessages: state => state.moduleUser.showErrorMessages
            })
		},
        methods: {
            ...mapMutations({
                saveTaskComment: 'moduleUser/saveTaskComment'
            }),
            ...mapActions({
                saveSelectedTasksToStorage: 'moduleUser/saveSelectedTasksToStorage'
            }),
            saveCommentToStore: function (event) {
                this.updatedComment = event.target.value;
                this.saveTaskComment({ uniqueId: this.uniqueId, comment: event.target.value }); // update vuex store
                this.saveSelectedTasksToStorage(); // update localStorage
            },
            toggleChevronsIcon() {
                this.chevronsUp = !this.chevronsUp;
            }
        },
        created () {
            this.updatedComment = this.taskWorklogComment;
        }
	}
</script>
