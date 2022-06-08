# SuperMemo-Git-sync
A PowerShell script to seamlessly backup and sync your SuperMemo collection (across multiple devices)

# Table of Contents
- [Features](#features)
- [Workflow](#workflow)
- [Setup](#setup)
  * [Complimentary video guide](#complimentary-video-guide)
  * [Prerequisites](#prerequisites)
  * [Setting up the back up script](#setting-up-the-back-up-script)
  * [Setting PowerShell execution policy](#setting-powershell-execution-policy)
- [How to use the script](#how-to-use-the-script)
- [Notes](#notes)
- [FAQ](#faq)
- [Troubleshooting](#troubleshooting)
  * [Fixing common git issues](#fixing-common-git-issues)
    + [Dirty files on pull - can't merge](#dirty-files-on-pull---can-t-merge)
    + [Accidental commit on pull - can't merge](#accidental-commit-on-pull---can-t-merge)
    + [Accidental commit + push - can't merge](#accidental-commit---push---can-t-merge)
- [Additional pro features](#additional-pro-features)
  * [Controlling what is synced by this script](#controlling-what-is-synced-by-this-script)
  * [Enabling pro features](#enabling-pro-features)
    + [Doing a `git stash` before launching SuperMemo](#doing-a--git-stash--before-launching-supermemo)
      - [Clearing out changes when relaunching SM](#clearing-out-changes-when-relaunching-sm)
      - [Getting your changes back](#getting-your-changes-back)

# Features
- Seamless experience. Run the script instead of the SM shortcut and it will sync your collection in the background
- Support for both vanilla SM and [SMA](https://sma.supermemo.wiki/)
- Automatic backup solution: git snapshot is taken every time you close SM so even if your local folder fails, you can go back to a previous version
- Sync your collection across any number of devices, as long as your only run SM on 1 PC at a time
- The script runs in the background unless your input is required. No need to stop to ensure your git collection is still OK every time you run SM
- You're in control. If you're experimenting with your collection and decide you don't want to sync your changes, close the script and manually decide if you want to save / discard them

# Workflow
Upon launching, this script will:
1. Get the latest copy of your SM collection from git
	- The script will prompt to review the output if the current status is unexpected (no internet, git conflicts, etc.)
2. Launch SM
3. Save your collection to git once SM is closed
	- Once again, the script will stay opened if there's non standard output. Otherwise, it will close itself when finished

# Setup
## Complimentary video guide
https://www.youtube.com/watch?v=uAKzWlSmkz4

## Prerequisites
- This script assumes you're using git to backup your SuperMemo collection, as outlined in the SuperMemo community backup guide:
  - Text version: https://www.supermemo.wiki/en/supermemo/backup-guide#installing-setting-up-git
  - Video version: https://www.youtube.com/watch?v=4aq_Bo4zcfw
- [Download git](https://git-scm.com/downloads)
- Register at https://github.com/

## Setting up the back up script
1. Download `Start & sync SM.ps1`
   - Click on `Start & sync SM.ps1` in github
   - On the new page, click [Raw](Start%20%26%20sync%20SM.ps1?raw=1)
   - Right click on the page and click `Save (page) as ...` (specific text depends on your browser). Make sure the file is saved as a `.ps1` extension (i.e., not `Start & sync SM.ps1.txt` etc).
2. Place the script in your git folder together with your SM collection
![Example folder structure](images/folder_sctructure.png)
3. Right click on the .ps1 script and click `Send to` > `Desktop`
4. On your desktop, Right click on the newly created shortcut and click `Properties`
5. In the `Target` field, replace the current value with the respective string from the options below (depending on what you use) - this info is also available at the start of the script itself (pro features are described below - if you're uncomfortable with git, use the regular version)
	- SM
		- `C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -command "& 'D:\path\to\Start & sync SM.ps1' C:\path\to\sm18.exe"`
	- SM + Pro mode
		- `C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -command "& 'D:\path\to\Start & sync SM.ps1' C:\path\to\sm18.exe --pro"`

	- SMA
		- **NB** Note that for SMA, multiple .exe are available. You need to make sure to use the one in `app-2.1.0-beta.21` folder for the script to work
		- `C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -command "& 'D:\path\to\Start & sync SM.ps1' C:\path\to\app-2.1.0-beta.21\SuperMemoAssistant.exe"`
	- SMA + Pro mode
		- `C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -command "& 'D:\path\to\Start & sync SM.ps1' C:\path\to\app-2.1.0-beta.21\SuperMemoAssistant.exe --pro"`
6. Press `OK` on the Properties window
7. Optional: if you were using a shortcut to run SM, you can delete it

## Setting PowerShell execution policy
If you try to run the script and you've not run PowerShell scripts before, the script will most likely quickly close without producing any results. The reason for this is [PowerShell execution policies](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.security/set-executionpolicy?view=powershell-7.1), which, by default, do not allow execution of scripts downloaded for the internet. To circumvent this:
1. Open PowerShell in admin mode:
	- Press `Win key + X` and select `Windows PowerShell (Admin)`
2. Type `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` and hit enter

This will allow the execution of scripts that you unblock on case by case basis. To unblock our script and allow it to run:
1. Right click on `Start & sync SM.ps1` in your git folder (not the shortcut on the desktop!)
2. Tick `Unblock` at the bottom and click `OK`

You should now be able to run the script.

# How to use the script
- Use this script instead of the normal SuperMemo shortcut - it will ensure you have the latest copy of your collection before you start working on it and will update the latest copy when you're finished
- This is especially true for multiple devices: if you setup this script on multiple PCs then you don't need to worry about having the latest copy of your collection. As long as you only run this script (and not SM directly) then you can always pick up where you left off at any of your workstations
- **Do not** use this script to work on multiple devices **in parallel**: not only is this inefficient (as you'll see the same elements on every device, duplicating your efforts) but this will also create conflicting commits in git: eventually, when you'll try to sync your work between your devices, you'll get conflicts in git which would need to be resolved
	- Always work on one device at a time. When you wish to transfer to a new device, close SuperMemo on the original machine. Then, launch this script on your new device - you should see git notifications that it's updating some files
	- If you accidentally launch SuperMemo on multiple computers, modified files may prevent git from syncing your latest changes from other devices. To resolve this, you may need to `reset` and `stash` your changes.

# Notes
- This script is nothing too complicated - it's a few git commands to sync the collection, mixed in with a few readable prompts. I've used it myself for 1 year+ as of the writing of this readme file. Still, I can't hold any responsibility if something goes horribly wrong - use at your own risk and all that
- After setting up the script, make sure to make a few test changes to ensure that everything is working as you would expect (e.g. making a simple text edit on 1 PC, and then launching the script on the other PC and expecting to see the change) 
- The script does automatic backups for you in git every time you close it. As such, there is no need to use the backup generation functionality in SM
- In the event where no Internet connection is present, there is still a benefit of using this script compared to launching standalone SuperMemo: this script will create commits every time you close SuperMemo (but won't be able to push them online). This is better because it allows you to work with more granular changes, should you wish to revert them
- Any questions - you can ask for help in SuperMemo community discord: [invite](https://discord.gg/vUQhqCT), [web version](https://chat.supermemo.wiki/); or [get in touch personally](https://discordapp.com/users/204301231244574721/)
- This project took some time to do, so if you found this work useful, you can return me the favour :) [![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://paypal.me/Rizihs)

# FAQ

- What if I don't want to sync my changes after closing SM? (e.g. when I want to experiment with my collection)
	- Just close the script after SM is launched - if the script is closed, it can't push your changes. Alternatively, if you plan to experiment a lot, consider launching SM manually and only launch via the script to sync afterwards when you're happy with your changes.

# Troubleshooting

Sometimes you might encounter issues where upon running the script it will open and close PowerShell so quickly that it's impossible to see the actual error. To solve this:
- Launch PowerShell normally
- Type the string that you've used in the `Target` field (as described in the [setup](#Setup) section - e.g. `C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -command "& 'D:\path\to\Start & sync SM.ps1' C:\path\to\sm18.exe"`) and hit Enter
![Examples of debugging commands in PowerShell](images/running_powershell.png)

## Fixing common git issues
These appear in the order of frequency & severity. Doing these will mean some loss of data (even if it may be data that you don't care about), so if you're not sure what you're doing, I recommend doing a full copy of your collection's folder.

Video guide: https://www.youtube.com/watch?v=jof8hAk4Ppc

### Dirty files on pull - can't merge
**TBA soon™**
### Accidental commit on pull - can't merge
**TBA soon™**
### Accidental commit + push - can't merge
**TBA soon™**

# Additional pro features
The script will work out of the box as-is - no need to tweak it beyond the basic configuration. If you're not too comfortable with git, I recommend leaving these as is.

## Controlling what is synced by this script
Every time you close SuperMemo, `Add-GitFiles` function is called, which will sync the collection with git. Out of the box, it does `git add -A *`, where `*` stands for all files in the folder. This means that every time you close SuperMemo, all files in the collection will be saved. This configuration will work for the majority of people.

This can be changed, if desired. E.g. if you store additional information in the same git repo, but only choose to save SuperMemo related files when your close SuperMemo. To do so, see https://git-scm.com/docs/git-add

## Enabling pro features
For the rest of these features to work, the script needs to be run in pro mode. To do this, `--pro` needs to be added as the **last** parameter when running the script (within the outer `""`): the [setup](#Setup) section at the top has this covered so just copy & paste the relevant string.

### Doing a `git stash` before launching SuperMemo
If the script detects any dirty changes, the script will prompt you to type `cl` as you launch it. If you type in these characters and press _Enter_, the script will clear any modified files in the git repo, before launching SuperMemo.

This will probably be useful if you're using your collection on 2+ devices - e.g. if you've launched this script on machine A (and synced your changes), and at the same time **accidentally** launched SuperMemo on machine B. This will modify SuperMemo files on both machines in a different way, meaning that if you afterwards try to run the script on Machine B, you will get conflicts.

Typing `cl` will clean the dirty files and sync the latest version of the knowledge collection.

#### Clearing out changes when relaunching SM
When you launch SM (via this script) and close it without performing any actions, the script will try to detect that no actions were performed (the script may not always detect this). If the script detects that SM was closed without many any changes, it will, once again, prompt you to enter `cl`. Doing so will clean the files as if SM was never launched in the first place.

#### Getting your changes back
If you've accidentally did a `cl` where you didn't intend to, you can get your changes back by opening _git bash_ in your knowledge folder and typing `git stash pop`. Previous versions are recoverable too, see: https://git-scm.com/docs/git-stash