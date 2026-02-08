# PowerShell script to create a venv and install requirements
# Run in the workspace root: .\scripts\setup_env.ps1

# Create virtual env
python -m venv .venv

# Activate venv in current session (PowerShell)
. .venv\Scripts\Activate.ps1

# Upgrade pip and install requirements
python -m pip install --upgrade pip
pip install -r requirements.txt

Write-Host "Setup complete. Activate with '. .venv\Scripts\Activate.ps1' and run 'python app.py' to start the server."