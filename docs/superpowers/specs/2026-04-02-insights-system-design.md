# Sistema de Insights "Tus Descubrimientos" — Design Spec

## Objetivo

Adicionar inteligencia contextual ao Mi Codigo, transformando dados que a usuaria ja registra diariamente (peso, energia, humor, agua, comidas, suplemento, exercicio, sono, fase do ciclo, sintomas) em insights personalizados que:

1. Mostram correlacoes que ela nao perceberia sozinha
2. Criam o "momento magico" que justifica pagar pelo app
3. Incentivam registro diario (precisa dos dados para gerar insights)
4. Usam tom empatico (negativo) ou celebracao (positivo), nunca punitivo

## Arquitetura

Tres camadas, todas client-side (sem backend):

```
localStorage (dados existentes)
        |
        v
[Motor de Correlacao] -- funcoes puras que calculam estatisticas
        |
        v
[Gerador de Insights] -- transforma numeros em frases humanas
        |
        v
[UI] -- Cards na Home + Tooltips inline no Mi Dia
```

### Camada 1: Motor de Correlacao

Modulo `InsightsEngine` dentro do MiCodigo IIFE. Funcoes puras que leem localStorage e retornam objetos de correlacao.

Cada funcao retorna:
```javascript
{
  id: string,           // ex: 'water_energy'
  found: boolean,       // correlacao significativa encontrada?
  positive: boolean,    // padrao positivo ou negativo?
  emoji: string,        // emoji principal
  title: string,        // titulo curto (ex: "Agua y Energia")
  metric: string,       // dado numerico principal
  threshold: number,    // dias minimos necessarios
  daysAvailable: number // dias com dados que a usuaria tem
}
```

### As 8 Correlacoes

| ID | Correlacao | Calculo | Nivel |
|----|-----------|---------|-------|
| `weight_trend` | Tendencia de peso | Diferenca media: ultimos 7 dias vs 7 anteriores | Dia 3 |
| `water_energy` | Agua -> Energia | Media de energia em dias >=8 vasos vs <6 vasos | Dia 7 |
| `exercise_mood` | Exercicio -> Humor | % de Genial/Bien em dias com exercicio vs sem | Dia 7 |
| `meals_energy` | Comidas -> Energia | Energia media com 4/4 comidas vs <3 | Dia 7 |
| `sleep_mood` | Sono -> Humor | % humor positivo em noites >=7h vs <6h | Dia 7 |
| `sleep_symptoms` | Sono -> Sintomas | Frequencia de sintomas com <6h vs >=7h | Dia 14 |
| `supplement_symptoms` | Suplemento -> Sintomas | Frequencia de sintomas em semanas com vs sem | Dia 14 |
| `cycle_weight` | Fase -> Peso | Media de peso por fase, identificar variacao normal | Dia 30 |

**Regra de minimo:** so gera insight se tiver >= 3 dias com dados em cada lado da comparacao (ex: 3 dias com exercicio E 3 dias sem).

**Regra de significancia:** so mostra se a diferenca for >= 20% (evita insights triviais como "energia subiu 3%").

### Camada 2: Gerador de Insights

Modulo `InsightsGenerator` que recebe as correlacoes e produz textos prontos para UI.

**Tom positivo (celebracao):**
```
"Buen hallazgo! Los dias que tomaste 8+ vasos de agua, tu energia subio un {X}%. Tu cuerpo te lo agradece."
```

**Tom negativo (coach empatico):**
```
"Cuando duermes menos de 6h, tus bochornos tienden a duplicarse. Que tal priorizar el descanso esta noche? Pequenos ajustes hacen gran diferencia."
```

**Tom neutro (tendencia estavel):**
```
"Esta semana tu peso se mantuvo estable. La constancia es progreso."
```

Templates completos para cada correlacao:

#### weight_trend
- Positivo: "Esta semana: -{X} kg. Ritmo saludable! La constancia es tu mejor aliada."
- Neutro: "Tu peso se mantuvo estable esta semana. Constancia es progreso."
- Negativo: "+{X} kg esta semana — puede ser retencion, ciclo o variacion normal. Mira la tendencia, no el dia a dia."

#### water_energy
- Positivo: "Buen hallazgo! Los dias con 8+ vasos de agua, tu energia promedio fue {X} vs {Y}. Tu cuerpo te lo agradece!"
- Negativo: "Los dias con menos agua, tu energia baja un {X}%. Un vaso mas puede hacer diferencia."

#### exercise_mood
- Positivo: "Cuando haces ejercicio, tu humor es 'Genial' o 'Bien' el {X}% de las veces. Sigue asi!"
- Negativo: "Los dias sin ejercicio, tu humor tiende a bajar. Hasta 10 minutos de caminata pueden ayudar."

#### meals_energy
- Positivo: "Cuando completas tus 4 comidas, tu energia sube un {X}%. La constancia alimentaria te sienta bien!"
- Negativo: "Saltarte comidas se asocia con {X}% menos energia. Tu cuerpo necesita combustible regular."

