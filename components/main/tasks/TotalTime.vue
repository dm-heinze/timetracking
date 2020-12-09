<template>
    <span
        v-if="totalTime"
        :class="{ 'mr-3': $mq === 'md' || $mq === 'lg' || $mq === 'mdp' || $mq === 'plg', 'align-self-center': $mq === 'sm' }"
    >
        worked so far: <span class="font-weight-bold">{{ totalTime }}</span>
    </span> <!-- todo: condition -->
</template>

<script>
	import _ from "lodash";
    import { mapState } from 'vuex';

    export default {
		name: "TotalTime",
        computed: {
            ...mapState({
                selectedTasks: state => state.moduleUser.selectedTasks
            }),
            totalTime() { // todo
                let sumOfWorkedTime = 0;
                if (this.selectedTasks.length !== 0) {
                    const __selectedTasks = _.cloneDeep(this.selectedTasks);
                    const allSelectedTasksTimes = __selectedTasks.filter((__selected) => !__selected.booked).filter((__nonBooked) => __nonBooked.timeSpent !== '0' && __nonBooked.timeSpent !== '').map((__selectedTask) => Number.parseInt(__selectedTask.timeSpent))

                    for (let timeSpentOnIndividualSelectedTask of allSelectedTasksTimes) {
                        sumOfWorkedTime += timeSpentOnIndividualSelectedTask
                    }
                }

                // sumOfWorkedTime added as milliseconds bc timeSpent val was saved as milliseconds
                const dateFromTotalWorkTime = new Date(0, 0, 0, 0, 0,0, sumOfWorkedTime);  // todo

                return dateFromTotalWorkTime.toTimeString().slice(0, 8); // remove any non-time related information
            }
        }
	}
</script>
