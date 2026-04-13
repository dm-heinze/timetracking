<template>
    <div>
        <div
            v-for="project in projects"
            :key="project.id"
            class="relative group w-full grid grid-cols-6 justify-between items-center gap-4 border rounded py-4 px-5 hover:shadow-md cursor-pointer transition"
            @click="selectProject(project)"
        >
            <div class="col-span-5 flex flex-col max-w-[280px]">
                <div class="text-primary font-bold">{{ project.key }}</div>
                <div class="text-truncate text-sm text-neutral-content">{{ project.name }}</div>
            </div>
            <div class="col-span-1 text-primary justify-self-end">
                <Icon name="lucide:search" class="w-6 h-6 stroke-primary group-hover:text-accent" />
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    projects: {
        required: true,
        type: Array
    }
})

const emit = defineEmits(['select-project'])

function selectProject(project) {
    emit('select-project', project)
}
</script>
