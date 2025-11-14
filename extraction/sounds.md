# How to Extract Sound Files

## Description

This file contains the instructions on how to extract audio files from any game which uses .BANK FMOD files (which includes Cult of the Lamb). Since this method only requires external tools and no programming expertise, no script is provided and anyone with little technological knowledge would be able to follow through and produce successful results.

## Prerequisites

You will need to install the following software/tools:

- [FMOD Bank Tools](https://www.nexusmods.com/rugbyleaguelive3/mods/2?tab=files)
- [foobar2000](https://www.foobar2000.org/download)

Install the following below **AFTER** you have installed the above software:

- [vgmstream decoder for foobar2000](https://www.foobar2000.org/components/view/foo_input_vgmstream)
- [encoderpack for foobar2000](https://www.foobar2000.org/encoderpack)

You are also required to have some basic knowledge on how to use File Explorer.

After successfully completing all of the above, we can start proceeding with the next steps!

## Guide

### Building .FSB files

Before we can extract sound files from the game, we would need to build (create) .FSB files. Here is how you would do it:

1. Open FMOD Bank Tools and either select the bank folder to where our bank files are (in this case: "C:\Program Files (x86)\Steam\steamapps\common\Cult of the Lamb\Cult of the Lamb_Data\StreamingAssets") or copy the bank files to its own bank folder.

2. Go to the top-left hand corner and select File > Build. It would then proceed to create our .FSB files in its fsb folder. Note it may print out an error stating that it is unable to find .txt .wav list files. You can ignore them as we will be using foobar2000 to convert them into .wav files.

If all is done well, you should see our created .FSB files all set and ready in the fsb folder. We can now proceed to extracting sound files from them.

### Extracting Audio Files

1. Open up foobar2000.

2. If you have not installed the additional foobar components stated above, please do so and restart foobar2000.

3. Go to File and click Open on the top-left hand corner.

4. Select all the generated .FSB files we have just created and click OK.

5. You should see all the sounds that are extracted from the files. We can then proceed to Edit > Remove duplicate files and Edit > Remove dead files.

6. Now we can select all the audio files (you can do so by pressing <kbd>Ctrl</kbd> + <kbd>A</kbd> on your keyboard) and right-clicking on them.

7. Select the Convert option and click Quick Convert. It should give you a prompt to select which format you want our sound files to be in (it should select the .WAV format by default, you may change it to a different format if you want).

8. After clicking Convert, it should ask you where you want to save your files. Select any folder of your choice and click OK.

9. After it has completed its extraction, you should see all the extracted sound files in your desired folder.

And just like that, you should have all your sound files ready to use, enjoy!

## Credits

Thanks to dippy (@dubstellon) in the C.O.T.L Modding Discord Server for teaching me how to extract the sound files.
