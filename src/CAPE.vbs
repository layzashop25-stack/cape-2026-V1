Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")

' Set working directory
WshShell.CurrentDirectory = FSO.GetParentFolderName(WScript.ScriptFullName)

' Check if node_modules exists
If Not FSO.FolderExists("node_modules") Then
    MsgBox "Installing dependencies... Please wait.", vbInformation, "CAPE Setup"
    WshShell.Run "cmd /c npm install", 1, True
End If

' Start server in background
WshShell.Run "cmd /c npm run dev", 0, False

' Wait for server to start
WScript.Sleep 3000

' Open browser
WshShell.Run "http://localhost:5173", 1, False

MsgBox "CAPE is running! Close this message to keep the app running." & vbCrLf & vbCrLf & "To stop the app, close your browser and press Ctrl+C in the command window.", vbInformation, "CAPE Started"
