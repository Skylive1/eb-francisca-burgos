$path = 'src\components\Profesor\GestorMateriales.jsx'
$lines = Get-Content $path

# Line 390 (index 389) is corrupted - fix it to proper two lines
$corruptLine = $lines[389]
$lines[389] = "                          transition={{ type: 'spring', duration: 0.6, bounce: 0.1 }}"

# Insert the missing closing > and div opening after line 390
$newLines = @()
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($i -eq 389) {
        $newLines += "                          transition={{ type: 'spring', duration: 0.6, bounce: 0.1 }}"
        $newLines += "                        >"
        $newLines += "                          <div className={``p-6 md:p-10 pt-4 border-t-2 $`` + '{' + 'isDarkMode ? ' + "'" + 'border-slate-800' + "'" + ' : ' + "'" + 'border-slate-100' + "'" + '}' + '``}'+ '>'
    } else {
        $newLines += $lines[$i]
    }
}

Set-Content $path $newLines
Write-Host "Fixed line 390"
