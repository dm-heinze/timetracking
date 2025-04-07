<template>
    <div>
        <header v-if="session" class="p-4 bg-base-200">
            <div class="container mx-auto flex justify-between items-center">
                <h1 class="text-xl font-bold">Jira Time Tracker</h1>
                <div class="flex items-center gap-4">
                    <span>{{ session.user.name }}</span>
                    <img v-if="session.user.picture" :src="session.user.picture" class="w-8 h-8 rounded-full" />
                    <button @click="logout" class="btn btn-sm btn-ghost">
                        <Icon name="lucide:log-out" class="w-4 h-4 mr-1" /> Logout
                    </button>
                </div>
            </div>
        </header>

        <slot />
    </div>
</template>

<script setup>
const { data: session } = useAuth()

function logout() {
    navigateTo('/api/auth/logout')
}
</script>