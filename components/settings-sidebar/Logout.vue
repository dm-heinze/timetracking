<template>
    <b-button pill variant="danger" @click.prevent="removeCurrentSession" type="button" class="login-content__sign-in-btn button--logout pt-2 pb-2 mr-1 w-100">
        <log-out-icon />
        <span class="pl-1">Logout</span>
    </b-button>
</template>

<script>
    import { mapActions, mapMutations } from 'vuex';
    import { LogOutIcon } from "vue-feather-icons";

	export default {
		name: "Logout",
        components: { LogOutIcon },
        methods: {
            ...mapMutations({
                toggleSettings: 'moduleUser/toggleSettings'
            }),
            ...mapActions({
                requestSessionRemoval: 'moduleUser/requestSessionRemoval',
                resetState: 'moduleUser/resetState'
            }),
            removeCurrentSession: function () {
                this.toggleSettings();

                this.requestSessionRemoval()
                    .then(() => {
                        this.resetState()
                            .then(() => this.$router.push('/customer/login'))
                    })
                    .catch(() => console.log("err occurred"));
            }
        }
	}
</script>
