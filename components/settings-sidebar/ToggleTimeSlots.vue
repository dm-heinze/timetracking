<template>
    <div class="wrapper--toggleOptionals">
        <h3 class="sidebar__title">Advanced Time Settings</h3>
        <div class="pb-3">Toggle to save if time slots should be saved & shown when re-starting the same task.</div>
        <div class="pb-3">Currently toggling is only possible if there are no unbooked tasks for the current day.</div>

        <b-list-group-item class="d-flex justify-content-between pt-3 time-slot-list-item">
            <div class="ticket__info col-10">
                <div class="ticket__info__key font-weight-bold">Show Time Slots</div>
            </div>
            <div class="toggle-listing">
                <toggle-right-icon
                    class="ticket__icon align-self-center toggle-listing--show"
                    @click="updateSelectionForShowStartAndEndTimes"
                    v-if="showStartAndEndTimes"
                />
                <toggle-left-icon
                    class="ticket__icon align-self-center toggle-listing--hide"
                    @click="updateSelectionForShowStartAndEndTimes"
                    v-else
                />
            </div>
        </b-list-group-item>
    </div>
</template>

<script>
    import { mapActions, mapGetters, mapMutations, mapState } from "vuex";
    import { ToggleLeftIcon, ToggleRightIcon } from 'vue-feather-icons';
    import { BListGroupItem } from "bootstrap-vue";

    export default {
		name: "ToggleTimeSlots",
        components: {
            ToggleLeftIcon, ToggleRightIcon,
            BListGroupItem
        },
        computed: {
            ...mapState({
                showStartAndEndTimes: state => state.moduleTask.showStartAndEndTimes
            }),
            ...mapGetters({
                everythingBookedAlready: 'moduleTask/everythingBookedAlready'
            })
        },
        methods: {
            ...mapMutations({
                setShowStartAndEndTimes: 'moduleTask/setShowStartAndEndTimes'
            }),
            ...mapActions({
                saveShowStartAndEndTimes: 'moduleTask/saveShowStartAndEndTimes'
            }),
            updateSelectionForShowStartAndEndTimes: function () {
                // only allow toggling if there are no unbooked selectedTasks for the current day // todo: reflect state in template
                if (this.everythingBookedAlready) {
                    this.setShowStartAndEndTimes({ value: !this.showStartAndEndTimes }); // update vuex store

                    this.saveShowStartAndEndTimes(); // update val in cookies
                }
            }
        }
	}
</script>
