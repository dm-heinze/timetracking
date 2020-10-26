<template>
    <div>
        <div class="flash-message alert alert-primary" v-if="flashMessage !== null">
            {{flashMessage}}
            <button type="button" class="close" @click="closeFlashMessage()" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';

    export default {
        name: "FlashMessage",
        data() {
          return {
              message: null
          }
        },
        computed: {
            ...mapState({
                flashMessage: state => state.moduleFlashMessage.message
            })
        },
        methods: {
            closeFlashMessage: function() {
                this.$store.commit('moduleFlashMessage/resetMessage');
            }
        }
    }
</script>
