#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Extract recipes from +200 RECETAS PARA DIABETES PDF and save as structured JSON.

Strategy: Use monotonically increasing recipe numbers as the primary boundary detector.
The PDF has recipes numbered 1-201 (with some gaps), plus 2 unnumbered recipes.
We only accept a line as a new recipe title if its number is strictly greater than
the previous recipe number (preventing numbered steps/ingredients from being treated as titles).
"""

import sys
import io
import re
import json

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

import PyPDF2

PDF_PATH = r"d:\USER\Downloads\Projc_ClaudeCode\Quiz Nutriplan\Receitas Espanhol_modelar\+200+RECETAS+PARA+DIABETES.pdf"
OUTPUT_PATH = r"d:\USER\Downloads\Projc_ClaudeCode\Quiz Nutriplan\mi-codigo-app\data\recetas.json"

WATERMARK = "Licensed to FC GRUTES SERVICOS LTDA"

# Category page boundaries (1-indexed, inclusive)
CATEGORY_PAGE_RANGES = [
    ("desayuno", 19, 64),
    ("almuerzo", 66, 115),
    ("cena", 117, 178),
    ("snack", 180, 199),
    ("jugo", 201, 235),
    ("cena", 236, 250),  # extra recipes at end, dinner type
]

# Page labels to strip
LABEL_KEYWORDS = [
    'ENSALADAS', 'PLATOS DE POLLO', 'EMPANADAS', 'BOWLS', 'SMOOTHIES',
    'SNACKS', 'JUGOS', 'MUFFINS DE BROCOLI', 'MUFFINS', 'SIN GLUTEN',
    'BATIDOS', 'HUEVOS', 'YOGUR', 'TOSTADA', 'RECETAS CREATIVAS',
    'RECETAS', 'CREATIVAS', 'PLATOS', 'PAN DE CALABAZA', 'CON CURCUM A',
    'ESPAGUETTIS', 'ESPAGUETIS', 'SOPAS', 'CREMAS', 'IMPORTANTE',
    'PLATOS DE CARNE', 'PLATOS DE PESCADO', 'PESCADO Y M ARISCOS',
    'PESCADO Y MARISCOS', 'EXCLUSIVO', 'PARA DIABETICOS',
    'RECETAS PARA SUSTITUIR LA PASTA', 'COMIDA MEXICANA',
    'ESPAGUETTI', 'CONSEJOS ADICIONALES', 'PLATOS DE POLLO',
    'SALMON', 'RECETAS RAPIDAS', 'POLLO', 'CARNE', 'PESCADO',
    'BOWLS SALUDABLES', 'BOWL', 'GRANOLA',
]


def remove_emojis(text):
    return re.compile(
        "[\U0001F300-\U0001F9FF\U00002702-\U000027B0\U0000FE00-\U0000FE0F"
        "\U0000200D\U00002640-\U00002642\U0000200B-\U0000200F\U00002705"
        "\U0001FA00-\U0001FAFF]+", flags=re.UNICODE
    ).sub('', text)


def clean_line(line):
    line = remove_emojis(line)
    line = re.sub(r'[ \t]+', ' ', line)
    line = line.strip()
    # Remove trailing page labels stuck to text (e.g., "fibra.TOSTADA" -> "fibra.")
    for kw in LABEL_KEYWORDS:
        if line.endswith(kw) and len(line) > len(kw):
            prefix = line[:-len(kw)]
            if prefix and (prefix[-1] in '.,:;!?)' or prefix[-1].islower()):
                line = prefix.strip()
    return line.strip()


def is_page_label(line):
    """Check if a line is a decorative page label (not recipe content)."""
    s = re.sub(r'\s+', ' ', line.strip()).upper()
    if not s:
        return False
    for kw in LABEL_KEYWORDS:
        if s == kw:
            return True
    if re.match(r'^[A-ZÁÉÍÓÚÑÜ\s]+$', s) and len(s) < 50:
        for kw in LABEL_KEYWORDS:
            if s == kw or s.startswith(kw + ' ') or s.endswith(' ' + kw):
                return True
    return False


def is_non_recipe_page(text):
    tl = text.lower()
    checks = [
        ('desayunos saludables', 'recetas paso a paso'),
        ('almuerzos nutritivos', 'ideas creativas'),
        ('cenas ligeras', 'opciones deliciosas'),
        ('snacks inteligentes', 'combate los antojos'),
        ('jugos saludables', 'bebidas saludables'),
        ('consejos adicionales', 'varía tus'),
    ]
    for phrases in checks:
        if all(p in tl for p in phrases):
            return True
    if 'importante' in tl and 'dispara la glucosa' in tl:
        return True
    if 'recetas para sustituir la pasta' in tl and len(text.strip()) < 100:
        return True
    if 'consejos practicos' in tl or 'consejos prácticos' in tl:
        return True
    if len(text.strip()) < 80 and ('inspiradas en' in tl or 'ligeras y nutritivas' in tl):
        return True
    # Page 42 has the unnumbered "Pan de Calabaza" recipe - handled separately
    if 'pan de calabaza' in tl and 'curcum' in tl:
        return True
    return False


def get_category(page_num):
    for cat, start, end in CATEGORY_PAGE_RANGES:
        if start <= page_num <= end:
            return cat
    return None


def extract_all_text(reader):
    """Extract cleaned text from all recipe pages, as list of (page_num, line)."""
    segments = []
    for i in range(19, min(250, len(reader.pages))):
        raw = reader.pages[i].extract_text()
        if not raw:
            continue
        page_num = i + 1

        # Check non-recipe page using RAW text (before label stripping removes keywords)
        raw_no_watermark = '\n'.join(l for l in raw.split('\n') if WATERMARK not in l)
        if is_non_recipe_page(raw_no_watermark):
            continue

        for line in raw.split('\n'):
            if WATERMARK in line:
                continue
            cl = clean_line(line)
            if not cl:
                continue
            if is_page_label(cl):
                continue
            segments.append((page_num, cl))

    return segments


def find_recipe_boundaries(segments):
    """Find recipe title lines using monotonically increasing numbers."""
    title_pattern = re.compile(r'^(\d{1,3})\.\s+(.+)')

    recipes = []
    last_recipe_num = 0

    for idx, (page_num, line) in enumerate(segments):
        m = title_pattern.match(line)
        if m:
            num = int(m.group(1))
            title_text = m.group(2).strip()

            if num > last_recipe_num:
                if re.search(r'[a-záéíóúñüA-ZÁÉÍÓÚÑÜ]', title_text):
                    tl = title_text.lower()
                    if tl.startswith('ingredientes') or tl.startswith('preparaci'):
                        continue

                    recipes.append({
                        'num': num,
                        'title': title_text.rstrip(':').strip().strip('"').strip('\u201c').strip('\u201d').strip(),
                        'seg_start': idx,
                        'start_page': page_num,
                    })
                    last_recipe_num = num

    for i in range(len(recipes)):
        recipes[i]['seg_end'] = recipes[i + 1]['seg_start'] if i + 1 < len(recipes) else len(segments)

    return recipes


def parse_recipe_body(segments, seg_start, seg_end):
    """Parse body segments into ingredients, preparation, consejo."""
    lines = [seg[1] for seg in segments[seg_start:seg_end]]
    text = '\n'.join(lines)

    # Find section markers - expanded to include Procedimiento and "Preparación :" with space
    # Match INGREDIENTES as a section header - allow optional leading number or checkbox
    ing_match = re.search(r'(?i)(?:^|\n)\s*(?:\d+\.)?\s*\u2705?\s*INGREDIENTES\b', text)
    # Match Preparacion, Preparación, Procedimiento (allow optional leading number)
    prep_match = re.search(
        r'(?i)(?:^|\n)\s*(?:\d+\.)?\s*(?:PREPARACION|PREPARACI[ÓO]N|PROCEDIMIENTO|MODO DE PREPARACION|MODO DE PREPARACI[ÓO]N)\s*:?',
        text
    )
    consejo_match = re.search(r'(?i)\bConsejo\s*(?:nutricional|Nutricional|extra|adicional)?\s*:', text)

    ingredientes = []
    preparacion = []
    consejo = ""

    # Determine format: "full" has Ingredientes BEFORE Preparacion; "inline" has only Preparacion
    has_ing_before_prep = (ing_match and prep_match and ing_match.start() < prep_match.start())

    if has_ing_before_prep:
        # Full format: has both Ingredientes and Preparacion sections
        ing_text = text[ing_match.end():prep_match.start()]
        if consejo_match and consejo_match.start() > prep_match.end():
            prep_text = text[prep_match.end():consejo_match.start()]
            consejo_text = text[consejo_match.end():]
        else:
            prep_text = text[prep_match.end():]
            consejo_text = ""

        ingredientes = _parse_ingredients(ing_text)
        preparacion = _parse_steps(prep_text)
        consejo = _clean_consejo(consejo_text)

    elif prep_match:
        # Inline format: "Preparación : Mezcla..." (no separate ingredients before prep)
        prep_end_pos = prep_match.end()
        # The prep marker might end before or after the colon
        # Skip any remaining colon and whitespace after the marker
        rest = text[prep_end_pos:]
        rest = rest.lstrip(':').lstrip()

        if consejo_match and consejo_match.start() > prep_match.end():
            prep_text = text[prep_end_pos:consejo_match.start()]
            consejo_text = text[consejo_match.end():]
        else:
            prep_text = text[prep_end_pos:]
            consejo_text = ""

        prep_text = prep_text.strip().lstrip(':').strip()

        # For inline recipes, merge multi-line text then parse
        prep_clean = re.sub(r'\n+', ' ', prep_text).strip()
        prep_clean = _remove_trailing_labels(prep_clean)

        # Check if it has numbered steps
        if re.search(r'\d+\.\s*[A-ZÁÉÍÓÚÑÜa-záéíóúñü]', prep_clean):
            preparacion = _parse_steps(prep_text)
        elif prep_clean:
            preparacion = [prep_clean]

        consejo = _clean_consejo(consejo_text)

    elif ing_match and not prep_match and ing_match.start() < (consejo_match.start() if consejo_match else len(text)):
        # Only ingredients as section header, no explicit prep section
        if consejo_match and consejo_match.start() > ing_match.end():
            ing_text = text[ing_match.end():consejo_match.start()]
            consejo_text = text[consejo_match.end():]
            consejo = _clean_consejo(consejo_text)
        else:
            ing_text = text[ing_match.end():]
        ingredientes = _parse_ingredients(ing_text)

    else:
        # No markers at all - try to parse as freeform text
        # Check if text contains a consejo
        if consejo_match:
            body_text = text[:consejo_match.start()].strip()
            consejo_text = text[consejo_match.end():]
            consejo = _clean_consejo(consejo_text)
        else:
            body_text = text.strip()

        # Try to extract any meaningful content
        body_clean = re.sub(r'\n+', ' ', body_text).strip()
        body_clean = _remove_trailing_labels(body_clean)
        if body_clean and len(body_clean) > 10:
            preparacion = [body_clean]

    return ingredientes, preparacion, consejo


def _parse_ingredients(text):
    """Parse ingredients text into list."""
    text = re.sub(r'(?i)^[^:\n]*:?\s*:?\s*', '', text.strip(), count=1)
    items = []
    for line in text.split('\n'):
        line = line.strip()
        if not line:
            continue
        if is_page_label(line):
            continue
        if re.match(r'(?i)(preparaci[oó]n|procedimiento|modo de prep)', line):
            break
        if re.match(r'(?i)consejo', line):
            break
        # Remove leading numbers (ingredient numbering)
        line = re.sub(r'^\d+\.\s*', '', line)
        # Keep sub-headers like "Relleno:", "Para la base:" as items
        line = line.lstrip('- ').lstrip('• ').strip()
        if line and len(line) > 1:
            items.append(line)
    return items


def _parse_steps(text):
    """Parse preparation text into list of steps."""
    text = text.strip().lstrip(':').strip()
    steps = []
    current = ""
    for line in text.split('\n'):
        line = line.strip()
        if not line:
            continue
        if is_page_label(line):
            continue
        if re.match(r'(?i)consejo', line):
            break
        if re.match(r'(?i)^(apta para diabéticos|perfecta para|alta en proteína|Todas estas recetas)', line):
            continue
        if re.match(r'(?i)^(Bajas en carbohidratos|Ricas en proteína|Sin frituras|Ideal para mantener)', line):
            continue

        m = re.match(r'^(\d+)\.\s*(.+)', line)
        if m:
            if current:
                steps.append(current)
            current = m.group(2).strip()
        else:
            if current:
                current += ' ' + line
            else:
                current = line
    if current:
        steps.append(current)

    return [_remove_trailing_labels(re.sub(r'\s+', ' ', s).strip()) for s in steps if s.strip() and len(s.strip()) > 2]


def _clean_consejo(text):
    if not text:
        return ""
    text = text.strip().lstrip(':').strip()
    text = re.sub(r'\s+', ' ', text).strip()
    return _remove_trailing_labels(text)


def _remove_trailing_labels(text):
    changed = True
    while changed:
        changed = False
        for kw in LABEL_KEYWORDS:
            if text.upper().endswith(kw):
                text = text[:-len(kw)].strip()
                changed = True
    return text.strip()


def fix_name(name):
    """Fix common PDF extraction artifacts in recipe names."""
    name = re.sub(r'\bSm oothie\b', 'Smoothie', name)
    name = re.sub(r'\bLim onada\b', 'Limonada', name)
    name = re.sub(r'\bJam aica\b', 'Jamaica', name)
    name = re.sub(r'\bCrem a\b', 'Crema', name)
    name = re.sub(r'\bEdam am e\b', 'Edamame', name)
    name = re.sub(r'\bocum o\b', 'ocumo', name)
    name = re.sub(r'\bCam arones\b', 'Camarones', name)
    name = re.sub(r'\bform ar\b', 'formar', name)
    name = re.sub(r'\bence rado\b', 'encerado', name)
    name = re.sub(r'\bhomog énea\b', 'homogénea', name)
    name = re.sub(r'\balmendra s\b', 'almendras', name)
    name = re.sub(r'\bHorne a\b', 'Hornea', name)
    # Remove all quote characters (they wrap foreign words like "Noodles", "Risotto")
    name = name.replace('"', '').replace('\u201c', '').replace('\u201d', '').replace("'", '')
    # Clean whitespace
    name = re.sub(r'\s+', ' ', name).strip()
    return name


def build_special_recipes():
    """Build manually-parsed unnumbered recipes."""
    return [
        {
            'id': 0,
            'num': 0,  # Before recipe 1
            'nombre': 'Muffins de brócoli para desayuno',
            'categoria': 'desayuno',
            'ingredientes': [
                '2 huevos',
                '1 taza de brócoli cocido y picado',
                '1/2 taza de harina de almendras',
                '1/2 taza de queso cottage',
                '1/4 taza de cebolla picada',
                '1/2 taza de queso mozzarella rallado',
                'Orégano al gusto',
                'Sal y pimienta al gusto',
            ],
            'preparacion': [
                'Precalienta el horno a 180 °C.',
                'Mezcla los huevos con el queso cottage.',
                'Agrega el brócoli, cebolla, harina de almendras, orégano, sal y pimienta.',
                'Incorpora la mozzarella y mezcla bien.',
                'Vierte en moldes para muffins engrasados.',
                'Hornea 20-25 minutos, hasta que estén firmes.',
                'Retira, coloca más mozzarella por encima y hornea 5 minutos más hasta gratinar.',
            ],
            'consejo': '',
        },
        {
            'id': 0,
            'num': 21.5,  # Between 21 and 22
            'nombre': 'Pan de Calabaza con Cúrcuma',
            'categoria': 'desayuno',
            'ingredientes': [
                '1 taza de puré de calabaza',
                '1 1/2 tazas de harina de almendras',
                '1 cucharada de cúrcuma en polvo',
                '1/2 cucharadita de bicarbonato de sodio',
                '3 huevos',
                '2 cucharadas de aceite de coco derretido',
                '1/4 taza de nueces (opcional)',
            ],
            'preparacion': [
                'Precalienta el horno a 180°C (350°F) y engrasa un molde para pan.',
                'Mezcla los ingredientes secos: harina de almendras, cúrcuma, bicarbonato y edulcorante.',
                'Bate los ingredientes húmedos: huevos, puré de calabaza y aceite de coco.',
                'Combina los ingredientes secos con los húmedos y agrega las nueces (opcional).',
                'Vierte la mezcla en el molde y hornea durante 40-50 minutos o hasta que esté dorado y al insertar un palillo, salga limpio.',
                'Deja enfriar antes de servir.',
            ],
            'consejo': '',
        },
    ]


def main():
    print("Reading PDF...")
    reader = PyPDF2.PdfReader(PDF_PATH)
    print(f"Total pages: {len(reader.pages)}")

    # Extract text segments
    segments = extract_all_text(reader)
    print(f"Extracted {len(segments)} text segments")

    # Find recipe boundaries
    raw_recipes = find_recipe_boundaries(segments)
    print(f"Found {len(raw_recipes)} numbered recipes")

    # Parse each recipe
    parsed = []
    for raw in raw_recipes:
        body_start = raw['seg_start'] + 1
        body_end = raw['seg_end']

        # Handle multi-line titles
        title_extra = []
        for j in range(body_start, min(body_start + 3, body_end)):
            line = segments[j][1]
            ll = line.lower()
            if any(m in ll for m in ['ingredientes', 'preparaci', 'procedimiento', 'modo de prep', 'consejo']):
                break
            if re.match(r'^\d+\.', line):
                break
            if is_page_label(line):
                continue
            if len(line) < 80 and re.search(r'[a-záéíóúñü]', line.lower()):
                title_extra.append(line.rstrip(':').strip())
                body_start = j + 1
            else:
                break

        nombre = raw['title']
        if title_extra:
            nombre = nombre + ' ' + ' '.join(title_extra)
        nombre = fix_name(nombre.rstrip(':').strip())

        cat = get_category(raw['start_page'])
        if not cat:
            continue

        ingredientes, preparacion, consejo = parse_recipe_body(segments, body_start, body_end)

        parsed.append({
            'num': raw['num'],
            'nombre': nombre,
            'categoria': cat,
            'ingredientes': ingredientes,
            'preparacion': preparacion,
            'consejo': consejo,
        })

    # Add special unnumbered recipes
    special = build_special_recipes()
    parsed.extend(special)

    # Sort by number
    parsed.sort(key=lambda x: x['num'])

    # Assign sequential IDs
    for i, r in enumerate(parsed, 1):
        r['id'] = i

    # Build output
    output = []
    for r in parsed:
        output.append({
            'id': r['id'],
            'nombre': r['nombre'],
            'categoria': r['categoria'],
            'ingredientes': r['ingredientes'],
            'preparacion': r['preparacion'],
            'consejo': r['consejo'],
        })

    # Write JSON
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    total = len(output)
    print(f"\nTotal recipes: {total}")
    print(f"Saved to: {OUTPUT_PATH}")

    cats = {}
    for r in output:
        cats[r['categoria']] = cats.get(r['categoria'], 0) + 1
    print("\nPer category:")
    for cat in ['desayuno', 'almuerzo', 'cena', 'snack', 'jugo']:
        print(f"  {cat}: {cats.get(cat, 0)}")

    no_ing = [r for r in output if not r['ingredientes']]
    no_prep = [r for r in output if not r['preparacion']]
    with_consejo = sum(1 for r in output if r['consejo'])
    print(f"\nWithout ingredients: {len(no_ing)} (inline format)")
    print(f"Without preparation: {len(no_prep)}")
    print(f"With consejo: {with_consejo}")

    # Show first and last recipes
    print("\n=== First 5 ===")
    for r in output[:5]:
        print(f"  [{r['id']}] {r['nombre'][:60]} | ing:{len(r['ingredientes'])} prep:{len(r['preparacion'])} | {r['categoria']}")

    print("\n=== Last 5 ===")
    for r in output[-5:]:
        print(f"  [{r['id']}] {r['nombre'][:60]} | ing:{len(r['ingredientes'])} prep:{len(r['preparacion'])} | {r['categoria']}")

    # Show any recipes without preparation
    if no_prep:
        print(f"\n=== Recipes WITHOUT preparation ({len(no_prep)}) ===")
        for r in no_prep:
            print(f"  [{r['id']}] {r['nombre'][:60]} | cat={r['categoria']}")

    # Show sample inline recipe
    print("\n=== Sample inline recipe ===")
    for r in output:
        if not r['ingredientes'] and r['preparacion']:
            print(json.dumps(r, ensure_ascii=False, indent=2))
            break

    # Show sample full recipe
    print("\n=== Sample full recipe ===")
    for r in output:
        if r['ingredientes'] and r['preparacion'] and r['consejo']:
            print(json.dumps(r, ensure_ascii=False, indent=2))
            break


if __name__ == '__main__':
    main()
