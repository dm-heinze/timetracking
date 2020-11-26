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

export const addTaskMixin = { // todo
    methods: {
        addToSelectedIssues: function (selectedTicket, fromSearchResults = true) {
            let __selection;

            if (fromSearchResults) {
                __selection = _.cloneDeep(selectedTicket);
                __selection.uniqueId = _.now();
            } else {
                __selection = {
                    assignedToTicket: true,
                    uniqueId: _.now(),
                    key: selectedTicket.key,
                    issueLink: process.env.BASE_DOMAIN + process.env.ENDPOINT_BROWSE + selectedTicket.key,
                    summary: selectedTicket.summary,
                    comment: '',
                    timeSpent: 0,
                    startTime: '',
                    endTime: '',
                    booked: false
                };
            }

            this.addSelectedTask(__selection);

            this.saveSelectedTasksToStorage();
        }
    }
}

export const toggleBookmarkedMixin = { // todo
    methods: {
        toggleBookmarked: function (searchResultToBeToggled, summary = '') {
            this.updateBookmarks({ bookmark: searchResultToBeToggled, summary });

            this.saveBookmarksToStorage();
        },
    }
}

export const resetSearchMixin = { // todo
    methods: {
        resetSearch: function (close = false) {
            this.setSearchTerm('');

            this.setSearchResult([]);

            if (close) this.toggleSettings();
        },
    }
}
