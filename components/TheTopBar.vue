<template>
  <div class="flex flex-col justify-between items-center gap-4 md:flex-row md:flex-wrap">
    <button @click="requestAction('addCustomTask')" class="btn btn-primary">
      <PlusCircleIcon class="w-5 h-5" />
      <span class="ml-2 md:hidden xl:block">Add a custom task</span>
    </button>
    <button @click="onStartBreak()" class="btn btn-secondary" :disabled="breakActive">
      <CoffeeIcon class="w-5 h-5" />
      <span class="ml-2 md:hidden xl:block">Take a break</span>
    </button>

    <div class="flex flex-col md:ml-auto items-end">
      <div>Worked: <span class="font-bold">{{ timeSpentTotal }}</span></div>
      <div class="flex gap-1 items-center">
        <div class="tooltip tooltip-bottom tooltip-primary" data-tip="Reset break time">
          <button @click="onResetBreak()" class="btn btn-xs btn-circle btn-outline" :disabled="breakActive || breakTime === '00:00:00'">
            <RotateCwIcon class="w-4 h-4"/>
          </button>
        </div>
        <span>Break:</span><span class="font-bold">{{ breakTime }}</span>
      </div>
    </div>
    <button @click="requestAction('addWorklogs')" class="btn btn-accent" :disabled="!validIssues">
      <SendIcon class="w-5 h-5" />
      <span class="ml-2 md:hidden xl:block">Push all your tasks</span>
    </button>

    <ConfirmationModal @close="showModal = false" @confirm="confirm" :show-modal="showModal" :type="modalType" />
  </div>
</template>

<script>
import { SendIcon, PlusCircleIcon, CoffeeIcon, RotateCwIcon } from 'vue-feather-icons'

export default {
  name: 'TheTopBar',
  components: { SendIcon, PlusCircleIcon, CoffeeIcon, RotateCwIcon },
  data() {
    return {
      showModal: false,
      modalType: ''
    }
  },
  computed: {
    timeSpentTotal () {
      let totalH = 0
      let totalM = 0
      let totalS = 0

      this.$store.state.issues.list.map((issue) => {
        const [h, m, s] = issue.timeSpent.split(':')

        const intS = parseInt(s)
        const intM = parseInt(m)
        const intH = parseInt(h)

        totalS = intS + totalS
        if (totalS >= 60) {
          totalS = totalS - 60
          totalM++
        }

        totalM = intM + totalM
        if (totalM >= 60) {
          totalM = totalM - 60
          totalH++
        }

        totalH = intH + totalH
      })

      return `${totalH < 10 ? '0' + totalH : totalH }:${totalM < 10 ? '0' + totalM : totalM }:${totalS < 10 ? '0' + totalS : totalS }`
    },
    validIssues () {
      let isValid = true

      if (this.$store.state.issues.list.length === 0) {
        return false
      }

      this.$store.state.issues.list.map((issue) => {
        if (issue.comment === '' || issue.timeSpent === '00:00:00' || issue.key === 'CUSTOM') {
          isValid = false
        }
      })

      return isValid
    },
    breakTime () {
      return this.$store.state.break.time
    },
    breakActive () {
      return this.$store.state.break.active
    }
  },
  methods: {
    requestAction: function(action) {
      this.modalType = action
      this.showModal = true
    },
    confirm: function(payload) {
      if (this.modalType === 'addWorklogs') {
        this.addWorklogs()
      }

      if (this.modalType === 'addCustomTask') {
        this.addCustomTask(payload)
      }
    },
    resetModal: function() {
      this.showModal = false
      setTimeout(() => {
        this.modalType = ''
      }, 500)
    },
    addWorklogs: async function() {
      try {
        await Promise.all(
          this.$store.state.issues.list.map(async (issue) => {
            await this.$jira.issueWorklogs.addWorklog({
              issueIdOrKey: issue.key,
              comment: issue.comment,
              timeSpent: this.parseJiraTimeFormat(issue.timeSpent)
            })

            this.$store.commit('issues/remove', { id: issue.storeId })
          })
        )

        this.onResetBreak()
        this.resetModal()
      } catch (e) {
        console.log(e)
      }
    },
    parseJiraTimeFormat: function(time) {
      let [h, m, s] = time.split(':')

      h = parseInt(h)
      m = parseInt(m)
      s = parseInt(s)

      if(s > 0) {
        m = m + 1
      }

      return `${h}h ${m}m`
    },
    onStartBreak: function() {
      this.$store.commit('break/setState', { stateName: 'active', value: true })
    },
    onResetBreak: function() {
      this.$store.commit('break/setState', { stateName: 'active', value: false })
      this.$store.commit('break/setState', { stateName: 'interval', value: null })
      this.$store.commit('break/setState', { stateName: 'time', value: '00:00:00' })
    },
    addCustomTask: function(payload) {
      this.$store.commit('issues/add', {
        key: 'CUSTOM',
        name: payload.customTaskName !== '' ? payload.customTaskName : new Date().getTime()
      });

      this.resetModal()
    },
  }
}
</script>
