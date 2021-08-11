# PowerShell script for running and syncing SM https://github.com/supermemo/SuperMemoScripts
# To be used with a git backup, as per https://www.supermemo.wiki/en/supermemo/backup-guide#internet-backups-git
# To run, put this script into your SM collection folder (the one with the .KNO file), right click the script and
# Sent to > Desktop. Then, right click the newly created shortcut and select Properties.
# Depending whether you use SM or SMA, put the respective string below (replacing the correct path) in the Target field (ignoring the #) and press OK

# SM
# C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -command "& 'D:\path\to\Start & sync SM.ps1' C:\path\to\sm18.exe"

# SM + Pro mode
# C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -command "& 'D:\path\to\Start & sync SM.ps1' C:\path\to\sm18.exe --pro"


# SMA
# C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -command "& 'D:\path\to\Start & sync SM.ps1' C:\path\to\SuperMemoAssistant.exe"

# SMA + Pro mode
# C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -command "& 'D:\path\to\Start & sync SM.ps1' C:\path\to\SuperMemoAssistant.exe --pro"


# SMA with a default collection
# C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -command "& 'D:\path\to\Start & sync SM.ps1' C:\path\to\SuperMemoAssistant.exe --collection='\"D:\path\to\your SM collection.KNO\"'"

# SMA with a default collection + Pro mode
# C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -command "& 'D:\path\to\Start & sync SM.ps1' C:\path\to\SuperMemoAssistant.exe --collection='\"D:\path\to\your SM collection.KNO\"' --pro"

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
    $cmdOutput = git status --porcelain=v1
    $cmdOutput
    if ($cmdOutput.Count -le 5) { # less or equals
        $userInput = Read-Host -Prompt "It seems that SM was opened and closed without performing many actions. Type cl to clear them."
        if ($userInput -eq "cl") {
            Clear-CurrentFolder
        }
    }
}

if ($args[$args.Count - 1] -eq "--pro") {
    $proMode = $true
    $args[$args.Count - 1] = $null;
}

"git pull"
git pull
$pullCode = $LASTEXITCODE

"git status"
$statusOutput = cmd /c git status --porcelain=v1
if ($null -ne $statusOutput -or $pullCode) {
    $statusOutput
    "`r`nNon standard git output - double check above"
    if ($proMode) {
        $userInput = Read-Host -Prompt "Type cl if you want to clear any unsaved changes(backup will be stashed)"
        if ($userInput -eq "cl") {
            Clear-CurrentFolder
        }
    } else {
        Read-Host -Prompt "Press Enter to continue"
    }
} else {
    "All OK - proceeding"
}

"`r`nStarted SM, will commit changes on close. Close this terminal if you don't want that"
& $args[0] $args[1] | Out-Null # start SM from provided path (&) and wait for it to close (Out-Null)
"Closed SM"

if ($proMode) {
    Remove-UselessFiles
}

"Proceeding to commit & push changes"
Add-GitFiles
git commit -m "PowerShell script update"

"git pull"
git pull
$pullCode = $LASTEXITCODE

"git push"
git push -u

if ($pullCode -or $LASTEXITCODE) {
    Read-Host "`r`nNon standard git output - double check above"
}