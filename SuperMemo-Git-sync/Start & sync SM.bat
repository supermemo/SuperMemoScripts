@echo off
echo git pull
git pull
git status
set /P INPUT=Type cl if you want to clear above changes(backup will be stashed):


If "%INPUT%"=="cl" (
  call:gitAddFiles
  git stash
  git reset --hard
  git clean -i
  git pull
  echo Current folder is now clean. Google "git stash" if you need to get your changes back.
  pause
)

echo Started SM...
start /w %1:\SuperMemo\sm18.exe
echo Detected SM has closed. Close the script if you don't want to save changes from this session
pause

call:gitAddFiles
git commit -m "Update"
git push -u
echo.
git status
pause



:gitAddFiles
  git add -A *
goto:eof