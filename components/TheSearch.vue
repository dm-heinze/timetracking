<template>
    <div>
        <autocompleted-search class="mb-2" />
        <div class="select__container mb-2">
            <b-form-select v-model="selectedProject" class="rounded-pill pl-4 px-4">
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
            <div class="select__container mb-2">
                <b-form-select v-model="selectedTicket" class="rounded-pill pl-4 px-4">
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
            <div v-if="selectedTicket !== ''" class="d-flex justify-content-end">
                <b-button pill variant="primary" class="font-weight-bold modal__save-btn pl-4 pr-4" @click.prevent="addSelectionToSelectedTasks()">Select</b-button>
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
                    this.requestRelatedTickets();
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
                this.selectedTicket = '';
                this.selectedProject = '';

                this.addSelectedTask(selectedTaskObject);
                this.saveSelectedTasksToStorage();
            }
        }
    }
</script>
