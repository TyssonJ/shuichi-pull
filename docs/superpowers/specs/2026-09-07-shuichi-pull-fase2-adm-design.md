# Shuichi Pull — Fase 2: Área de ADM (design)

Data: 2026-09-07
Status: aguardando revisão
Depende de: [`2026-09-04-shuichi-pull-fase1-design.md`](2026-09-04-shuichi-pull-fase1-design.md) — esta é a Fase 2 prevista na seção 9 daquele documento.

## 1. O que é

Hoje o Shuichi Pull é ~300 páginas estáticas geradas a partir de JSON versionado
no git (`data/*.json`, `content/*.json`), validado por zod no build. Editar
qualquer coisa — corrigir uma descrição, adicionar um evento, atualizar um
código promocional — exige mexer em código e fazer deploy. Isso trava o site
num único mantenedor.

A Fase 2 entrega um painel (`/adm`) onde administradores logados com Discord
editam esse conteúdo pelo navegador, sem tocar em código. É a fundação também
para a Fase 3 (perfis, login público) — ambas puxam o mesmo alicerce de conta
e banco de dados.

### Escopo desta fase

Dentro: login Discord + tabela de administradores, CRUD de eventos e códigos,
edição de itens/personagens/locais/textos via camada de correções, gerenciar
ADMs, auditoria.

Fora, de propósito: perfis públicos, login Steam, badges, conquistas,
organização de partida, aprovação/rascunho antes de publicar, permissão por
coleção. Ver seção 7 (decisões e por quê).

## 2. Por que sair do site 100% estático

`site/next.config.ts` hoje tem `output: 'export'` — não existe servidor, só
HTML gerado. Um painel de edição precisa de algo que rode código (autenticar,
gravar no banco) e de um lugar para gravar (banco). As duas mudanças saem
juntas: tira `output: 'export'`, hospeda na Vercel (free tier), banco Postgres
no Neon (free tier).

**As páginas públicas continuam estáticas.** Não é SSR em toda visita — seria
trocar um site instantâneo por um site refém do free tier do banco aguentar
tráfego. Cada página de elenco/item/local continua pré-renderizada. Quando um
ADM salva uma edição, o servidor dispara revalidação só das páginas afetadas
(`revalidatePath` do Next). Uma correção leva alguns segundos para aparecer no
ar — não é instantânea, e isso é aceito conscientemente.

## 3. Autenticação

Auth.js (`next-auth`) com provedor Discord, sessão em cookie JWT. Ninguém
digita senha própria do site — login é sempre "Entrar com Discord".

`/adm/*` sem sessão → redireciona para o login do Discord.
`/adm/*` com sessão mas Discord ID fora da tabela `administradores` → página
"sem acesso" (nunca 404, que esconderia o motivo).

O primeiro `chefe` (o usuário) entra por variável de ambiente
(`ADM_CHEFE_DISCORD_ID`) — checada no login, não em seed de banco, para não
depender de rodar script manual em produção. A partir daí, promover outro
`chefe` é uma ação de `chefe` dentro do próprio painel.

## 4. Modelo de dados

Seis tabelas em Postgres via Drizzle.

### `administradores`
| campo | tipo | nota |
|---|---|---|
| `discord_id` | text, PK | |
| `nome` | text | vindo do perfil Discord no primeiro login |
| `papel` | enum(`adm`, `chefe`) | |
| `promovido_por` | text, nullable | discord_id de quem promoveu; nulo para o chefe fundador |
| `criado_em` | timestamp | |

### `eventos`, `codigos`
Mesmos campos que `content/eventos.json` e `content/codigos.json` têm hoje
(ver `site/lib/eventos.ts` — `EventoSchema`, `CodigoSchema`). Conteúdo
editorial puro, sem base gerada: mora inteiro no banco desde o início. Um
script de migração roda uma vez, importando os JSON atuais; depois disso os
arquivos saem do repo.

