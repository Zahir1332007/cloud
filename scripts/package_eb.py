import os
import zipfile
import shutil

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_ZIP = os.path.join(ROOT_DIR, "deploy-eb.zip")

FILES_TO_ADD = [
    "application.py",
    "Procfile",
    "requirements.txt",
]

DIRS_TO_ADD = [
    "backend/app",
]

def create_eb_package():
    if os.path.exists(OUTPUT_ZIP):
        os.remove(OUTPUT_ZIP)

    print(f"Creating Elastic Beanstalk package: {OUTPUT_ZIP}")
    with zipfile.ZipFile(OUTPUT_ZIP, "w", zipfile.ZIP_DEFLATED) as zip_file:
        # Add root files
        for filename in FILES_TO_ADD:
            filepath = os.path.join(ROOT_DIR, filename)
            if os.path.exists(filepath):
                print(f"  + Adding {filename}")
                zip_file.write(filepath, arcname=filename)
            else:
                print(f"  ! Warning: {filename} not found!")

        # Add backend/pyproject.toml if exists
        pyproject = os.path.join(ROOT_DIR, "backend", "pyproject.toml")
        if os.path.exists(pyproject):
            zip_file.write(pyproject, arcname=os.path.join("backend", "pyproject.toml"))

        # Add backend/app directory
        for dir_rel in DIRS_TO_ADD:
            full_dir = os.path.join(ROOT_DIR, dir_rel)
            for root, dirs, files in os.walk(full_dir):
                # Skip __pycache__ and venv
                if "__pycache__" in root or "venv" in root:
                    continue
                for file in files:
                    if file.endswith((".pyc", ".pyo")):
                        continue
                    abs_path = os.path.join(root, file)
                    rel_path = os.path.relpath(abs_path, ROOT_DIR)
                    print(f"  + Adding {rel_path}")
                    zip_file.write(abs_path, arcname=rel_path)

    size_kb = os.path.getsize(OUTPUT_ZIP) / 1024
    print(f"\n[OK] Package created successfully: deploy-eb.zip ({size_kb:.1f} KB)")

if __name__ == "__main__":
    create_eb_package()

