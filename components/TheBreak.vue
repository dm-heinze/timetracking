<template>
  <div class="col-span-12 flex justify-center items-center bg-error overflow-hidden text-white transition-all" :class="active ? 'h-20' : 'h-0'">
    <CoffeeIcon class="w-6 h-6 mr-2" />
    <span>You are currently on a break for</span>
    <span class="font-bold ml-1">{{ breakTime }}</span>
    <button @click="onStopBreak()" class="btn btn-secondary ml-4"><PauseCircleIcon class="w-6 h-6 mr-2" />Stop break</button>
  </div>
</template>

<script>
import { CoffeeIcon, PauseCircleIcon } from 'vue-feather-icons'
export default {
  name: 'TheBreak',
  components: { CoffeeIcon, PauseCircleIcon },
  data() {
    return {
      seconds: 0,
      minutes: 0,
      hours: 0
    }
  },
  computed: {
    active () {
      return this.$store.state.break.active
    },
    time () {
      return this.$store.state.break.time
    },
    breakTime: {
      get() {
        let h = this.hours < 10 ? '0' + this.hours : this.hours
        let m = this.minutes < 10 ? '0' + this.minutes : this.minutes
        let s = this.seconds < 10 ? '0' + this.seconds : this.seconds

        return `${h}:${m}:${s}`
      },
      set(time) {
        const [h, m, s] = time.split(':')
        this.hours = parseInt(h)
        this.minutes = parseInt(m)
        this.seconds = parseInt(s)
      }
    }
  },
  created() {
    const [h, m, s] = this.$store.state.break.time.split(':')
    this.hours = parseInt(h)
    this.minutes = parseInt(m)
    this.seconds = parseInt(s)
  },
  mounted() {
    this.onStopBreak()
  },
  watch: {
    active: function (active) {
      if (active) {
        this.stopActiveTimers()

        if (this.$store.state.break.interval !== null) {
          clearInterval(this.$store.state.break.interval)
        }

        this.$store.commit('break/setState', { stateName: 'interval', value: setInterval(this.processTimer, 1000) })
      }

      if (!active) {
        clearInterval(this.$store.state.break.interval)
        this.$store.commit('break/setState', { stateName: 'interval', value: null })
      }
    },
    breakTime(newTime) {
      this.$store.commit('break/setState', { stateName: 'time', value: newTime })
    },
    time(newTime) {
      if (newTime === '00:00:00') {
        this.seconds = 0
        this.minutes = 0
        this.hours = 0
      }
    }
  },
  methods: {
    onStopBreak: function () {
      this.$store.commit('break/setState', { stateName: 'active', value: false })
    },
    processTimer: function() {
      this.seconds++

      if(this.seconds === 60) {
        this.seconds = 0
        this.minutes++

        if(this.minutes === 60) {
          this.minutes = 0
          this.hours++
        }
      }
    },
    stopActiveTimers: function () {
      const activeIssues = this.$store.state.issues.list.filter(issue => issue.interval !== null)
      activeIssues.map((issue) => {
        clearInterval(issue.interval)
        this.$store.commit('issues/update', { id: issue.storeId, property: 'interval', value: null })
      })
    },
  }
}
</script>
