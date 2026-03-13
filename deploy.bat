@echo off
set CURRENT_DATE=%date% %time%

if "%~1"=="" (
    set COMMIT_MSG=portfolio update %CURRENT_DATE%
) else (
    set COMMIT_MSG=%~1
)

echo Saving source code to GitHub...
git add .
git commit -m "%COMMIT_MSG%"
git push origin main

echo Building and deploying the live site...
call ng deploy

echo Deployment complete!
