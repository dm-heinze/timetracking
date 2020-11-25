export const searchAriaLabelMixin = {
    computed: {
        searchFieldButtonAriaLabel () {
            if (!this.searchLoading && this.searchTerm === '') return 'visual only search icon';
            if (!this.searchLoading && this.searchTerm !== '') return 'reset search';
            if (this.searchLoading) return 'search loading indicator';
        }
    }
}