### `correcoes` — a peça central
Uma linha por campo corrigido em conteúdo que **tem** base gerada
(personagens, itens, locais, faq, controles, traduções).

| campo | tipo | nota |
|---|---|---|
| `id` | serial, PK | |
| `colecao` | text | `personagens`, `itens`, `locais`, `faq`, `controles`, `traducoes.itens`, etc. |
| `registro_id` | text | o `id` do item/personagem/local, ou a chave de tradução |
| `campo` | text | ex. `descricao.pt`, `talento.pt` |
| `valor` | text | o valor corrigido |
| `valor_base` | text | o valor do JSON gerado **no momento em que a correção foi salva** |
| `autor` | text | discord_id |
| `criado_em` | timestamp | |

Restrição única em (`colecao`, `registro_id`, `campo`) — uma correção viva por
campo; salvar de novo substitui.

**Por que `valor_base` existe:** sem ele, quando `npm run dados` reimporta o
jogo e um valor muda, o painel não teria como saber se a correção salva ainda
faz sentido ou se está escondendo um dado novo do jogo atrás de uma correção
velha. Com ele, a leitura compara `valor_base` salvo contra o valor atual do
JSON: se bateram, a correção é aplicada normal; se divergem, o painel mostra
o conflito (seção 6) em vez de decidir sozinho.

**Na leitura:** `lib/dados.ts` e `lib/itens.ts` ganham uma função de resolução
que busca as correções da coleção e as aplica por cima do JSON gerado antes
de devolver o registro. As páginas públicas chamam as mesmas funções de
sempre (`listarItens()`, `buscarPersonagem()`) e não sabem que a correção
existe.

### `auditoria`
| campo | tipo |
|---|---|
| `id` | serial, PK |
| `autor` | text (discord_id) |
| `acao` | text (`correcao.criar`, `correcao.reverter`, `evento.criar`, `adm.promover`, …) |
| `alvo` | text (ex. `itens/pen-drive-criptografado/descricao.pt`) |
| `valor_antigo` | text, nullable |
| `valor_novo` | text, nullable |
| `criado_em` | timestamp |

Toda escrita do painel grava uma linha aqui, incluindo promoção/rebaixamento
de ADM. É histórico somente-leitura — nunca editado, nunca apagado.

**Desfazer** uma correção é apagar a linha correspondente de `correcoes`; o
valor volta sozinho ao do JSON gerado, sem precisar guardar "como era antes"
em lugar nenhum — a base nunca foi destruída.

## 5. Papéis e permissões

Dois papéis:

- **`adm`** — CRUD de eventos e códigos; cria/edita/reverte correções nas
  cinco coleções; pode reverter correções de qualquer ADM, não só as
  próprias. Toda ação vai ao ar direto (sem rascunho/aprovação) e fica em
  `auditoria` — a proteção contra erro é o histórico reversível, não uma
  fila de revisão.
- **`chefe`** — tudo que `adm` faz, mais `/adm/administradores` (promover e
  rebaixar) e `/adm/auditoria` (consulta).

Sem permissão por coleção (ex. "ADM só de eventos"): o grupo é pequeno e de
confiança, então essa granularidade seria complexidade sem uso real (ver
seção 7).

Edição concorrente no mesmo campo não tem bloqueio — quem salva por último
vence, e ambas as gravações ficam em `auditoria`. Não há usuários suficientes
para justificar lock otimista ainda.

## 6. Telas e fluxos

`/adm` é um shell interno simples (sidebar + conteúdo) — não tenta imitar a
estética "papel + Alter Ego" do site público, é ferramenta de bastidor.

**Sidebar:** Eventos, Códigos, Itens, Personagens, Mapa, Textos, e — só para
`chefe` — ADMs e Auditoria.

**Eventos / Códigos** (`/adm/eventos`, `/adm/codigos`) — CRUD comum: lista,
formulário criar/editar, excluir com confirmação. Sem camada de correções
envolvida, é a tela mais simples.

