<script lang="ts">
    import { BannerButton, Header, LabelTitle } from "../base";

    import { GitManager } from "../../scripts/managers";
    import { unixToDate } from "../../utils";

    interface Props { gitManager: GitManager; }
    const { gitManager }: Props = $props();
</script>

<div class="flex flex-col gap-4 items-center">
    <div class="flex flex-col gap-1">
        <Header title="Creation Details" />

        {#await gitManager.getLastUpdatedUnix()}
            <LabelTitle title="Created by © osoclos" />
            <LabelTitle title="Last Updated: Just Now" />
        {:then lastUpdatedUnix}
            <LabelTitle title="Created by © {new Date(lastUpdatedUnix).getFullYear()} osoclos" />
            <LabelTitle title="Last Updated: {unixToDate(lastUpdatedUnix)}" />
        {/await}
    </div>
    
    <BannerButton label="View Repository" href="https://github.com/osoclos/cultivis" />
</div>