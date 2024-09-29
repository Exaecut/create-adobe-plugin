param(
    [string]$ClProgram,
    [string]$IncludeArgs,
    [string]$Pipl,
    [string]$OutputRR,
    [string]$OutputRsrc,
    [string]$OutputRC,
    [string]$Rez
)

$ClProgram = $ClProgram -replace '\\\\', '\'
$Pipl = $Pipl -replace '\\\\', '\'
$OutputRR = $OutputRR -replace '\\\\', '\'
$OutputRsrc = $OutputRsrc -replace '\\\\', '\'
$Rez = $Rez -replace '\\\\', '\'

$IncludeArgsArray = $IncludeArgs -split ';'

$IncludeArgsFormatted = @()
foreach ($Include in $IncludeArgsArray) {
    $IncludeArgsFormatted += "/I"
    $IncludeArgsFormatted += "`"$Include`""
}

print("Compiling PiPl file...")

# First command: Compile with the After Effects SDK Headers
& "$ClProgram" $IncludeArgsFormatted "/I" "$env:EX_AFTERFX_SDK\Headers" "/I" "$env:EX_AFTERFX_SDK\Util" "/I" "$env:EX_AFTERFX_SDK\Resources" "/EP" "$Pipl" > "$OutputRR"

if ($LASTEXITCODE -eq 0) {
    (Get-Content $OutputRR) | Where-Object { $_ -ne "" } | Set-Content $OutputRR

    # Second command: Run Rez with the output files
    & "$Rez" "$OutputRR" "$OutputRsrc"

    # Third command: Compile for MSWindows
    & "$ClProgram" "/D" "MSWindows" "/EP" "$OutputRsrc" > "$OutputRC"
} else {
    Write-Host "The first command failed with exit code $LASTEXITCODE."
}