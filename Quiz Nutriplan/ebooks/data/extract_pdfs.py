import sys
import io
import os
import json
import re
import PyPDF2

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

SRC_DIR = r"d:\USER\Downloads\Projc_ClaudeCode\Quiz Nutriplan\El-Codigo-Hormonal-Kit-Principal"
OUT_DIR = r"d:\USER\Downloads\Projc_ClaudeCode\Quiz Nutriplan\ebooks\data"

WATERMARK = "Licensed to FC GRUTES"


def clean_text(text):
    lines = text.split('\n')
    cleaned = [l for l in lines if WATERMARK not in l]
    return '\n'.join(cleaned)


def extract_all_text(pdf_path):
    pages_text = []
    with open(pdf_path, 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        num_pages = len(reader.pages)
        print(f"  Pages found: {num_pages}")
        for page in reader.pages:
            text = page.extract_text() or ""
            text = clean_text(text)
            pages_text.append(text)
    return pages_text


def parse_recipe_page(page_text):
    """Parse a single page that contains a recipe in format:
    N. RECIPE NAME
    INGREDIENTES
    ...
    MODO DE PREPARACIÓN
    ...
    Consejo Extra: ...
    """
    text = page_text.strip()
    if not text or len(text) < 30:
        return None

    lines = text.split('\n')

    # Try to match "N. RECIPE NAME" at the start
    first_line = lines[0].strip()
    title_match = re.match(r'^(\d{1,3})\.\s+(.+)', first_line)
    if not title_match:
        return None

    recipe_num = title_match.group(1)
    recipe_name = title_match.group(2).strip()

    # Split text by INGREDIENTES and MODO DE PREPARACIÓN
    ingredientes = []
    preparacion = []
    consejo = ""

    # Find sections
    ing_idx = None
    prep_idx = None
    consejo_idx = None

    for i, line in enumerate(lines):
        s = line.strip().upper()
        if 'INGREDIENTES' in s and ing_idx is None:
            ing_idx = i
        if ('MODO DE PREPARACI' in s or s == 'PREPARACIÓN' or s == 'PREPARACION') and prep_idx is None:
            prep_idx = i
        if ('CONSEJO' in s.upper() or 'CONSEJO EXTRA' in s.upper()) and consejo_idx is None:
            consejo_idx = i

    if ing_idx is not None and prep_idx is not None:
        # Extract ingredients (between INGREDIENTES and MODO DE PREPARACIÓN)
        ing_lines = lines[ing_idx+1:prep_idx]
        ingredientes = [l.strip() for l in ing_lines if l.strip()]

        # Extract preparation (between MODO DE PREPARACIÓN and Consejo/end)
        end_idx = consejo_idx if consejo_idx else len(lines)
        prep_lines = lines[prep_idx+1:end_idx]
        # Clean preparation steps - remove trailing step numbers like "1." "2."
        for pl in prep_lines:
            s = pl.strip()
            if s:
                # Remove trailing step number
                s = re.sub(r'\s*\d+\.\s*$', '', s)
                if s:
                    preparacion.append(s)

        if consejo_idx:
            consejo_lines = lines[consejo_idx:]
            consejo_text = ' '.join(l.strip() for l in consejo_lines if l.strip())
            # Remove "Consejo Extra:" or "Consejo:" prefix
            consejo = re.sub(r'^Consejo\s*(?:Extra)?\s*:\s*', '', consejo_text, flags=re.IGNORECASE).strip()
    elif ing_idx is not None:
        # Only ingredients found, rest is prep
        ing_lines = lines[ing_idx+1:]
        ingredientes = [l.strip() for l in ing_lines if l.strip()]
    else:
        # No clear structure - save as raw content
        content = '\n'.join(lines[1:]).strip()
        return {
            "nombre": f"Receta {recipe_num}: {recipe_name}",
            "ingredientes": [],
            "preparacion": [],
            "contenido_raw": content
        }

    result = {
        "nombre": f"Receta {recipe_num}: {recipe_name}",
        "ingredientes": ingredientes,
        "preparacion": preparacion,
    }
    if consejo:
        result["consejo"] = consejo
    return result


def parse_recipes_page_by_page(pages_text):
    """Parse recipes from PDFs where each page has one recipe (PDFs 04, 05)."""
    recipes = []
    for page_text in pages_text:
        recipe = parse_recipe_page(page_text)
        if recipe:
            recipes.append(recipe)
    return recipes


def parse_recipes_informal(pages_text):
    """Parse recipes from PDFs with informal structure (PDFs 01, 02) - page by page."""
    recipes = []
    current_recipe_name = None
    current_content = []

    for page_idx, page_text in enumerate(pages_text):
        text = page_text.strip()
        if not text:
            continue

        lines = text.split('\n')
        first_line = lines[0].strip() if lines else ""

        if len(text) < 50:
            continue

        is_chapter = any(kw in first_line.lower() for kw in ['capítulo', 'capitulo', 'recetas prácticas', 'índice', 'indice', 'conclusi', 'fibras y nutrici', 'fermentaci'])

        if is_chapter:
            if current_recipe_name and current_content:
                full_content = '\n'.join(current_content)
                ingredientes, preparacion = try_extract_ing_prep(full_content)
                recipes.append(build_recipe_entry(current_recipe_name, ingredientes, preparacion, full_content))
                current_recipe_name = None
                current_content = []
            continue

        # Check if page starts with a recipe title
        if len(first_line) < 80 and first_line and not first_line[0].isdigit():
            if current_recipe_name and current_content:
                full_content = '\n'.join(current_content)
                ingredientes, preparacion = try_extract_ing_prep(full_content)
                recipes.append(build_recipe_entry(current_recipe_name, ingredientes, preparacion, full_content))

            current_recipe_name = first_line
            current_content = lines[1:]
        else:
            current_content.extend(lines)

    if current_recipe_name and current_content:
        full_content = '\n'.join(current_content)
        ingredientes, preparacion = try_extract_ing_prep(full_content)
        recipes.append(build_recipe_entry(current_recipe_name, ingredientes, preparacion, full_content))

    return recipes


def build_recipe_entry(name, ingredientes, preparacion, raw_content):
    entry = {"nombre": name}
    if ingredientes:
        entry["ingredientes"] = ingredientes
    if preparacion:
        entry["preparacion"] = preparacion
    entry["contenido_raw"] = raw_content.strip()
    return entry


def try_extract_ing_prep(text):
    ingredientes = []
    preparacion = []

    ing_match = re.search(
        r'(?:Ingredientes?\s*(?:Simples?)?)\s*[:\n](.*?)(?:Modo de Preparaci[oó]n|Preparaci[oó]n|Elaboraci[oó]n|C[oó]mo (?:hacer|preparar))',
        text, re.DOTALL | re.IGNORECASE
    )
    if ing_match:
        ing_text = ing_match.group(1).strip()
        ingredientes = [l.strip() for l in ing_text.split('\n') if l.strip()]

    prep_match = re.search(
        r'(?:Modo de Preparaci[oó]n|Preparaci[oó]n|Elaboraci[oó]n)\s*[:\n](.*?)(?:Consejo|Tip|Beneficio|$)',
        text, re.DOTALL | re.IGNORECASE
    )
    if prep_match:
        prep_text = prep_match.group(1).strip()
        preparacion = [l.strip() for l in prep_text.split('\n') if l.strip()]

    return ingredientes, preparacion


def parse_recipes_structured_03(pages_text):
    """Parse recipes from PDF 03 (100 Recetas Quema-Grasa) which has mixed formats:
    - Detailed recipes: "Receta N: Title" with full Ingredientes/Modo de Preparación
    - Compact recipe groups: numbered lists with brief descriptions
    """
    full_text = '\n'.join(pages_text)
    recipes = []
    found_nums = set()

    # Split by "Receta N:" pattern (detailed recipes)
    parts = re.split(r'(Receta\s+\d+\s*:\s*[^\n]+)', full_text)

    i = 0
    while i < len(parts):
        header_match = re.match(r'Receta\s+(\d+)\s*:\s*(.+)', parts[i].strip())
        if header_match:
            recipe_num = int(header_match.group(1))
            recipe_name = header_match.group(2).strip()
            body = parts[i + 1] if i + 1 < len(parts) else ""
            i += 2

            ingredientes = []
            preparacion = []

            # Extract Ingredientes
            ing_match = re.search(
                r'Ingredientes\s*:\s*\n(.*?)(?:Modo de Preparaci[oó]n|Preparaci[oó]n)\s*:',
                body, re.DOTALL | re.IGNORECASE
            )
            if ing_match:
                ingredientes = [l.strip() for l in ing_match.group(1).strip().split('\n') if l.strip()]

            # Extract Preparación
            prep_match = re.search(
                r'(?:Modo de Preparaci[oó]n|Preparaci[oó]n)\s*:\s*\n(.*?)(?:Consejo|Tip|Por qu[eé]|Beneficio|Receta\s+\d+|$)',
                body, re.DOTALL | re.IGNORECASE
            )
            if prep_match:
                prep_lines = []
                for l in prep_match.group(1).strip().split('\n'):
                    s = l.strip()
                    if s:
                        s = re.sub(r'\s*\d+\.\s*$', '', s)
                        if s:
                            prep_lines.append(s)
                preparacion = prep_lines

            entry = {"nombre": f"Receta {recipe_num}: {recipe_name}"}
            if ingredientes:
                entry["ingredientes"] = ingredientes
            if preparacion:
                entry["preparacion"] = preparacion
            if not ingredientes and not preparacion:
                entry["contenido_raw"] = body.strip()[:2000]
            recipes.append(entry)
            found_nums.add(recipe_num)
        else:
            i += 1

    # Look for compact grouped recipes (e.g., "6. Batido Proteico de Cacao")
    compact_pattern = re.compile(r'(\d{1,3})\.\s+([A-ZÁÉÍÓÚÑa-záéíóúñ][^\n]{3,60})\n(.*?)(?=\d{1,3}\.\s+[A-ZÁ-Ú]|\Z)', re.DOTALL)
    for m in compact_pattern.finditer(full_text):
        num = int(m.group(1))
        if num not in found_nums and 1 <= num <= 100:
            name = m.group(2).strip()
            body = m.group(3).strip()[:500]
            recipes.append({
                "nombre": f"Receta {num}: {name}",
                "contenido_raw": body
            })
            found_nums.add(num)

    # Sort by recipe number
    def sort_key(r):
        m = re.match(r'Receta\s+(\d+)', r.get('nombre', ''))
        return int(m.group(1)) if m else 999
    recipes.sort(key=sort_key)

    return recipes


def parse_sections(pages_text):
    """Parse non-recipe PDFs into chapters/sections."""
    sections = []
    current_title = ""
    current_content_lines = []

    full_text = '\n'.join(pages_text)
    lines = full_text.split('\n')

    section_pattern = re.compile(
        r'^(?:cap[ií]tulo|secci[oó]n|parte|d[ií]a|paso|m[ií]to|verdad|regla|consejo|tip)\s*\d*',
        re.IGNORECASE
    )

    for line in lines:
        stripped = line.strip()

        if not stripped:
            if current_content_lines and current_content_lines[-1] != "":
                current_content_lines.append("")
            continue

        is_header = False

        if section_pattern.match(stripped):
            is_header = True
        elif len(stripped) < 80 and stripped.upper() == stripped and len(stripped) > 3 and any(c.isalpha() for c in stripped):
            is_header = True
        elif any(marker in stripped.upper() for marker in ['CAPÍTULO', 'CAPITULO', 'SECCIÓN', 'SECCION', 'DÍA ', 'DIA ', 'MITO #', 'MITO#', 'VERDAD #']):
            is_header = True

        if is_header:
            if current_title or current_content_lines:
                content = '\n'.join(current_content_lines).strip()
                if content or current_title:
                    sections.append({"titulo": current_title, "contenido": content})
            current_title = stripped
            current_content_lines = []
        else:
            current_content_lines.append(stripped)

    if current_title or current_content_lines:
        content = '\n'.join(current_content_lines).strip()
        if content or current_title:
            sections.append({"titulo": current_title, "contenido": content})

    if not sections or (len(sections) == 1 and not sections[0]["titulo"]):
        sections = []
        for i, page_text in enumerate(pages_text):
            text = page_text.strip()
            if text:
                sections.append({"titulo": f"Página {i+1}", "contenido": text})

    return sections


# Define the PDFs
pdfs = [
    ("00-Comience-Aqui.pdf", "00-comience-aqui.json", "sections"),
    ("01-Panes-Inteligentes-Sin-Gluten-Vol-1.pdf", "01-panes-vol1.json", "recipes_informal"),
    ("02-Panes-Inteligentes-Sin-Gluten-Vol-2.pdf", "02-panes-vol2.json", "recipes_informal"),
    ("03-100-Recetas-Quema-Grasa.pdf", "03-recetas-quema-grasa.json", "recipes_03"),
    ("04-Recetas-Fitness-Mujeres-Vol-1.pdf", "04-recetas-fitness-vol1.json", "recipes_page"),
    ("05-Recetas-Fitness-Adelgazar-Vol-2.pdf", "05-recetas-fitness-vol2.json", "recipes_page"),
    ("06-Plan-31-Dias-Control-Glucemico.pdf", "06-plan-31-dias.json", "sections"),
    ("07-Guia-Alimentos-Permitidos-y-Prohibidos.pdf", "07-guia-alimentos.json", "sections"),
    ("08-Tabla-Indice-Glucemico.pdf", "08-tabla-indice-glucemico.json", "sections"),
    ("09-Checklist-Anti-Hipoglucemia.pdf", "09-checklist-hipoglucemia.json", "sections"),
    ("10-Mitos-y-Verdades-sobre-la-Insulina.pdf", "10-mitos-verdades-insulina.json", "sections"),
]

results_summary = []

for pdf_name, json_name, doc_type in pdfs:
    pdf_path = os.path.join(SRC_DIR, pdf_name)
    json_path = os.path.join(OUT_DIR, json_name)

    print(f"\n{'='*60}")
    print(f"Processing: {pdf_name}")
    print(f"  Type: {doc_type}")

    if not os.path.exists(pdf_path):
        print(f"  ERROR: File not found!")
        results_summary.append((pdf_name, json_name, "NOT FOUND", 0))
        continue

    try:
        pages_text = extract_all_text(pdf_path)

        if doc_type == "recipes_informal":
            items = parse_recipes_informal(pages_text)
            output = {
                "archivo": pdf_name,
                "tipo": "recetas",
                "total_paginas": len(pages_text),
                "total_recetas": len(items),
                "recetas": items
            }
            count_label = f"{len(items)} recipes"

        elif doc_type == "recipes_03":
            items = parse_recipes_structured_03(pages_text)
            output = {
                "archivo": pdf_name,
                "tipo": "recetas",
                "total_paginas": len(pages_text),
                "total_recetas": len(items),
                "recetas": items
            }
            count_label = f"{len(items)} recipes"

        elif doc_type == "recipes_page":
            items = parse_recipes_page_by_page(pages_text)
            output = {
                "archivo": pdf_name,
                "tipo": "recetas",
                "total_paginas": len(pages_text),
                "total_recetas": len(items),
                "recetas": items
            }
            count_label = f"{len(items)} recipes"

        else:  # sections
            items = parse_sections(pages_text)
            output = {
                "archivo": pdf_name,
                "tipo": "secciones",
                "total_paginas": len(pages_text),
                "total_secciones": len(items),
                "secciones": items
            }
            count_label = f"{len(items)} sections"

        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(output, f, ensure_ascii=False, indent=2)

        print(f"  Extracted: {count_label}")
        print(f"  Saved to: {json_name}")
        results_summary.append((pdf_name, json_name, doc_type, count_label))

    except Exception as e:
        print(f"  ERROR: {e}")
        import traceback
        traceback.print_exc()
        results_summary.append((pdf_name, json_name, "ERROR", str(e)))

print(f"\n{'='*60}")
print("SUMMARY")
print(f"{'='*60}")
for pdf_name, json_name, doc_type, count in results_summary:
    print(f"  {pdf_name}")
    print(f"    -> {json_name} | {count}")
print(f"\nAll files saved to: {OUT_DIR}")
