<script lang="ts">
    import { ImageLink } from ".";
    import { Header, LabelTitle } from "../base";

    interface CreditData {
        label: string;
        href: string;
    }

    const credits: Record<string, CreditData[]> = {
        "Assets and Inspiration": [
            {
                label: "Massive Monster",
                href: "https://massivemonster.co/"
            },

            {
                label: "Devolver Digital",
                href: "https://devolverdigital.com/"
            }
        ],

        "Rendering": [{
            label: "Esoteric Software",
            href: "https://esotericsoftware.com/"
        }],

        "Audio Extraction": [
            {
                label: "foobar2000",
                href: "https://www.foobar2000.org"
            },
            {
                label: "FMOD Bank Tools",
                href: "https://www.nexusmods.com/rugbyleaguelive3/mods/2?tab=files"
            }
        ]
    };
</script>

<div class="flex flex-col gap-4">
    <Header title="Special Thanks" />

    <div class="flex flex-col gap-8">
        {#each Object.entries(credits) as [title, creditData], y (y)}
            <div class="flex flex-col gap-4 items-center">
                <LabelTitle {title} />
                <div class="flex flex-row gap-6 items-center">
                    {#each creditData as { label, href }, x (x)}
                        <ImageLink {label} {href} src="/static/assets/credits/special-thanks.png" {x} {y} />
                    {/each}
                </div>
            </div>
        {/each}
    </div>
</div>