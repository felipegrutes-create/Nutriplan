# Kanban CRM — Aba Pendentes (Feegow Dashboard)
**Data:** 2026-03-18
**Status:** Aprovado pelo usuário

---

## 1. Visão Geral

Transformar a aba **Pendentes** do dashboard Feegow de uma tabela estática em um **board Kanban estilo Pipedrive**, com persistência de dados CRM em uma nova aba do Google Sheets via Google Apps Script Web App. Cada paciente pendente de retorno se torna um card gerenciável pela equipe comercial.

---

## 2. Estrutura do Kanban

### 2.1 Colunas (em ordem)

| # | Nome | Cor | Condição de entrada |
|---|------|-----|---------------------|
| 1 | 📋 Sem Contato | Cinza | Nenhum campo CRM preenchido |
| 2 | 📞 1º Contato | Âmbar | `contato1_data` preenchido |
| 3 | 📞 2º Contato | Laranja | `contato2_data` preenchido |
| 4 | 📄 Proposta Feita | Índigo | `proposta_feita = "Sim"` |
| 5 | 📅 Retorno Marcado | Teal | `retorno_marcado = "Sim"` |
| 6 | ✅ Quitado | Verde | `quitado = true` |

**Progressão automática:** o card é alocado na coluna mais avançada cujos critérios são satisfeitos. Não há drag-and-drop manual — a coluna é sempre derivada dos dados.

### 2.2 Totalizadores nas colunas

- **Proposta Feita:** exibe `Total em negociação: R$ X.XXX` (soma dos `valor` dos cards na coluna), em índigo
- **Quitado:** exibe `Total recebido: R$ X.XXX` (soma dos `valor` dos cards na coluna), em verde

---

## 3. Design do Card

Cada card exibe, diretamente na face (sem precisar abrir nada):

```
┌─────────────────────────────────────┐
│ Nome Paciente              ● urgência│
│ Profissional                         │
│ 📞 C1: dd/mm   📞 C2: dd/mm         │
│ 👤 Vendedora   💰 R$ valor           │
│ [badge Proposta] [badge Retorno]     │
│ [badge Parc.Pago] [badge Quitado]   │
└─────────────────────────────────────┘
```

- **Urgência dot:** avaliada na ordem — vermelho (>180 dias), senão laranja (>90), senão índigo (>60), senão cinza (≤60). Primeira condição satisfeita vence.
- **Badges:** aparecem apenas quando o status correspondente está ativo
- **Clicar no card** abre modal com formulário CRM editável

---

## 4. Formulário CRM (Modal)

Campos editáveis ao clicar no card:

| Campo | Tipo | Opções/Formato |
|-------|------|----------------|
| Contato 1 | Date picker | dd/mm/aaaa |
| Contato 2 | Date picker | dd/mm/aaaa |
| Vendedora | Select | Alice Valentin / Rayssa Guedes |
| Valor | Text input | Máscara R$ currency |
| Retorno Marcado | Select | Sim / Não |
| Proposta Feita | Select | Sim / Não |
| Parcialmente Pago | Checkbox | — |
| Quitado | Checkbox | — |

Ação **Salvar:** envia dados para o Google Apps Script Web App via `fetch POST` → salva na aba `CRM_Pendentes` do Sheets → atualiza card no board instantaneamente.

---

## 5. Persistência de Dados

### 5.1 Google Apps Script Web App

- Script vinculado à mesma planilha do dashboard
- Implantado como **Web App** com:
  - *Execute as:* proprietário da conta
  - *Who has access:* Anyone (sem necessidade de OAuth no cliente)
- Endpoints:
  - `GET ?action=read` → retorna todos os registros CRM como JSON
  - `POST` com body JSON → upsert do registro pelo `paciente_key`

### 5.2 Aba `CRM_Pendentes` no Sheets

Colunas da aba:

| Coluna | Campo | Tipo |
|--------|-------|------|
| A | paciente_key | String (nome normalizado, lowercase) |
| B | contato1_data | String dd/mm/aaaa |
| C | contato2_data | String dd/mm/aaaa |
| D | vendedora | String |
| E | valor | Number |
| F | retorno_marcado | String (Sim/Não) |
| G | proposta_feita | String (Sim/Não) |
| H | parc_pago | Boolean |
| I | quitado | Boolean |
| J | ultima_atualizacao | ISO timestamp |

**Chave primária:** `paciente_key` = nome do paciente em lowercase, trim, sem acentos.
> ⚠️ Limitação conhecida: dois pacientes com nomes idênticos compartilham a mesma chave e sobrescrevem os dados um do outro. Aceitável para o volume atual da clínica.

### 5.3 Fluxo de dados

```
Dashboard (JS)
  → fetch GET Apps Script → lê CRM_Pendentes → JSON
  → merge com retDetails (dados Feegow) → monta cards

Usuário edita card → modal → Salvar
  → fetch POST Apps Script → upsert CRM_Pendentes
  → atualiza estado local → re-renderiza board
```

---

## 6. Integração com Dados Existentes

Os dados dos pacientes (nome, profissional, dias sem retorno, datas) continuam vindo da planilha `Dados Diários` existente via `processData()`. Os dados CRM são carregados em paralelo via Apps Script e merged pelo `paciente_key`. Pacientes sem registro CRM ficam na coluna **Sem Contato**.

---

## 7. Mudanças no Arquivo HTML

- A aba **Pendentes** (`sec-pend`) tem seu conteúdo substituído pelo board Kanban
- Os filtros (busca, profissional, ano) são mantidos acima do board
- KPI cards de contagem (Total, 2025, 2026, Críticos) permanecem no topo
- Todo o restante do dashboard (outras 5 abas) permanece intocado

---

## 8. O que NÃO está no escopo

- Drag-and-drop manual entre colunas
- Histórico de alterações por registro
- Notificações ou alertas automáticos
- Integração direta com Pipedrive

---

## 9. Dependências e Pré-requisitos

1. Acesso ao Google Apps Script da planilha para criar e implantar o Web App
2. URL do Web App após implantação → inserida no topo do `<script>` do dashboard como `const CRM_SCRIPT_URL = "https://script.google.com/macros/s/..."`. Se ausente ou vazia, o board carrega normalmente mas o botão Salvar exibe aviso de configuração pendente.
3. O arquivo `dashboard-feegow-v2.html` como base para a implementação
