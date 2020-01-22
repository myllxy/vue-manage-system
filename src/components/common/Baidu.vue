<template>
	<baidu-map class="map" :center="center"></baidu-map>
</template>

<script>

	export default {
		data() {
            return {
                center:"成都"
            };
		},
		methods: {


		},
		mounted() {
		}
	}

</script>

<style scoped>
	.map {
		width: 100%;
		height: 900px;
	}
</style>