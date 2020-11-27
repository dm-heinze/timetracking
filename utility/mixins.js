export const searchAriaLabelMixin = {
    computed: {
        searchFieldButtonAriaLabel () {
            if (!this.searchLoading && this.searchTerm === '') return 'visual only search icon';
            if (!this.searchLoading && this.searchTerm !== '') return 'reset search';
            if (this.searchLoading) return 'search loading indicator';
        }
    }
}

export const resetSearchMixin = { // todo
    methods: {
        resetSearch: function (close = false) {
            this.setSearchTerm('');

            this.setSearchResult([]);

            if (close) this.toggleSettings();
        }
    }
}
