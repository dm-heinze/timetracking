<template>
    <div>
        <div>{{ customTaskKey }}</div>
        <button @click.prevent="removeTask">Delete</button>
    </div>
</template>

<script>
    import { mapMutations } from 'vuex';
    export default {
        name: "CustomTask",
        props: {
          customTaskKey: {
            type: String,
            required: true
          }
        },
        methods: {
            ...mapMutations({
                removeCustomTask: 'moduleUser/removeCustomTask'
            }),
            removeTask: function () {
                this.removeCustomTask(this.customTaskKey);
            }
        }
    }
</script>
