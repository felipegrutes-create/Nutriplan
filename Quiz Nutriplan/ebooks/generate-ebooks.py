#!/usr/bin/env python3
"""Generate HTML ebooks from extracted JSON data."""
import sys, io, json, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

DATA_DIR = 'd:/USER/Downloads/Projc_ClaudeCode/Quiz Nutriplan/ebooks/data'
OUT_DIR = 'd:/USER/Downloads/Projc_ClaudeCode/Quiz Nutriplan/ebooks'

# Book metadata: json_file -> (html_file, title, subtitle, emoji, color)
BOOKS = [
    # Kit Principal
    ('00-comience-aqui.json', 'comience-aqui.html', 'Comience Aquí', 'Tu guía de inicio para transformar tu metabolismo', '📖', '#2E7D52'),
    ('01-panes-vol1.json', 'panes-vol1.html', 'Panes Inteligentes Vol. 1', '37 recetas de panes sin gluten para tu equilibrio hormonal', '🍞', '#C9922A'),
    ('02-panes-vol2.json', 'panes-vol2.html', 'Panes Inteligentes Vol. 2', '45 recetas más de panes sin gluten para tu equilibrio hormonal', '🥖', '#C9922A'),
    ('03-recetas-quema-grasa.json', 'recetas-quema-grasa.html', '100 Recetas Quema Grasa', 'Recetas diseñadas para activar tu metabolismo', '🔥', '#E8445A'),
    ('04-recetas-fitness-vol1.json', 'recetas-fitness-vol1.html', 'Recetas Fitness Vol. 1', 'Nutrición inteligente para mujeres activas', '💪', '#6366F1'),
    ('05-recetas-fitness-vol2.json', 'recetas-fitness-vol2.html', 'Recetas Fitness Vol. 2', 'Más recetas para adelgazar con sabor', '🏋️', '#6366F1'),
    ('06-plan-31-dias.json', 'plan-31-dias.html', 'Plan de 31 Días', 'Tu plan completo de transformación hormonal día a día', '📅', '#2E7D52'),
    ('07-guia-alimentos.json', 'guia-alimentos.html', 'Guía de Alimentos', 'Tu mapa completo de alimentos para el equilibrio hormonal', '🥬', '#2E7D52'),
    ('08-tabla-indice-glucemico.json', 'tabla-ig.html', 'Tabla de Índice Glucémico', 'Tu semáforo visual para elegir alimentos que estabilizan tu insulina', '📊', '#06B6D4'),
    ('09-checklist-hipoglucemia.json', 'checklist.html', 'Checklist Anti-Hipoglucemia', 'Tu sistema de protección hormonal con checklists diarios y kit de emergencia', '✅', '#2E7D52'),
    ('10-mitos-verdades-insulina.json', 'mitos-verdades.html', 'Mitos y Verdades sobre la Insulina', 'Desmontando las mentiras que sabotean tu metabolismo hormonal', '🧠', '#E8445A'),
    # Bonos
    ('bonos-carnes.json', 'bono-carnes.html', 'Guía de Carnes Inteligentes', 'Proteína inteligente: elige, cocina y combina para tu equilibrio hormonal', '🥩', '#DC2626'),
    ('bonos-avena.json', 'bono-avena.html', 'Recetas con Avena', 'Tu cereal estrella con recetas para desayunos, snacks y postres hormonales', '🥣', '#C9922A'),
    ('bonos-navidad.json', 'bono-navidad.html', 'Recetario Navideño Saludable', 'Celebra la Navidad con sabor, tradición y equilibrio hormonal', '🎄', '#DC2626'),
    ('bonos-jugos.json', 'bono-jugos.html', 'Jugos Verdes Detox', 'Tu farmacia líquida con recetas para cada momento del día', '🥤', '#16A34A'),
    ('bonos-frutas.json', 'bono-frutas.html', 'Guía de Frutas Inteligentes', 'Tu semáforo frutal: cuáles potencian y cuáles sabotean tu equilibrio hormonal', '🍎', '#F59E0B'),
    ('bonos-bebidas.json', 'bono-bebidas.html', 'Bebidas Inteligentes', 'Tu farmacia líquida natural para el equilibrio hormonal', '🍵', '#16A34A'),
    ('bonos-masa-muscular.json', 'bono-masa-muscular.html', 'Guía de Masa Muscular y Metabolismo', 'Recupera fuerza, tono y vitalidad con proteína inteligente y ejercicios seguros', '💪', '#7C3AED'),
    ('bonos-emociones.json', 'bono-emociones.html', 'Control Emocional y Equilibrio Hormonal', 'Rompe el ciclo estrés-cortisol-insulina con técnicas prácticas para tu día a día', '🧘', '#EC4899'),
    ('bonos-ejercicios.json', 'bono-ejercicios.html', 'Plan de Ejercicios Semanal', 'Rutinas seguras para activar tu metabolismo y equilibrio hormonal — sin gimnasio', '🏃', '#F59E0B'),
    ('bonos-desparasitacion.json', 'bono-desparasitacion.html', 'Guía de Desparasitación Natural', 'Limpia tu intestino con remedios naturales y recupera tu energía hormonal', '🌿', '#16A34A'),
]

