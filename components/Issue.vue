<template>
  <div class="flex flex-col p-5 border rounded gap-2 bg-base-100 md:flex-row md:flex-wrap md:justify-between md:gap-3 lg:justify-around lg:gap-4" :class="{ 'border-success bg-success-100': issueData.interval !== null, 'border-error': isCustomTask}">
    <div v-if="isCustomTask" class="w-full text-center md:text-left md:w-[200px] md:max-w-[200px] lg:mr-auto">
      <div v-if="!editName" class="font-bold text-primary">{{ issueData.name }}</div>
      <input v-if="editName" v-model="customTaskName" class="input input-bordered"/>
    </div>
    <a v-else :href="`${$jiraResource.url}/browse/${issueData.key}`" class="w-full text-center md:text-left md:w-[200px] md:max-w-[200px] lg:mr-auto hover:underline" target="_blank" rel="noopener">
      <div class="font-bold text-primary">{{ issueData.key }}</div>
      <div class="text-neutral-content text-sm text-truncate">{{ issueData?.fields?.summary }}</div>
    </a>
    <div class="flex flex-col gap-2 md:flex-row items-center">
      <button v-if="isCustomTask && !editName" @click="editName = true" :disabled="issueData.interval !== null" class="btn btn-sm btn-outline btn-neutral w-full md:w-auto"><Edit2Icon class="w-4 h-4 mr-1" /> Edit Name</button>
      <button v-if="isCustomTask && editName" @click="editName = false" :disabled="issueData.interval !== null" class="btn btn-sm btn-outline btn-success w-full md:w-auto"><SaveIcon class="w-4 h-4 mr-1" /> Save Name</button>
      <button @click="requestAction('assignIssue')" :disabled="issueData.interval !== null" class="btn btn-sm btn-outline btn-neutral w-full md:w-auto"><PlusCircleIcon class="w-4 h-4 mr-1" /> Assign Ticket</button>
    </div>
    <div class="flex justify-center items-center md:ml-auto md:gap-2 lg:ml-0">
      <button v-if="issueData.interval === null" @click="startTimer()" class="btn btn-circle btn-ghost text-primary"><PlayCircleIcon class="w-6 h-6" /></button>
      <button v-else @click="pauseTimer()" class="btn btn-circle btn-ghost text-primary"><PauseCircleIcon class="w-6 h-6" /></button>
      <button @click="requestAction('addWorklog')" :disabled="issueData.interval !== null || comment === '' || timeWorked === '00:00:00' || isCustomTask" class="btn btn-circle btn-ghost text-primary"><SendIcon class="w-6 h-6" /></button>
      <button @click="requestAction('remove')" :disabled="issueData.interval !== null" class="btn btn-circle btn-ghost text-primary"><Trash2Icon class="w-6 h-6" /></button>
      <div class="text-primary flex-shrink-0">
        <label :for="`timer-${issueData.key}`" class="font-bold">Total:</label>
        <input :id="`timer-${issueData.key}`" :disabled="issueData.interval !== null" v-model="timeWorked" type="time" step="1" class="input min-w-[135px] pr-0" :class="{ 'input-error': timeWorked === '00:00:00' }" />
      </div>
    </div>
    <textarea v-model="comment" class="w-full textarea textarea-bordered rounded p-2 resize-y overflow-hidden h-16" :class="{ 'bg-error/25': comment === '' }" rows="4" />

    <ConfirmationModal @close="showModal = false" @confirm="confirm" :show-modal="showModal" :type="modalType" :issue="issueData" />
  </div>
</template>

<script>
import ConfirmationModal from './ConfirmationModal.vue'
import { PlayCircleIcon, PauseCircleIcon, SendIcon, Trash2Icon, Edit2Icon, PlusCircleIcon, SaveIcon } from 'vue-feather-icons'
export default {
  name: 'Issue',
  components: { ConfirmationModal, PlayCircleIcon, PauseCircleIcon, SendIcon, Trash2Icon, Edit2Icon, PlusCircleIcon, SaveIcon },
  props: {
    issueData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      seconds: 0,
      minutes: 0,
      hours: 0,
      comment: '',
      showModal: false,
      modalType: '',
      editName: false
    }
  },
  computed: {
    timeWorked: {
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
    },
    isCustomTask() {
      return this.issueData.key.includes('CUSTOM')
    },
    customTaskName: {
      get() {
        return this.issueData.name
      },
      set(newVal) {
        this.$store.commit('issues/update', { id: this.issueData.storeId, property: 'name', value: newVal })
      }
    }
  },
  created() {
    this.timeWorked = this.issueData.timeSpent
    this.comment = this.issueData.comment
  },
  watch: {
    timeWorked(newTime) {
      this.$store.commit('issues/update', { id: this.issueData.storeId, property: 'timeSpent', value: newTime })
    },
    comment(newComment) {
      this.$store.commit('issues/update', { id: this.issueData.storeId, property: 'comment', value: newComment })
    }
  },
  methods: {
    startTimer: function() {
      this.editName = false
      this.$store.commit('break/setState', { stateName: 'active', value: false })
      this.stopActiveTimers()

      if(this.issueData.interval !== null) {
        clearInterval(this.issueData.interval)
      }

      this.$store.commit('issues/update', { id: this.issueData.storeId, property: 'interval', value: setInterval(this.processTimer, 1000) })
    },
    pauseTimer: function() {
      clearInterval(this.issueData.interval)
      this.$store.commit('issues/update', { id: this.issueData.storeId, property: 'interval', value: null })
    },
    stopActiveTimers: function () {
      const activeIssues = this.$store.state.issues.list.filter(issue => issue.interval !== null)
      activeIssues.map((issue) => {
        clearInterval(issue.interval)
        this.$store.commit('issues/update', { id: issue.storeId, property: 'interval', value: null })
      })
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
    requestAction: function(action) {
      this.modalType = action
      this.showModal = true
    },
    confirm: function(payload) {
      if (this.modalType === 'remove') {
        this.removeIssue()
      }

      if (this.modalType === 'addWorklog') {
        this.addWorklog()
      }

      if (this.modalType === 'assignIssue') {
        this.assignIssue(payload)
      }
    },
    resetModal: function() {
      this.showModal = false
      setTimeout(() => {
        this.modalType = ''
      }, 500)
    },
    removeIssue: function() {
      this.$store.commit('issues/remove', { id: this.issueData.storeId })
      this.resetModal()
    },
    addWorklog: async function() {
      try {
        await this.$jira.issueWorklogs.addWorklog({
          issueIdOrKey: this.issueData.key,
          comment: this.issueData.comment,
          timeSpent: this.parseJiraTimeFormat(this.issueData.timeSpent)
        })

        this.removeIssue()
      } catch (e) {
        console.log(e)
      }
    },
    assignIssue: async function(payload) {
      try {
        this.$store.commit('issues/override', { id: this.issueData.storeId, issue: payload })
        this.resetModal()
      } catch (e) {
        console.log(e)
      }
    }
  },
  beforeDestroy() {
    clearInterval(this.issueData.interval)
  }
}
</script>
