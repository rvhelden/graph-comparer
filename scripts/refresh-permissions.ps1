<#
.SYNOPSIS
  Refreshes Microsoft Graph permissions data for a client-side comparer app.

.DESCRIPTION
  - Downloads DevX permissions JSON (v1.0 + beta)
  - Fetches Microsoft Graph service principal (app roles, delegated scopes, RSAP)
  - Builds Kibali and runs 'import' to create GraphPermissions.json
  - Produces index-by-scope.json:
      {
        "Mail.Read": {
          "delegatedWork": [ { version, url, method, rank } ],
          "delegatedPersonal": [ ... ],
          "application": [ ... ],
          "meta": {
            "delegated": { adminDisplay, adminDescription },
            "application": { adminDisplay, adminDescription }
          }
        }
      }

.PARAMETERS
  -OutDir                Output folder (default: ./data)
  -TenantId              Entra tenant id (GUID or domain)
  -ClientId              App registration (for app-only Graph call)
  -ClientSecret          App secret (if omitted, uses $env:GRAPH_CLIENT_SECRET if set)
  -IncludeBeta           Include DevX beta file (default: true)
  -DevxBranch            DevX content branch (default: dev)
  -SkipKibali            Skip building Kibali & GraphPermissions.json
  -KibaliRepo            Kibali repo URL (default: https://github.com/microsoftgraph/kibali.git)
  -GitCommit             Commit changes if data changed (uses local git)
  -Verbose               Chatty logs

.NOTES
  Requires: PowerShell 7+, git, dotnet 8+
#>

[CmdletBinding()]
param(
    [string]$OutDir = "$(Join-Path (Get-Location) 'data')",
    [string]$TenantId,
    [string]$ClientId,
    [string]$ClientSecret,
    [string]$KibaliRepo = 'https://github.com/microsoftgraph/kibali.git'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ---------- Helpers ----------
function Write-Info($msg) { Write-Host "• $msg" }

function Ensure-Dir([string]$p) {
    if (-not (Test-Path $p)) { New-Item -ItemType Directory -Path $p | Out-Null }
    (Resolve-Path $p).Path
}

function Download-File([string]$url, [string]$outFile) {
    Write-Info "GET $url"
    Invoke-WebRequest -UseBasicParsing -Uri $url -OutFile $outFile
}

function Get-GraphTokenAppOnly([string]$tenantId, [string]$clientId, [string]$clientSecret) {
    $body = @{
        client_id     = $clientId
        scope         = 'https://graph.microsoft.com/.default'
        client_secret = $clientSecret
        grant_type    = 'client_credentials'
    }
    $tokenEndpoint = "https://login.microsoftonline.com/$tenantId/oauth2/v2.0/token"
    $resp = Invoke-RestMethod -Method POST -Uri $tokenEndpoint -Body $body -ContentType 'application/x-www-form-urlencoded'
    return $resp.access_token
}

function Get-ServicePrincipalPermissionsJson([string]$tenantId, [string]$clientId, [string]$clientSecret) {
    if (-not $tenantId -or -not $clientId) {
        Write-Info "TenantId/ClientId not provided — skipping service principal fetch."
        return $null
    }
    if (-not $clientSecret) { $ClientSecret = $env:GRAPH_CLIENT_SECRET }
    if (-not $clientSecret) { throw "ClientSecret not provided and GRAPH_CLIENT_SECRET env var not set." }

    $token = Get-GraphTokenAppOnly -tenantId $tenantId -clientId $clientId -clientSecret $clientSecret
    $headers = @{ Authorization = "Bearer $token" }
    # Official Graph service principal for Microsoft Graph (includes appRoles + oauth2PermissionScopes + RSAP)
    $url = 'https://graph.microsoft.com/v1.0/servicePrincipals(appId=''00000003-0000-0000-c000-000000000000'')?$select=id,appId,displayName,appRoles,oauth2PermissionScopes,resourceSpecificApplicationPermissions'
    Write-Info "GET Graph service principal (permissions catalog)"
    $obj = Invoke-RestMethod -Headers $headers -Uri $url -Method GET
    return ($obj | ConvertTo-Json -Depth 100)
}

function Ensure-Kibali([string]$repoUrl, [string]$workDir) {
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw "git not found in PATH." }
    if (-not (Get-Command dotnet -ErrorAction SilentlyContinue)) { throw ".NET SDK not found in PATH." }
    if (Test-Path $workDir) {
        Write-Info "Updating Kibali repo..."
        git -C $workDir fetch --depth=1 origin main | Out-Null
        git -C $workDir reset --hard origin/main | Out-Null
    }
    else {
        Write-Info "Cloning Kibali..."
        git clone --depth=1 $repoUrl $workDir | Out-Null
    }
    Write-Info "Building Kibali (dotnet build -c Release)..."
    dotnet build $workDir -c Release | Out-Null

    $tool = Get-ChildItem -Recurse -Path (Join-Path $workDir 'src') -Filter 'KibaliTool*' `
    | Where-Object { $_.FullName -match 'bin[\\/](Release|Debug)[\\/]net' } `
    | Where-Object { $_.Name -like 'KibaliTool*' } `
    | Select-Object -First 1

    if (-not $tool) { throw "KibaliTool not found after build." }
    return $tool.Directory.FullName
}

function Run-KibaliImport([string]$toolDir, [string]$outFile) {
    Write-Info "Running Kibali 'import' to generate GraphPermissions.json..."
    Push-Location $toolDir
    try {
        $exe = Get-ChildItem -Filter 'KibaliTool.dll' | Select-Object -First 1
        &dotnet $exe.FullName import --pf https://raw.githubusercontent.com/microsoftgraph/microsoft-graph-devx-content/refs/heads/master/permissions/new/permissions.json | Out-Null
    }
    finally { Pop-Location }

    $kOut = Join-Path (Split-Path $toolDir -Parent) 'output/GraphPermissions.json'
    if (-not (Test-Path $kOut)) { throw "Kibali did not produce output/GraphPermissions.json" }
    Copy-Item $kOut $outFile -Force
}

function Build-IndexByScope([string]$kibaliJsonPath, [string]$spJsonPath, [string]$outPath) {
    Write-Info "Building inverted index (scope -> [url, method])..."
    if (-not (Test-Path $kibaliJsonPath)) { throw "Missing $kibaliJsonPath" }

    $k = Get-Content $kibaliJsonPath -Raw | ConvertFrom-Json -Depth 200

    # The Kibali schema (permissions-schema.json) models:
    #   { permissions: { "<PermissionName>": { schemes: {Application|DelegatedWork|DelegatedPersonal}, pathSets: [ { schemeKeys, methods, paths{ '/v1.0/..' : ... } } ] } } }
    # We’ll reflect that generically here.
    $index = @{}

    # Build a lookup from the service principal for admin text (optional)
    $metaDelegated = @{}
    $metaApplication = @{}
    if ($spJsonPath -and (Test-Path $spJsonPath)) {
        $sp = Get-Content $spJsonPath -Raw | ConvertFrom-Json -Depth 200
        foreach ($s in $sp.oauth2PermissionScopes) {
            $metaDelegated[$s.value] = [pscustomobject]@{
                adminDisplay     = $s.adminConsentDisplayName
                adminDescription = $s.adminConsentDescription
            }
        }
        foreach ($r in $sp.appRoles) {
            $metaApplication[$r.value] = [pscustomobject]@{
                adminDisplay     = $r.adminConsentDisplayName
                adminDescription = $r.adminConsentDescription
            }
        }
    }

    # Iterate Kibali permissions
    $perms = $k.permissions.PSObject.Properties
    foreach ($p in $perms) {
        $permName = $p.Name
        $def = $p.Value

        # slot with meta
        if (-not $index.ContainsKey($permName)) {
            $index[$permName] = [ordered]@{
                delegatedWork     = @()
                delegatedPersonal = @()
                application       = @()
                meta              = [ordered]@{
                    delegated   = $metaDelegated[$permName]
                    application = $metaApplication[$permName]
                }
            }
        }

        $pathSets = @($def.pathSets)
        foreach ($pset in $pathSets) {
            $schemes = @($pset.schemeKeys)
            $methods = @($pset.methods)
            $pathsObj = $pset.paths

            if (-not $pathsObj) { continue }
            $pathKeys = $pathsObj.PSObject.Properties.Name

            foreach ($path in $pathKeys) {
                $version = if ($path -like '/v1.0/*') { 'v1.0' } elseif ($path -like '/beta/*') { 'beta' } else { $null }
                foreach ($m in $methods) {
                    foreach ($sch in $schemes) {
                        $bucketName = switch ($sch) {
                            'Application' { 'application' }
                            'DelegatedWork' { 'delegatedWork' }
                            'DelegatedPersonal' { 'delegatedPersonal' }
                            default { $null }
                        }
                        if (-not $bucketName) { continue }

                        $entry = [pscustomobject]@{
                            version = $version
                            url     = $path
                            method  = $m
                            # rank is optional; if Kibali has schemes.<scheme>.privilegeLevel we can surface it:
                            rank    = ($def.schemes.$sch.privilegeLevel ?? $null)
                        }
                        # de-dup
                        if (-not ($index[$permName].$bucketName | Where-Object { $_.url -eq $entry.url -and $_.method -eq $entry.method -and $_.version -eq $entry.version })) {
                            $index[$permName].$bucketName += $entry
                        }
                    }
                }
            }
        }
    }

    # Write compact JSON
    ($index | ConvertTo-Json -Depth 50) | Out-File -FilePath $outPath -Encoding utf8
}

# ---------- Work ----------
$OutDir = Ensure-Dir $OutDir

# 1) Download DevX permissions JSON
#    (these are the same files Graph Explorer/DevX API consume)
$devxBase = "https://raw.githubusercontent.com/microsoftgraph/microsoft-graph-devx-content/$DevxBranch/permissions"
$paths = @(
    @{ url = "$devxBase/new/permissions.json"; out = Join-Path $OutDir 'permissions-v1.0.json' }
)

$paths += @{ url = "$devxBase/permissions-descriptions.json"; out = Join-Path $OutDir 'permissions-descriptions.json' }

foreach ($i in $paths) { Download-File -url $i.url -outFile $i.out }

# 2) Fetch the Microsoft Graph service principal (optional, but recommended for admin descriptions)
$spOut = Join-Path $OutDir 'sp-permissions.json'
try {
    $spJson = Get-ServicePrincipalPermissionsJson -tenantId $TenantId -clientId $ClientId -clientSecret $ClientSecret
    if ($spJson) {
        $spJson | Out-File -FilePath $spOut -Encoding utf8
    }
}
catch {
    Write-Warning "Failed to fetch service principal permissions: $($_.Exception.Message)"
}

# 3) Kibali import -> GraphPermissions.json (unless skipped)
$kibaliOut = Join-Path $OutDir 'graph-permissions.json'
if (-not $SkipKibali) {
    $work = Join-Path ([System.IO.Path]::GetTempPath()) "kibali-src"
    $toolDir = Ensure-Kibali -repoUrl $KibaliRepo -workDir $work
    Run-KibaliImport -toolDir $toolDir -outFile $kibaliOut
}
else {
    Write-Info "Skipping Kibali build/import as requested."
}

# 4) Build the inverted index used by the React app
if (Test-Path $kibaliOut) {
    $indexOut = Join-Path $OutDir 'index-by-scope.json'
    Build-IndexByScope -kibaliJsonPath $kibaliOut -spJsonPath (Test-Path $spOut ? $spOut : $null) -outPath $indexOut
}
else {
    Write-Warning "graph-permissions.json not found. Skipping index build."
}

# 5) Optional: commit if changed
if ($GitCommit) {
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) { Write-Warning "git not found; skipping commit." }
    else {
        git config user.email "permissions-bot@local"
        git config user.name "permissions-bot"
        git add "$OutDir/*.json"
        if ($LASTEXITCODE -ne 0) { Write-Warning "git add failed." }
        $diff = git diff --cached --name-only
        if ($diff) {
            git commit -m "data: refresh Graph permissions $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" | Out-Null
            git push
            Write-Info "Changes committed & pushed."
        }
        else {
            Write-Info "No data changes detected."
        }
    }
}

Write-Host "`nDone. Data is in $OutDir`n"