def escape_html(text):
    return text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')

def render_recipe_card(recipe, index):
    nombre = escape_html(recipe.get('nombre', f'Receta {index+1}'))

    # Handle structured vs raw content
    ingredientes = recipe.get('ingredientes', [])
    preparacion = recipe.get('preparacion', [])
    contenido_raw = recipe.get('contenido_raw', '')
    consejo = recipe.get('consejo', '')

    imagen = recipe.get('imagen', '')
    img_html = ''
    if imagen:
        img_html = f'<div class="recipe-img"><img src="{imagen}" alt="{nombre}" loading="lazy"></div>'

    body_html = img_html + '<div class="recipe-divider"></div>'

    if ingredientes:
        body_html += '<div class="recipe-label">Ingredientes</div><ul class="recipe-ingredients">'
        for ing in ingredientes:
            body_html += f'<li>{escape_html(str(ing))}</li>'
        body_html += '</ul>'

    if preparacion:
        body_html += '<div class="recipe-label">Preparación</div><ol class="recipe-steps">'
        for step in preparacion:
            body_html += f'<li>{escape_html(str(step))}</li>'
        body_html += '</ol>'

    if contenido_raw and not ingredientes and not preparacion:
        # Render raw content as paragraphs
        paragraphs = contenido_raw.strip().split('\n')
        body_html += '<div class="recipe-label">Receta</div><div class="section-text">'
        for p in paragraphs:
            p = p.strip()
            if p:
                body_html += f'<p>{escape_html(p)}</p>'
        body_html += '</div>'

    if consejo:
        body_html += f'''<div class="recipe-tip">
            <div class="recipe-tip-label">Consejo Nutricional</div>
            <div class="recipe-tip-text">{escape_html(consejo)}</div>
        </div>'''

    return f'''<div class="recipe-card">
        <div class="recipe-header" onclick="toggleRecipe(this)">
            <div class="recipe-num">{index+1}</div>
            <div class="recipe-name">{nombre}</div>
            <span class="recipe-toggle" aria-hidden="true">▾</span>
        </div>
        <div class="recipe-body">{body_html}</div>
    </div>'''

def render_section_card(section, index):
    titulo = escape_html(section.get('titulo', f'Sección {index+1}'))
    contenido = section.get('contenido', '')

    paragraphs = contenido.strip().split('\n') if contenido else []
    content_html = ''
    for p in paragraphs:
        p = p.strip()
        if p:
            content_html += f'<p>{escape_html(p)}</p>'

    return f'''<div class="recipe-card">
        <div class="recipe-header" onclick="toggleRecipe(this)">
            <div class="recipe-num">{index+1}</div>
            <div class="recipe-name">{titulo}</div>
            <span class="recipe-toggle" aria-hidden="true">▾</span>
        </div>
        <div class="recipe-body">
            <div class="recipe-divider"></div>
            <div class="section-text">{content_html}</div>
        </div>
    </div>'''

def render_chapter_header(chapter, has_image=True):
    nombre = escape_html(chapter.get('nombre', ''))
    descripcion = escape_html(chapter.get('descripcion', ''))
    imagen = chapter.get('imagen', '')
    img_html = ''
    if imagen and has_image:
        img_html = f'''<div class="chapter-img">
            <img src="{imagen}" alt="{nombre}" loading="lazy">
        </div>'''
    return f'''<div class="chapter-header">
        {img_html}
        <h2 class="chapter-title">{nombre}</h2>
        <p class="chapter-desc">{descripcion}</p>
    </div>'''

def render_intro_section(intro):
    titulo = escape_html(intro.get('titulo', ''))
    contenido = intro.get('contenido', '')
    paragraphs = contenido.strip().split('\n') if contenido else []
    content_html = ''
    for p in paragraphs:
        p = p.strip()
        if p:
            if p.startswith('•'):
                content_html += f'<p class="intro-bullet">{escape_html(p)}</p>'
            else:
                content_html += f'<p>{escape_html(p)}</p>'
    return f'''<div class="intro-section">
        <h2 class="intro-title">{titulo}</h2>
        <div class="intro-content">{content_html}</div>
    </div>'''

