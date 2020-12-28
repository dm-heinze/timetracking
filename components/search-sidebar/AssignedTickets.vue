<template>
    <div>
        <div class="d-flex justify-content-between">
            <h3 class="sidebar__title">Assigned Tickets</h3>
            <button
                id="refreshTooltipTargetButton"
                ref="refreshTooltipTarget"
                @click="refreshAssignedTickets"
                class="refresh--assignedTickets pl-2"
                aria-label="refresh assigned tickets"
                v-b-tooltip.hover.top title="Get Latest"
            > <!-- todo -->
                <download-cloud-icon />
            </button>
        </div>
        <div v-if="assignedTickets.length"> <!-- todo -->
            <b-list-group>
                <b-list-group-item
                    v-for="assignedTicket in assignedTickets"
                    :key="assignedTicket.uniqueId"
                    @click="addToSelectedIssues({ selectedTicket: assignedTicket, fromSearchResults: true })"
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
        <div v-else class="sidebar__title--no-bookmarks pt-2">
            <div class="font-weight-bold">Currently no assigned tickets.</div>
            To check for any updates try the refresh button above.
        </div>
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex';
	import { PlusCircleIcon, DownloadCloudIcon } from "vue-feather-icons";
    import { BListGroup, BListGroupItem } from "bootstrap-vue";

    export default {
		name: "AssignedTickets",
        components: {
		    PlusCircleIcon, DownloadCloudIcon,
            BListGroupItem, BListGroup
        },
        directives: { 'b-list-group': BListGroup, 'b-list-group-item': BListGroupItem },
        computed: {
		    ...mapState({
                assignedTickets: state => state.modulePrefill.assignedTickets
            })
        },
        methods: {
		    ...mapActions({
                addToSelectedIssues: 'moduleTask/addToSelectedIssues',
                refreshAssignedTickets: 'modulePrefill/refreshAssignedTickets'
            })
        },
        mounted() {
            // wait for rendering
            this.$nextTick(function () {
                // bc disable event from Break.vue may 'overwrite' call from AssignedTickets.vue bc of timing
                // this listener also covers the case of $mq changes -> no separate watcher needed as in Break.vue
                this.$root.$on('bv::tooltip::disabled', (e) => {
                    this.$root.$emit('bv::enable::tooltip', 'refreshTooltipTargetButton');
                })
            })
        }
	}
</script>
