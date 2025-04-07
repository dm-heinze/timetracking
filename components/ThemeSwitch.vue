<template>
    <div class="form-control w-full">
        <label for="theme-switch" class="label">
            <span class="label-text font-bold">Theme</span>
        </label>
        <select
            id="theme-switch"
            v-model="currentTheme"
            @change="changeTheme"
            class="select select-bordered"
        >
            <option v-for="theme in themes" :key="theme" :value="theme">{{ theme }}</option>
        </select>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const themes = ref([
    'dmf',
    'dark',
    'cupcake',
    'bumblebee',
    'emerald',
    'corporate',
    'synthwave',
    'retro',
    'cyberpunk',
    'valentine',
    'halloween',
    'garden',
    'forest',
    'aqua',
    'lofi',
    'pastel',
    'fantasy',
    'wireframe',
    'black',
    'luxury',
    'dracula',
    'cmyk',
    'autumn',
    'business',
    'acid',
    'lemonade',
    'night',
    'coffee',
    'winter'
])

const currentTheme = ref('dmf')

onMounted(() => {
    if (process.client) {
        // Gespeichertes Theme laden
        currentTheme.value = localStorage.getItem('theme') || 'dmf'
        document.documentElement.setAttribute('data-theme', currentTheme.value)
    }
})

function changeTheme() {
    if (process.client) {
        // Theme speichern und anwenden
        localStorage.setItem('theme', currentTheme.value)
        document.documentElement.setAttribute('data-theme', currentTheme.value)
    }
}
</script>