CHAPTER_STYLES = '''
.intro-section {
  background: #fff;
  border-radius: var(--radius);
  border: 1px solid var(--borda);
  padding: 28px 24px;
  margin-bottom: 28px;
  box-shadow: var(--sombra);
}
.intro-title {
  font-family: 'DM Serif Display', serif;
  font-size: 22px;
  font-weight: 400;
  color: var(--accent);
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--verde-light);
}
.intro-content p {
  font-size: 14px;
  line-height: 1.8;
  margin-bottom: 12px;
  color: var(--texto);
}
.intro-bullet {
  padding-left: 8px;
  border-left: 3px solid var(--accent);
  margin-left: 4px;
  color: var(--texto) !important;
  font-weight: 500;
}
.chapter-header {
  margin-top: 36px;
  margin-bottom: 20px;
  text-align: center;
}
.chapter-img {
  border-radius: var(--radius);
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,.1);
}
.chapter-img img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}
.chapter-title {
  font-family: 'DM Serif Display', serif;
  font-size: 24px;
  font-weight: 400;
  color: var(--accent);
  margin-bottom: 8px;
  border-bottom: none !important;
}
.chapter-desc {
  font-size: 14px;
  color: var(--texto-sub);
  line-height: 1.5;
  max-width: 500px;
  margin: 0 auto 4px;
}
'''