**Itens / Personagens / Mapa / Textos** (`/adm/itens`, etc.) — lista o
conteúdo gerado com indicador visual em quem tem correção ativa. Abrir um
registro mostra cada campo com o valor atual; campo corrigido ganha um botão
"reverter" ao lado. Editar é escrever em cima do campo e salvar — não há tela
de edição separada da de visualização.

Quando `valor_base` da correção diverge do valor atual no JSON (a ingestão
trouxe algo novo por baixo de uma correção existente), o campo mostra:

> "O jogo mudou isto para **X**. Sua correção (**Y**) continua valendo."

com duas ações: aceitar o valor novo do jogo (apaga a correção) ou manter a
correção como está.

**ADMs** (`/adm/administradores`, só `chefe`) — lista de quem tem acesso,
campo para adicionar por Discord ID, botão de rebaixar. Sem convite por link:
quem promove já sabe o Discord ID de quem confia.

**Auditoria** (`/adm/auditoria`, só `chefe`) — lista cronológica
somente-leitura, filtro por autor e por coleção. Consulta, não ação.

**Erros:** falha ao salvar (banco fora do ar) mantém o formulário preenchido
no estado local e mostra a mensagem — não perde o que foi digitado. Coleção
sem nenhuma correção mostra lista limpa, sem estado de "vazio" alarmante —
é o normal.

**Registro removido do jogo:** se a ingestão tira um item/personagem/local
que tinha correção salva, a correção fica órfã — não é apagada
automaticamente (perderia o histórico), mas a tela de listagem separa um
grupo "correções sem registro correspondente" para o ADM revisar e apagar
manualmente.

## 7. Decisões e por quê

| Decisão | Alternativa considerada | Por que esta |
|---|---|---|
| Banco só guarda correções, JSON gerado continua no git | Banco como única fonte da verdade | `npm run dados` pode rodar a qualquer hora sem apagar edições de ADM; base sempre regenerável do zero |
| Sem fluxo de rascunho/aprovação | ADM comum envia, chefe aprova | Grupo pequeno e de confiança; aprovação dobraria o trabalho recorrente sem reduzir risco proporcionalmente — o histórico reversível já cobre isso |
| Sem permissão por coleção | ADM restrito a uma área | Poucas pessoas, todas de confiança geral; granularidade fina aqui é complexidade sem consumidor |
| Sem lock de edição concorrente | Lock otimista por registro | Volume de ADMs simultâneos baixo demais para justificar; `auditoria` já resolve "quem mudou o quê por último" |
| Páginas públicas continuam estáticas, revalidadas sob demanda | SSR lendo o banco em toda visita | Zero dependência do banco para o tráfego público; o free tier do Neon fica reservado para o painel |

## 8. Preparado para a Fase 3

A tabela `administradores` e a sessão Auth.js já dão a base de conta que a
Fase 3 (perfis públicos, login Discord+Steam, UUID, mains) vai estender —
uma tabela `usuarios` separada de `administradores`, mesma sessão, Steam
como segundo provedor vinculado à mesma conta.

## 9. Migração do conteúdo existente

Script único, rodado uma vez: lê `content/eventos.json` e `content/codigos.json`,
insere em `eventos`/`codigos` no banco, e os arquivos saem do repo. Os JSONs
gerados (`data/*.json`, `content/faq.json`, `content/controles.json`)
continuam no git exatamente como hoje — nada muda neles, a tabela
`correcoes` é que passa a existir por cima.

## 10. Aberto para a implementação

1. Escolher exatamente quais campos de cada coleção são editáveis via
   correção (provavelmente: todo campo de texto/tradução; não os campos
   numéricos que vêm de dados do jogo como peso e velocidade — a discutir).
2. Formato exato do valor em `correcoes.valor` para campos que não são
   string simples (ex. lista de tags) — serializar como JSON no campo text,
   ou tabela própria por tipo? Provável: JSON no campo text, mais simples.
3. Rate limit / proteção de abuso no login Discord — provavelmente
   desnecessário dado o portão de `administradores`, mas revisar.
