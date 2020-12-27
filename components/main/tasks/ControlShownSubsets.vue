<template>
    <div class="toggle-show-all pb-2 d-flex flex-row justify-content-end align-items-center mr-4"> <!-- todo -->
        <!-- [ today / not-today ] Tabs --> <!-- todo -->
        <template>
            <button
                @click="toggleUnbookedTasksNotOfTheDay"
                class="mr-4 font-weight-bold"
                :class="{ 'inactive': !showUnbookedTasksNotOfTheDay }"
                :disabled="showUnbookedTasksNotOfTheDay"
                v-if="unbookedTasksNotOfTheDay.length"
            >
                Previously
            </button>
            <button
                @click="toggleUnbookedTasksNotOfTheDay"
                class="mr-4 font-weight-bold"
                :class="{ 'inactive': showUnbookedTasksNotOfTheDay }"
                :disabled="!showUnbookedTasksNotOfTheDay"
            >
                Today
            </button>
        </template>

        <!-- [ unbooked only / booked + unbooked ] Toggler --> <!-- todo -->
        <template>
            <toggle-right-icon
                class="toggle-show-all--show"
                :class="{ 'disabled': showUnbookedTasksNotOfTheDay }"
                v-b-tooltip.hover
                title="Toggle Booked"
                @click="toggleShowAllSelectedTasksOfCurrentDay()"
                v-if="showAllSelectedTasksOfCurrentDay"
            />
            <toggle-left-icon
                class="toggle-show-all--hide"
                :class="{ 'disabled': showUnbookedTasksNotOfTheDay }"
                v-b-tooltip.hover
                title="Toggle Booked"
                @click="toggleShowAllSelectedTasksOfCurrentDay()"
                v-else
            />
        </template>
    </div>
</template>

<script>
    import { mapMutations, mapState } from 'vuex';
    import { ToggleLeftIcon, ToggleRightIcon } from "vue-feather-icons";

	export default {
		name: "ControlShownSubsets",
        components: {
            ToggleLeftIcon, ToggleRightIcon
        },
        props: {
            unbookedTasksNotOfTheDay: {
                required: true
            }
        },
        computed: {
            ...mapState({
                showAllSelectedTasksOfCurrentDay: state => state.moduleTask.showAllSelectedTasksOfCurrentDay,
                showUnbookedTasksNotOfTheDay: state => state.moduleTask.showUnbookedTasksNotOfTheDay
            })
        },
        methods: {
            ...mapMutations({
                toggleShowAllSelectedTasksOfCurrentDay: 'moduleTask/toggleShowAllSelectedTasksOfCurrentDay',
                toggleUnbookedTasksNotOfTheDay: 'moduleTask/toggleUnbookedTasksNotOfTheDay'
            })
        }
	}
</script>
