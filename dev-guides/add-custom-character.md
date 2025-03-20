# Adding Custom Characters in CultiVis

This guide contains a detailed step-by-step guide on how to add and develop custom characters in the CultiVis repository.

> [!WARNING]
>
> ## SPOILER
>
> Note this does not show you how to add a custom character in the CultiVis website, which is not supported, and will likely be done in another website.

## Prerequisites

You will need to be competent in the following libraries/languages, and have the following runtimes installed:

* Typescript
* Svelte

* Bun

## Guide

### Step 1: Add Spine assets in `public/assets`

Before you can start creating your own custom character, you will need to add your `.skel` Spine file, alongside its atlas and packed texture files, into the `public/assets` subfolder.

### Step 2: Add data in `src/data`

Adding variant data of your characters is crucial in creating your custom character as it allows you to visualize how you would structure your custom character class. This also prevents the problem of creating multiple custom classes for characters with similar attributes, and allow you to merge them into one single character class.

You may define a schema in the `schemas` subfolder before you create your data file in the `files` subfolder, but its optional.

To enable intellisense and linting of your custom character. it is essential that you add types of your data structure in the `types` subfolder.

### Step 3: Add your class in `src/scripts`

Next, you can add your custom character class in the `src/scripts` subfolder. You will need functions that can serialize/deserialize your character, clone and update your character. Depending on the complexity of your custom character, you may need additional code so that it will appear correctly when it is rendered in CultiVis.

Afterwards, you can then add functions and switch cases to the `Factory` and `Exporter` class, which would allow you to easily create and cache your character.

You can also limit the animations that can be selected in `src/data/files/forbidden-animations.json`, which you can then add it to `src/components/characters/CharacterNavigation.svelte` to restrict them.

### Step 4: Create UI for character customization

You can add Svelte components as UI for your character customization in the `src/components` subfolder. You will have to add a menu component for your character, as well as modify the existing character navigation components to include your custom character.

If you have additional attributes you need to customize, you can add them to the `CharacterNavigation.svelte` component in `src/components/characters` subfolder.

### Step 5: Generate static assets for the character

You can generate static assets in the `public` folder by first adding an endpoint in the `setup/generate.ts` file. Afterwards, you can create a button and connect it to create the assets for your characters in the `generator` subfolder.

Then run `bun generate` in the terminal and click on the button to generate your custom character assets, which will appear in the `public/static/assets` subfolder.

## Reference

You may refer to commit [cd71a50](https://github.com/osoclos/cultivis/commit/cd71a5099464a48e52dc0085356ce42cdb3852b8) for an example addition of a custom character. If you require more low-level modifications, you may check out the other character classes in the repository.
