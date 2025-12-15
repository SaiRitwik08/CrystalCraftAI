# CrystaLLM End-to-End Pipeline Script
# Automation for training and sampling CrystaLLM

$ErrorActionPreference = "Stop"

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "   CrystaLLM Training & Sampling Pipeline" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

# 1. Environment Check
Write-Host "`n[1/5] Checking Environment..." -ForegroundColor Yellow
if (Test-Path "venv") {
    Write-Host "Virtual environment found." -ForegroundColor Green
    $python = ".\venv\Scripts\python.exe"
} else {
    Write-Host "Virtual environment NOT found. Initializing..." -ForegroundColor Yellow
    python -m venv venv
    $python = ".\venv\Scripts\python.exe"
    & $python -m pip install --upgrade pip
    & $python -m pip install -r requirements.txt
    & $python -m pip install torch==2.0.1 --index-url https://download.pytorch.org/whl/cu118
    & $python -m pip install -e .
}

# 2. Data Preparation
Write-Host "`n[2/5] Checking Data..." -ForegroundColor Yellow
if (-not (Test-Path "tokens_v1_train_val.tar.gz")) {
    Write-Host "Downloading dataset..."
    & $python bin/download.py tokens_v1_train_val.tar.gz
    tar -xzf tokens_v1_train_val.tar.gz
} else {
    Write-Host "Dataset already present." -ForegroundColor Green
}

# 3. Training
Write-Host "`n[3/5] Model Training..." -ForegroundColor Yellow
if (-not (Test-Path "my_train.yaml")) {
    Write-Error "Configuration file 'my_train.yaml' not found!"
}

# Check if training is already done (e.g. iter 10000)
# Note: This is a simplified check.
Write-Host "Starting/Resuming Training..."
Write-Host "Press Ctrl+C to stop training at any time (checkpoint is saved automatically)."
& $python -u bin/train.py --config=my_train.yaml

# 4. Sampling
Write-Host "`n[4/5] Generating Samples..." -ForegroundColor Yellow
$outDir = "out_crystallm_v1_from_scratch"
$samplesDir = "gen_samples_pipeline"
New-Item -ItemType Directory -Force -Path $samplesDir | Out-Null

$formulas = @("NaCl", "MgO", "Fe2O3")
foreach ($formula in $formulas) {
    Write-Host "Generating structure for $formula..."
    $prompt = "data_$formula`n"
    & $python bin/sample.py out_dir=$outDir start=$prompt num_samples=1 max_new_tokens=1000 device=cuda target=file
    Move-Item "sample_1.cif" "$samplesDir\${formula}_generated.cif" -Force -ErrorAction SilentlyContinue
}

# 5. Validation
Write-Host "`n[5/5] Validating Samples..." -ForegroundColor Yellow
& $python validate_samples.py

Write-Host "`nPipeline Completed Successfully!" -ForegroundColor Green
