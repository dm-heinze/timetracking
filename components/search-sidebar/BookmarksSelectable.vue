<template>
	<div>
        <div class="d-flex pr-1 amountToggler amountToggler--suggestions" :class="{ 'no-toggle': this.bookmarked.length < 6 }">
            <h3 class="sidebar__title title--bookmarks" @click="toggleShownAmount" v-b-hover="handleShowTogglerOnHover">Bookmarks</h3>
            
            <chevrons-down-icon v-if="!showMore && showTogglerIcon && this.bookmarked.length > 5" class="mx-2" />
            <chevrons-up-icon v-else-if="showMore && showTogglerIcon && this.bookmarked.length > 5" class="mx-2" />
        </div>
        <client-only>
            <div v-if="bookmarked.length !== 0">
                <b-list-group> <!-- todo: dynamically import -->
                    <b-list-group-item
                        v-for="bookmarkedTicket in bookmarkedToBeVisible"
                        :key="bookmarkedTicket.key"
                        class="d-flex justify-content-between"
                        @click="addToSelectedIssues({ selectedTicket: bookmarkedTicket, fromSearchResults: false })"
                    >
                        <div class="ticket__info col-11">
                            <div class="ticket__info__key font-weight-bold">{{ bookmarkedTicket.key }}</div>
                            <div class="ticket__info__summary text-truncate">{{ bookmarkedTicket.summary }}</div>
                        </div>
                        <plus-circle-icon class="ticket__icon align-self-center" />
                    </b-list-group-item>
                </b-list-group>
            </div>
            <div v-else>No Bookmarks Saved.</div>
        </client-only>
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex';
    import { ChevronsDownIcon, ChevronsUpIcon, PlusCircleIcon } from "vue-feather-icons";
    import { BListGroup, BListGroupItem, VBHover } from "bootstrap-vue";
    import _ from "lodash";

    export default {
		name: "BookmarksSelectable",
        components: {
		    PlusCircleIcon, ChevronsDownIcon, ChevronsUpIcon,
            BListGroupItem, BListGroup },
        directives: { 'b-list-group': BListGroup, 'b-list-group-item': BListGroupItem, 'b-hover': VBHover },
        data() {
            return {
                showMore: true,
                showTogglerIcon: false
            }
        },
        computed: {
            ...mapState({
                bookmarked: state => state.moduleUser.bookmarked
            }),
            bookmarkedToBeVisible () {
                if ((this.bookmarked.length < 6) || this.showMore) return this.bookmarked;
                else return _.slice(this.bookmarked, 0 , 5); // end excluded
            }
        },
        methods: {
            ...mapActions({
                addToSelectedIssues: 'moduleUser/addToSelectedIssues'
            }),
            toggleShownAmount () {
                this.showMore = !this.showMore;
            },
            handleShowTogglerOnHover () {
                if (this.bookmarked.length > 5) this.showTogglerIcon = !this.showTogglerIcon;
            }
        },
	}
</script>
