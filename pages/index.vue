<template>
    <div>
        Timetracking
        <selected-tasks/>
    </div>
</template>

<script>
    import SelectedTasks from "../components/SelectedTasks";

    export default {
        name: 'Index',
        components: { SelectedTasks }
    }
</script>