#### sleep_mood
- Positivo: "Noches de 7h+: {X}% de tus dias con humor positivo. El descanso es tu superpoder."
- Negativo: "Cuando duermes menos de 6h, tu humor tiende a caer. Priorizar el sueno es autocuidado."

#### sleep_symptoms
- Positivo: "En tus noches de buen sueno, los sintomas molestos bajan un {X}%. Dato poderoso para tu proxima consulta."
- Negativo: "Las noches cortas (<6h) se asocian con {X}x mas {sintoma}. Hablalo con tu medico si persiste."

#### supplement_symptoms
- Positivo: "Las semanas que tomaste suplemento, tuviste {X}% menos {sintoma}. Vale la pena la constancia!"
- Neutro: "Aun no vemos patron claro entre suplemento y sintomas. Sigue registrando — necesitamos mas datos."

#### cycle_weight
- Positivo: "En fase lutea tu peso sube ~{X} kg — es hormonal y temporal. Tu 'peso real' se mide en la fase folicular."
- Informativo: "Tu peso varia hasta {X} kg segun la fase del ciclo. Es completamente normal."

### Camada 3: UI

#### Home — Secao "Tus Descubrimientos"

**Posicao:** Apos o card de streak, antes do menu do dia.

**Header:**
```html
<div style="font-size:11px;font-weight:700;color:#C9922A;text-transform:uppercase;
     letter-spacing:1px;margin:16px 0 8px">
  TUS DESCUBRIMIENTOS
</div>
```

**Cards de insight:**
- Estilo `mc-card` existente
- Background: `rgba(201,146,42,.08)` para positivos, `rgba(99,102,241,.08)` para empaticos
- Borda: `rgba(201,146,42,.15)` ou `rgba(99,102,241,.15)`
- Conteudo: emoji + titulo (bold, 13px) + texto do insight (12px, rgba(255,255,255,.7)) + metrica numerica (bold, gold/verde)
- Maximo 3 cards visiveis por vez
- Priorizacao: novos > positivos > negativos

**Estado vazio (dia 1-2):**
```
mc-card com background gold sutil:
"Registra tu Mi Dia durante 3 dias y empezare a mostrarte patrones
 sobre tu cuerpo. Cada registro cuenta!"
```

**Card de nivel desbloqueado (aparece 1 vez):**
```
mc-card com icone de cadeado:
"Nuevo nivel desbloqueado — con {N} dias de datos, ahora puedo
 mostrarte correlaciones mas profundas"
```
Marcado como visto em localStorage key `mc_insights_levels_seen`.

#### Mi Dia — Tooltips Inline

**Posicao:** Abaixo do titulo de cada secao (Agua, Ejercicio, Sueno, etc.) quando um insight relevante existe.

**Estilo:**
```css
background: rgba(201,146,42,.08);
border: 1px solid rgba(201,146,42,.15);
border-radius: 8px;
padding: 8px 12px;
font-size: 11px;
color: rgba(255,255,255,.6);
margin-bottom: 8px;
```

**Prefixo:** "Dato: " em bold gold.

**Mapeamento secao -> insight:**
- Secao Agua: `water_energy`
- Secao Ejercicio: `exercise_mood`
- Secao Sueno: `sleep_mood` ou `sleep_symptoms`
- Secao Suplemento: `supplement_symptoms`
- Secao Comidas: `meals_energy`

**Regra:** Maximo 1 tooltip por secao. So aparece se o insight esta desbloqueado (nivel atingido).

### Niveis Progressivos

```
Dia 1-2:  Estado vazio com mensagem motivacional
Dia 3:    weight_trend + medias simples
Dia 7:    water_energy, exercise_mood, meals_energy, sleep_mood
Dia 14:   sleep_symptoms, supplement_symptoms
Dia 30:   cycle_weight
```

O nivel e calculado com base em `Object.keys(getCheckins()).length` (dias com pelo menos 1 checkin salvo).

### Dados Consumidos (todos ja existem em localStorage)

| Key localStorage | Dados | Usado por |
|-----------------|-------|-----------|
| `mc_checkins` | {date: {peso, humor, energia}} | weight_trend, sleep_mood, sleep_symptoms |
| `mc_water` | {date: count} | water_energy |
| `mc_meals` | {date: {desayuno, almuerzo, cena, snack}} | meals_energy |
| `mc_supplements` | {date: boolean} | supplement_symptoms |
| `mc_exercise` | {date: boolean} | exercise_mood |
| `mc_sleep` | {date: {hours}} | sleep_mood, sleep_symptoms |
| `mc_cycle` | {date: {phase, symptoms[]}} | cycle_weight, sleep_symptoms, supplement_symptoms |

### Performance

- Calculos rodam 1x ao abrir Mi Codigo (`open()` ou `navigate('home')`)
- Cache em variavel `_cachedInsights` (limpa ao navegar para outro app/fechar)
- Nenhuma chamada de rede, nenhum framework, JS puro
- Estimativa: <50ms para 30 dias de dados

### Nao inclui (fora do escopo)

- Notificacoes push
- Machine learning / IA real
- Sincronizacao com backend
- Integracao com wearables
- Relatorio para medico (feature separada, futura "Mi Consulta")
