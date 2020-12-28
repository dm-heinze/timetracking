<template>
	<ul>
        <li v-for="startAndEndTime in startAndEndTimesArray" :key="startAndEndTime.id">
            {{ startAndEndTime.startTime }} - {{ startAndEndTime.endTime }} = {{ startAndEndTime.duration }}
        </li>
    </ul>
</template>

<script>
	export default {
		name: "StartAndEndTimes",
        props: {
            timeSpent: {
                required: true
            },
            booked: {
                required: true
            },
            uniqueId: {
                required: true
            },
            startAndEndTimesArray: {
                required: false,
                default: () => []
            }
        }
    }
</script>
