<script setup lang="ts">
import { onMounted, ref } from "vue";
import InlineSvg from "./packages/vue-inline-svg/lib/inline-svg.vue";

const firstSrc = `https://upload.wikimedia.org/wikipedia/commons/9/95/Vue.js_Logo_2.svg`;
const firstStroke = "blue";

const secondSrc = `https://upload.wikimedia.org/wikipedia/commons/3/30/React_Logo_SVG.svg`;
const secondStroke = "green";

const src = ref(firstSrc);
const stroke = ref(firstStroke);

onMounted(() => {
	setInterval(() => {
		src.value = src.value === firstSrc ? secondSrc : firstSrc;
		stroke.value = stroke.value === firstStroke ? secondStroke : firstStroke;
	}, 2000);
});
</script>

<template>
	<div>
		<InlineSvg :src="src" :stroke="stroke" alt="Company Logo" client-only />
	</div>
</template>
