<template>
    <div class="login-content">
        <b-container>
            <b-row>
                <b-col cols="12" lg="3"  class="login-content__container--left">
                    <div class="login-content__titles" :style="marginBottomTitle">
                        <h3>Sign in to Time Tracker</h3>
                        <h5>Welcome back</h5>
                    </div>
                    <b-row align-h="center" v-if="$mq === 'sm'"><img src="~/assets/images/illustration.svg" height="150px"></b-row>
                    <form id="login" class="col-12 mt-4">
                        <div class="row">
                            <b-form-input
                                id="user"
                                type="text"
                                class="form-control rounded-pill"
                                placeholder="Username"
                                v-model="userObj.name" />
                        </div>
                        <div class="row mt-3">
                            <input
                                id="password"
                                type="password"
                                class="form-control rounded-pill"
                                placeholder="Password"
                                v-model="userObj.pass" />
                        </div>
                        <div class="row login-content__problem d-flex justify-content-between mt-2">
                            <div v-if="errorMessage" class="login-content__error-message">{{ errorMessage }}</div>
                            <div><a :href="directLinkPasswordReset">Forgot password?</a></div>
                        </div>
                        <div class="row">
                            <b-button pill variant="primary" @click.prevent="setUser()" type="button" class="mt-4 col-12 login-content__sign-in-btn">Sign In</b-button>
                        </div>
                    </form>
                </b-col>
                <b-col cols="12" lg="7" class="login-content__container--right">
                    <div class="login-content__titles" v-if="$mq === 'lg'">
                        <h3>Time Tracker</h3>
                        <h5>by {{ brandName }}</h5>
                    </div>
                    <img src="~/assets/images/illustration.svg" height="276px" v-if="$mq === 'md' || $mq === 'lg'" class="mt-4">
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script>
    import { mapActions } from 'vuex';

    export default {
        name: 'login',
        data() {
            return {
                userObj: {
                    name: null,
                    pass: null
                },
                errorMessage: ''
            }
        },
        computed: {
            directLinkPasswordReset () {
                return '#'
            },
            marginBottomTitle () {
                if (this.$mq === 'sm') return { marginBottom: '80px' }
                else return { marginBottom: '180px' }
            },
            brandName () {
                return process.env.BRAND_NAME;
            }
        },
        methods: {
            ...mapActions({
                createApiObject: 'moduleUser/createApiObject',
            }),
            setUser: function () {
                this.createApiObject({ data: this.userObj })
                    .then(() => this.$router.push('/'))
                    .catch((__errorMessage) => this.errorMessage = __errorMessage);
            }
        },
        mounted() {
            this.$router.push('/')
        }
    }
</script>
