<script lang="ts" module>
    export const HAS_NOTICED_TUTORIAL_LOCAL_STORAGE_NAME: string = "has-noticed-tutorial";
</script>

<script lang="ts">
    import { BannerButton, Header, LabelTitle } from "../base";
    import { List } from "../utils";

    import { unixToDate } from "../../utils";

    interface Props {
        lastUpdatedUnix?: number;
        hasNoticedTutorial?: boolean;
    }

    let { lastUpdatedUnix = -1, hasNoticedTutorial = $bindable(false) }: Props = $props();
    
    function onnotice() {
        if (hasNoticedTutorial) return;
        hasNoticedTutorial = true;

        localStorage.setItem(HAS_NOTICED_TUTORIAL_LOCAL_STORAGE_NAME, "CHECKED");
    }
</script>

<div class="flex flex-col gap-4 items-center">
    <div class="flex flex-col gap-1">
        <Header title="Creation Details" />

        {#if lastUpdatedUnix < 0}
            <LabelTitle title="Created by © osoclos" />
            <LabelTitle title="Last Updated: Just Now" />
        {:else}
            <LabelTitle title="Created by © {new Date(lastUpdatedUnix).getFullYear()} osoclos" />
            <LabelTitle title="Last Updated: {unixToDate(lastUpdatedUnix)}" />
        {/if}
    </div>
    
    <List class="flex flex-col justify-center items-center" enableKeyInput>
        <BannerButton label="View Repository" href="https://github.com/osoclos/cultivis" />
        <BannerButton label="How to Use" href="https://github.com/osoclos/cultivis/blob/main/README.md#usage" hasNotice={!hasNoticedTutorial} {onnotice} />
    </List>
</div>