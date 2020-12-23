# SuperMemoScripts
Scripts compilation repository for SuperMemo users

This software works in tandem with Image Occlusion Editor, found [on this same GitHub profile](https://github.com/supermemo/ImageOcclusionEditor)

## SuperMemo Assistant (Legacy)
### Downloads
[SuperMemoAssistant Executable (compiled script)](https://github.com/supermemo/SuperMemoScripts/releases/download/v0.1d/SuperMemoAssistant_legacy-v0.1d.exe)

[SuperMemoAssistant Script (.ahk script)](https://raw.githubusercontent.com/supermemo/SuperMemoScripts/master/supermemo.ahk)

### Shortcuts

* **Create Occlusion**: `Ctrl+Win+o`
* **Edit Occlusion**: `Ctrl+Win+e`
* **Focus Content Window**: `Ctrl+Alt+c`
* **Compress Image**: `Ctrl+Win+c`
* **Set Hook**: `Ctrl+Win+h`

### Configuration
At the head of the .ahk script
```
global ImageEditorBin := "C:\Program Files (x86)\ImageOcclusionEditor\ImageOcclusionEditor.exe"
global OcclusionItemNamePattern := "[Occlusion]: {1}"         ; {1} Parent name
global OcclusionImageNamePattern := "__Occlusion: {1} {2}"    ; {1} Original image name {2} TimeStamp
```

## Demonstration video
[![Image Occlusion Editor Demonstration](https://img.youtube.com/vi/BJ1ZAYSGJ4M/0.jpg)](https://youtu.be/BJ1ZAYSGJ4M)
