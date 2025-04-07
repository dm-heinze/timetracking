<template>
    <div class="min-h-screen flex flex-col justify-center items-center gap-5">
        <div class="">
            <h3 class="text-2xl font-bold text-primary">Jira Time Tracker</h3>
            <div class="text-sm">by dmf</div>
        </div>
        <img src="~/assets/images/login.png" alt="illustration" height="376" class="">
        <button @click="login" class="btn btn-primary">
            Login with Jira
        </button>
    </div>
</template>

<script setup>
import { onMounted } from 'vue'
const { session } = useAuth()

// Wenn bereits eingeloggt, zur Hauptseite weiterleiten
watchEffect(() => {
    if (session?.value?.authenticated) {
        navigateTo('/');
    }
});

function login() {
    window.location.href = '/api/auth/login';
}

onMounted(() => {
    // Theme Change initialisieren
    if (process.client) {
        import('theme-change').then(({ themeChange }) => {
            themeChange(true)
        })
    }
})
</script>