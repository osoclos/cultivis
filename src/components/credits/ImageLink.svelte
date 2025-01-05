<script lang="ts">
    interface Props {
        src: string;
        alt: string;

        href: string;
    }

    const { src, alt, href }: Props = $props();
</script>

<!-- highlight color filter: hover:brightness-80 hover:hue-rotate-15 hover:saturate-240 -->
<a {href} class="outline-none brightness-360 hue-rotate-45 saturate-120 hover:brightness-185 hover:hue-rotate-168 hover:saturate-200 active:brightness-185 active:hue-rotate-168 active:saturate-200 transition-[filter,_translate] duration-150 hover:-translate-y-1 active:-translate-y-1" target="_blank">
    <img {src} {alt} width="160" height="auto" draggable="false" />
</a>