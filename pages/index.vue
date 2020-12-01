<template>
    <div class="overview" :class="{ 'container': $mq === 'sm' }">
        <div class="w-100">
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

                                <b-button pill @click.prevent="toggleBreak" v-b-toggle.breakTracker type="button" class="login-content__sign-in-btn py-2 mr-1" v-b-tooltip.hover title="Take a break" :class="{ 'mb-3': $mq === 'sm', 'px-5': $mq === 'md' || $mq === 'mdp' || $mq === 'plg' }">
                                    <coffee-icon />
                                    <span class="pl-1" v-if="$mq === 'lg' || $mq === 'sm'">Take a break</span>
                                </b-button>
                                <client-only>
                                    <button  @click.prevent="resetBreakTracker" class="button--resetBreakTracker ml-1 mr-2 px-3" v-b-tooltip.hover title="Reset Break Tracker" ref="resetBreakButton" id="resetTrackedBreakTime" v-if="!onABreak && (accumulatedBreakTime != '00:00:00')">
                                        <rotate-ccw-icon />
                                    </button>
                                </client-only>
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
    import { CoffeeIcon, PauseCircleIcon, RotateCcwIcon } from 'vue-feather-icons';
    import { BCollapse, BNavbarNav } from "bootstrap-vue";
    import SelectedTasks from "~/components/main/tasks/SelectedTasks";
    import AddCustomTask from "~/components/main/tasks/AddCustomTask";
    import PushTotalTime from "~/components/main/tasks/PushTotalTime";
    import SearchSidebar from "~/components/search-sidebar/SearchSidebar";

    export default {
        name: 'Index',
        components: {
            SearchSidebar,
            PushTotalTime,
            AddCustomTask, SelectedTasks, Settings: () => import('~/components/settings-sidebar/Settings'),
            BCollapse, BNavbarNav,
            CoffeeIcon, PauseCircleIcon, RotateCcwIcon
        },
        directives: { 'b-collapse': BCollapse, 'b-navbar-nav': BNavbarNav },
        data () {
            return {
                // break
                timeRightNow: 0,
                runningTimer: '',
                startTime: '',
                endTime: '',
                initialLoggedBreak: ''
            }
        },
        computed: {
            ...mapState({
                selectedTasks: state => state.moduleUser.selectedTasks,
                // break
                accumulatedBreakTime: state => state.moduleUser.accumulatedBreakTime,
                onABreak: state => state.moduleUser.onABreak,
                isTimerActive: state => state.moduleUser.isTimerActive,
                activeTicket: state => state.moduleUser.activeTicket,
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

                const dateFromTotalWorkTime = new Date(0, 0, 0, 0, 0,0, sumOfWorkedTime);  // todo

                return dateFromTotalWorkTime.toTimeString().slice(0, 8);
            },
            flexDirection () {
                return `flex-${this.$mq === 'sm' ? 'column' : 'row'}`
            }
        },
        watch: {
            onABreak: function(newValue) {
                if (newValue) {
                    this.initialLoggedBreak = this.accumulatedBreakTime;

                    this.runningTimer = setInterval(() => this.currentTimeInSeconds(), 1000);
                } else {
                    // stop interval when onABreak is set to false
                    this.endTime = new Date();

                    clearInterval(this.runningTimer);

                    // save to localStorage
                    this.saveBreaksToStorage();
                }
            },
            settingsOpen: function(newValue) {
                if (newValue && this.searchResults.length !== 0) this.setSearchResult([]);
            },
            $mq: function (newValue) {
                if (newValue === 'lg' || newValue === 'sm') this.$root.$emit('bv::disable::tooltip');
                else this.$root.$emit('bv::enable::tooltip');

                if (this.$refs.resetBreakButton) this.$root.$emit('bv::enable::tooltip', 'resetTrackedBreakTime'); // todo
            }
        },
        methods: {
            ...mapActions({
                requestAllProjects: 'moduleUser/requestAllProjects',
                saveBreaksToStorage: 'moduleUser/saveBreaksToStorage',
            }),
            ...mapMutations({
                // break
                toggleBreakMutation: 'moduleUser/toggleBreak',
                updateTotalBreakTime: 'moduleUser/updateTotalBreakTime',
                setIsTimerActive: 'moduleUser/setIsTimerActive',
                setLastTicket: 'moduleUser/setLastTicket',
                addBreak: 'moduleUser/addBreak',
                setSearchResult: 'moduleUser/setSearchResult'
            }),
            // break
            toggleBreak: function () {
                // todo
                // start a break immediately
                // -> step 1) set onABreak to true

                this.toggleBreakMutation();

                if (this.isTimerActive) {
                    this.setLastTicket(this.activeTicket);

                    // this stops any active timer bc of watcher on isTimerActive in SelectedTask
                    this.setIsTimerActive();
                }

                this.startTime = new Date();
            },
            resetBreakTracker: function () {
                // update vuex store
                this.updateTotalBreakTime({ totalBreakTime: '00:00:00' });

                // update localStorage & show feedback
                this.saveBreaksToStorage()
                    .then(() => {
                        this.$bvModal.msgBoxOk('Break Tracker was successfully reset to 00:00:00.', {
                            centered: true,
                            okVariant: 'success rounded-pill',
                            okTitle: 'Okay',
                            bodyClass: 'modal__main-container',
                            footerClass: 'modal__main-container modal__actions modal__feedback__footer'
                        })
                    })
                    .catch(() => {
                        this.$bvModal.msgBoxOk('There has been an error. Break Tracker could not be reset.', {
                            centered: true,
                            okVariant: 'danger rounded-pill',
                            okTitle: 'Okay',
                            bodyClass: 'modal__main-container',
                            footerClass: 'modal__main-container modal__actions modal__feedback__footer'
                        })
                    });
            },
            currentTimeInSeconds: function () {
                const __dateRightNow = new Date();

                this.timeRightNow = __dateRightNow;

                const calculatedDifference = this.timeRightNow.getTime() - this.startTime.getTime();

                let breakTimeAsDate = new Date(__dateRightNow.getFullYear(), __dateRightNow.getMonth(), __dateRightNow.getDate(), 0, 0, 0, calculatedDifference);


                if (this.accumulatedBreakTime != '00:00:00') {
                    const initialBreakInArrayFormat = this.initialLoggedBreak.split(":");

                    const currentBreakTimeInArrayFormat = breakTimeAsDate.toTimeString().slice(0, 8).split(":");

                    const summedUpInitialAndNewBreak = _.zipWith(initialBreakInArrayFormat, currentBreakTimeInArrayFormat, (a, b) => Number(a) + Number(b));

                    breakTimeAsDate = new Date(__dateRightNow.getFullYear(), __dateRightNow.getMonth(), __dateRightNow.getDate(), summedUpInitialAndNewBreak[0], summedUpInitialAndNewBreak[1], summedUpInitialAndNewBreak[2], 0);
                }

                // update vuex store with totalBreakTime
                this.updateTotalBreakTime({ totalBreakTime:  breakTimeAsDate.toTimeString().slice(0, 8) });

                // save to localStorage
                this.saveBreaksToStorage();
            }
        },
        middleware ({ store, redirect }) {
            return new Promise((resolve, reject) => {
                store.dispatch('moduleUser/requestPrefill')
                    .then(() => resolve())
                    .catch((err) => {
                        redirect('/customer/login');
                        reject();
                    })
            })
        },
        mounted() {
            this.requestAllProjects();

            // wait for rendering
            this.$nextTick(function () {
                if (this.$mq === 'lg' || this.$mq === 'sm') this.$root.$emit('bv::disable::tooltip');

                if (this.$refs.resetBreakButton) this.$root.$emit('bv::enable::tooltip', 'resetTrackedBreakTime'); // todo
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
