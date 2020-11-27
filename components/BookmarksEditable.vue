<template>
    <b-list-group>
        <b-list-group-item
            v-for="bookmarkedTicket in bookmarked"
            :key="bookmarkedTicket.key"
            class="d-flex justify-content-between"
        >
            <div class="ticket__info col-10">
                <div class="ticket__info__key font-weight-bold">{{ bookmarkedTicket.key }}</div>
                <div class="ticket__info__summary text-truncate">{{ bookmarkedTicket.summary }}</div>
            </div>
            <div class="ticket__actions">
                <bookmark-icon class="ticket__icon align-self-center ticket__icon--bookmarked" @click="toggleBookmarked({ searchResultToBeToggled: bookmarkedTicket.key })" />
                <plus-circle-icon  class="ticket__icon align-self-center ticket__icon--selectable" @click="addToSelectedIssues(bookmarkedTicket, false)" />
            </div>
        </b-list-group-item>
    </b-list-group>
</template>

<script>
    import _ from "lodash"; // todo
    import { mapState, mapActions, mapMutations } from 'vuex';
    import { BookmarkIcon, PlusCircleIcon } from 'vue-feather-icons';
    import { BListGroup, BListGroupItem } from 'bootstrap-vue';
    import { addTaskMixin } from "~/utility/mixins";

	export default {
		name: "BookmarksEditable",
        components: {
            BookmarkIcon, PlusCircleIcon,
            BListGroup, BListGroupItem,
        },
        mixins: [addTaskMixin], // todo: move to comp or to store
        directives: { 'b-list-group': BListGroup, 'b-list-group-item': BListGroupItem },
        computed: {
            ...mapState({
                bookmarked: state => state.moduleUser.bookmarked
            })
        },
        methods: {
            ...mapActions({
                saveSelectedTasksToStorage: 'moduleUser/saveSelectedTasksToStorage',
                toggleBookmarked: 'moduleUser/toggleBookmarked'
            }),
            ...mapMutations({
                addSelectedTask: 'moduleUser/addSelectedTask'
            })
        }
	}
</script>
