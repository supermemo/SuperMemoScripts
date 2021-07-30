# SuperMemo-Git-sync
A PowerShell script to seamlessly backup and sync your SuperMemo collection (across multiple devices)

**NB:** This script assumes you're using git to backup your SuperMemo collection, as outlined in https://www.supermemo.wiki/supermemo/backup-guide

# Features
- Seamless experience. Run the script instead of the SM shortcut and it will sync your collection in the background
- Support for both vanilla SM and [SMA](https://sma.supermemo.wiki/)
- Sync your collection across any number of devices, as long as your only run SM on 1 PC at a time
- The script runs in the background unless your input is required. No need to stop to ensure your git collection is still OK every time you run SM
- You're in control. If you're experimenting with your collection and decide you don't want to sync your changes, close the script and manually decide if you want to save / discard them

# Workflow
Upon launching, this script will:
1. Get the latest copy of your SM collection from git
	- The script will prompt to review the output if the current status is unexpected (no internet, git conflicts, etc.)
2. Launch SM
3. Once SM is closed, it save your collection to git
	- Once again, the script will stay opened if there's non standard output. Otherwise, it will close itself when finished

# Setup
1. Download `Start & sync SM.ps1`
2. Place the script in your git folder together with your SM collection
3. Right click on the .ps1 script and click `Send to` > `Desktop`
4. On your desktop, Right click on the newly created shortcut and click `Properties`
5. In the `Target` field, put the respective string from the options below, depending on what you use. This info is also available at the start of the script itself (pro features are described below - if you're uncomfortable with git, use the regular version)
- SM
	- `C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -command "& 'D:\path\to\Start & sync SM.ps1' C:\path\to\sm18.exe"`
- SM + Pro mode
	- `C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -command "& 'D:\path\to\Start & sync SM.ps1' C:\path\to\sm18.exe --pro"`

- SMA
	- `C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -command "& 'D:\path\to\Start & sync SM.ps1' C:\path\to\SuperMemoAssistant.exe"`
- SMA + Pro mode
	- `C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -command "& 'D:\path\to\Start & sync SM.ps1' C:\path\to\SuperMemoAssistant.exe --pro"`

- SMA with a default collection
	- `C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -command "& 'D:\path\to\Start & sync SM.ps1' C:\path\to\SuperMemoAssistant.exe --collection='\"D:\path\to\your SM collection.KNO\"'"`
- SMA with a default collection + Pro mode
	- `C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -command "& 'D:\path\to\Start & sync SM.ps1' C:\path\to\SuperMemoAssistant.exe --collection='\"D:\path\to\your SM collection.KNO\"' --pro"`
6. Press `OK` on the Properties window
7. Optional: if you were using a shortcut to run SM, you can delete it

# How to use
- Use this script instead of the normal SuperMemo shortcut - it will ensure you have the latest copy of your collection before you start working on it and will update the latest copy when you're finished
- This is especially true for multiple devices: if you setup this script on multiple PCs then you don't need to worry about having the latest copy of your collection. As long as you only run this script (and not SM directly) then you can always pick up where you left off at any of your workstations
- **Do not** use this script to work on multiple devices **in parallel**: not only is this inefficient (as you'll see the same elements on every device, duplicating your efforts) but this will also create conflicting commits in git: eventually, when you'll try to sync your work between your devices, you'll get conflicts in git which would need to be resolved
	- Always work on one device at a time. When you wish to transfer to a new device, close SuperMemo on the original machine. Then, launch this script on your new device - you should see git notifications that it's updating some files
	- If you accidentally launch SuperMemo, modified files may prevent git from syncing your latest changes from other devices. To resolve this, you can use 'git stash' (as described in the next section)

# Notes
- This script is nothing too complicated - you can see that it's a few git commands to sync the collection, mixed in with a few readable prompts. I've used it myself for 4 months+ as of the writing of this readme file. Still, I can't hold any responsibility if something goes horribly wrong - use at your own risk and all that
- After setting up the script, make sure to make a few test changes to ensure that everything is working as you would expect (e.g. making a simple text edit on 1 PC, and then launching the script on the other PC and expecting to see the change) 
- In the event where no Internet connection is present, there is still a benefit of using this script compared to launching standalone SuperMemo: this script will create commits every time you close SuperMemo (but won't be able to push them online). This is better because it allows you to work with more granular changes, should you wish to revert them
- Any questions - let me know, and I'll try to do a better write up/explain

# Additional pro features
The script will work out of the box as-is - no need to tweak it beyond the basic configuration. If you're not too comfortable with git, I recommend skipping these.

## Controlling what is synced by this script
Every time you close SuperMemo, `Add-GitFiles` function is called, which will sync the collection with git. Out of the box, it does `git add -A *`, where `*` stands for all files in the folder. This means that every time you close SuperMemo, all files in the collection will be saved. This configuration will work for the majority of people.

This can be changed, if desired. E.g. if you store additional information in the same git repo, but only choose to save SuperMemo related files when your close SuperMemo. To do so, see https://git-scm.com/docs/git-add

## Enabling pro features
For the rest of these features to work, the script needs to be run in pro mode. To do this, `--pro` needs to be added as the **last** parameter when running the script (within the outer `""`): the #Setup section at the top has this covered so just copy & paste the relevant string.

### Doing a 'git stash' before launching SuperMemo
If the script detects any dirty changes, the script will prompt you to type `cl` as you launch it. If you type in these characters and press _Enter_, the script will clear any modified files in the git repo, before launching SuperMemo.

This will probably be useful if you're using your collection on 2+ devices - e.g. if you've launched this script on machine A (and synced your changes), and at the same time **accidentally** launched SuperMemo on machine B. This will modify SuperMemo files on both machines in a different way, meaning that if you afterwards try to run the script on Machine B, you will get conflicts.

Typing `cl` will clean the dirty files and sync the latest version of the knowledge collection.

#### Clearing out changes when relaunching SM
When you launch SM (via this script) and close it without performing any actions, the script will try to detect that no actions were performed (the script may not always detect this). If this is the case, the script will, once again, prompt you to enter `cl`. Doing so will clean the files as if SM was never launched in the first place.

#### Getting your changes back
If you've accidentally did a `cl` where you didn't intend to, you can get your changes back by opening _git bash_ in your knowledge folder and typing `git stash pop`. Previous versions are recoverable too, see: https://git-scm.com/docs/git-stash