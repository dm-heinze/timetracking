<template>
	<ul>
        <li v-for="startAndEndTime in startAndEndTimesArray" :key="startAndEndTime.id">
            <start-and-end-time
                :unique-id="uniqueId"
                :id="startAndEndTime.id"
                :start-time="startAndEndTime.startTime"
                :end-time="startAndEndTime.endTime"
                :duration="startAndEndTime.duration"
                :booked="booked"
                :duration-in-milli-seconds="startAndEndTime.durationInMilliSeconds"
            />
        </li>
    </ul>
</template>

<script>
    import StartAndEndTime from "~/components/main/tasks/task/StartAndEndTime";

    export default {
		name: "StartAndEndTimes",
        components: { StartAndEndTime },
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
