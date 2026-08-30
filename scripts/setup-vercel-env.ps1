# Sample School — Vercel environment variables
# Prereqs: npm i -g vercel  (or use npx vercel)
#          vercel login
#          cd to this repo and: vercel link

$ErrorActionPreference = "Stop"

$vars = @{
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN        = "school-29-march-26.firebaseapp.com"
  NEXT_PUBLIC_FIREBASE_PROJECT_ID         = "school-29-march-26"
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET     = "school-29-march-26.firebasestorage.app"
  NEXT_PUBLIC_SCHOOL_MIRROR_PASSWORD      = "SuperAdmin123!"
}

$environments = @("production", "preview", "development")

Write-Host "Setting Sample School Firebase env on linked Vercel project..." -ForegroundColor Cyan
Write-Host "Project ID must be: school-29-march-26" -ForegroundColor Yellow
Write-Host "Add NEXT_PUBLIC_FIREBASE_API_KEY and APP_ID manually from Firebase Console." -ForegroundColor Yellow

foreach ($name in $vars.Keys) {
  foreach ($env in $environments) {
    Write-Host "  $name ($env)"
    npx vercel env add $name $env --value $vars[$name] --yes --force 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
      Write-Host "    (run manually: vercel env add $name $env)" -ForegroundColor DarkYellow
    }
  }
}

Write-Host ""
Write-Host "Done. Redeploy: npx vercel --prod" -ForegroundColor Green
Write-Host "Confirm footer shows: Firestore: school-29-march-26" -ForegroundColor Green
