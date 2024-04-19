<template>
  <div>
    <input v-model="showModal" type="checkbox" class="modal-toggle" />
    <div class="modal">
      <div class="modal-box rounded p-0">
        <template v-if="type === 'remove'">
          <div class="flex justify-between items-center py-2 px-7 border-b">
            <div class="font-bold text-primary">Delete Task?</div>
            <div @click="closeModal" class="btn btn-circle btn-ghost text-primary -mr-3"><XIcon /></div>
          </div>
          <div class="py-5 px-7 border-b text-primary text-sm">
            Delete tracker for <span class="font-bold">{{ issue?.key }} {{ issue?.fields?.summary }}</span>
          </div>
          <div class="flex justify-between py-3 px-7">
            <button @click="closeModal" class="btn btn-ghost">Cancel</button>
            <button @click="confirm" class="btn btn-primary">Delete</button>
          </div>
        </template>
        <template v-else-if="type === 'addWorklog'">
          <div class="flex justify-between items-center py-2 px-7 border-b">
            <div class="font-bold text-primary">Push Single Task?</div>
            <div @click="closeModal" class="btn btn-circle btn-ghost text-primary -mr-3"><XIcon /></div>
          </div>
          <div class="py-5 px-7 border-b text-primary text-sm">
            Are you sure you want to book tracked time for <span class="font-bold">{{ issue?.key }} {{ issue?.fields?.summary }}</span>
          </div>
          <div class="flex justify-between py-3 px-7">
            <button @click="closeModal" class="btn btn-ghost">Cancel</button>
            <button @click="confirm" class="btn btn-primary">Push Time</button>
          </div>
        </template>
        <template v-else-if="type === 'addWorklogs'">
          <div class="flex justify-between items-center py-2 px-7 border-b">
            <div class="font-bold text-primary">Push Time?</div>
            <div @click="closeModal" class="btn btn-circle btn-ghost text-primary -mr-3"><XIcon /></div>
          </div>
          <div class="py-5 px-7 border-b text-primary text-sm">
            Are you sure you want to book tracked time?
          </div>
          <div class="flex justify-between py-3 px-7">
            <button @click="closeModal" class="btn btn-ghost">Cancel</button>
            <button @click="confirm" class="btn btn-primary">Push Time</button>
          </div>
        </template>
        <template v-else-if="type === 'addCustomTask'">
          <div class="flex justify-between items-center py-2 px-7 border-b">
            <div class="font-bold text-primary">Add Custom Task</div>
            <div @click="closeModal" class="btn btn-circle btn-ghost text-primary -mr-3"><XIcon /></div>
          </div>
          <div class="py-5 px-7 border-b text-primary text-sm">
            Do you want to add a custom name? Otherwise a random name will be set. You can edit the name later regardless.
            <input v-model="customTaskName" type="text" placeholder="Enter Custom Name" class="input input-bordered w-full mt-5" />
          </div>
          <div class="flex justify-between py-3 px-7">
            <button @click="closeModal" class="btn btn-ghost">Cancel</button>
            <button @click="confirm({ customTaskName })" class="btn btn-primary">Add Task</button>
          </div>
        </template>
        <template v-else-if="type === 'assignIssue'">
          <div class="flex justify-between items-center py-2 px-7 border-b">
            <div class="font-bold text-primary">Assign Ticket</div>
            <div @click="closeModal" class="btn btn-circle btn-ghost text-primary -mr-3"><XIcon /></div>
          </div>
          <div class="py-5 px-7 border-b text-primary text-sm">
            <Search @select-issue="confirm" />
          </div>
        </template>
        <template v-else>
          <div class="flex justify-between items-center py-2 px-7 border-b">
            <div class="font-bold text-primary">Something went wrong</div>
            <div @click="closeModal" class="btn btn-circle btn-ghost text-primary -mr-3"><XIcon /></div>
          </div>
          <div class="py-5 px-7 border-b text-primary text-sm">
            No confirmation type isset
          </div>
          <div class="flex justify-between py-3 px-7">
            <button @click="closeModal" class="btn btn-ghost">Cancel</button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { XIcon } from 'vue-feather-icons'
import Search from "./Search.vue";
export default {
  name: 'ConfirmationModal',
  components: { Search, XIcon },
  props: {
    showModal: {
      required: true,
      type: Boolean
    },
    type: {
      required: true,
      type: String
    },
    issue: {
      required: false,
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      customTaskName: ''
    }
  },
  methods: {
    closeModal: function () {
      this.$emit('close')
    },
    confirm: function (payload) {
      this.$emit('confirm', payload)
    }
  }
}
</script>
