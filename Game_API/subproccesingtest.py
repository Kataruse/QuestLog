import subprocess
try:
    ans = subprocess.check_output(["./Game_API/exe/AlgFinalTestC.exe", "urmom"], text=True)
    print(ans)

except subprocess.CalledProcessError as e:
    print(f"Command failed with return code {e.returncode}")