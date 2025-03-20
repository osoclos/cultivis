<script lang="ts">
    import { twMerge } from "tailwind-merge";

    import { SpritesheetImage } from "../utils";

    import { Actor } from "../../scripts";
    import { Bishop, Follower, Guard, Heretic, MiniBoss, Occultist, Player, Soldier, TOWW, Witness } from "../../scripts/characters";
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

    let button: HTMLButtonElement;

    const src: string = $derived.by(() => {
        switch (actor) {
            case Follower: return "/static/assets/characters/followers.png";
            case Player: return "/static/assets/characters/player.png";
            
            case Soldier: return "/static/assets/characters/soldiers.png";
            case Occultist: return "/static/assets/characters/occultists.png";
            case Guard: return "/static/assets/characters/guards.png";

            case Heretic: return "/static/assets/characters/heretics.png";
            
            case Bishop:
            case TOWW: return "/static/assets/characters/crowns.png";

            case MiniBoss: return "/static/assets/characters/mini-bosses.png";
            case Witness: return "/static/assets/characters/witnesses.png";
            
            default: return "/static/ui/cancel.png";
        }
    });

    const label: string = $derived.by(() => {
        if (isLoading) return "Loading...";
        
        switch (actor) {
            case Follower: return "Follower";
            case Player: return "Player";

            case Soldier: return "Soldier";
            case Occultist: return "Occultist";
            case Guard: return "Guard";

            case Heretic: return "Heretic";

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
            case "/static/assets/characters/crowns.png": return 200;

            default: return 64;
        }
    });

    const tileHeight: number = $derived.by(() => {
        switch (src) {
            case "/static/ui/cancel.png": return 100;
            case "/static/assets/characters/crowns.png": return 200;

            default: return 64;
        }
    });

    function onclick() {
        if (isLoading) return;
        button.focus();
        
        click();
        soundManager.play("Click");
    }
</script>

<button bind:this={button} class={twMerge("flex flex-col items-center px-4 py-2 gap-2 bg-dark rounded-xs outline-0 focus:outline-3 outline-highlight not-motion-reduce:transition-[outline] not-motion-reduce:duration-75", isLoading && "brightness-75", className)} aria-label={label} {onclick} onpointerenter={() => button.focus()} onfocus={() => soundManager.play("Flicker")}>
    <div class="w-20 h-20">
        <SpritesheetImage {src} {label} x={+(actor === TOWW) * 4} y={0} width={80} height={80} {tileWidth} {tileHeight} />
    </div>
    
    <p class="text-xl text-center text-active text-nowrap">{label}</p>
</button>