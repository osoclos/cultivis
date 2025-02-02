<script lang="ts">
    import type { Action } from "svelte/action";
    import { twMerge } from "tailwind-merge";

    import { SpritesheetImage } from "../utils";

    import { Actor } from "../../scripts";
    import { Bishop, Follower, MiniBoss, Player, TOWW, Witness } from "../../scripts/characters";
    import { soundManager } from "../../scripts/managers";

    interface Props {
        actor: typeof Actor;
        isLoading?: boolean;

        class?: string;
        onclick?: VoidFunction;
    }

    const {
        actor = $bindable(),
        isLoading = false,

        class: className,
        onclick: click = () => {}
    }: Props = $props();

    const src: string = $derived.by(() => {
        switch (actor) {
            case Follower: return "/static/assets/followers.png";
            case Player: return "/static/assets/player.png";

            case Bishop:
            case TOWW: return "/static/assets/crowns.png";

            case MiniBoss: return "/static/assets/mini-bosses.png";
            case Witness: return "/static/assets/witnesses.png";
            
            default: return "/static/ui/cancel.png";
        }
    });

    const label: string = $derived.by(() => {
        if (isLoading) return "Loading...";
        
        switch (actor) {
            case Follower: return "Follower";
            case Player: return "Player";

            case Bishop: return "Bishop";
            case TOWW: return "T.O.W.W.";

            case MiniBoss: return "Mini Boss";
            case Witness: return "Witness";
            
            default: return "Actor";
        }
    });

    const tileWidth: number = $derived.by(() => {
        switch (src) {
            case "/static/ui/cancel.png": return 100;
            case "/static/assets/crowns.png": return 200;

            default: return 64;
        }
    });

    const tileHeight: number = $derived.by(() => {
        switch (src) {
            case "/static/ui/cancel.png": return 100;
            case "/static/assets/crowns.png": return 200;

            default: return 64;
        }
    });

    function onclick() {
        if (isLoading) return;
        
        click();
        soundManager.play("Click");
    }

    const focusEvent: Action<HTMLButtonElement> = (button) => {
        function focus() {
            button.focus();
        }

        $effect(() => {
            button.addEventListener("click", focus);
            button.addEventListener("pointerenter", focus);

            return () => {
                button.removeEventListener("click", focus);
                button.removeEventListener("pointerenter", focus);
            }
        });
    };
</script>

<button use:focusEvent class={twMerge("flex flex-col items-center px-4 py-2 gap-2 bg-dark rounded-xs outline-0 focus:outline-3 outline-highlight not-motion-reduce:transition-[outline] not-motion-reduce:duration-75", isLoading && "brightness-75", className)} aria-label={label} {onclick} onfocus={() => soundManager.play("Flicker")}>
    <div class="w-20 h-20">
        <SpritesheetImage {src} {label} x={+(actor === TOWW) * 4} y={0} width={80} height={80} {tileWidth} {tileHeight} />
    </div>
    
    <p class="text-xl text-center text-active text-nowrap">{label}</p>
</button>