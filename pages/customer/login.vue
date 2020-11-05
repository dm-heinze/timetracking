<template>
    <div class="login-content">
        <b-row class="no-gutters">
            <b-col cols="12" lg="4"  class="login-content__container--left vh-100">
                <div class="login-content__titles" :style="marginBottomTitle">
                    <h3>Sign in to Time Tracker</h3>
                    <h5>Welcome back</h5>
                </div>
                <b-row align-h="center" v-if="$mq === 'sm' || $mq === 'md'" :class="{ 'pt-5': $mq === 'sm', 'pt-1': $mq === 'md', 'pb-2': $mq === 'md' }">
                    <img src="~/assets/images/illustration.svg" alt="illustration" :height="$mq === 'md' ? '250px' : '180px'">
                </b-row>
                <form id="login" class="col-12 mt-4">
                    <div class="row">
                        <b-form-input
                            id="user"
                            type="text"
                            class="form-control rounded-pill pt-4 pl-4 pb-4"
                            placeholder="Username"
                            v-model="userObj.name" />
                    </div>
                    <div class="row mt-3">
                        <b-form-input
                            id="password"
                            type="password"
                            class="form-control rounded-pill pt-4 pl-4 pb-4"
                            placeholder="Password"
                            v-model="userObj.pass" />
                    </div>
                    <div class="row login-content__problem d-flex mt-2" :class="{ 'justify-content-between': $mq === 'lg', 'justify-content-center': $mq === 'sm' || $mq === 'md' }">
                        <div class="login-content__error-message" :class="{ 'ml-4': $mq === 'lg' }">{{ errorMessage }}</div>
                        <div :class="{ 'mr-3': $mq === 'lg' }"><a :href="directLinkPasswordReset">Forgot password?</a></div>
                    </div>
                    <div class="row">
                        <b-button pill variant="primary" @click.prevent="setUser()" type="button" class="mt-4 col-12 login-content__sign-in-btn pt-2 pb-2">Sign In</b-button>
                    </div>
                </form>
            </b-col>
            <b-col cols="12" lg="8" class="login-content__container--right vh-100" v-if="$mq === 'lg'">
                <div class="login-content__titles">
                    <h3>Time Tracker</h3>
                    <h5>by dmf</h5>
                </div>
                <img src="~/assets/images/illustration.svg" alt="illustration" :height="$mq === 'lg' ? '376px' : '275px'" class="mt-5">
            </b-col>
        </b-row>
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
                if (this.$mq === 'lg') return { marginBottom: '180px' }
                else return { marginBottom: '90px' }
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
