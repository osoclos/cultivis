<script lang="ts" module>
    import type { AllModdedFollowerSlotId, ModdedFollower } from "../../../scripts/characters";
    export const MODDED_FOLLOWER_SLOT_NAMES: Partial<Record<AllModdedFollowerSlotId, string>> = {
        HEAD_SKIN_BTM: "Head",
        HEAD_SKIN_TOP: "Head Details",

        ARM_LEFT_SKIN: "Left Arm",
        ARM_RIGHT_SKIN: "Right Arm",

        LEG_LEFT_SKIN: "Left Leg",
        LEG_RIGHT_SKIN: "Right Leg",

        BODY_NAKED: "Body",
        MARKINGS: "Markings",

        "EYE_LEFT/IRIS": "Left Iris",
        "EYE_LEFT/PUPIL": "Left Pupil",
        "EYE_LEFT/SCHLERA": "Left Eye White",

        "EYE_RIGHT/IRIS": "Right Iris",
        "EYE_RIGHT/PUPIL": "Right Pupil",
        "EYE_RIGHT/SCHLERA": "Right Eye White",
    };

    export const FOLLOWER_MENU_NAMES = ["form", "clothing", "accessory", "color", "variant"] as const;
    export type FollowerMenuName = typeof FOLLOWER_MENU_NAMES[number];

    export function isStrFollowerMenuName(str: string): str is FollowerMenuName {
        return FOLLOWER_MENU_NAMES.includes(str as FollowerMenuName);
    }
</script>

