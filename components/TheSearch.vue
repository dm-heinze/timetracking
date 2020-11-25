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
    import AutocompletedSearch from "~/components/AutocompletedSearch";
    import ProjectBasedSearch from "~/components/ProjectBasedSearch";
    import SearchResults from "~/components/SearchResults";

    export default {
        name: "TheSearch",
        components: { AutocompletedSearch, ProjectBasedSearch, SearchResults },
    }
</script>
