<template>
  <div class="space-y-3">
    <div class="form-control">
      <div class="input-group">
        <input
          v-model="searchTerm"
          @input="requestSearch"
          @keyup.esc="resetSearch()"
          type="text"
          placeholder="Search..."
          class="input input-bordered rounded-full border-r-0 pl-6 w-full"
          aria-label="Search for tickets"
        />
        <button @click="!searchLoading && searchTerm !== '' ? resetSearch() : false" class="btn btn-outline border-l-0 border-base-content border-opacity-20 pl-4 pr-5 w-14 h-12" :class="{ 'loading': searchLoading }" :disabled="searchTerm === '' && searchLoading">
          <search-icon v-if="!searchLoading && searchTerm === ''" class="w-5 h-5" />
          <x-icon v-if="!searchLoading && searchTerm !== ''" class="w-5 h-5" />
        </button>
      </div>
    </div>

    <IssuePicker
      :issues="issues"
      bookmarkable
      class="space-y-3 pt-2 overflow-y-scroll lg:h-[320px]"
      style="-ms-overflow-style: none; scrollbar-width: none;"
      @select-issue="addIssue"
    />
  </div>
</template>

<script>
import _ from 'lodash';
import { SearchIcon, XIcon } from 'vue-feather-icons';
import IssuePicker from "./IssuePicker.vue";
export default {
  name: 'TheSearch',
  components: {IssuePicker, SearchIcon, XIcon },
  data() {
    return {
      searchTerm: '',
      searchLoading: false,
      issues: []
    }
  },
  methods: {
    requestSearch: _.debounce(async function () {
      if (!_.isEmpty(this.searchTerm)) {
        try {
          this.searchLoading = true;
          const regexForTicketKeys = /[a-z]+\-[1-9]+[0-9]*$/i;

          let jqlSearchString;
          if (this.searchTerm.match(regexForTicketKeys)) {
            jqlSearchString = `key = '${this.searchTerm}' ORDER BY created DESC`;
          } else {
            jqlSearchString = `summary ~ '${this.searchTerm}' ORDER BY created DESC`;
          }

          const { issues } = await this.$jira.issueSearch.searchForIssuesUsingJqlPost({ jql: jqlSearchString, fields: ['summary'] });
          this.issues = issues;

          this.searchLoading = false;
        } catch (e) {
          this.searchLoading = false;
          console.log(e);
        }
      }
    }, 1000),
    resetSearch: function () {
      this.searchTerm = '';
      this.issues = [];
    },
    addIssue: function (issue) {
      this.$emit('select-issue', issue);
    }
  }
}
</script>

<style lang="scss">
.btn.loading:before {
  margin-right: 0;
}
</style>
