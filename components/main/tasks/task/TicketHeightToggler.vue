<template>
    <div class="d-flex justify-content-center selected-ticket__toggle-btn">
        <button v-b-toggle="`selected-task-${uniqueId}`" @click="toggleChevronsIcon()">
            <chevrons-down-icon v-if="!chevronsUp"/>
            <chevrons-up-icon v-else />
        </button>
    </div>
</template>

<script>
    import { ChevronsDownIcon, ChevronsUpIcon } from "vue-feather-icons";

    export default {
		name: "TicketHeightToggler",
        components: { ChevronsDownIcon, ChevronsUpIcon },
        props: {
            uniqueId: {
                required: true
            }
        },
        data() {
            return {
                chevronsUp: true
            };
        },
        methods: {
            toggleChevronsIcon() {
                this.chevronsUp = !this.chevronsUp;
            }
        }
	}
</script>
