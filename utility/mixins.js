export const searchAriaLabelMixin = {
    computed: {
        searchFieldButtonAriaLabel () {
            if (!this.searchLoading && this.searchTerm === '') return 'visual only search icon';
            if (!this.searchLoading && this.searchTerm !== '') return 'reset search';
            if (this.searchLoading) return 'search loading indicator';
        }
    }
}

export const mainButtonsFlexDirectionMixin = {
    computed: {
        flexDirection () {
            return `flex-${this.$mq === 'sm' ? 'column' : 'row'}`
        }
    }
}
