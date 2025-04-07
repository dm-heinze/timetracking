<template>
    <div>
        <input v-model="showModalValue" type="checkbox" class="modal-toggle" />
        <div class="modal">
            <div class="modal-box rounded p-0">
                <template v-if="type === 'remove'">
                    <div class="flex justify-between items-center py-2 px-7 border-b">
                        <div class="font-bold text-primary">Delete Task?</div>
                        <div @click="closeModal" class="btn btn-circle btn-ghost text-primary -mr-3">
                            <Icon name="lucide:x" />
                        </div>
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
                        <div @click="closeModal" class="btn btn-circle btn-ghost text-primary -mr-3">
                            <Icon name="lucide:x" class="w-5 h-5" />
                        </div>
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
                        <div @click="!loading ? closeModal() : null" class="btn btn-circle btn-ghost text-primary -mr-3">
                            <Icon name="lucide:x" class="w-5 h-5" />
                        </div>
                    </div>
                    <div class="py-5 px-7 border-b text-primary text-sm">
                        Are you sure you want to book tracked time?
                    </div>
                    <div class="flex justify-between py-3 px-7">
                        <button @click="!loading ? closeModal() : null" class="btn btn-ghost">Cancel</button>
                        <button @click="confirm" class="btn btn-primary" :disabled="loading">
                            <span v-show="!loading">Push Time</span>
                            <span v-show="loading" aria-label="Loading..." role="status">
                <svg class="h-6 w-6 animate-spin" viewBox="3 3 18 18">
                  <path
                      class="fill-gray-200"
                      d="M12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19C15.866 19 19 15.866 19 12C19 8.13401 15.866 5 12 5ZM3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z"></path>
                  <path
                      class="fill-primary"
                      d="M16.9497 7.05015C14.2161 4.31648 9.78392 4.31648 7.05025 7.05015C6.65973 7.44067 6.02656 7.44067 5.63604 7.05015C5.24551 6.65962 5.24551 6.02646 5.63604 5.63593C9.15076 2.12121 14.8492 2.12121 18.364 5.63593C18.7545 6.02646 18.7545 6.65962 18.364 7.05015C17.9734 7.44067 17.3403 7.44067 16.9497 7.05015Z"></path>
                </svg>
              </span>
                        </button>
                    </div>
                </template>
                <template v-else-if="type === 'addCustomTask'">
                    <div class="flex justify-between items-center py-2 px-7 border-b">
                        <div class="font-bold text-primary">Add Custom Task</div>
                        <div @click="closeModal" class="btn btn-circle btn-ghost text-primary -mr-3">
                            <Icon name="lucide:x" class="w-5 h-5" />
                        </div>
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
                        <div @click="closeModal" class="btn btn-circle btn-ghost text-primary -mr-3">
                            <Icon name="lucide:x" class="w-5 h-5" />
                        </div>
                    </div>
                    <div class="py-5 px-7 border-b text-primary text-sm">
                        <Search @select-issue="confirm" />
                    </div>
                </template>
                <template v-else>
                    <div class="flex justify-between items-center py-2 px-7 border-b">
                        <div class="font-bold text-primary">Something went wrong</div>
                        <div @click="closeModal" class="btn btn-circle btn-ghost text-primary -mr-3">
                            <Icon name="lucide:x" class="w-5 h-5" />
                        </div>
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

<script setup>
import { ref, computed } from 'vue'
import Search from "./Search.vue"

const props = defineProps({
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
        default: () => ({})
    },
    loading: {
        required: false,
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['close', 'confirm'])

const customTaskName = ref('')
const showModalValue = computed({
    get: () => props.showModal,
    set: () => { /* Für Sync mit v-model */ }
})

function closeModal() {
    emit('close')
}

function confirm(payload) {
    emit('confirm', payload)
}
</script>