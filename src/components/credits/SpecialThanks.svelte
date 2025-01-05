<script lang="ts">
    import { ImageLink } from ".";
    import { Header, LabelTitle } from "../base";

    interface CreditData {
        src: string;
        alt: string;

        href: string;
    }

    const credits: Record<string, CreditData[]> = {
        "Assets and Inspiration": [
            {
                src: "/static/ui/massive-monster.png",
                alt: "Massive Monster",

                href: "https://massivemonster.co/"
            },

            {
                src: "/static/ui/devolver-digital.png",
                alt: "Devolver Digital",

                href: "https://devolverdigital.com/"
            }
        ],

        "Rendering": [{
            src: "/static/ui/esoteric-software.png",
            alt: "Esoteric Software",

            href: "https://esotericsoftware.com/"
        }]
    };
</script>

<div class="flex flex-col gap-4">
    <Header title="Special Thanks" />

    <div class="flex flex-col gap-8">
        {#each Object.entries(credits) as [title, creditData], i (i)}
            <div class="flex flex-col gap-4 items-center">
                <LabelTitle {title} />
                <div class="flex flex-row gap-6 items-center">
                    {#each creditData as { src, alt, href }, i (i)}
                        <ImageLink {src} {alt} {href} />
                    {/each}
                </div>
            </div>
        {/each}
    </div>
</div>