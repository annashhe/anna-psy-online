# Deploy static site to Cloudflare Pages (excludes local/ and dev junk).
# Requires in the same PowerShell session:
#   $env:CLOUDFLARE_API_TOKEN = "..."
#   $env:CLOUDFLARE_ACCOUNT_ID = "f480ee9a20c8270499364bf5fbb05de6"

$ErrorActionPreference = "Stop"

if (-not $env:CLOUDFLARE_API_TOKEN) {
  throw "Set CLOUDFLARE_API_TOKEN first."
}

if (-not $env:CLOUDFLARE_ACCOUNT_ID) {
  $env:CLOUDFLARE_ACCOUNT_ID = "f480ee9a20c8270499364bf5fbb05de6"
}

$nodeDir = "C:\Program Files\nodejs"
if (Test-Path $nodeDir) {
  $env:Path = "$nodeDir;$env:Path"
}

$src = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$stage = Join-Path $env:TEMP "muzhskoy-pages-deploy"

if (Test-Path $stage) {
  Remove-Item $stage -Recurse -Force
}
New-Item -ItemType Directory -Path $stage | Out-Null

robocopy $src $stage /E /XD local .git .github PROMPTS scripts node_modules .wrangler /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
if ($LASTEXITCODE -ge 8) {
  throw "robocopy failed: $LASTEXITCODE"
}

Push-Location $src
try {
  npx --yes wrangler@4 pages deploy $stage --project-name=muzhskoy-psikholog-ru --commit-dirty=true
}
finally {
  Pop-Location
}
