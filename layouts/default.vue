<template>
    <div class="row" :style="{ overflow: 'hidden' }">
        <div class="col-12">
            <nuxt />
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import _ from "lodash";

    export default {
        computed: {
            _() {
                return _;
            },
            ...mapState({
                currentUser: state => state.moduleUser.currentUser,
            })
        },
        data() {
            return {
                name: 'default.vue'
            }
        }
    }
</script>
