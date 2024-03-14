<template>
  <div class="form-control w-full">
    <label for="theme-switch" class="label">
      <span class="label-text font-bold">Theme</span>
    </label>
    <select id="theme-switch" data-choose-theme class="select select-bordered">
      <option v-for="theme in themes" :value="theme">{{ theme }}</option>
    </select>
  </div>
</template>

<script>
import { themeChange } from 'theme-change'

export default {
  data() {
    return {
      themes: [
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
      ]
    }
  },
  mounted: function () {
    themeChange(false)
  },
}
</script>
