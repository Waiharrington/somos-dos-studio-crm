import os

replaces = {
    "Dra. Maoly": "Somos Dos Studio",
    "Maoly": "Somos Dos Studio",
    "maoly-crm": "somos-dos-crm",
    "paciente": "cliente",
    "Paciente": "Cliente",
    "tratamiento": "servicio",
    "Tratamiento": "Servicio",
    "Estética": "Estudio",
    "Clínica": "Estudio",
    "clínica": "estudio",
    "Tratamientos": "Servicios",
    "tratamientos": "servicios"
}

root_dir = r"c:\Users\Waiha\.gemini\antigravity\CRM Somos dos"

for root, dirs, files in os.walk(root_dir):
    for name in files:
        if name.endswith(('.ts', '.tsx', '.js', '.jsx', '.css', '.html', '.json', '.md', '.sql')):
            file_path = os.path.join(root, name)
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content = content
                for old, new in replaces.items():
                    new_content = new_content.replace(old, new)
                
                if new_content != content:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Rebranded: {file_path}")
            except Exception as e:
                print(f"Error processing {file_path}: {e}")
