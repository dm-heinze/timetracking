<template>
    <b-button pill variant="primary" type="button" class="login-content__sign-in-btn py-2" v-b-modal="'add-custom-task'" v-b-tooltip.hover title="Add Custom task" :class="{ 'mr-3': $mq === 'md' || $mq === 'lg' || $mq === 'mdp' || $mq === 'plg', 'mb-2': $mq === 'sm', 'px-5': $mq === 'md' || $mq === 'mdp' || $mq === 'plg' }">
        <plus-circle-icon />
        <span class="pl-1" v-if="$mq === 'lg' || $mq === 'sm'">Add Custom task</span>

        <b-modal :id="'add-custom-task'" centered>
            <template v-slot:modal-header="{ close }">
                <div class="d-flex justify-content-between align-items-center w-100 modal__top-bar">
                    <h3 class="primary">Add Custom Task</h3>
                    <span>
                        <x-icon @click="resetAndCloseModal()" />
                    </span>
                </div>
            </template>
            <template v-slot:default>
                <div class="modal__main-container">
                    <div class="modal__main-container__main-text">Do you want to add a custom name? Otherwise a random name will be set. You can edit the name later regardless.</div>
                    <b-form-input class="form-control rounded-pill pt-4 pl-4 pb-4" type="text" v-model="customNameCustomTask" placeholder="Add Custom Name"></b-form-input>
                </div>
            </template>
            <template v-slot:modal-footer="{ ok, cancel }">
                <div class="d-flex justify-content-between w-100 modal__actions">
                    <b-button pill class="font-weight-bold modal__cancel-btn" @click.prevent="resetAndCloseModal()">Cancel</b-button>
                    <b-button pill variant="primary" class="font-weight-bold modal__save-btn" @click.prevent="startNewCustomTask()">Save</b-button>
                </div>
            </template>
        </b-modal>
    </b-button>
</template>

<script>
    import { mapState, mapActions, mapMutations } from 'vuex';
    import { PlusCircleIcon, XIcon } from 'vue-feather-icons';
    import { BFormInput } from "bootstrap-vue";
    import _ from "lodash";

	export default {
		name: "AddCustomTask",
        components: {
		    PlusCircleIcon, XIcon,
            BFormInput
        },
        directives: { 'b-form-input': BFormInput },
        data () {
            return {
                customNameCustomTask: '',
            }
        },
        computed: {
            ...mapState({
                allExistingProjects: state => state.moduleUser.allExistingProjects,
            })
        },
        methods: {
            ...mapMutations({
                addSelectedTask: 'moduleUser/addSelectedTask',
            }),
            ...mapActions({
                requestAllProjects: 'moduleUser/requestAllProjects',
                saveSelectedTasksToStorage: 'moduleUser/saveSelectedTasksToStorage'
            }),
            startNewCustomTask: function () {
                const newCustomTask = {
                    assignedToTicket: false,
                    uniqueId: _.now(),
                    key: this.customNameCustomTask ? this.customNameCustomTask : `New custom task ${_.now()}`, // todo
                    issueLink: '',
                    summary: '',
                    comment: '',
                    timeSpent: 0,
                    startTime: '',
                    endTime: '',
                    booked: false // todo
                };

                this.addSelectedTask(newCustomTask);

                this.customNameCustomTask = '';

                this.resetAndCloseModal();

                this.saveSelectedTasksToStorage();

                if (this.allExistingProjects.length === 0) this.requestAllProjects(); // todo
            },
            // modal
            resetAndCloseModal: function () {
                this.$bvModal.hide('add-custom-task');
                this.customNameCustomTask = '';
            }
        }
	}
</script>
