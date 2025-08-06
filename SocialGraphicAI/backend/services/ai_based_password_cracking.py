# backend/services/ai_based_password_cracking.py

import subprocess

def run_passgan(model_path="passgan/model", output_file="generated_passwords.txt", count=1000):
    try:
        result = subprocess.run(
            ["python3", "passgan/sample.py", "--model", model_path, "--nsamples", str(count)],
            capture_output=True, text=True
        )
        with open(output_file, "w") as f:
            f.write(result.stdout)
        return {"generated": count, "output": output_file}
    except Exception as e:
        return {"error": str(e)}
