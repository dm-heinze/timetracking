<template>
    <div>
        <autocompleted-search/>
        <div>Get All Tickets by Project</div>
        <select v-model="selectedProject">
            <option v-if="!allExistingProjects.length" disabled value="">Loading Projects...</option>
            <option v-else disabled value="">Select a project</option>
            <option
                v-for="existingProject in allExistingProjects"
                :value="existingProject.id"
            >{{ existingProject.name }}</option>
        </select>
        <div v-show="selectedProject !== ''">
            <select v-model="selectedTicket">
                <option v-if="!relatedTickets.length" disabled value="">Loading Related Tickets...</option>
                <option v-else disabled value="">Select a ticket</option>
                <option
                    v-for="relatedTicket in relatedTickets"
                    :value="relatedTicket.key"
                >{{ relatedTicket.key }}: {{ relatedTicket.summary }} </option>
            </select>
            <div v-if="selectedTicket !== ''">
                <button v-b-toggle.sidebar-search @click="addSelectionToSelectedTasks">Select & Close Sidebar</button>
            </div>
        </div>

        <div class="result-wrp col-md-12">
            <div class="result-item">
                <search-results/>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapActions } from 'vuex';
    import AutocompletedSearch from "./AutocompletedSearch";
    import _ from 'lodash';

    export default {
        name: "TheSearch",
        components: {
            AutocompletedSearch,
            SearchResults: () => import('./SearchResults'),
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
                requestRelatedTickets: 'moduleUser/requestRelatedTickets',
                flashMessage: 'moduleFlashMessage/flashMessage'
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

                this.addSelectedTask(selectedTaskObject);
                this.saveSelectedTasksToStorage();
            }
        }
    }
</script>
