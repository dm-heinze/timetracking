<template>
    <div class="login-content">
        <b-row class="no-gutters">
            <b-col cols="12" lg="4" class="login-content__container--left vh-100">
                <div class="login-content__titles" :style="marginBottomTitle">
                    <h3>Sign in to Time Tracker</h3>
                    <div class="subtitle">Welcome back</div>
                </div>
                <b-row align-h="center" v-if="$mq === 'sm' || $mq === 'md'" :class="{ 'pt-5': $mq === 'sm', 'pt-1': $mq === 'md', 'pb-2': $mq === 'md' }">
                    <img src="~/assets/images/login.png" alt="illustration" :height="$mq === 'md' ? '250px' : '180px'">
                </b-row>
                <form id="login" class="col-12 mt-4">
                    <div class="row">
                        <b-form-input
                            id="user"
                            type="text"
                            class="form-control rounded-pill pt-4 pl-4 pb-4"
                            placeholder="Username"
                            v-model="userObj.name"
                            @keyup.enter.prevent="submitLoginForm()"
                            aria-label="username"
                        />
                    </div>
                    <div class="row mt-3 login__input-container--password">
                        <b-form-input
                            id="password"
                            :type="passwordHidden ? 'password' : 'text'"
                            class="form-control rounded-pill pt-4 pl-4 pb-4"
                            placeholder="Password"
                            v-model="userObj.pass"
                            @keyup.enter.prevent="submitLoginForm()"
                            aria-label="user password"
                        />
                        <template v-if="userObj.pass">
                            <eye-icon v-if="passwordHidden" @click="togglePasswordHidden()" class="select__icon show" />
                            <eye-off-icon v-else @click="togglePasswordHidden()" class="select__icon hide" />
                        </template>
                    </div>
                    <div class="row login-content__problem d-flex mt-2" :class="{ 'justify-content-between': $mq === 'lg' || $mq === 'plg', 'flex-column text-center': $mq === 'sm' || $mq === 'md' || $mq === 'mdp' }">
                        <div class="login-content__error-message" :class="{ 'ml-4': $mq === 'lg' }">{{ errorMessage }}</div>
                        <div :class="{ 'mr-3': $mq === 'lg' }"><a :href="directLinkPasswordReset">Forgot password?</a></div>
                    </div>
                    <div class="row">
                        <b-button
                            pill
                            variant="primary"
                            type="button"
                            class="mt-4 col-12 login-content__sign-in-btn pt-2 pb-2"
                            :disabled="loading"
                            @click.prevent="submitLoginForm()"
                        >
                            <b-icon v-if="loading" icon="three-dots" animation="cylon" font-scale="1"></b-icon>
                            <span v-else>Sign In</span>
                        </b-button>
                    </div>
                </form>
            </b-col>
            <b-col cols="12" lg="8" class="login-content__container--right vh-100" v-if="$mq === 'lg' || $mq === 'plg' || $mq === 'mdp'">
                <div class="login-content__titles">
                    <h3>Time Tracker</h3>
                    <div class="subtitle">by dmf</div>
                </div>
                <img src="~/assets/images/login.png" alt="illustration" :height="($mq === 'lg' || $mq === 'plg') ? '376px' : '275px'" class="mt-5">
            </b-col>
        </b-row>
    </div>
</template>

<script>
    import _ from "lodash";
    import { mapActions } from 'vuex';
    import { BIcon, BIconThreeDots, BFormInput } from 'bootstrap-vue';
    import { EyeIcon, EyeOffIcon } from 'vue-feather-icons';

    export default {
        name: 'login',
        components: { BIcon, BIconThreeDots, BFormInput, EyeIcon, EyeOffIcon },
        directives: { 'b-form-input': BFormInput, 'b-icon': BIcon, 'b-icon-three-dots': BIconThreeDots },
        data() {
            return {
                userObj: {
                    name: null,
                    pass: null
                },
                errorMessage: '',
                loading: false,
                passwordHidden: true
            }
        },
        computed: {
            // todo
            directLinkPasswordReset () {
                return '#'
            },
            marginBottomTitle () {
                if (this.$mq === 'sm') return { marginBottom: '80px' }
                if (this.$mq === 'lg' || this.$mq === 'plg') return { marginBottom: '180px' }
                if (this.$mq === 'mdp') return { marginBottom: '130px' }
                else return { marginBottom: '90px' }
            }
        },
        methods: {
            ...mapActions({
                requestLogin: 'moduleUser/requestLogin',
            }),
            submitLoginForm: function () {
                if (_.isEmpty(this.userObj.name) || _.isEmpty(this.userObj.pass)) {
                    this.errorMessage = "Please enter both username and password."
                } else {
                    this.loading = true;

                    this.requestLogin({ data: this.userObj })
                        .then(() => this.$router.push('/', () => this.loading = false))
                        .catch((__errorMessage) => {
                            this.loading = false;

                            this.errorMessage = __errorMessage; // todo
                        });
                }
            },
            togglePasswordHidden () {
                this.passwordHidden = !this.passwordHidden;
            }
        }
    }
</script>
