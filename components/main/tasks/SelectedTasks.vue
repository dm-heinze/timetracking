<template>
    <div class="selected-tickets__container">
        <client-only>
            <div v-if="notAlreadyBooked.length !== 0">
                <ul>
                    <li>
                        <draggable v-model="notAlreadyBooked" :disabled="isTimerActive">
                            <SelectedTask
                                v-for="selectedTask in notAlreadyBooked"
                                :key="selectedTask.uniqueId"
                                :taskKey="selectedTask.key"
                                :taskDirectLink="selectedTask.assignedToTicket ? selectedTask.issueLink : ''"
                                :taskSummary="selectedTask.assignedToTicket ? selectedTask.summary : ''"
                                :taskWorklogComment="selectedTask.comment"
                                :timeSpent="selectedTask.timeSpent"
                                :startedAt="selectedTask.startTime"
                                :endedAt="selectedTask.endTime"
                                :assigned-to-ticket="selectedTask.assignedToTicket"
                                :booked="selectedTask.booked"
                                :uniqueId="selectedTask.uniqueId"
                            />
                        </draggable>
                    </li>
                </ul>
            </div>
            <div v-else>There are no selected issues</div>
            <div v-if="showErrorMessages && (notAlreadyBooked.length === 0)" class="message--error">No selected issues</div>
        </client-only>
    </div>
</template>

<script>
    import { mapMutations, mapState, mapActions } from 'vuex';
    import draggable from 'vuedraggable';

    export default {
        name: "SelectedTasks",
        components: {
            // added prefetch directive for webpack for case: adding a custom task w/ no network connection & no selectedTasks
            SelectedTask: () => import(/* webpackPrefetch: true */ '~/components/main/tasks/task/SelectedTask'),
            draggable
        },
        computed: {
            ...mapState({
                selectedTasks: state => state.moduleUser.selectedTasks,
                showErrorMessages: state => state.moduleUser.showErrorMessages,
                isTimerActive: state => state.moduleUser.isTimerActive
            }),
            alreadyBooked () { // todo: expiration
                return this.selectedTasks.filter((__task) => __task.booked)
            },
            notAlreadyBooked: {
                get () {
                    return this.selectedTasks.filter((__task) => !__task.booked) // todo
                },

                set (value) { // value param represents the updated array consisting only of non-booked tasks
                    if(!this.isTimerActive) {
                        let __selectedTasks;

                        if (this.alreadyBooked.length) {
                            // non-expired booked tasks should stay in the list
                            // -> aggregate those w/ list of unbooked tasks represented by received value param
                            __selectedTasks = [...value, ...this.alreadyBooked]; // todo
                        } else {
                            __selectedTasks = value; // no booked tasks in selectedTasks list -> no need to create aggregated list
                        }

                        // set vuex store state
                        this.setSelectedTasks(__selectedTasks);

                        // todo
                        // synchronize localStorage & vuex store state
                        this.saveSelectedTasksToStorage();
                    }
                }

            }
        },
        methods: {
            ...mapMutations({
                setSelectedTasks: 'moduleUser/setSelectedTasks'
            }),
            ...mapActions({
                saveSelectedTasksToStorage: 'moduleUser/saveSelectedTasksToStorage'
            })
        }
    }
</script>
