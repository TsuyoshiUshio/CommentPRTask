@echo off
call Script\compile.bat

rmdir Deploy /S /Q
mkdir Deploy

xcopy Task Deploy\Task\ /E /Y /Q
FOR /D %%f IN (Deploy\Task\*) DO copy Src\*.js %%f /Y

xcopy images Deploy\images\ /E /Y /Q
copy readme.md Deploy
copy vss-extension.json Deploy

FOR /D %%f IN (Deploy\Task\*) DO (pushd %%f & call npm install --production & popd)