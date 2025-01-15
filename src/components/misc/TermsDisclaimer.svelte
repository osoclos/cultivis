<script lang="ts">
    import { onMount } from "svelte";

    import { BannerButton, Header, Notice } from "../base";
    import { List } from "../utils";

    import { GitManager } from "../../scripts/managers";

    interface Props {
        hasAcknowledgedTerms: boolean;

        termsChangesSummary: string;
        latestTermsDate: string;

        isOnPhone: boolean;

        onclick?: () => void;
    }

    let {
        hasAcknowledgedTerms = $bindable(),

        termsChangesSummary = $bindable(),
        latestTermsDate = $bindable(),

        isOnPhone = $bindable(),

        onclick = () => {}
    }: Props = $props();

    let container: HTMLDivElement;
    onMount(() => hasAcknowledgedTerms && container.classList.replace("grid", "hidden"));
</script>

<div bind:this={container} class="grid fixed top-0 left-0 z-100 place-items-center p-0 sm:p-8 w-full h-full bg-[#00000060] {hasAcknowledgedTerms ? "opacity-0" : "opacity-100"} not-motion-reduce:transition-opacity not-motion-reduce:duration-600" role="dialog" ontransitionend={({ target }) => target === container && container.classList.replace("grid", "hidden")}>
    <div class="flex flex-col gap-4 sm:gap-3 items-center pt-6 pb-4 px-4 mx-4 max-w-160 bg-secondary rounded-lg">
        <div class="flex flex-col gap-2">
            <Header title="DISCLAIMER" />
            <p class="font-subtitle text-active text-center">{localStorage.getItem(GitManager.TERMS_LOCAL_STORAGE_NAME) ? `CultiVis has updated its terms of service${latestTermsDate ? ` on ${latestTermsDate}` : ""}.${termsChangesSummary ? ` ${termsChangesSummary}` : ""} You may view the new terms below or close this popup.` : "CultiVis requires you to agree and acknowledge the CultiVis Terms of Service. You may view the terms below or close this popup."}</p>
        </div>

        <div class="flex flex-col gap-2 w-80 sm:w-fit">
            <Notice class="not-sm:pb-2 not-sm:text-sm" label="Closing this popup will mean you agree with the Terms of Service." />
            <List class="flex flex-col sm:flex-row justify-center items-center" enableKeyInput={!hasAcknowledgedTerms} isHorizontal={!isOnPhone} focusFirst>
                <BannerButton label="View Terms" href="https://github.com/osoclos/cultivis/blob/main/ToS.md" />
                <BannerButton label="Close and Accept" {onclick} />
            </List>
        </div>
    </div>
</div>