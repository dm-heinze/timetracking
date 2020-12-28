<template>
	<div>
        <button
            class="px-2 py-2"
            v-b-modal="`confirm-deletion-modal-${uniqueId}`"
            :disabled="isTimerActive && (activeTicket === uniqueId)"
        >
            <trash2-icon />
        </button>

        <b-modal :id="`confirm-deletion-modal-${uniqueId}`" centered>
            <template v-slot:modal-header="{ close }">
                <div class="d-flex justify-content-between align-items-center w-100 modal__top-bar">
                    <h3 class="primary">Delete Task?</h3>
                    <span>
                        <x-icon @click="close()" />
                    </span>
                </div>
            </template>
            <template v-slot:default>
                <div class="modal__main-container">
                    <div class="modal__main-container__main-text">
                        Delete tracker for <span class="font-weight-bold">{{ optionalTaskKey }} {{ taskSummary }}</span>?
                    </div>
                </div>
            </template>
            <template v-slot:modal-footer="{ ok, cancel }">
                <div class="d-flex justify-content-between w-100 modal__actions">
                    <b-button
                        class="font-weight-bold modal__cancel-btn"
                        @click.prevent="cancel()"
                    >
                        Cancel
                    </b-button>
                    <b-button
                        variant="primary"
                        class="font-weight-bold modal__save-btn"
                        @click.prevent="removeTicketFromSelectedTickets(uniqueId)"
                    >
                        Delete
                    </b-button>
                </div>
            </template>
        </b-modal>
    </div>
</template>

<script>
    import { mapState, mapMutations, mapActions } from 'vuex';
    import { Trash2Icon, XIcon } from 'vue-feather-icons';

	export default {
		name: "TicketDeletion",
        props: {
            uniqueId: {
                required: true
            },
            taskSummary: {
                type: String,
                required: true
            },
            assignedToTicket: {
                required: true
            },
            taskKey: {
                required: true
            }
        },
        components: { Trash2Icon, XIcon },
        computed: {
		    ...mapState({
                isTimerActive: state => state.moduleUser.isTimerActive,
                activeTicket: state => state.moduleUser.activeTicket
            }),
            optionalTaskKey () {
                if (this.assignedToTicket) return `${this.taskKey}: `;
                else return this.taskKey;
            },
        },
        methods: {
            ...mapMutations({
                removeSelectedTask: 'moduleTask/removeSelectedTask',
            }),
            ...mapActions({
                saveSelectedTasksToStorage: 'moduleTask/saveSelectedTasksToStorage',
            }),
            removeTicketFromSelectedTickets: function (ticketToRemoveFromSelectedTickets) {
                this.removeSelectedTask(ticketToRemoveFromSelectedTickets);

                this.saveSelectedTasksToStorage();
            }
        }
	}
</script>
