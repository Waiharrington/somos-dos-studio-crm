import os

replaces = {
    "bg-Somos Dos Studio-gradient": "bg-brand-primary",
    "text-Somos Dos Studio-primary": "text-brand-primary",
    "shadow-Somos Dos Studio-primary": "shadow-brand-primary/20",
    "border-Somos Dos Studio-primary": "border-brand-primary/20",
    "bg-Somos Dos Studio-gradient-soft": "bg-brand-primary/5",
    "bg-pink-": "bg-brand-primary/", # Rough mapping
    "text-pink-": "text-brand-primary/",
    "border-pink-": "border-brand-primary/",
    "maoly-primary": "brand-primary",
    "maoly-light": "brand-secondary",
    "Dra. Somos Dos Studio": "Somos Dos Studio",
    "expedientes clínicos": "proyectos activos",
    "Ficha": "Proyecto",
    "ficha": "proyecto",
    "Nueva Ficha": "Nuevo Proyecto",
    "Nueva proyecto": "Nuevo Proyecto"
}

root_dir = r"c:\Users\Waiha\.gemini\antigravity\CRM Somos dos\src"

for root, dirs, files in os.walk(root_dir):
    for name in files:
        if name.endswith(('.ts', '.tsx', '.js', '.jsx', '.css', '.html', '.json', '.md')):
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
                    print(f"Fixed: {file_path}")
            except Exception as e:
                print(f"Error processing {file_path}: {e}")
