<template>
    <div class="overview" :class="{ 'container': $mq === 'sm' }">
        <div class="w-100">
            <active-break />

            <b-row align-v="stretch" class="no-gutters">
                <b-col cols="12" lg="4" class="container--left vh-100">
                    <div class="login-content__titles">
                        <transition name="toggle">
                            <search-sidebar v-if="!settingsOpen" />
                        </transition>
                        <transition name="toggle">
                            <settings v-if="settingsOpen" />
                        </transition>
                    </div>
                </b-col>
                <b-col cols="12" lg="8" class="container--right vh-100">
                    <div class="col-xl-11 col-xxl-10">
                        <div class="d-flex justify-content-between container--right__main-actions" :class="{ 'flex-column': $mq === 'sm' }">
                            <div class="d-flex" :class="[flexDirection,  { 'pr-3': $mq === 'md' ||  $mq === 'lg' }]">
                                <add-custom-task />

                                <break />
                            </div>
                            <div class="d-flex" :class="[flexDirection, { 'align-items-center': $mq === 'md' || $mq === 'lg' || $mq === 'mdp' || $mq === 'plg' }]">
                                <span v-if="totalTime" :class="{ 'mr-3': $mq === 'md' || $mq === 'lg' || $mq === 'mdp' || $mq === 'plg', 'align-self-center': $mq === 'sm' }">worked so far: <span class="font-weight-bold">{{ totalTime }}</span></span> <!-- todo: condition -->

                                <push-total-time />
                            </div>
                        </div>
                        <selected-tasks />
                    </div>
                </b-col>
            </b-row>
        </div>
    </div>
</template>

<script>
    import _ from "lodash";
    import { mapState, mapActions, mapMutations } from 'vuex';
    import SelectedTasks from "~/components/main/tasks/SelectedTasks";
    import AddCustomTask from "~/components/main/tasks/AddCustomTask";
    import PushTotalTime from "~/components/main/tasks/PushTotalTime";
    import SearchSidebar from "~/components/search-sidebar/SearchSidebar";
    import Break from "~/components/main/Break";
    import { mainButtonsFlexDirectionMixin } from "~/utility/mixins";
    import ActiveBreak from "~/components/main/ActiveBreak";

    export default {
        name: 'Index',
        components: {
            ActiveBreak,
            Break,
            SearchSidebar,
            PushTotalTime,
            AddCustomTask,
            SelectedTasks,
            Settings: () => import('~/components/settings-sidebar/Settings')
        },
        mixins: [mainButtonsFlexDirectionMixin],
        computed: {
            ...mapState({
                selectedTasks: state => state.moduleUser.selectedTasks, // totalTime
                settingsOpen: state => state.moduleUser.settingsOpen,
                searchResults: state => state.moduleUser.searchResults
            }),
            marginBottomTitle () {
                if (this.$mq === 'sm') return { marginBottom: '80px' }
                if (this.$mq === 'lg') return { marginBottom: '180px' }
                else return { marginBottom: '90px' }
            },
            totalTime() { // todo
                let sumOfWorkedTime = 0;
                if (this.selectedTasks.length !== 0) {
                    const __selectedTasks = _.cloneDeep(this.selectedTasks);
                    const allSelectedTasksTimes = __selectedTasks.filter((__selected) => !__selected.booked).filter((__nonBooked) => __nonBooked.timeSpent !== '0' && __nonBooked.timeSpent !== '').map((__selectedTask) => Number.parseInt(__selectedTask.timeSpent))

                    for (let timeSpentOnIndividualSelectedTask of allSelectedTasksTimes) {
                        sumOfWorkedTime += timeSpentOnIndividualSelectedTask
                    }
                }

                // sumOfWorkedTime added as milliseconds bc timeSpent val was saved as milliseconds
                const dateFromTotalWorkTime = new Date(0, 0, 0, 0, 0,0, sumOfWorkedTime);  // todo

                return dateFromTotalWorkTime.toTimeString().slice(0, 8); // remove any non-time related information
            }
        },
        watch: {
            settingsOpen: function(newValue) {
                if (newValue && this.searchResults.length !== 0) this.setSearchResult([]);
            },
            $mq: function (newValue) {
                if (newValue === 'lg' || newValue === 'sm') this.$root.$emit('bv::disable::tooltip');
                else this.$root.$emit('bv::enable::tooltip');
            }
        },
        methods: {
            ...mapActions({
                requestAllProjects: 'moduleUser/requestAllProjects'
            }),
            ...mapMutations({
                setSearchResult: 'moduleUser/setSearchResult'
            })
        },
        middleware ({ store, redirect }) {
            return new Promise((resolve, reject) => {
                store.dispatch('moduleUser/requestPrefill')
                    .then(() => resolve())
                    .catch((err) => {
                        redirect('/customer/login'); // if page requested on reload/initial request: if sessionId invalid requestPrefill will result in this catch block
                        reject();
                    })
            })
        },
        mounted() {
            this.requestAllProjects(); // moved here (from originally vuex store) to client-side to allow page rendering as requested project data will be behind select forms & not immediately apparent if not available

            // wait for rendering
            this.$nextTick(function () {
                // do not show any tooltip for these screens as text visible & not icon-only
                if (this.$mq === 'lg' || this.$mq === 'sm') this.$root.$emit('bv::disable::tooltip');
            })
        }
    }
</script>

<style lang="scss">
    .toggle-enter-active, .toggle-leave-active {
        transition: all .3s ease-in-out;
    }

    .toggle-enter, .toggle-leave-to {
        opacity: 0;
        left: -100%;
    }

    .toggle-enter-to, .toggle-leave {
        opacity: 1;
        left: 0;
    }
</style>
