<template>
    <div class="container">
      <div class="row">
        <div class="col-xs-12">
          <flash-message />
        </div>
      </div>
      <client-only>
        <div class="row" v-if="!_.isEmpty(currentUser)">
          <div class="col-md-12 header-wrp">
            <navigation/>
            <span class="total-time icon-clock" title="Total amount of time"><span>01:15</span></span>
          </div>
        </div>
      </client-only>
      <div class="row">
        <div class="col-md-12 content-wrp">
          <nuxt />
        </div>
      </div>
    </div>
</template>

<script>
  import { mapState } from 'vuex';
  import FlashMessage from "../components/FlashMessage";
  import _ from "lodash";

  export default {
    components: {FlashMessage},
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
