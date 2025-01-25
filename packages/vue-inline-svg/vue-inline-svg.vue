<template>
	<component :is="vnode" />
</template>

<script setup lang="ts">
import {
	h,
	onServerPrefetch,
	shallowRef,
	watch,
	type SVGAttributes,
	type VNodeChild,
	createTextVNode,
	useAttrs,
	type WatchCallback,
	Fragment,
} from "vue";
// @ts-expect-error
import parses from "html-parse-stringify";

interface OwnProps {
	src: string;
	clientOnly?: boolean;
	alt: string;
}

interface Props extends OwnProps, /* @vue-ignore */ SVGAttributes {}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const attrs = useAttrs() as SVGAttributes;
const vnode = shallowRef<VNodeChild>(undefined);

onServerPrefetch(async () => {
	if (props.clientOnly) return;
	vnode.value = await createVNode(props.src, props.alt, attrs);
});

if (typeof window !== "undefined" && !props.clientOnly) {
	vnode.value = await createVNode(props.src, props.alt, attrs);
}

let run = props.clientOnly;
const callback: WatchCallback<[OwnProps, SVGAttributes]> = async ([p, a]) => {
	if (typeof window === "undefined") return;

	if (run) {
		vnode.value = await createVNode(p.src, p.alt, a);
	} else {
		run = true;
	}
};

watch([() => props, () => attrs], callback, {
	flush: "post",
	deep: true,
	immediate: true,
});
</script>

<script lang="ts">
async function createVNode(src: string, alt: string, attrs: SVGAttributes) {
	try {
		const response = await fetch(src, { headers: { Accept: "image/svg+xml" } });

		if (!response.ok) {
			throw new Error("Failed to fetch SVG");
		}

		const xmlText = await response.text();
		const svgText = xmlText.replace(/<\?xml.*?\?>/, "").trim();

		if (!svgText.startsWith("<svg")) {
			throw new Error("Invalid SVG");
		}

		const ast = parses.parse(svgText);
		// @ts-expect-error
		return h(Fragment, render(ast, attrs));
	} catch (error) {
		console.error(error);
		return createTextVNode(alt);
	}
}

export function isNode(node: { type: any }): boolean | boolean {
	return typeof node === "object" && typeof node.type !== "undefined";
}

type TagNode = {
	type: "tag";
	name: string;
	attrs: Record<string, string>;
	children: Node[];
};

type TextNode = {
	type: "text";
	content: string;
};

type Node = TagNode | TextNode;

function render(node: Node | Node[], attrs: SVGAttributes = {}): VNodeChild {
	if (Array.isArray(node)) return node.map((n) => render(n, attrs));
	if (!isNode(node)) return;
	if (node.type === "text") return node.content;
	if (node.type === "tag") {
		const props = { ...node.attrs, ...attrs };
		const children = node.children.map((c) => render(c));
		return h(node.name, props, children);
	}
}
</script>
