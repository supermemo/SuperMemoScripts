# SuperMemo Image Occlusion Editor + Misc

This software works in tandem with Image Occlusion Editor, found [on this same GitHub profile](https://github.com/supermemo/ImageOcclusionEditor)

- [Download](#download)
- [Install instructions](#instructions)
- [Shortcuts](#shortcuts)
- [Options](#configuration)
- [Demonstration video](#demonstration-video)

## Downloads
https://github.com/supermemo/SuperMemoScripts/raw/master/ImageOcclusionEditor/supermemo_18.ahk
- [Executable](https://github.com/supermemo/SuperMemoScripts/releases/download/v0.1d/SuperMemoAssistant_legacy-v0.1d.exe): Executable (.exe) format.
- [Script (SM 18)](https://raw.githubusercontent.com/supermemo/SuperMemoScripts/master/ImageOcclusionEditor/supermemo_18.ahk): Customizable script (.ahk) format.
- [Script (SM 17)](https://raw.githubusercontent.com/supermemo/SuperMemoScripts/master/ImageOcclusionEditor/supermemo_17.ahk): Customizable script (.ahk) format.

## Instructions

1. Download the ahk executable or script (see above),
2. Download the [Image Occlusion Editor](https://github.com/supermemo/ImageOcclusionEditor) installer,
3. Run SuperMemo 17 or 18
4. Run the script (from step 1)
4. On any element with a picture, press <kbd>Ctrl</kbd> + <kbd>Win</kbd> + <kbd>O</kbd>

## Shortcuts

* **Create Occlusion**: `Ctrl+Win+O`
* **Edit Occlusion**: `Ctrl+Win+E`
* **Focus Content Window**: `Ctrl+Alt+C`
* **Compress Image**: `Ctrl+Win+C`
* **Set Hook**: `Ctrl+Win+H`

## Options

If you wish to customize the scripts (e.g. the keyboard hotkey), follow the instructions below:

1. Download the `.ahk` file on this repository (as opposed to the `.exe`)
2. At the head of the script file, edit the following options to your taste:

```ahk
global ImageEditorBin := "C:\Program Files (x86)\ImageOcclusionEditor\ImageOcclusionEditor.exe"
global OcclusionItemNamePattern := "[Occlusion]: {1}"         ; {1} Parent name
global OcclusionImageNamePattern := "__Occlusion: {1} {2}"    ; {1} Original image name {2} TimeStamp
```

## Demonstration video

[![Image Occlusion Editor Demonstration](https://img.youtube.com/vi/BJ1ZAYSGJ4M/0.jpg)](https://youtu.be/BJ1ZAYSGJ4M)
