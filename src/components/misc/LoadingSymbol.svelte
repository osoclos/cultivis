<script lang="ts">
    import { onMount } from "svelte";

    import { SpritesheetImage } from "../utils";
    import { Random } from "../../utils";

    interface Props { isMobile?: boolean; }
    const { isMobile = false }: Props = $props();

    const gradient: string = Random.item(["bg-gradient-to-t", "bg-gradient-to-tl", "bg-gradient-to-tr"]);

    const startPosition: string = $derived(gradient === "bg-gradient-to-tr" ? "bg-[-32rem_0rem]" : "bg-[0rem_0rem]");
    const endPosition: string = $derived(gradient === "bg-gradient-to-tr" ? "bg-[0rem_-32rem]" : "bg-[-32rem_-32rem]");

    let hasFadedIn: boolean = $state(false);
    onMount(() => setTimeout(() => hasFadedIn = true, 300));
</script>

<div class="relative">
    <SpritesheetImage src="/static/assets/misc/loading-symbols.png" srcset={["/static/assets/misc/loading-symbols.webp", "/static/assets/misc/loading-symbols.png"]} label="Loading Symbol" x={Random.int(2)} y={0} tileWidth={512} tileHeight={512} width={512 - 128 * +isMobile} height={512 - 128 * +isMobile} />
    <div class="absolute top-0 left-0 {isMobile ? "w-96 h-96" : "w-128 h-128"} bg-[length:64rem_64rem] {hasFadedIn ? endPosition : startPosition} {gradient} from-dark-highlight via-dark-highlight via-45% to-55% to-secondary mix-blend-darken transition-[background-position] duration-4500 ease-out"></div>
</div>