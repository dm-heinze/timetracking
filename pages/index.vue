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
                            <settings-sidebar v-if="settingsOpen" />
                        </transition>
                    </div>
                </b-col>
                <b-col cols="12" lg="8" class="container--right vh-100">
                    <div class="col-xl-11 col-xxl-10">
                        <div class="d-flex justify-content-between container--right__main-actions" :class="{ 'flex-column': $mq === 'sm' }">
                            <div class="d-flex" :class="[flexDirection, { 'pr-3': $mq === 'md' ||  $mq === 'lg' }]">
                                <add-custom-task />

                                <break />
                            </div>
                            <div class="d-flex" :class="[flexDirection, { 'align-items-center': $mq === 'md' || $mq === 'lg' || $mq === 'mdp' || $mq === 'plg' }]">
                                <total-time />

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
    import { mapState, mapActions, mapMutations } from 'vuex';
    import SelectedTasks from "~/components/main/tasks/SelectedTasks";
    import AddCustomTask from "~/components/main/tasks/AddCustomTask";
    import PushTotalTime from "~/components/main/tasks/PushTotalTime";
    import TotalTime from "~/components/main/tasks/TotalTime";
    import SearchSidebar from "~/components/search-sidebar/SearchSidebar";
    import ActiveBreak from "~/components/main/ActiveBreak";
    import Break from "~/components/main/Break";
    import { mainButtonsFlexDirectionMixin } from "~/utility/mixins";

    export default {
        name: 'Index',
        components: {
            TotalTime,
            ActiveBreak,
            Break,
            SearchSidebar,
            PushTotalTime,
            AddCustomTask,
            SelectedTasks,
            SettingsSidebar: () => import('~/components/settings-sidebar/SettingsSidebar')
        },
        mixins: [mainButtonsFlexDirectionMixin],
        computed: {
            ...mapState({
                settingsOpen: state => state.moduleUser.settingsOpen,
                searchResults: state => state.moduleUser.searchResults
            }),
            marginBottomTitle () {
                if (this.$mq === 'sm') return { marginBottom: '80px' }
                if (this.$mq === 'lg') return { marginBottom: '180px' }
                else return { marginBottom: '90px' }
            },
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
