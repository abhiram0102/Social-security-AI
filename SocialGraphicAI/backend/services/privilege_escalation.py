# backend/services/privilege_escalation.py

import subprocess

def check_sudo_permissions():
    try:
        result = subprocess.run(["sudo", "-l"], capture_output=True, text=True)
        return {"sudo_rights": result.stdout}
    except Exception as e:
        return {"error": str(e)}

def check_kernel_exploits():
    try:
        uname = subprocess.getoutput("uname -r")
        known = ["3.13.0", "4.4.0", "5.8.0"]
        for k in known:
            if k in uname:
                return {"possible_kernel_exploit": True, "kernel": uname}
        return {"possible_kernel_exploit": False, "kernel": uname}
    except Exception as e:
        return {"error": str(e)}
