<template>
    <b-collapse is-nav id="breakTracker">
        <b-navbar-nav class="d-flex flex-row justify-content-center align-items-center stickyBreakTracker">
            <coffee-icon class="mr-2" />
            You are currently on a break for
            <span class="font-weight-bold mr-3 ml-1" :style="{ width: '80px' }">{{ accumulatedBreakTime }}</span>
            <b-button pill @click.prevent="toggleBreak" v-b-toggle.breakTracker type="button" class="login-content__sign-in-btn pt-2 pb-2 mr-1">
                <pause-circle-icon />
                <span class="pl-1">Stop break</span>
            </b-button>
        </b-navbar-nav>
    </b-collapse>
</template>

<script>
    import { mapState, mapMutations } from 'vuex';
    import { CoffeeIcon, PauseCircleIcon } from 'vue-feather-icons';
    import { BCollapse, BNavbarNav } from "bootstrap-vue";

	export default {
		name: "ActiveBreak",
        components: {
            BCollapse, BNavbarNav,
            CoffeeIcon, PauseCircleIcon
        },
        directives: { 'b-collapse': BCollapse, 'b-navbar-nav': BNavbarNav },
        computed: {
            ...mapState({
                accumulatedBreakTime: state => state.moduleUser.accumulatedBreakTime
            })
        },
        methods: {
            ...mapMutations({
                toggleBreakMutation: 'moduleUser/toggleBreak'
            }),
            toggleBreak: function () {
                // start a break immediately
                // -> step 1) set onABreak to true
                this.toggleBreakMutation();
            }
        }
	}
</script>
