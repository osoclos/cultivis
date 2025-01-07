<script lang="ts" module>
    export const TOS_VERSION: string = "03-01-25";
</script>

<script lang="ts">
    import { onMount } from "svelte";

    import { BannerButton, Header, Notice } from "../base";
    import { List } from "../utils";

    interface Props { termsAcknowledged: boolean; }
    let { termsAcknowledged = $bindable() }: Props = $props();

    let container: HTMLDivElement;
    onMount(() => {
        termsAcknowledged && container.classList.replace("grid", "hidden");
    });

    const monthNames: string[] = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    function getDate(): string {
        const [day, month, year] = TOS_VERSION.split("-").map((str) => +str.slice(0, 2));
        return `${day} ${monthNames[month - 1]} ${year + 2000}`;
    }

    function isTOSAmended(): boolean {
        return TOS_VERSION.split("-")[2].length > 2;
    }
    
    function onclick() {
        // localStorage.setItem("terms-acknowledged", TOS_VERSION);
        termsAcknowledged = true;
    }
</script>

<div bind:this={container} class="grid fixed top-0 left-0 z-10 place-items-center p-0 sm:p-8 w-full h-full bg-[#00000060] {termsAcknowledged ? "opacity-0" : "opacity-100"} transition-opacity duration-600" ontransitionend={({ target }) => target === container && container.classList.replace("grid", "hidden")}>
    <div class="flex flex-col gap-8 sm:gap-4 items-center pt-6 pb-4 px-4 mx-4 max-w-160 bg-secondary rounded-lg">
        <div class="flex flex-col gap-2">
            <Header title="DISCLAIMER" />
            <p class="font-subtitle text-active text-center">{localStorage.getItem("terms-acknowledged") ? `CultiVis has updated its terms of service ${isTOSAmended() ? "again" : `on ${getDate()}`}. You may view the new terms below or close this popup.` : "CultiVis requires you to agree and acknowledge the CultiVis Terms of Service. You may view the terms below or close this popup."}</p>
        </div>

        <div class="flex flex-col gap-2 w-80 sm:w-fit">
            <Notice class="text-sm" label="Closing this popup will mean you agree with the Terms of Service." />
            <List class="flex flex-row justify-center scale-80 sm:scale-100" enableKeyInput={!termsAcknowledged} isHorizontal focusFirst>
                <BannerButton label="View Terms" href="https://github.com/osoclos/cultivis/blob/main/ToS.md" />
                <BannerButton label="Close and Accept" {onclick} />
            </List>
        </div>
    </div>
</div>