<script lang="ts">
    import { twMerge } from "tailwind-merge";

    import { BoxOption } from "..";
    import { Header } from "../../base";
    import { ColorDot, MultiGrid, SpritesheetImage } from "../../utils";

    import { followerData } from "../../../data/files";
    import { CLOTHING_IDS, clothingIdsByCategory, FOLLOWER_IDS, followerIdsByCategory, HATS_ID, necklaceIdsByCategory, type ClothingCategoryName, type ClothingData, type ClothingId, type ColorSet, type FollowerCategoryName, type FollowerId, type FormData, type HatId, type NecklaceCategoryName, type NecklaceData, type NecklaceId } from "../../../data/types";

    import { Follower, isModdedFollowerObj, type FollowerObject } from "../../../scripts/characters";
    import { Color, Random } from "../../../utils";

    interface Props {
        follower: Follower;
        obj: FollowerObject;

        menu?: FollowerMenuName;

        class?: string;
        enableKeyInput?: boolean;

        onupdate?: VoidFunction;
    }

    let {
        follower,
        obj,

        menu = $bindable("form"),

        class: className,
        enableKeyInput = false,

        onupdate: update = () => {}
    }: Props = $props();

    const title: string = $derived.by(() => {
        switch (menu) {
            case "form": return "Choose Form";
            case "clothing": return "Choose Robes";
            case "accessory": return "Choose Accessory";

            case "color": return "Choose Color";
            case "variant": return "Choose Variant";
        }
    });

    const dividerTitles: string[] = $derived.by(() => {
        switch (menu) {
            case "form": return Object.keys(followerIdsByCategory);
            case "clothing": return Object.keys(clothingIdsByCategory);
            case "accessory": return [...Object.keys(necklaceIdsByCategory), "Hats"];
            
            case "color": return ["Follower Form Colors", "General Follower Colors", "Clothing Colors"].slice(+!followerColorSets.length + +!followerData.forms[obj.form].canBeTinted, 2 + +!!(clothingColorSets?.length ?? 0));
            case "variant": return ["Follower Form Variants", "Clothing Variants"];
        }
    });

    const followerColorSets = $derived(followerData.forms[obj.form].sets);
    const generalColorSets = $derived(followerData.generalColorSets);

    const clothingColorSets = $derived(followerData.clothing[obj.isHooded ? "Default_Clothing" : obj.clothing].sets);

    function findMostPopularColor(set: ColorSet) {
        const slotLengths = set.map(({ slots }) => slots.length);
        const i = slotLengths.indexOf(Math.max(...slotLengths));

        return set[i].color;
    }

    const followerVariants = $derived(followerData.forms[obj.form].variants);
    const clothingVariants = $derived(followerData.clothing[obj.clothing].variants);

    function updateForm(id: FollowerId) {
        follower.form = id;
        obj.form = id;

        update();
    }

    function updateClothing(id: ClothingId) {
        follower.clothing = id;
        obj.clothing = id;

        update();
    }

    function updateNecklace(id: NecklaceId | null) {
        follower.necklace = id;
        obj.necklace = id;

        update();
    }

    function updateHat(id: HatId | null) {
        follower.hat = id;
        obj.hat = id;

        update();
    }

    function updateFormColorSetIdx(i: number) {
        follower.formColorSetIdx = i;
        obj.formColorSetIdx = i;

        if (isModdedFollowerObj(follower) && isModdedFollowerObj(obj)) for (const slot in follower.colors) (follower.colors[slot as AllModdedFollowerSlotId] as Color).cloneObj(obj.colors[slot as AllModdedFollowerSlotId]);
        update();
    }

    function updateClothingColorSetIdx(i: number) {
        const { colors = null } = isModdedFollowerObj(follower) ? follower : {};
        
        follower.clothingColorSetIdx = i;
        obj.clothingColorSetIdx = i;

        if (colors && isModdedFollowerObj(follower) && isModdedFollowerObj(obj)) for (const slot in colors) {
            const color = colors[slot as AllModdedFollowerSlotId] as Color;

            (follower as ModdedFollower).setColor(slot as AllModdedFollowerSlotId, color);
            color.cloneObj(obj.colors[slot as AllModdedFollowerSlotId]);
        }

        update();
    }

    function updateFormVariantIdx(i: number) {
        const { colors = null } = isModdedFollowerObj(follower) ? follower : {};
        
        follower.formVariantIdx = i;
        obj.formVariantIdx = i;

        if (colors && isModdedFollowerObj(follower) && isModdedFollowerObj(obj)) for (const slot in colors) {
            const color = colors[slot as AllModdedFollowerSlotId] as Color;

            (follower as ModdedFollower).setColor(slot as AllModdedFollowerSlotId, color);
            color.cloneObj(obj.colors[slot as AllModdedFollowerSlotId]);
        }

        update();
    }

    function updateClothingVariantIdx(i: number) {
        const { colors = null } = isModdedFollowerObj(follower) ? follower : {};
        
        follower.clothingVariantIdx = i;
        obj.clothingVariantIdx = i;

        if (colors && isModdedFollowerObj(follower) && isModdedFollowerObj(obj)) for (const slot in colors) {
            const color = colors[slot as AllModdedFollowerSlotId] as Color;

            (follower as ModdedFollower).setColor(slot as AllModdedFollowerSlotId, color);
            color.cloneObj(obj.colors[slot as AllModdedFollowerSlotId]);
        }

        update();
    }
</script>

