import _ from "lodash";

export const searchAriaLabelMixin = {
    computed: {
        searchFieldButtonAriaLabel () {
            if (!this.searchLoading && this.searchTerm === '') return 'visual only search icon';
            if (!this.searchLoading && this.searchTerm !== '') return 'reset search';
            if (this.searchLoading) return 'search loading indicator';
        }
    }
}
export const smartPickedIssuesMixin = {
    computed: {
        smartPickedSuggestions () {
            return _.slice(this.prefilledSearchSuggestions.filter((__ticket) => __ticket.assignee !== this.currentUser), 0, 5) // end excluded
        }
    }
}
