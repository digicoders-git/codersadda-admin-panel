# Script to remove API imports from all website folder files
$websiteFolder = "d:\abhay\ProjectR\CodersAdda\dashboard\src\pages\website"

# API patterns to remove
$apiPatterns = @(
    'from "../../apis/course"',
    'from "../../apis/courseCategory"',
    'from "../../apis/blog"',
    'from "../../apis/review"',
    'from "../../apis/subscription"',
    'from "../../apis/websiteCategory"'
)

# Get all JSX files except the ones we already fixed
$files = Get-ChildItem -Path $websiteFolder -Filter "*.jsx" | 
    Where-Object { $_.Name -notin @('AddWebsiteCategory.jsx', 'EditWebsiteCategory.jsx', 'WebsiteCategories.jsx') }

Write-Host "Found $($files.Count) files to process"

foreach ($file in $files) {
    Write-Host "Processing: $($file.Name)"
    
    $content = Get-Content -Path $file.FullName -Raw
    
    # Check if file has API imports
    $hasApiImports = $false
    foreach ($pattern in $apiPatterns) {
        if ($content -match [regex]::Escape($pattern)) {
            $hasApiImports = $true
            break
        }
    }
    
    if ($hasApiImports) {
        Write-Host "  - Has API imports, needs cleanup"
    } else {
        Write-Host "  - No API imports found, skipping"
    }
}

Write-Host "`nDone! Found files with API imports."
