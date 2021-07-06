# PowerShell script for running and syncing SM https://github.com/supermemo/SuperMemoScripts
# To be used with a git backup, as per https://www.supermemo.wiki/en/supermemo/backup-guide#internet-backups-git
# To run, put this script into your SM collection folder (the one with the .KNO file), right click the script and
# Sent to > Desktop. Then, right click the newly created shortcut and select Properties.
# Depending whether you use SM or SMA, put the respective string below (replacing the correct path) in the Target field (ignoring the #) and press OK

# SM
# C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -command "& 'D:\path\to\Start & sync SM.ps1' C:\path\to\sm18.exe"

# SMA
# C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -command "& 'D:\path\to\Start & sync SM.ps1' C:\path\to\SuperMemoAssistant.exe"

# SMA with a default collection
# C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -command "& 'D:\path\to\Start & sync SM.ps1' C:\path\to\SuperMemoAssistant.exe --collection='\"D:\path\to\your SM collection.KNO\"'"

function Add-GitFiles {
    git add -A *
}

function Clear-CurrentFolder {
    Add-GitFiles
    git stash
    git reset --hard
    git pull
    Read-Host "Current folder is now clean. Google `"git stash`" if you need to get your changes back. (Enter to continue)"
}

function Remove-UselessFiles {
    $cmdOutput = git status | Sort-Object
    $cmdOutput

    if  ($cmdOutput[4].Split("/")[1] -eq "collection.ini" -and
        (
            $cmdOutput[7] -eq "Changes not staged for commit:" -or
            $cmdOutput[8] -eq "Changes not staged for commit:"
        )
    ) {
        $userInput = Read-Host -Prompt "It seems that SM was opened and closed without performing many actions. Type cl to clear them."
        if ($userInput -eq "cl") {
            Clear-CurrentFolder
        }
    }
}

$gitPullErrors = $false
"git pull"
$pullOutput = cmd /c git pull
$pullOutput = $pullOutput -split "`r`n" # split by newline in case the output is multiline
if ($pullOutput[0] -ne "Already up to date." -and $pullOutput[1] -ne "Fast-forward") {
    $pullOutput
    $gitPullErrors = $true
}

"git status"
$statusOutput = cmd /c git status
if ($statusOutput[3] -ne "nothing to commit, working tree clean" -or $gitPullErrors) {
    $statusOutput
    "`r`nNon standard git output, double check above"
    $userInput = Read-Host -Prompt "Type cl if you want to clear any unsaved changes(backup will be stashed)"
    if ($userInput -eq "cl") {
        Clear-CurrentFolder
    }
} else {
    "All OK - proceeding"
}

"`r`nStarted SM, will commit changes on close. Close this terminal if you don't want that"
& $args[0] $args[1] | Out-Null # start SM from provided path (&) and wait for it to close (Out-Null)
"Closed SM"

Remove-UselessFiles

Add-GitFiles
git commit -m "PS SM+Obsidian upd"

$gitPullErrors = $false
"git pull"
$pullOutput = cmd /c git pull
$pullOutput = $pullOutput -split "`r`n" # split by newline in case the output is multiline
if ($pullOutput[0] -ne "Already up to date." -and $pullOutput[1] -ne "Fast-forward") {
    $pullOutput
    $gitPullErrors = $true
}

"git push"
git push -u

$statusOutput = cmd /c git status
if ($statusOutput[3] -ne "nothing to commit, working tree clean" -or $gitPullErrors) {
    $statusOutput
    Read-Host "`r`nNon standard git output, double check above"
}