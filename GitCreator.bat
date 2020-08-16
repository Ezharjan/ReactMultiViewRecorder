@echo off
git init
set /p msg=Add origin:
git add .
git remote add origin "%msg%"
git commit -m "first commit"
git push -u origin master
echo --------End!--------
pause

