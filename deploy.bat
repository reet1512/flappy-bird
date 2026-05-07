@echo off

echo Adding files...
git add .

echo Committing changes...
git commit -m "quick update"

echo Pushing to GitHub...
git push

echo Deployment complete!
pause