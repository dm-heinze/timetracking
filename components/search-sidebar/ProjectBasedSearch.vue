<template>
	<div>
        <div class="select__container mb-2">
            <b-form-select v-model="selectedProject" class="rounded-pill pl-4 pr-5" aria-label="search by project" :disabled="$nuxt.isOffline">
                <b-form-select-option v-if="!allExistingProjects.length" disabled value="">Loading Projects...</b-form-select-option>
                <b-form-select-option v-else disabled value="">{{ selectedProject !== '' ? 'Select a project' : 'Get All Tickets by Project' }}</b-form-select-option>
                <b-form-select-option
                    v-for="existingProject in allExistingProjects"
                    :value="existingProject.id"
                    :key="existingProject.id"
                >{{ existingProject.name }}</b-form-select-option>
            </b-form-select>
            <chevron-down-icon class="select__icon" />
        </div>
        <div v-show="selectedProject !== ''">
            <div class="select__container mb-3">
                <b-form-select v-model="selectedTicket" class="rounded-pill pl-4 pr-5" aria-label="tickets related to selected project" :disabled="$nuxt.isOffline && !selectedProject">
                    <b-form-select-option v-if="!relatedTickets.length && selectedProject !== '' && !($nuxt.isOffline)" disabled value="">Loading Related Tickets...</b-form-select-option>
                    <b-form-select-option v-else disabled value="">Select a ticket</b-form-select-option>
                    <b-form-select-option
                        v-for="relatedTicket in relatedTickets"
                        :value="relatedTicket.key"
                        :key="relatedTicket.key"
                    >{{ relatedTicket.key }}: {{ relatedTicket.summary }} </b-form-select-option>
                </b-form-select >
                <chevron-down-icon class="select__icon" />
            </div>
        </div>
        <div v-if="$nuxt.isOffline" class="message--network-error">No network connection. Most recent related tickets may not be available right now.</div>
        <div class="select__container__actions d-flex justify-content-between">
            <b-button v-if="selectedProject !== ''" pill class="font-weight-bold" @click.prevent="toggleProjectSelection()">Cancel</b-button>
            <div v-if="selectedProject !== '' && selectedTicket !== ''">
                <b-button pill variant="primary" class="font-weight-bold px-4 py-2" @click.prevent="addSelectionToSelectedTasks()">Select</b-button>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapActions } from 'vuex';
    import { BFormSelect, BFormSelectOption } from "bootstrap-vue";
    import { ChevronDownIcon } from "vue-feather-icons";
    import _ from "lodash";

    export default {
		name: "ProjectBasedSearch",
        components: { ChevronDownIcon, BFormSelect, BFormSelectOption },
        directives: { 'b-form-select': BFormSelect, 'b-form-select-option': BFormSelectOption },
        data() {
            return {
                show: true, // todo
                selectedProject: '',
                selectedTicket: '',
                selectedTaskObject: {}
            }
        },
        computed: {
            ...mapState({
                allExistingProjects: state => state.moduleUser.allExistingProjects,
                selectedTasks: state => state.moduleTask.selectedTasks,
                relatedTickets: state => state.moduleSearch.relatedTickets
            })
        },
        watch: {
            selectedProject: function (newValue) {
                if (newValue) {
                    this.setSelectedProject(this.selectedProject);

                    // remove selectedTicket so selectBtn disappears until a ticket from new project gets selected
                    this.selectedTicket = '';

                    // todo
                    if (!($nuxt.isOffline)) {
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
        },
        methods: {
            ...mapMutations({
                setSearchResult: 'moduleSearch/setSearchResult',
                addSelectedTask: 'moduleTask/addSelectedTask',
                setSelectedProject: 'moduleSearch/setSelectedProject',
                setRelatedTickets: 'moduleSearch/setRelatedTickets'
            }),
            ...mapActions({
                getIssue: 'moduleSearch/getIssue',
                saveSelectedTasksToStorage: 'moduleTask/saveSelectedTasksToStorage',
                requestRelatedTickets: 'moduleSearch/requestRelatedTickets'
            }),
            addSelectionToSelectedTasks: function () {
                const __selectedTaskObject = this.relatedTickets.find((__relatedTicket) => __relatedTicket.key === this.selectedTicket);

                const selectedTaskObject = { ...__selectedTaskObject,
                    assignee: '',
                    issueLink: process.env.BASE_DOMAIN + process.env.ENDPOINT_BROWSE + this.selectedTicket,
                    comment: '',
                    timeSpent: 0,
                    startTime: '',
                    endTime: '',
                    assignedToTicket: true,
                    booked: false,
                    uniqueId: _.now(),
                    dayAdded: new Date().toDateString()
                }

                // reset search via project selection
                this.toggleProjectSelection();

                this.addSelectedTask(selectedTaskObject);
                this.saveSelectedTasksToStorage();
            },
            toggleProjectSelection: function () {
                this.selectedTicket = '';
                this.selectedProject = '';
                this.setSelectedProject('');
                this.setRelatedTickets([]);
            }
        }
	}
</script>