def generate_ebook(json_file, html_file, title, subtitle, emoji, color):
    json_path = os.path.join(DATA_DIR, json_file)
    html_path = os.path.join(OUT_DIR, html_file)

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Check for new "capitulos" format
    is_chapters = isinstance(data, dict) and data.get('tipo') == 'capitulos'
    extra_styles = ''

    if is_chapters:
        # New chapter-based format
        capitulos = data.get('capitulos', [])
        intro = data.get('intro', None)
        count = data.get('total_recetas', sum(len(c.get('recetas', [])) for c in capitulos))
        item_label = 'recetas'
        extra_styles = CHAPTER_STYLES

        cards_html = ''
        if intro:
            cards_html += render_intro_section(intro)

        recipe_index = 0
        for cap in capitulos:
            cards_html += render_chapter_header(cap)
            for recipe in cap.get('recetas', []):
                cards_html += render_recipe_card(recipe, recipe_index)
                recipe_index += 1
    else:
        # Original format
        # Determine content type and extract items
        items = []
        item_type = 'section'

        if isinstance(data, list):
            items = data
            if items and 'ingredientes' in items[0]:
                item_type = 'recipe'
        elif isinstance(data, dict):
            if 'recetas' in data and data['recetas']:
                items = data['recetas']
                item_type = 'recipe'
            elif 'secciones' in data and data['secciones']:
                items = data['secciones']
                item_type = 'section'
            # Also check for educational content in bonos
            edu = data.get('contenido_educativo', [])
            if edu and not items:
                items = edu

        # For bonos with both educational + recipes, merge
        if isinstance(data, dict) and 'contenido_educativo' in data and 'recetas' in data:
            edu = data.get('contenido_educativo', [])
            rec = data.get('recetas', [])
            if edu and rec:
                items = edu + rec
                item_type = 'mixed'

        count = len(items)
        item_label = 'recetas' if item_type == 'recipe' else 'secciones' if item_type == 'section' else 'contenidos'

        # Generate cards HTML
        cards_html = ''
        for i, item in enumerate(items):
            if item_type == 'recipe' or (item_type == 'mixed' and ('ingredientes' in item or 'preparacion' in item or 'contenido_raw' in item)):
                cards_html += render_recipe_card(item, i)
            else:
                cards_html += render_section_card(item, i)

    html = f'''<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>El Código Hormonal — {escape_html(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;0,800;1,400&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet">
<style>
:root {{
  --verde: #2E7D52;
  --verde-deep: #1B5E3A;
  --verde-light: #E8F5EE;
  --cream: #FFFDF7;
  --warm: #FBF8F3;
  --gold: #C9922A;
  --gold-light: #F9F3E6;
  --texto: #1A1A2E;
  --texto-sub: #4B5563;
  --borda: #E5E7EB;
  --accent: {color};
  --sombra: 0 1px 3px rgba(0,0,0,.06), 0 4px 12px rgba(0,0,0,.04);
  --radius: 14px;
}}
* {{ box-sizing: border-box; margin: 0; padding: 0; }}
html {{ scroll-behavior: smooth; }}
body {{
  font-family: 'DM Sans', sans-serif;
  background: var(--cream);
  color: var(--texto);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}}
.hero {{
  position: relative;
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(165deg, {color}dd 0%, {color} 50%, {color}cc 100%);
  overflow: hidden;
  padding: 40px 24px;
}}
.hero::before {{
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 20% 80%, rgba(255,255,255,.08) 0%, transparent 70%),
    radial-gradient(ellipse 60% 50% at 80% 20%, rgba(255,255,255,.06) 0%, transparent 60%);
  pointer-events: none;
}}
.hero::after {{
  content: '';
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  pointer-events: none;
}}
.hero-content {{
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 480px;
  animation: fadeUp .8s ease-out both;
}}
@keyframes fadeUp {{
  from {{ opacity: 0; transform: translateY(24px); }}
  to {{ opacity: 1; transform: translateY(0); }}
}}
.hero-badge {{
  display: inline-block;
  background: rgba(255,255,255,.12);
  border: 1px solid rgba(255,255,255,.2);
  color: rgba(255,255,255,.9);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  padding: 6px 16px;
  border-radius: 99px;
  margin-bottom: 24px;
}}
.hero-icon {{ font-size: 52px; margin-bottom: 16px; display: block; filter: drop-shadow(0 4px 12px rgba(0,0,0,.2)); }}
.hero h1 {{
  font-family: 'DM Serif Display', serif;
  font-size: clamp(28px, 6vw, 42px);
  color: #fff;
  line-height: 1.2;
  margin-bottom: 14px;
  font-weight: 400;
}}
.hero-sub {{
  font-size: 15px;
  color: rgba(255,255,255,.7);
  line-height: 1.6;
  margin-bottom: 24px;
}}
.hero-count {{
  display: inline-block;
  background: rgba(255,255,255,.15);
  color: #fff;
  padding: 8px 20px;
  border-radius: 99px;
  font-size: 14px;
  font-weight: 700;
}}
.content-area {{
  max-width: 720px;
  margin: 0 auto;
  padding: 32px 20px 48px;
}}
.content-area h2 {{
  font-family: 'DM Serif Display', serif;
  font-size: 24px;
  font-weight: 400;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--verde-light);
}}
.recipe-card {{
  background: #fff;
  border-radius: var(--radius);
  border: 1px solid var(--borda);
  margin-bottom: 10px;
  overflow: hidden;
  transition: all .2s;
}}
.recipe-card:hover {{ border-color: #ccc; }}
.recipe-card.open {{ box-shadow: var(--sombra); border-color: var(--accent); }}
.recipe-header {{
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  cursor: pointer;
  user-select: none;
}}
.recipe-num {{
  width: 32px; height: 32px; border-radius: 50%;
  background: var(--verde-light); color: var(--accent);
  font-size: 12px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: all .2s;
}}
.recipe-card.open .recipe-num {{ background: var(--accent); color: #fff; }}
.recipe-name {{ flex: 1; font-weight: 600; font-size: 14px; line-height: 1.35; }}
.recipe-toggle {{ font-size: 18px; color: var(--texto-sub); transition: transform .25s; flex-shrink: 0; }}
.recipe-card.open .recipe-toggle {{ transform: rotate(180deg); color: var(--accent); }}
.recipe-body {{ display: none; padding: 0 16px 18px; animation: slideDown .25s ease-out; }}
.recipe-card.open .recipe-body {{ display: block; }}
@keyframes slideDown {{
  from {{ opacity: 0; transform: translateY(-6px); }}
  to {{ opacity: 1; transform: translateY(0); }}
}}
.recipe-divider {{ height: 1px; background: var(--borda); margin-bottom: 16px; }}
.recipe-label {{
  font-size: 10px; font-weight: 700; letter-spacing: 1.5px;
  text-transform: uppercase; color: var(--accent); margin-bottom: 8px;
}}
.recipe-ingredients {{ list-style: none; padding: 0; margin-bottom: 18px; }}
.recipe-ingredients li {{
  position: relative; padding-left: 18px;
  font-size: 14px; line-height: 1.7;
}}
.recipe-ingredients li::before {{
  content: ''; position: absolute; left: 0; top: 10px;
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--accent); opacity: .4;
}}
.recipe-steps {{ list-style: none; counter-reset: step; padding: 0; margin-bottom: 16px; }}
.recipe-steps li {{
  counter-increment: step; position: relative; padding-left: 32px;
  font-size: 14px; line-height: 1.7; margin-bottom: 8px;
}}
.recipe-steps li::before {{
  content: counter(step); position: absolute; left: 0; top: 2px;
  width: 22px; height: 22px; border-radius: 50%;
  background: var(--verde-light); color: var(--accent);
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}}
.recipe-tip {{
  background: var(--gold-light); border-radius: 10px;
  padding: 14px 16px; border-left: 3px solid var(--gold);
}}
.recipe-tip-label {{
  font-size: 10px; font-weight: 700; letter-spacing: 1px;
  text-transform: uppercase; color: var(--gold); margin-bottom: 4px;
}}
.recipe-tip-text {{ font-size: 13px; line-height: 1.6; color: #78350F; font-style: italic; }}
.recipe-img {{
  width: 100%; border-radius: 10px; overflow: hidden; margin-bottom: 12px;
}}
.recipe-img img {{
  width: 100%; height: 180px; object-fit: cover; display: block;
}}
.section-text p {{
  font-size: 14px; line-height: 1.8; margin-bottom: 12px; color: var(--texto);
}}
.ebook-footer {{
  background: #1a1a2e; color: rgba(255,255,255,.6);
  text-align: center; padding: 40px 24px;
}}
.ebook-footer-brand {{
  font-family: 'DM Serif Display', serif;
  font-size: 18px; color: #fff; margin-bottom: 6px;
}}
.ebook-footer-sub {{ font-size: 12px; margin-bottom: 16px; }}
.ebook-footer-copy {{ font-size: 11px; color: rgba(255,255,255,.3); }}
.btt {{
  position: fixed; bottom: 24px; right: 24px;
  width: 44px; height: 44px; border-radius: 50%;
  background: var(--accent); color: #fff; border: none;
  cursor: pointer; font-size: 18px;
  box-shadow: 0 4px 16px rgba(0,0,0,.15);
  opacity: 0; transform: translateY(12px);
  transition: all .3s; z-index: 40;
  display: flex; align-items: center; justify-content: center;
}}
.btt.visible {{ opacity: 1; transform: translateY(0); }}
.back-link {{
  display: inline-flex; align-items: center; gap: 6px;
  color: rgba(255,255,255,.7); text-decoration: none;
  font-size: 13px; font-weight: 600;
  position: relative; z-index: 2; margin-bottom: 16px;
}}
.back-link:hover {{ color: #fff; }}
@media print {{
  .btt {{ display: none !important; }}
  .hero {{ min-height: auto; padding: 40px 24px; page-break-after: always; }}
  .recipe-body {{ display: block !important; }}
  .recipe-card {{ break-inside: avoid; box-shadow: none !important; }}
  .recipe-toggle {{ display: none; }}
  body {{ background: #fff; }}
}}
@media (max-width: 480px) {{
  .hero {{ padding: 32px 20px; }}
  .content-area {{ padding: 24px 16px 40px; }}
}}
{extra_styles}
</style>
</head>
<body>
<section class="hero">
  <div class="hero-content">
    <a href="portal.html" class="back-link">← Volver al portal</a>
    <span class="hero-badge">El Código Hormonal</span>
    <span class="hero-icon" aria-hidden="true">{emoji}</span>
    <h1>{escape_html(title)}</h1>
    <p class="hero-sub">{escape_html(subtitle)}</p>
    <div class="hero-count">{count} {item_label}</div>
  </div>
</section>
<div class="content-area">
{cards_html}
</div>
<footer class="ebook-footer">
  <div class="ebook-footer-brand">El Código Hormonal</div>
  <div class="ebook-footer-sub">{escape_html(title)}</div>
  <div class="ebook-footer-copy">Material exclusivo para miembros. Todos los derechos reservados.</div>
</footer>
<button class="btt" id="btt" onclick="window.scrollTo({{top:0,behavior:'smooth'}})" aria-label="Volver al inicio">↑</button>
<script>
function toggleRecipe(h){{ h.parentElement.classList.toggle('open'); }}
window.addEventListener('scroll', function(){{
  var b = document.getElementById('btt');
  if(window.pageYOffset > 400) b.classList.add('visible');
  else b.classList.remove('visible');
}}, {{passive:true}});
</script>
</body>
</html>'''

    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html)

    return count, item_label

# Generate all ebooks
print('Generating ebooks...\n')
for json_file, html_file, title, subtitle, emoji, color in BOOKS:
    json_path = os.path.join(DATA_DIR, json_file)
    if not os.path.exists(json_path):
        print(f'SKIP {json_file} (not found)')
        continue
    count, label = generate_ebook(json_file, html_file, title, subtitle, emoji, color)
    print(f'OK {html_file}: {count} {label}')

print('\nDone! All ebooks generated.')