<div class={twMerge("flex flex-col gap-2 items-center w-full", className)}>
    <Header {title} />

    <MultiGrid gridClass="mx-1" titles={dividerTitles} minColumns={4} maxColumns={6} tileWidth={64} tileHeight={64} gapWidth={20} gapHeight={12} {enableKeyInput} focusFirst>
        {#snippet children(category, y)}
            {#if menu === "form"}
                <BoxOption label="Select Random {category} Form" hideBackground onclick={() => updateForm(Random.item(followerIdsByCategory[category as FollowerCategoryName]))}>
                    <img src="/static/ui/dice-6.png" alt="" width="64" height="64" draggable="false" role="presentation" aria-hidden="true" />
                </BoxOption>

                {#each Object.values(followerIdsByCategory)[y].map<[FollowerId, FormData]>((id) => [id, followerData.forms[id]]) as [id, { name }], x (id)}
                    <BoxOption label={name} selected={id === obj.form} onclick={() => updateForm(id)}>
                        <SpritesheetImage src="/static/assets/characters/followers.png" label={name} {x} {y} tileWidth={64} tileHeight={64} />
                    </BoxOption>
                {/each}
            {:else if menu === "clothing"}
                <BoxOption label="Select Random {category} Robes" hideBackground onclick={() => updateClothing(Random.item(clothingIdsByCategory[category as ClothingCategoryName]))}>
                    <img src="/static/ui/dice-6.png" alt="" width="64" height="64" draggable="false" role="presentation" aria-hidden="true" />
                </BoxOption>

                {#each Object.values(clothingIdsByCategory)[y].map<[ClothingId, ClothingData]>((id) => [id, followerData.clothing[id]]) as [id, { name }], x (id) }
                    <BoxOption label={name} selected={id === obj.clothing} onclick={() => updateClothing(id)}>
                        <SpritesheetImage src="/static/assets/characters/clothing.png" label={name} {x} {y} tileWidth={64} tileHeight={64} />
                    </BoxOption>
                {/each}
            {:else if menu === "accessory"}
                {#if y < 3}
                    {#if !y}
                        <BoxOption label="Remove Necklace" hideBackground hideFocusRing onclick={() => updateNecklace(null)}>
                            <img src="/static/ui/cancel.png" alt="" width="64" height="64" draggable="false" role="presentation" aria-hidden="true" />
                        </BoxOption>
                    {/if}
                    
                    <BoxOption label="Select Random {category} Necklace" hideBackground onclick={() => updateNecklace(Random.item(necklaceIdsByCategory[category as NecklaceCategoryName]))}>
                        <img src="/static/ui/dice-6.png" alt="" width="64" height="64" draggable="false" role="presentation" aria-hidden="true" />
                    </BoxOption>

                    {#each Object.values(necklaceIdsByCategory)[y].map<[NecklaceId, NecklaceData]>((id) => [id, followerData.necklaces[id]]) as [id, { name }], x (id) }
                        <BoxOption label={name} selected={id === obj.necklace} onclick={() => updateNecklace(id)}>
                            <SpritesheetImage src="/static/assets/characters/necklaces.png" label={name} {x} {y} tileWidth={64} tileHeight={64} />
                        </BoxOption>
                    {/each}
                {:else}
                    <BoxOption label="Remove Hat" hideBackground hideFocusRing onclick={() => updateHat(null)}>
                        <img src="/static/ui/cancel.png" alt="" width="64" height="64" draggable="false" role="presentation" aria-hidden="true" />
                    </BoxOption>

                    <BoxOption label="Select Random Hat" hideBackground onclick={() => updateHat(Random.item([...HATS_ID]))}>
                        <img src="/static/ui/dice-6.png" alt="" width="64" height="64" draggable="false" role="presentation" aria-hidden="true" />
                    </BoxOption>
        
                    {#each Object.entries(followerData.hats) as [id, { name }], x (id) }
                        <BoxOption label={name} selected={id === obj.hat} onclick={() => updateHat(id as HatId)}>
                            <SpritesheetImage src="/static/assets/characters/hats.png" label={name} {x} y={0} tileWidth={64} tileHeight={64} />
                        </BoxOption>
                    {/each}
                {/if}
            {:else if menu === "color"}
                {#if y === 0 && followerData.forms[obj.form].canBeTinted && followerColorSets.length}
                    <BoxOption label="Select Random Follower Form Color" hideBackground onclick={() => updateFormColorSetIdx(Random.int(followerColorSets.length))}>
                        <img src="/static/ui/dice-6.png" alt="" width="64" height="64" draggable="false" role="presentation" aria-hidden="true" />
                    </BoxOption>
        
                    {#each followerColorSets as set, i (i) }
                        <BoxOption label="Follower Form Color {i}" selected={i === obj.formColorSetIdx} onclick={() => updateFormColorSetIdx(i)}>
                            <div class="m-3 w-10 h-10 rounded-full border-2 border-[#00000030]" style:background-color={Color.fromObj(findMostPopularColor(set)).toCSS_Str()}></div>
                        </BoxOption>
                    {/each}
                {:else if y === +!!followerColorSets.length && followerData.forms[obj.form].canBeTinted}
                    <BoxOption label="Select Random General Follower Color" hideBackground onclick={() => updateFormColorSetIdx(Random.int(generalColorSets.length) + followerColorSets.length)}>
                        <img src="/static/ui/dice-6.png" alt="" width="64" height="64" draggable="false" role="presentation" aria-hidden="true" />
                    </BoxOption>
        
                    {#each generalColorSets as set, i (i) }
                        <BoxOption label="General Follower Color {i}" selected={i + followerColorSets.length === obj.formColorSetIdx} onclick={() => updateFormColorSetIdx(i + followerColorSets.length)}>
                            <div class="m-3 w-10 h-10 rounded-full border-2 border-[#00000030]" style:background-color={Color.fromObj(findMostPopularColor(set)).toCSS_Str()}></div>
                        </BoxOption>
                    {/each}
                {:else if y === +!!followerColorSets.length + +followerData.forms[obj.form].canBeTinted && clothingColorSets?.length}
                    <BoxOption label="Select Random Clothing Color" hideBackground onclick={() => updateClothingColorSetIdx(Random.int(clothingColorSets.length))}>
                        <img src="/static/ui/dice-6.png" alt="" width="64" height="64" draggable="false" role="presentation" aria-hidden="true" />
                    </BoxOption>
        
                    {#each clothingColorSets as set, i (i) }
                        <BoxOption label="Clothing Color {i}" selected={i === obj.clothingColorSetIdx} onclick={() => updateClothingColorSetIdx(i)}>
                            <ColorDot class="m-3" color={findMostPopularColor(set)} />
                        </BoxOption>
                    {/each}
                {/if}
            {:else if menu === "variant"}
                {#if y === 0}
                    <BoxOption label="Select Random Form Variant" hideBackground onclick={() => updateFormVariantIdx(Random.int(followerVariants.length))}>
                        <img src="/static/ui/dice-6.png" alt="" width="64" height="64" draggable="false" role="presentation" aria-hidden="true" />
                    </BoxOption>
        
                    {#each followerVariants as name, x (x) }
                        <BoxOption label="Form Variant {x}" selected={x === obj.formVariantIdx} onclick={() => updateFormVariantIdx(x)}>
                            <SpritesheetImage src="/static/assets/characters/variants.png" label={name} {x} y={FOLLOWER_IDS.indexOf(obj.form)} tileWidth={64} tileHeight={64} />
                        </BoxOption>
                    {/each}
                {:else if y === 1}
                    <BoxOption label="Select Random Clothing Variant" hideBackground onclick={() => updateClothingVariantIdx(Random.int(clothingVariants.length))}>
                        <img src="/static/ui/dice-6.png" alt="" width="64" height="64" draggable="false" role="presentation" aria-hidden="true" />
                    </BoxOption>
        
                    {#each clothingVariants as name, x (x) }
                        <BoxOption label="Clothing Variant {x}" selected={x === obj.clothingVariantIdx} onclick={() => updateClothingVariantIdx(x)}>
                            <SpritesheetImage src="/static/assets/characters/variants.png" label={name} {x} y={CLOTHING_IDS.indexOf(obj.clothing) + FOLLOWER_IDS.length} tileWidth={64} tileHeight={64} />
                        </BoxOption>
                    {/each}
                {/if}
            {/if}
        {/snippet}
    </MultiGrid>
</div>