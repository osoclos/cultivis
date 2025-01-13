<script lang="ts">
    import { BannerButton, Header, LabelTitle } from "../base";

    interface Props { lastUpdatedDate: string; }
    const { lastUpdatedDate = $bindable() }: Props = $props();

    const lastUpdatedYear = lastUpdatedDate.match(/(\d+)$/)![1] ?? "";
</script>

<div class="flex flex-col gap-4 items-center">
    <div class="flex flex-col gap-1">
        <Header title="Creation Details" />

        <LabelTitle title="Created by {lastUpdatedYear ? `© ${lastUpdatedYear}` : ""} osoclos" />
        <LabelTitle title="Last Updated: {lastUpdatedDate || "Just Now"}" />
    </div>
    
    <BannerButton label="View Repository" href="https://github.com/osoclos/cultivis" />
</div>