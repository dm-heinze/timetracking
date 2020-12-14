<template>
    <div>
        <div class="d-flex justify-content-between">
            <div class="d-flex flex-row amountToggler" :class="{ 'no-toggle': this.assignedTickets.length < 5 }">
                <h3 class="sidebar__title pr-1" @click="toggleShownAmount" v-b-hover="handleShowTogglerOnHover">Assigned Tickets</h3>

                <chevrons-down-icon v-if="!showMore && showTogglerIcon && this.assignedTickets.length > 5" class="mx-2" />
                <chevrons-up-icon v-else-if="showMore && showTogglerIcon && this.assignedTickets.length > 5" class="mx-2" />
            </div>

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
        <b-list-group>
            <b-list-group-item
                v-for="assignedTicket in assignedTicketsToBeVisible"
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
</template>

<script>
    import { mapState, mapGetters, mapActions } from 'vuex';
    import { PlusCircleIcon, DownloadCloudIcon, ChevronsDownIcon, ChevronsUpIcon } from "vue-feather-icons";
    import { BListGroup, BListGroupItem, VBHover } from "bootstrap-vue";
    import _ from "lodash";

    export default {
		name: "AssignedTickets",
        components: {
		    PlusCircleIcon, DownloadCloudIcon, ChevronsDownIcon, ChevronsUpIcon,
            BListGroupItem, BListGroup
        },
        directives: { 'b-list-group': BListGroup, 'b-list-group-item': BListGroupItem, 'b-hover': VBHover },
        data() {
            return {
                showMore: true,
                showTogglerIcon: false
            }
        },
        computed: {
		    ...mapState({
                assignedTickets: state => state.moduleUser.assignedTickets
            }),
            ...mapGetters({
                // todo: flagged for possible deprecation
                // filtered from aggregated search & request results
                getAssignedTickets: 'moduleUser/getAssignedTickets'
            }),
            assignedTicketsToBeVisible () {
                if ((this.assignedTickets.length < 6) || this.showMore) return this.assignedTickets;
                else return _.slice(this.assignedTickets, 0 , 5); // end excluded
            }
        },
        methods: {
		    ...mapActions({
                addToSelectedIssues: 'moduleUser/addToSelectedIssues',
                refreshAssignedTickets: 'moduleUser/refreshAssignedTickets'
            }),
            toggleShownAmount () {
                this.showMore = !this.showMore;
            },
            handleShowTogglerOnHover () {
		        if (this.assignedTickets.length > 5) this.showTogglerIcon = !this.showTogglerIcon;
            }
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
