import os
import sys

def sanitize_env(env_path):
    if not os.path.exists(env_path):
        return
    with open(env_path, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()
    cleaned = []
    for line in lines:
        line = line.strip('\r\n')
        if '=' in line and not line.strip().startswith('#'):
            key, val = line.split('=', 1)
            key = key.strip()
            val = val.strip()
            if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
                val = val[1:-1].strip()
            cleaned.append(f"{key}={val}\n")
        else:
            cleaned.append(f"{line}\n")
    with open(env_path, 'w', encoding='utf-8') as f:
        f.writelines(cleaned)
    print(f"✅ Arquivo {env_path} sanitizado com sucesso (aspas e CRLF removidos).")

if __name__ == '__main__':
    target = sys.argv[1] if len(sys.argv) > 1 else '.env'
    sanitize_env(target)
