<template>
    <div>
        <div class="d-flex pr-1 amountToggler amountToggler--suggestions" :class="{ 'no-toggle': this.smartPickedSuggestions.length < 6 }">
            <h3 class="sidebar__title title--suggestions" @click="toggleShownAmount" v-b-hover="handleShowTogglerOnHover">Suggestions</h3>

            <chevrons-down-icon v-if="!showMore && showTogglerIcon && this.smartPickedSuggestions.length > 5" class="mx-2" />
            <chevrons-up-icon v-else-if="showMore && showTogglerIcon && this.smartPickedSuggestions.length > 5" class="mx-2" />
        </div>

        <b-list-group>
            <b-list-group-item
                v-for="searchResult in smartPickedSuggestionsToBeVisible"
                :key="searchResult.key"
                @click="addToSelectedIssues({ selectedTicket: searchResult, fromSearchResults: true })"
                class="d-flex justify-content-between"
            >
                <div class="ticket__info col-11">
                    <div class="ticket__info__key font-weight-bold">{{ searchResult.key }}</div>
                    <div class="ticket__info__summary text-truncate">{{ searchResult.summary }}</div> <!-- todo -->
                </div>

                <plus-circle-icon class="ticket__icon align-self-center" />
            </b-list-group-item>
        </b-list-group>
    </div>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex';
    import { PlusCircleIcon, ChevronsDownIcon, ChevronsUpIcon } from "vue-feather-icons";
    import { BListGroup, BListGroupItem, VBHover } from "bootstrap-vue";
    import _ from "lodash";

    export default {
		name: "Suggestions",
        components: {
		    PlusCircleIcon, ChevronsDownIcon, ChevronsUpIcon,
            BListGroupItem, BListGroup
        },
        directives: { 'b-list-group': BListGroup, 'b-list-group-item': BListGroupItem, 'b-hover': VBHover },
        data() {
            return {
                showMore: false,
                showTogglerIcon: false
            }
        },
        computed: {
            ...mapGetters({
                smartPickedSuggestions: 'moduleUser/getSmartPickedSuggestions' // any smart picked tickets that are not assigned to currentUser
            }),
            smartPickedSuggestionsToBeVisible () {
                if ((this.smartPickedSuggestions.length < 6) || this.showMore) return this.smartPickedSuggestions;
                else return _.slice(this.smartPickedSuggestions, 0 , 5); // end excluded
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
                if (this.smartPickedSuggestions.length > 5) this.showTogglerIcon = !this.showTogglerIcon;
            }
        }
	}
</script>
