<template>
    <div>
        <autocompleted-search class="mb-2" />

        <project-based-search />

        <div class="result-wrp">
            <div class="result-item">
                <search-results/>
            </div>
        </div>
    </div>
</template>

<script>
    import AutocompletedSearch from "~/components/search-sidebar/AutocompletedSearch";
    import ProjectBasedSearch from "~/components/search-sidebar/ProjectBasedSearch";
    import SearchResults from "~/components/search-sidebar/SearchResults";

    export default {
        name: "TheSearch",
        components: { AutocompletedSearch, ProjectBasedSearch, SearchResults },
    }
</script>
