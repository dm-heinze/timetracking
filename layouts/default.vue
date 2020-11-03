<template>
    <b-container fluid>
        <div class="row">
            <div class="col-12">
                <nuxt />
            </div>
        </div>
    </b-container>
</template>

<script>
    import _ from "lodash";

    export default {
        computed: {
            _() {
                return _;
            },
        }
    }
</script>
