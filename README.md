# SuperMemoScripts
Scripts compilation repository for SuperMemo users

## SuperMemo Assistant (Legacy)
### Downloads
[SuperMemoAssistant Executable (compiled script)](https://github.com/supermemo/SuperMemoScripts/releases/download/v0.1a/SuperMemoAssistant_legacy-v0.1a.exe)

[SuperMemoAssistant Script (.ahk script)](https://raw.githubusercontent.com/supermemo/SuperMemoScripts/master/supermemo.ahk)

### Shortcuts

* **Create Image Occlusion**: `Ctrl+Win+o`
* **Edit Image Occlusion**: `Ctrl+Win+e`
* **Focus Content Window**: `Ctrl+Alt+c`
* **Compress Image**: `Ctrl+Win+c`
* **Set Hook**: `Ctrl+Win+&`

### Configuration
At the head of the .ahk script
```
global ImageEditorBin := "C:\Program Files (x86)\ImageOcclusionEditor\ImageOcclusionEditor.exe"
global OcclusionItemNamePattern := "[Occlusion]: {1}"         ; {1} Parent name
global OcclusionImageNamePattern := "__Occlusion: {1} {2}"    ; {1} Original image name {2} TimeStamp
```
