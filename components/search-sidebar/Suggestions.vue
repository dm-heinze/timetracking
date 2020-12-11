<template>
    <div>
        <h3 class="sidebar__title title--suggestions">Suggestions</h3>
        <b-list-group>
            <b-list-group-item
                v-for="searchResult in smartPickedSuggestions"
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
    import { PlusCircleIcon } from "vue-feather-icons";
    import { BListGroup, BListGroupItem } from "bootstrap-vue";

    export default {
		name: "Suggestions",
        components: { PlusCircleIcon, BListGroupItem, BListGroup },
        directives: { 'b-list-group': BListGroup, 'b-list-group-item': BListGroupItem },
        computed: {
            ...mapGetters({
                smartPickedSuggestions: 'moduleUser/getSmartPickedSuggestions'
            })
        },
        methods: {
            ...mapActions({
                addToSelectedIssues: 'moduleUser/addToSelectedIssues'
            })
        }
	}
</script>
