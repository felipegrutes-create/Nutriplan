#!/usr/bin/env python3
"""
Extract text from 10 Bono PDFs and save as structured JSON files.
Recipe-type PDFs: parse recipes with nombre/ingredientes/preparacion
Guide-type PDFs: parse sections with titulo/contenido
"""
import sys
import io
import os
import re
import json

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import PyPDF2

BASE_DIR = r"d:/USER/Downloads/Projc_ClaudeCode"
PDF_DIR = os.path.join(BASE_DIR, "Quiz Nutriplan", "El-Codigo-Hormonal-Bonos")
OUT_DIR = os.path.join(BASE_DIR, "Quiz Nutriplan", "ebooks", "data")

os.makedirs(OUT_DIR, exist_ok=True)

WATERMARK = "Licensed to FC GRUTES"


def extract_all_text(pdf_path):
    """Extract text from all pages of a PDF, stripping watermark lines."""
    reader = PyPDF2.PdfReader(pdf_path)
    pages = []
    for i, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        lines = text.split('\n')
        clean_lines = [line for line in lines if WATERMARK not in line]
        text = '\n'.join(clean_lines).strip()
        pages.append(text)
    return pages


def clean_text(text):
    """Clean up extracted text: fix spacing, remove brand tags."""
    text = re.sub(r'BETH_NUTRIX', '', text)
    text = re.sub(r'Beth_nutrix', '', text)
    text = re.sub(r'BethNutrix', '', text)
    text = re.sub(r'B\s*E\s*T\s*H\s*_\s*N\s*U\s*T\s*R\s*I\s*X', '', text)
    text = re.sub(r'B\s+e\s+t\s+h\s+_\s+n\s+u\s+t\s+r\s+i\s+x', '', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


def save_json(data, filename):
    """Save data to JSON file with UTF-8 encoding."""
    path = os.path.join(OUT_DIR, filename)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    return path


def parse_ingredients_list(text):
    """Parse ingredient lines from text block."""
    items = []
    for line in text.strip().split('\n'):
        line = line.strip().lstrip('·•-').strip()
        if line and len(line) > 1:
            items.append(line)
    return items


def parse_preparation_list(text):
    """Parse preparation steps from text block."""
    steps = []
    for line in text.strip().split('\n'):
        line = line.strip()
        if line and len(line) > 1:
            steps.append(line)
    return steps


# ============================================================
# PDF 02: Guia Carnes Inteligentes (11 pages) - RECIPE type
# Pattern: INGREDIENTES + PREPARACION at top, then RECETA N: name at bottom
# Some pages are just benefits continuation (no INGREDIENTES)
# ============================================================
def process_02_carnes():
    pdf_path = os.path.join(PDF_DIR, "02-Guia-Carnes-Inteligentes.pdf")
    pages = extract_all_text(pdf_path)

    data = {
        "titulo": "Carne Inteligente: Como Consumir Proteina Animal para Regular tu Glucosa",
        "tipo": "recetas",
        "introduccion": clean_text(pages[2]) if len(pages) > 2 else "",
        "contenido_educativo": [],
        "recetas": []
    }

    if len(pages) > 3:
        data["contenido_educativo"].append({
            "titulo": "Frecuencia Recomendada",
            "contenido": clean_text(pages[3])
        })

    # Process page by page for recipes (pages 4-9)
    seen_nums = set()
    for page_idx in range(4, min(10, len(pages))):
        text = clean_text(pages[page_idx])
        if not text:
            continue

        # Check if this page has INGREDIENTES (it's a primary recipe page)
        has_ingredients = bool(re.search(r'INGREDIENTES', text))
        if not has_ingredients:
            continue  # This is just a benefits/continuation page

        # Extract recipe name from RECETA N: ... (multiline, at bottom of page)
        name_match = re.search(r'RECETA\s*\d+\s*[:.]\s*(.*?)$', text, re.DOTALL)
        nombre = ""
        if name_match:
            raw_name = name_match.group(1).strip()
            # The name lines - take non-empty lines, stop at any junk
            name_lines = []
            for line in raw_name.split('\n'):
                line = line.strip()
                if not line:
                    continue
                name_lines.append(line)
            nombre = ' '.join(name_lines)
            nombre = re.sub(r'\s+', ' ', nombre).strip()

        # Extract recipe number to deduplicate
        num_match = re.search(r'RECETA\s*(\d+)', text)
        recipe_num = num_match.group(1) if num_match else str(page_idx)
        if recipe_num in seen_nums:
            continue
        seen_nums.add(recipe_num)

        # Extract ingredients
        ing_match = re.search(r'INGREDIENTES\s*:?\s*\n(.*?)(?:PREPARACION|PREPARACIÓN)', text, re.DOTALL)
        ingredientes = parse_ingredients_list(ing_match.group(1)) if ing_match else []

        # Extract preparation (stop before RECETA name marker or emoji markers)
        prep_match = re.search(r'PREPARACION\s*:?\s*\n(.*?)(?:🍽|RECETA|$)', text, re.DOTALL)
        preparacion = parse_preparation_list(prep_match.group(1)) if prep_match else []

        if nombre:
            # Fix duplicate word prefixes like "Salteado de Salteado de calabacín"
            nombre = re.sub(r'^(.{5,30})\s+\1', r'\1', nombre)
            data["recetas"].append({"nombre": nombre, "ingredientes": ingredientes, "preparacion": preparacion})

    if len(pages) > 10:
        data["contenido_educativo"].append({
            "titulo": "Logros con estas recetas",
            "contenido": clean_text(pages[10])
        })

    path = save_json(data, "bonos-carnes.json")
    print(f"  02 Carnes: {len(data['recetas'])} recetas, {len(data['contenido_educativo'])} secciones -> {path}")


# ============================================================
# PDF 03: Recetas con Avena (15 pages) - RECIPE type
# Pattern: INGREDIENTES + PREPARACION at top, then RECETA N: name at bottom
# Some pages just repeat the name with a tip (no INGREDIENTES)
# Pages: 0=cover, 1-4=intro/educational, 5=tip,
#   6=R1 content, 7=R1 tip, 8=R2, 9=R3, 10=R3 tip,
#   11=R4, 12=R4 tip, 13=R5, 14=R5 tip, 15=R6
# ============================================================
def process_03_avena():
    pdf_path = os.path.join(PDF_DIR, "03-Recetas-con-Avena.pdf")
    pages = extract_all_text(pdf_path)

    data = {
        "titulo": "Avena Inteligente: Recetas Saludables para Diabeticos que Regulan tu Azucar",
        "tipo": "recetas",
        "introduccion": '\n\n'.join([clean_text(pages[i]) for i in range(1, min(6, len(pages)))]),
        "recetas": []
    }

    # Process page by page for recipes (pages 5+)
    seen_nums = set()
    for page_idx in range(5, len(pages)):
        text = clean_text(pages[page_idx])
        if not text:
            continue

        # Check if this page has INGREDIENTES (primary recipe page)
        has_ingredients = bool(re.search(r'INGREDIENTES', text, re.IGNORECASE))
        if not has_ingredients:
            continue  # Just a tip/continuation page

        # Extract recipe number
        num_match = re.search(r'RECETA\s*(\d+)', text)
        if not num_match:
            continue
        recipe_num = num_match.group(1)
        if recipe_num in seen_nums:
            continue
        seen_nums.add(recipe_num)

        # Extract recipe name - may appear before or after ingredients
        # Pattern A (recipes 1-3): INGREDIENTES...PREPARACION...RECETA N: Name (name at bottom)
        # Pattern B (recipes 4-6): RECETA N: Name\nINGREDIENTES...PREPARACION... (name at top)
        receta_pos = text.find('RECETA')
        ing_pos = re.search(r'INGREDIENTES', text, re.IGNORECASE)
        ing_pos = ing_pos.start() if ing_pos else len(text)

        if receta_pos < ing_pos:
            # Pattern B: name is between RECETA marker and INGREDIENTES
            name_match = re.search(r'RECETA\s*\d+[.:]\s*(.*?)(?:📝\s*)?(?:INGREDIENTES)', text, re.DOTALL | re.IGNORECASE)
        else:
            # Pattern A: name is after RECETA marker at bottom of page
            name_match = re.search(r'RECETA\s*\d+[.:]\s*(.*?)$', text, re.DOTALL)

        nombre = ""
        if name_match:
            raw_name = name_match.group(1).strip()
            # Remove anything that's not part of the name
            raw_name = re.sub(r'(?:🟢|💡|Ideal|Perfectos|Rica en|Alta en|INGREDIENTES|PREPARACION|📝).*', '', raw_name, flags=re.DOTALL).strip()
            name_lines = [l.strip() for l in raw_name.split('\n') if l.strip()]
            nombre = ' '.join(name_lines)
            nombre = re.sub(r'\s+', ' ', nombre).strip()

        # Extract ingredients
        ing_match = re.search(r'(?:📝\s*)?INGREDIENTES\s*:?\s*\n(.*?)(?:🍽\s*)?PREPARACION', text, re.DOTALL | re.IGNORECASE)
        ingredientes = parse_ingredients_list(ing_match.group(1)) if ing_match else []

        # Extract preparation - stop before RECETA marker or emoji recipe markers
        prep_match = re.search(r'PREPARACION\s*:?\s*\n(.*?)(?:🥄|🧁|🍓|🥣|🥗|RECETA|$)', text, re.DOTALL | re.IGNORECASE)
        preparacion = parse_preparation_list(prep_match.group(1)) if prep_match else []

        if nombre:
            data["recetas"].append({"nombre": nombre, "ingredientes": ingredientes, "preparacion": preparacion})

    path = save_json(data, "bonos-avena.json")
    print(f"  03 Avena: {len(data['recetas'])} recetas -> {path}")


# ============================================================
# PDF 04: Recetario Navideno Saludable (24 pages) - RECIPE type
# Pages: 0-1=cover/blank, 2-4=Hallaca de Pollo, 5=tips,
#         6-7=Hallaca Keto Garbanzos, 8-10=Pan de Jamon Keto,
#         11-12=Ponche de Huevo Keto, 13-14=Ensalada Cetogenica,
#         15-16=Galletas Navidenas Keto, 17-19=Pollo Relleno,
#         20-21=Pollo Glaseado, 22-23=Torta de Manzana, 24=conclusion
# ============================================================
def process_04_navidad():
    pdf_path = os.path.join(PDF_DIR, "04-Recetario-Navideno-Saludable.pdf")
    pages = extract_all_text(pdf_path)

    data = {
        "titulo": "Recetario Navideno Saludable para Diabeticos",
        "tipo": "recetas",
        "introduccion": "",
        "recetas": []
    }

    # Define recipes by page ranges (0-indexed, mapped from page content inspection)
    recipe_defs = [
        {"pages": (2, 5), "nombre": "Hallaca de Pollo Saludable (Sin Harina)"},
        {"pages": (5, 7), "nombre": "Hallaca Keto de Garbanzos"},
        {"pages": (7, 10), "nombre": "Pan de Jamon Keto"},
        {"pages": (10, 12), "nombre": "Ponche de Huevo Keto (Eggnog Saludable)"},
        {"pages": (12, 14), "nombre": "Ensalada Cetogenica de Pollo"},
        {"pages": (14, 16), "nombre": "Galletas Navidenas Keto"},
        {"pages": (16, 19), "nombre": "Pollo Relleno Navideno con Brocoli"},
        {"pages": (19, 21), "nombre": "Pollo Glaseado Navideno Keto y Saludable"},
        {"pages": (21, 23), "nombre": "Torta de Manzana Saludable"},
    ]

    for rdef in recipe_defs:
        start, end = rdef["pages"]
        if start >= len(pages):
            continue
        end = min(end, len(pages))
        recipe_text = '\n\n'.join([clean_text(pages[i]) for i in range(start, end)])

        # Extract ingredients (note: "IIngredientes" typo in PDF;
        # "Modo de p reparación" has spaced text from PDF extraction)
        ing_match = re.search(
            r'(?:I?I?ngredientes|INGREDIENTES)[^\n]*\n(.*?)(?:Modo de\s*p?\s*reparac|PREPARACION|Preparación|Preparacion|Modo de Preparac)',
            recipe_text, re.DOTALL | re.IGNORECASE
        )
        ingredientes = []
        if ing_match:
            ingredientes = parse_ingredients_list(ing_match.group(1))
            # Remove sub-headers like "Para la masa:", "Para el relleno:" but keep them as context
            cleaned = []
            for item in ingredientes:
                item = item.strip()
                if item and not re.match(r'^(?:Ingredientes|INGREDIENTES)', item, re.IGNORECASE):
                    cleaned.append(item)
            ingredientes = cleaned

        # Extract preparation (handle spaced "p reparación" from PDF extraction)
        prep_match = re.search(
            r'(?:Modo de\s*p?\s*reparac|PREPARACION|Preparación|Preparacion)[^\n]*\n(.*?)(?:Tip[s\s]|Tips para|💡|$)',
            recipe_text, re.DOTALL | re.IGNORECASE
        )
        preparacion = []
        if prep_match:
            preparacion = parse_preparation_list(prep_match.group(1))

        data["recetas"].append({
            "nombre": rdef["nombre"],
            "ingredientes": ingredientes,
            "preparacion": preparacion
        })

    # Last page = conclusion
    if len(pages) > 23:
        data["introduccion"] = clean_text(pages[23])

    path = save_json(data, "bonos-navidad.json")
    print(f"  04 Navidad: {len(data['recetas'])} recetas -> {path}")


# ============================================================
# PDF 05: Jugos Verdes Detox (18 pages) - RECIPE type
# Pages: 0=cover, 1=index, 2=intro, 3-4=why/principles,
#         5-6=ingredients/avoid, 7-8=tools/techniques,
#         9=recipe header, 10=Magnesio, 11=Clasico, 12=Nopal,
#         13=Detox, 14=Refrescante, 15=Estimulante,
#         16=Consejos, 17=Conclusion
# ============================================================
def process_05_jugos():
    pdf_path = os.path.join(PDF_DIR, "05-Jugos-Verdes-Detox.pdf")
    pages = extract_all_text(pdf_path)

    data = {
        "titulo": "Jugos Verdes para Diabeticos: El Metodo Natural para Sanar desde la Cocina",
        "tipo": "recetas",
        "introduccion": "",
        "contenido_educativo": [],
        "recetas": []
    }

    # Intro = pages 2-9
    data["introduccion"] = clean_text(pages[2]) if len(pages) > 2 else ""

    # Educational content: pages 3-9
    edu_titles = [
        "Por que Jugos Verdes para Diabeticos",
        "Principios de un Jugo Verde Apto para Diabeticos",
        "Ingredientes Ideales y sus Beneficios",
        "Ingredientes que se deben Evitar",
        "Herramientas Necesarias",
        "Tecnicas Basicas para Preparar tus Jugos",
    ]
    for idx, title in enumerate(edu_titles):
        page_idx = 3 + idx
        if page_idx < len(pages):
            data["contenido_educativo"].append({
                "titulo": title,
                "contenido": clean_text(pages[page_idx])
            })

    # Recipes: pages 10-15 (one recipe per page, name at bottom of page)
    recipe_page_defs = [
        (10, "Jugo Verde Magnesio"),
        (11, "Jugo Verde Clasico Antidiabetico"),
        (12, "Verde con Nopal y Canela"),
        (13, "Detox Verde Alcalinizante"),
        (14, "Refrescante de Clorofila"),
        (15, "Estimulante Digestivo"),
    ]

    for page_idx, nombre in recipe_page_defs:
        if page_idx >= len(pages):
            continue
        text = clean_text(pages[page_idx])

        ing_match = re.search(
            r'(?:Ingredientes|Ingred\s*ientes)\s*:?\s*\n(.*?)(?:Preparación|Preparacion)',
            text, re.DOTALL | re.IGNORECASE
        )
        ingredientes = parse_ingredients_list(ing_match.group(1)) if ing_match else []

        prep_match = re.search(
            r'(?:Preparación|Preparacion)\s*:?\s*\n(.*?)(?:NOTA|Puedes|Ideal|Sirve|🌵|🧄|🍋|🌿|$)',
            text, re.DOTALL | re.IGNORECASE
        )
        if not prep_match:
            prep_match = re.search(
                r'(?:Preparación|Preparacion)\s*:?\s*\n(.*?)$',
                text, re.DOTALL | re.IGNORECASE
            )
        preparacion = []
        if prep_match:
            # Get all lines, filter out the recipe name line at the end
            raw_prep = prep_match.group(1).strip()
            for line in raw_prep.split('\n'):
                line = line.strip()
                # Skip lines that are recipe name markers at bottom
                if re.match(r'^(?:🌵|🧄|🍋|🌿|🥤)\s*\d+\.', line):
                    continue
                if re.match(r'^\d+\.\s*Jugo|^\d+\.\s*Verde|^\d+\.\s*Detox|^\d+\.\s*Refrescante|^\d+\.\s*Estimulante', line):
                    continue
                if 'Jugo verde' in line and len(line) < 50:
                    continue
                if line:
                    preparacion.append(line)

        data["recetas"].append({
            "nombre": nombre,
            "ingredientes": ingredientes,
            "preparacion": preparacion
        })

    # Consejos and conclusion
    if len(pages) > 16:
        data["contenido_educativo"].append({
            "titulo": "Consejos Adicionales",
            "contenido": clean_text(pages[16])
        })
    if len(pages) > 17:
        data["contenido_educativo"].append({
            "titulo": "Conclusion",
            "contenido": clean_text(pages[17])
        })

    path = save_json(data, "bonos-jugos.json")
    print(f"  05 Jugos: {len(data['recetas'])} recetas, {len(data['contenido_educativo'])} secciones -> {path}")


# ============================================================
# PDF 06: Guia de Frutas Inteligentes (14 pages) - GUIDE type
# Pages: 0=cover, 1=index, 2=intro, 3=can diabetics eat fruit,
#         4=principles, 5-6=10 recommended fruits, 7=how to consume,
#         8-9=fruits to avoid, 10=practical ways, 11=myths,
#         12=expert advice, 13=conclusion
# ============================================================
def process_06_frutas():
    pdf_path = os.path.join(PDF_DIR, "06-Guia-de-Frutas-Inteligentes.pdf")
    pages = extract_all_text(pdf_path)

    data = {
        "titulo": "Frutas que Sanan: Guia Esencial de Frutas Aptas para Diabeticos",
        "tipo": "guia-frutas",
        "secciones": []
    }

    section_defs = [
        (1, "Indice"),
        (2, "Introduccion"),
        (3, "Pueden los Diabeticos Comer Fruta"),
        (4, "Principios para Elegir Frutas Aptas"),
        (5, "Las 10 Frutas Mas Recomendadas para Diabeticos (parte 1)"),
        (6, "Las 10 Frutas Mas Recomendadas para Diabeticos (parte 2)"),
        (7, "Como Consumir Frutas sin Elevar el Azucar en Sangre"),
        (8, "Frutas que Debes Evitar o Consumir con Precaucion (parte 1)"),
        (9, "Frutas que Debes Evitar o Consumir con Precaucion (parte 2)"),
        (10, "Formas Practicas de Incluir Frutas en tu Dieta"),
        (11, "Mitos Comunes sobre Frutas y Diabetes"),
        (12, "Consejos del Experto: Sanar con Frutas Reales"),
        (13, "Conclusion: Equilibrio, No Restriccion"),
    ]

    for page_idx, titulo in section_defs:
        if page_idx < len(pages):
            text = clean_text(pages[page_idx])
            if text:
                data["secciones"].append({
                    "titulo": titulo,
                    "contenido": text
                })

    path = save_json(data, "bonos-frutas.json")
    print(f"  06 Frutas: {len(data['secciones'])} secciones -> {path}")


# ============================================================
# PDF 07: Bebidas para Controlar la Glucosa (12 pages) - RECIPE type
# Pages: 0=cover, 1=index, 2=intro, 3-5=how they work/recommendations,
#         6=recomendaciones, 7-11=recipes, 12=conclusion
# ============================================================
def process_07_bebidas():
    pdf_path = os.path.join(PDF_DIR, "07-Bebidas-para-Controlar-la-Glucosa.pdf")
    pages = extract_all_text(pdf_path)

    data = {
        "titulo": "7 Bebidas Naturales para Controlar tu Glucosa: Guia Practica para Diabeticos",
        "tipo": "recetas",
        "introduccion": clean_text(pages[2]) if len(pages) > 2 else "",
        "contenido_educativo": [],
        "recetas": []
    }

    # Educational content
    for i in range(3, min(7, len(pages))):
        text = clean_text(pages[i])
        if text:
            lines = text.split('\n')
            title = ""
            for line in lines:
                line = line.strip()
                if line and len(line) > 5:
                    title = re.sub(r'^[📝✅💡⚠🟢\s]+', '', line).strip()
                    break
            data["contenido_educativo"].append({"titulo": title, "contenido": text})

    # Recipes: pages 6-11, one per page
    recipe_page_defs = [
        (6, "Te de Cascara de Pina con Canela y Clavos"),
        (7, "Infusion de Hojas de Guayaba, Canela y Jengibre"),
        (8, "Te de Manzanilla con Curcuma"),
        (9, "Te de Laurel con Limon y Canela"),
        (10, "Te de Linaza con Limon y Canela"),
    ]

    for page_idx, nombre in recipe_page_defs:
        if page_idx >= len(pages):
            continue
        text = clean_text(pages[page_idx])

        ing_match = re.search(
            r'(?:INGREDIENTES|Ingredientes)\s*:?\s*\n(.*?)(?:PREPARACION|Preparación|Preparacion|👩)',
            text, re.DOTALL | re.IGNORECASE
        )
        ingredientes = parse_ingredients_list(ing_match.group(1)) if ing_match else []

        prep_match = re.search(
            r'(?:PREPARACION|Preparación|Preparacion|👩‍🍳\s*PREPARACION)\s*:*\s*\n(.*?)(?:Cómo tomarlo|💡|Recomendación|🟢|$)',
            text, re.DOTALL | re.IGNORECASE
        )
        preparacion = parse_preparation_list(prep_match.group(1)) if prep_match else []

        beneficio_match = re.search(r'(?:🟢\s*)?BENEFICIO\s*:?\s*\n?(.*?)$', text, re.DOTALL | re.IGNORECASE)
        beneficio = beneficio_match.group(1).strip() if beneficio_match else ""

        recipe = {"nombre": nombre, "ingredientes": ingredientes, "preparacion": preparacion}
        if beneficio:
            recipe["beneficio"] = beneficio
        data["recetas"].append(recipe)

    # Conclusion
    if len(pages) > 11:
        data["contenido_educativo"].append({
            "titulo": "Conclusiones Finales",
            "contenido": clean_text(pages[11])
        })

    path = save_json(data, "bonos-bebidas.json")
    print(f"  07 Bebidas: {len(data['recetas'])} recetas, {len(data['contenido_educativo'])} secciones -> {path}")


# ============================================================
# PDF 08: Guia Masa Muscular y Metabolismo (35 pages) - GUIDE type
# ============================================================
def process_08_masa_muscular():
    pdf_path = os.path.join(PDF_DIR, "08-Guia-Masa-Muscular-y-Metabolismo.pdf")
    pages = extract_all_text(pdf_path)

    data = {
        "titulo": "Guia de Masa Muscular y Metabolismo para Diabeticos",
        "tipo": "guia",
        "secciones": []
    }

    current_section = None
    for i, page in enumerate(pages):
        text = clean_text(page)
        if not text or len(text) < 10:
            continue

        lines = text.split('\n')
        first_meaningful = ""
        for line in lines:
            line = line.strip()
            if line and len(line) > 3:
                first_meaningful = line
                break

        is_new_section = (
            i == 0 or
            (first_meaningful and len(first_meaningful) > 5 and len(first_meaningful) < 120 and
             (first_meaningful.isupper() or
              re.match(r'^(?:POR QUÉ|PRINCIPIOS|RECETAS|BATIDOS|EJERCICIOS|CONSEJOS|TABLA|PLAN|RUTINA|MENÚ|SEMANA|DÍA|CONCLUS)', first_meaningful, re.IGNORECASE)))
        )

        if is_new_section and first_meaningful:
            if current_section and current_section["contenido"]:
                data["secciones"].append(current_section)
            title = re.sub(r'^[🔹📌✅💡⚠🟢1⃣2⃣3⃣4⃣5⃣\s]+', '', first_meaningful).strip()
            current_section = {"titulo": title, "contenido": text}
        else:
            if current_section:
                current_section["contenido"] += '\n\n' + text
            else:
                current_section = {"titulo": first_meaningful[:80], "contenido": text}

    if current_section and current_section["contenido"]:
        data["secciones"].append(current_section)

    path = save_json(data, "bonos-masa-muscular.json")
    print(f"  08 Masa Muscular: {len(data['secciones'])} secciones -> {path}")


# ============================================================
# PDF 09: Control Emociones y Estres (21 pages) - GUIDE type
# ============================================================
def process_09_emociones():
    pdf_path = os.path.join(PDF_DIR, "09-Control-Emociones-y-Estres.pdf")
    pages = extract_all_text(pdf_path)

    data = {
        "titulo": "Control de las Emociones y el Estres para Diabeticos",
        "tipo": "guia",
        "secciones": []
    }

    current_section = None
    for i, page in enumerate(pages):
        text = clean_text(page)
        if not text or len(text) < 10:
            continue

        lines = text.split('\n')
        first_meaningful = ""
        for line in lines:
            line = line.strip()
            if line and len(line) > 3:
                first_meaningful = line
                break

        is_new_section = bool(re.search(
            r'SECCION|SECCIÓN|INTRODUCCION|INTRODUCCIÓN|IDENTIFICACION|TECNICAS|RELACION|CONSTRUYENDO|CONCLUSION|INDICE',
            text[:300], re.IGNORECASE
        ))
        if not is_new_section and first_meaningful:
            is_new_section = first_meaningful.isupper() and 10 < len(first_meaningful) < 100

        if is_new_section:
            if current_section and current_section["contenido"]:
                data["secciones"].append(current_section)
            title = re.sub(r'^[📑🗂\s]+', '', first_meaningful).strip()
            title = re.sub(r'^SECCION\s*\d+\s*:?\s*', '', title, flags=re.IGNORECASE)
            current_section = {"titulo": title, "contenido": text}
        else:
            if current_section:
                current_section["contenido"] += '\n\n' + text
            else:
                current_section = {"titulo": first_meaningful[:80], "contenido": text}

    if current_section and current_section["contenido"]:
        data["secciones"].append(current_section)

    path = save_json(data, "bonos-emociones.json")
    print(f"  09 Emociones: {len(data['secciones'])} secciones -> {path}")


# ============================================================
# PDF 10: Plan Ejercicios Semanal (18 pages) - GUIDE type
# ============================================================
def process_10_ejercicios():
    pdf_path = os.path.join(PDF_DIR, "10-Plan-Ejercicios-Semanal.pdf")
    pages = extract_all_text(pdf_path)

    data = {
        "titulo": "Plan de Ejercicios Semanal para Diabeticos: Recupera tu Energia y Vitalidad",
        "tipo": "guia",
        "secciones": []
    }

    current_section = None
    for i, page in enumerate(pages):
        text = clean_text(page)
        if not text or len(text) < 10:
            continue

        lines = text.split('\n')
        first_meaningful = ""
        for line in lines:
            line = line.strip()
            if line and len(line) > 3:
                first_meaningful = line
                break

        is_new_section = bool(re.search(
            r'SECCION|SECCIÓN|INTRODUCCION|INTRODUCCIÓN|PLAN DE EJERCICIO|RECOMENDACION|CONCLUSION|DÍA\s*\d|LUNES|MARTES|MIÉRCOLES|JUEVES|VIERNES|SÁBADO|DOMINGO|SEMANA|INDICE',
            text[:300], re.IGNORECASE
        ))
        if not is_new_section and first_meaningful:
            is_new_section = (
                (first_meaningful.isupper() or re.match(r'^I\s*N\s*T\s*R\s*O', first_meaningful))
                and 8 < len(first_meaningful) < 120
            )

        if is_new_section:
            if current_section and current_section["contenido"]:
                data["secciones"].append(current_section)
            title = re.sub(r'^[📑🗂\s]+', '', first_meaningful).strip()
            title = re.sub(r'^SECCION\s*\d+\s*:?\s*', '', title, flags=re.IGNORECASE)
            if re.match(r'^[A-ZÁÉÍÓÚÑ]\s+[A-ZÁÉÍÓÚÑ]\s+', title):
                title = re.sub(r'\s+', '', title)
            current_section = {"titulo": title, "contenido": text}
        else:
            if current_section:
                current_section["contenido"] += '\n\n' + text
            else:
                current_section = {"titulo": first_meaningful[:80], "contenido": text}

    if current_section and current_section["contenido"]:
        data["secciones"].append(current_section)

    path = save_json(data, "bonos-ejercicios.json")
    print(f"  10 Ejercicios: {len(data['secciones'])} secciones -> {path}")


# ============================================================
# PDF 11: Guia de Desparasitacion (22 pages) - GUIDE type
# ============================================================
def process_11_desparasitacion():
    pdf_path = os.path.join(PDF_DIR, "11-Guia-de-Desparasitacion.pdf")
    pages = extract_all_text(pdf_path)

    data = {
        "titulo": "Desintoxica tu Cuerpo, Recupera tu Energia: Guia para Eliminar Metales Pesados, Parasitos y Candida",
        "tipo": "guia",
        "secciones": []
    }

    current_section = None
    for i, page in enumerate(pages):
        text = clean_text(page)
        if not text or len(text) < 10:
            continue

        lines = text.split('\n')
        first_meaningful = ""
        for line in lines:
            line = line.strip()
            if line and len(line) > 3:
                first_meaningful = line
                break

        is_new_section = bool(re.search(
            r'SECCION|SECCIÓN|INTRODUCCION|INTRODUCCIÓN|IDENTIFICACION|ALIMENTOS|PLAN DE DESINTOX|CONSIDERACION|CONCLUSION|INDICE|ÍNDICE',
            text[:300], re.IGNORECASE
        ))
        if not is_new_section and first_meaningful:
            is_new_section = first_meaningful.isupper() and 10 < len(first_meaningful) < 120

        if is_new_section:
            if current_section and current_section["contenido"]:
                data["secciones"].append(current_section)
            title = re.sub(r'^[📑🗂\s]+', '', first_meaningful).strip()
            title = re.sub(r'^SEC\s*C\s*IO\s*N\s*\d+\s*:?\s*', '', title, flags=re.IGNORECASE)
            if re.match(r'^[A-ZÁÉÍÓÚÑ]\s+[A-ZÁÉÍÓÚÑ]\s+', title):
                title = re.sub(r'(?<=\S)\s+(?=\S)', '', title)
            current_section = {"titulo": title, "contenido": text}
        else:
            if current_section:
                current_section["contenido"] += '\n\n' + text
            else:
                current_section = {"titulo": first_meaningful[:80], "contenido": text}

    if current_section and current_section["contenido"]:
        data["secciones"].append(current_section)

    path = save_json(data, "bonos-desparasitacion.json")
    print(f"  11 Desparasitacion: {len(data['secciones'])} secciones -> {path}")


# ============================================================
# MAIN
# ============================================================
if __name__ == '__main__':
    print("=" * 60)
    print("Extracting text from 10 Bono PDFs...")
    print("=" * 60)

    process_02_carnes()
    process_03_avena()
    process_04_navidad()
    process_05_jugos()
    process_06_frutas()
    process_07_bebidas()
    process_08_masa_muscular()
    process_09_emociones()
    process_10_ejercicios()
    process_11_desparasitacion()

    print("\n" + "=" * 60)
    print("All done! JSON files saved to:")
    print(f"  {OUT_DIR}")
    print("=" * 60)
