<template>
	<div>
        <b-button :disabled="isTimerActive && (activeTicket === uniqueId)" pill variant="light-grey" type="button" class="login-content__sign-in-btn button--ticketAssignment pt-2 pb-2" :class="{ 'disabled': isTimerActive && (activeTicket === uniqueId), 'mb-2': $mq === 'sm', 'mr-3': $mq === 'md' || $mq === 'lg', 'mr-2': $mq === 'mdp' || $mq === 'plg' }" @click.prevent="toggleTicketAssignment()">
            <plus-circle-icon />
            <span class="pl-1">Assign Ticket</span>
        </b-button>

        <b-modal :id="`ticket-assignment-${uniqueId}`" centered>
            <template v-slot:modal-header="{ close }">
                <div class="d-flex justify-content-between align-items-center w-100 modal__top-bar">
                    <h3 class="primary">Assign Ticket</h3>
                    <span>
                        <x-icon @click="toggleTicketAssignment(true)" />
                    </span>
                </div>
            </template>
            <template v-slot:default>
                <div class="modal__main-container">
                    <div class="select__container mb-3">
                        <b-form-select v-model="selectedProject" class="rounded-pill pl-4 pr-5" :disabled="$nuxt.isOffline">
                            <b-form-select-option v-if="!allExistingProjects.length" disabled value="">Loading Projects...</b-form-select-option>
                            <b-form-select-option v-else disabled value="">Select a project</b-form-select-option>
                            <b-form-select-option
                                v-for="existingProject in allExistingProjects"
                                :value="existingProject.id"
                                :key="existingProject.id"
                            >{{ existingProject.name }}</b-form-select-option>
                        </b-form-select>
                        <chevron-down-icon class="select__icon" />
                    </div>

                    <div class="select__container mb-3">
                        <b-form-select  v-model="selectedTicket" :disabled="selectedProject === ''" class="rounded-pill pl-4 pr-5">
                            <b-form-select-option v-if="!relatedTickets.length && selectedProject !== ''" disabled value="">Loading Related Tickets...</b-form-select-option>
                            <b-form-select-option v-else disabled value="">Select a ticket</b-form-select-option>
                            <b-form-select-option
                                v-for="relatedTicket in relatedTickets"
                                :value="relatedTicket.key"
                                :key="relatedTicket.key"
                            >{{ relatedTicket.key }}: {{ relatedTicket.summary }}</b-form-select-option>
                        </b-form-select>
                        <chevron-down-icon class="select__icon" />
                    </div>

                    <div v-if="$nuxt.isOffline" class="message--network-error">No network connection. Most recent related tickets may not be available right now.</div>
                </div>
            </template>
            <template v-slot:modal-footer="{ ok, cancel }">
                <div class="d-flex justify-content-between w-100 modal__actions">
                    <b-button pill class="font-weight-bold modal__cancel-btn" @click.prevent="toggleTicketAssignment(true)">Cancel</b-button>
                    <b-button pill variant="primary" class="font-weight-bold modal__save-btn" :disabled="selectedTicket === ''" @click.prevent="toggleTicketAssignment()">Save</b-button>
                </div>
            </template>
        </b-modal>
    </div>
</template>

<script>
    import { mapState, mapMutations, mapActions } from 'vuex';
    import { PlusCircleIcon, ChevronDownIcon, XIcon } from 'vue-feather-icons';
    import { BFormSelect, BFormSelectOption} from 'bootstrap-vue';


	export default {
		name: "TicketAssignment",
        components: {
            PlusCircleIcon, ChevronDownIcon, XIcon,
            BFormSelect, BFormSelectOption,
        },
        directives: { 'b-form-select': BFormSelect, 'b-form-select-option': BFormSelectOption },
        props: {
            uniqueId: {
                required: true
            },
        },
        data() {
            return {
                selectedProject: '',
                selectedTicket: '',
                lastSelectedTicket: '',
                showSelection: false // todo!
            }
        },
        computed: {
            ...mapState({
                allExistingProjects: state => state.moduleUser.allExistingProjects,
                relatedTickets: state => state.moduleUser.relatedTickets,
                isTimerActive: state => state.moduleUser.isTimerActive,
                activeTicket: state => state.moduleUser.activeTicket
            })
        },
        methods: {
		    ...mapMutations({
                setSelectedProject: 'moduleUser/setSelectedProject',
                setRelatedTickets: 'moduleUser/setRelatedTickets',
                assignToTicket: 'moduleUser/assignToTicket'
            }),
            ...mapActions({
                requestAllProjects: 'moduleUser/requestAllProjects',
                requestRelatedTickets: 'moduleUser/requestRelatedTickets',
                saveSelectedTasksToStorage: 'moduleUser/saveSelectedTasksToStorage'
            }),
            toggleTicketAssignment: function (cancelAssignment = false) {
                this.showSelection = !this.showSelection;

                if (this.showSelection && this.allExistingProjects.length === 0) this.requestAllProjects(); // if search offCanvas was not opened yet allExistingProjects is empty // todo
                if (this.showSelection) {
                    this.lastSelectedTicket = this.selectedTicket;
                    this.$bvModal.show(`ticket-assignment-${this.uniqueId}`);
                }

                if (cancelAssignment) {
                    this.selectedTicket = this.lastSelectedTicket;
                    this.selectedProject = ''; // on cancel revert to initial state

                    this.resetProjectAndRelatedTicketsInStore();

                    this.$bvModal.hide(`ticket-assignment-${this.uniqueId}`);
                }

                // saving to vuex store/localStorage only needed if there was a change in the assigned ticket
                // if cancelBtn was used: do not save
                if (!this.showSelection && (cancelAssignment === false) && (this.lastSelectedTicket !== this.selectedTicket)) {
                    // step 1: update vuex store
                    this.assignToTicket({ uniqueId: this.uniqueId, assignedTicketKey: this.selectedTicket }); // todo
                    this.resetProjectAndRelatedTicketsInStore();

                    // step 2: update localStorage
                    this.saveSelectedTasksToStorage();
                }
            },
            resetProjectAndRelatedTicketsInStore: function () {
                this.setSelectedProject('');
                this.setRelatedTickets([]);
            },
        },
        watch: {
            selectedProject: function (newValue) {
                if (newValue) {
                    this.setSelectedProject(this.selectedProject);

                    // todo
                    if (!($nuxt.isOffline)) { // only make API request if network available
                        this.requestRelatedTickets()
                            .catch((err) => {
                                if (err.response) {
                                    if (err.response.status === 401) this.$router.push('/customer/login');
                                    else console.log("err occurred w/ status code: ", err.response.status);
                                } else if (err.message) {
                                    console.log("err.message: ", err.message);
                                } else {
                                    console.log("err occurred: ", err);
                                }
                            })
                    }
                }
            }
        }
	}
</script>
