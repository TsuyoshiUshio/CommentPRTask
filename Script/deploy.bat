call Script\compile.bat

copy Src\*.js Task
copy package.json Task

IF EXIST Task\node_modules (
    RD /s /q Task\node_modules
)

xcopy /Y /I /S node_modules Task\\node_modules
