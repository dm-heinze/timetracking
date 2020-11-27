<template>
    <div>
        <h3 class="sidebar__title">Assigned Tickets</h3>
        <b-list-group>
            <b-list-group-item
                v-for="assignedTicket in assignedTickets"
                :key="assignedTicket.uniqueId"
                @click="addToSelectedIssues(assignedTicket)"
                class="d-flex justify-content-between"
            >
                <div class="ticket__info col-11">
                    <div class="ticket__info__key font-weight-bold">{{ assignedTicket.key }}</div>
                    <div class="ticket__info__summary text-truncate">{{ assignedTicket.summary }}</div>
                </div>

                <plus-circle-icon class="ticket__icon align-self-center" />
            </b-list-group-item>
        </b-list-group>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';
	import { PlusCircleIcon } from "vue-feather-icons";
    import { BListGroup, BListGroupItem } from "bootstrap-vue";

    export default {
		name: "AssignedTickets",
        components: { PlusCircleIcon, BListGroupItem, BListGroup },
        directives: { 'b-list-group': BListGroup, 'b-list-group-item': BListGroupItem },
        computed: {
            ...mapGetters({
                assignedTickets: 'moduleUser/getAssignedTickets'
            })
        },
        methods: {
            addToSelectedIssues: function (assignedTicket) { // todo
                this.$emit('updateSelectedIssues', assignedTicket)
            }
        }
	}
</script>
