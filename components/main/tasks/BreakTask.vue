<template>
    <div class="selected-ticket__container">
        <div class="selected-ticket__heading" :class="{ 'flex-row  align-items-start': $mq === 'md', 'flex-column align-items-center': $mq === 'sm', 'align-items-center': $mq === 'lg' || $mq === 'plg', 'flex-row': $mq === 'mdp' }">
            <a :href="'#'" class="col-sm-10 notALink" :class="{ 'col-9': $mq === 'mdp' }">
                <div :class="{ 'd-flex flex-column align-items-center justify-content-center': $mq === 'sm' }">
                    <div class="font-weight-bold">Break</div>
                </div>
            </a>

            <div class="selected-ticket__heading__controls d-flex" :class="{ 'w-100 justify-content-between': $mq === 'md' || $mq === 'sm', 'flex-row': $mq === 'md' || 'lg', 'flex-column': $mq === 'sm', 'justify-content-between': $mq === 'mdp' }">
                <div class="ticket-trackers d-flex flex-row" :class="{ 'align-self-center': $mq === 'sm' }">
                    <ticket-time-spent :of-type-break="true" :time-spent="accumulatedBreakTimeInMilliSeconds" unique-id="breakTask" :booked="false" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import TicketTimeSpent from "~/components/main/tasks/task/TicketTimeSpent";
    import _ from "lodash";


    export default {
        name: "BreakTask",
        components: {
            TicketTimeSpent
        },
        computed: {
            ...mapState({
                accumulatedBreakTime: state => state.moduleUser.accumulatedBreakTime
            }),
            flexDirection () { // todo
                return `flex-${this.$mq === 'sm' ? 'column' : 'row'}`
            },
            accumulatedBreakTimeInMilliSeconds () { // todo
                const __dateRightNow = new Date();

                const __clonedVal = _.cloneDeep(this.accumulatedBreakTime);

                // split string of shape hh:mm:ss into array of shape [ 'hh', 'mm', 'ss' ]
                const initialBreakInArrayFormat = __clonedVal.split(":");

                const breakTimeAsDate = new Date(__dateRightNow.getFullYear(), __dateRightNow.getMonth(), __dateRightNow.getDate(), initialBreakInArrayFormat[0], initialBreakInArrayFormat[1], initialBreakInArrayFormat[2] ? initialBreakInArrayFormat[2] : 0 ,0);

                const helperDate = new Date(__dateRightNow.getFullYear(), __dateRightNow.getMonth(), __dateRightNow.getDate(), 0, 0, 0,0);

                return breakTimeAsDate.getTime() - helperDate.getTime();
            }
        }
    }
</script>
