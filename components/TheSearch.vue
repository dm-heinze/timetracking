<template>
    <div>
        <autocompleted-search class="mb-2" />
        <div class="select__container mb-2">
            <b-form-select v-model="selectedProject" class="rounded-pill pl-4 pr-5">
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
                <b-form-select v-model="selectedTicket" class="rounded-pill pl-4 pr-5">
                    <b-form-select-option v-if="!relatedTickets.length" disabled value="">Loading Related Tickets...</b-form-select-option>
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
        <div class="select__container__actions d-flex justify-content-between">
            <b-button v-if="selectedProject !== ''" pill class="font-weight-bold" @click.prevent="toggleProjectSelection()">Cancel</b-button>
            <div v-if="selectedProject !== '' && selectedTicket !== ''">
                <b-button pill variant="primary" class="font-weight-bold px-4 py-2" @click.prevent="addSelectionToSelectedTasks()">Select</b-button>
            </div>
        </div>

        <div class="result-wrp">
            <div class="result-item">
                <search-results/>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapActions } from 'vuex';
    import AutocompletedSearch from "./AutocompletedSearch";
    import { ChevronDownIcon } from 'vue-feather-icons';
    import _ from 'lodash';

    export default {
        name: "TheSearch",
        components: {
            AutocompletedSearch,
            SearchResults: () => import('./SearchResults'),
            ChevronDownIcon
        },
        data() {
            return {
                show: true,
                selectedProject: '',
                selectedTicket: '',
                selectedTaskObject: {}
            }
        },
        computed: {
            ...mapState({
                allExistingProjects: state => state.moduleUser.allExistingProjects,
                selectedTasks: state => state.moduleUser.selectedTasks,
                relatedTickets: state => state.moduleUser.relatedTickets
            })
        },
        watch: {
            selectedProject: function (newValue) {
                if (newValue) {
                    this.setSelectedProject(this.selectedProject);

                    // remove selectedTicket so selectBtn disappears until a ticket from new project gets selected
                    this.selectedTicket = '';

                    this.requestRelatedTickets()
                        .catch((err) => { if (err.response.status === 401) this.$router.push('/customer/login') })
                }
            }
        },
        methods: {
            ...mapMutations({
                setSearchResult: 'moduleUser/setSearchResult',
                addSelectedTask: 'moduleUser/addSelectedTask',
                setSelectedProject: 'moduleUser/setSelectedProject',
            }),
            ...mapActions({
                getIssue: 'moduleUser/getIssue',
                saveSelectedTasksToStorage: 'moduleUser/saveSelectedTasksToStorage',
                requestRelatedTickets: 'moduleUser/requestRelatedTickets'
            }),
            addSelectionToSelectedTasks: function () {
                const __selectedTaskObject = this.relatedTickets.find((__relatedTicket) => __relatedTicket.key === this.selectedTicket);

                const selectedTaskObject = { ...__selectedTaskObject,
                    assignee: '',
                    issueLink: process.env.BASE_DOMAIN + process.env.ENDPOINT_BROWSE + this.selectedTicket,
                    comment: '',
                    // timeSpent: 0, // todo
                    timeSpent: '', //
                    startTime: '',
                    endTime: '',
                    assignedToTicket: true,
                    booked: false,
                    uniqueId: _.now()
                }

                // reset search via project selection
                this.toggleProjectSelection();

                this.addSelectedTask(selectedTaskObject);
                this.saveSelectedTasksToStorage();
            },
            toggleProjectSelection: function () {
                this.selectedTicket = '';
                this.selectedProject = '';
            }
        }
    }
</script>
