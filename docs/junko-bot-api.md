# Integração Site ⇄ Junko Bot

O site (`https://shuichipull.vercel.app`) e o bot do Discord conversam nas duas direções:

- **Bot → site**: o bot chama a API do site (`/api/junko/…`) para ler perfis e partidas e para alterar coisas
  (aprovar UID, inscrever em partida).
- **Site → bot**: quando algo acontece no site (partida criada, UID enviado…), o site manda um **evento**
  (`POST <bot>/eventos`) para o bot reagir (avisar no Discord, dar cargo, etc.).

O lado do site já está pronto. O bot precisa de duas coisas: **usar a chave** para chamar o site e
**expor `POST /eventos`** para receber os avisos.

---

## 1. Ligando (uma vez)

1. Entre no site como **chefe** → `/adm/junko/`.
2. **Gerar chave**: copie a chave (`jk_…`) na hora — o site guarda só o hash e não mostra de novo.
   Guarde no ambiente do bot (ex.: variável `SHUICHI_API_KEY`). Gerar outra invalida a anterior.
3. Depois que o bot tiver a rota `POST /eventos`, marque **Enviar eventos ao bot**, confira o endereço do bot
   e use **Enviar evento de teste**.

> Sempre use a **barra no final** das URLs (`/api/junko/status/`). Sem ela o site responde `308` para a versão
> com barra, e muitos clientes HTTP não repetem o `POST` nem reenviam o cabeçalho na volta.

---

## 2. Bot → site

Todo pedido leva o cabeçalho:

```
Authorization: Bearer jk_SUA_CHAVE
```

| Sem chave gerada no painel | Chave errada/ausente |
|---|---|
| `503` `{"erro": "A integração ainda não foi configurada…"}` | `401` `{"erro": "Chave inválida."}` |

Erros de corpo devolvem `400` com `{"erro": "...", "problemas": ["campo: motivo"]}`.
`discordId` é o ID numérico do Discord (string).

### `GET /api/junko/status/`
Confere URL e chave. → `{"ok": true, "site": "shuichipull", "agora": "…", "eventosAtivos": false}`

### `GET /api/junko/partidas/`
Próximas partidas agendadas (`partidas`, até 20) e as que estão rolando agora (`emAndamento`), com vagas e inscritos.
Cada partida traz `status` (`agendada` \| `em_andamento` \| `finalizada` \| `cancelada`), `iniciadaEm` (ISO, quando o host apertou
"Começar") e `duracaoSegundos` (só depois de finalizada).

```json
{
  "partidas": [{
    "id": 12, "titulo": "Sala do Tyson", "hostDiscordId": "1234…",
    "dataHora": "2026-09-22T00:00:00.000Z", "vagas": 16,
    "url": "https://shuichipull.vercel.app/partidas/12/",
    "ocupadas": 9, "reservas": 2,
    "inscritos": [{ "discordId": "5678…", "papel": "participante", "personagemId": "shuichi-saihara" }]
  }]
}
```
`ocupadas` conta só titulares (reserva e o host jogando de Monokuma não ocupam vaga).
`dataHora` é UTC; o site exibe em horário de Brasília (UTC−3).

### `GET /api/junko/usuarios/{discordId}/`
`404` se a pessoa nunca entrou no site.

```json
{
  "discordId": "5678…", "nome": "Fulano", "uid": "STEAM_0:1:123", "uidStatus": "pendente",
  "podeSerHost": true, "mains": ["shuichi-saihara"], "bio": "…",
  "perfilUrl": "https://shuichipull.vercel.app/u/5678…/",
  "estatisticas": { "total": 12, "vitorias": 7, "derrotas": 4, "tragedias": 1, "mvps": 2, "…": 0 }
}
```

### `POST /api/junko/usuarios/{discordId}/uid/`
Corpo: `{"status": "aprovado" | "banido" | "pendente"}` → `{"ok": true, "discordId": "…", "uidStatus": "aprovado"}`.
Fica na auditoria do site com autor `junko-bot`. `404` se a pessoa nunca entrou no site.

### `POST /api/junko/partidas/{id}/inscricao/`
Corpo: `{"discordId": "…", "tipo": "participante" | "reserva", "personagemId": "shuichi-saihara" | null}`
(`tipo` padrão `participante`; `personagemId` padrão `null` = vaga genérica).

Segue as **mesmas regras do site**: `409` se a partida não aceita mais inscrição ou os titulares acabaram
("entre como reserva"), `403` se pedir `monokuma` e a pessoa não for o host, `404` se a partida não existe ou a
pessoa nunca entrou no site, `400` se o `personagemId` não existe no elenco.

### `DELETE /api/junko/partidas/{id}/inscricao/`
Corpo: `{"discordId": "…"}` → tira a pessoa da partida.

### `GET /api/junko/avaliacoes/?desde=<ISO>&limite=100`
Avaliações dadas **no site** (0–5 estrelas + texto), das mais antigas pras mais novas. Anônimas: **nunca** trazem quem avaliou,
e o que o próprio bot mandou não volta pra ele. `limite` até 200. Para paginar, use o `proximo` da resposta como `desde` da chamada seguinte
(`null` = acabou).

```json
{ "avaliacoes": [{ "id": 7, "partidaId": 12, "avaliadoDiscordId": "5678…", "estrelas": 4,
                   "comentario": "jogou muito bem", "criadoEm": "2026-09-21T15:00:00.000Z" }],
  "proximo": null }
```

### `POST /api/junko/avaliacoes/`
Manda avaliações que o bot tem pro site. Lote de até 100, **idempotente** pelo `externoId` (repetir atualiza, não duplica).

```json
{ "avaliacoes": [{ "externoId": "b-123", "avaliadoDiscordId": "5678…", "estrelas": 5,
                   "comentario": "ótimo jogador", "avaliadorDiscordId": "1234…", "criadoEm": "2026-09-20T10:00:00Z" }] }
```

Só `externoId`, `avaliadoDiscordId` e `estrelas` (inteiro de 0 a 5) são obrigatórios; `comentario` (cortado em 300 caracteres), `avaliadorDiscordId`
(guardado, **nunca exibido**) e `criadoEm` são opcionais. Item inválido não derruba o lote: volta em `ignoradas` com o motivo.
Quem é avaliado precisa ter entrado no site ao menos uma vez.

```json
{ "ok": true, "importadas": 1, "ignoradas": [{ "externoId": "b-9", "motivo": "estrelas: estrelas precisa ser um inteiro de 0 a 5" }] }
```

As importadas aparecem no perfil da pessoa com o selo "via Junko" e entram na média.

> Alterações feitas pelo bot **não** geram evento de volta para o bot (evita eco).

---

## 3. Site → bot

O site faz `POST <endereço do bot>/eventos` (padrão `https://junkobott.squareweb.app/eventos`), com:

```
Content-Type: application/json
X-Origem: shuichipull
Authorization: Bearer <credencial>   ← só se você configurou uma credencial no painel
```

Corpo:

```json
{
  "origem": "shuichipull",
  "evento": "partida.criada",
  "enviadoEm": "2026-09-21T15:00:00.000Z",
  "dados": { "…": "depende do evento" }
}
```

Responda **2xx** rápido (o site espera no máximo 4 s e **não** repete o envio). Qualquer outra resposta, timeout ou
falha de conexão vira uma linha `junko.falha` no log do painel (no máximo uma por minuto). O site nunca deixa uma
falha do bot atrapalhar quem está usando o site.

| `evento` | Quando | `dados` |
|---|---|---|
| `partida.criada` | Host abre uma sala | `{ partida }` |
| `partida.iniciada` | Host aperta "Começar" (partida fica em andamento) | `{ partida }` |
| `partida.cancelada` | Host ou ADM cancela | `{ partida }` |
| `partida.finalizada` | Host finaliza | `{ partida }` |
| `inscricao.entrou` | Alguém entra numa partida | `{ partidaId, discordId, papel, personagemId }` |
| `inscricao.saiu` | Alguém sai | `{ partidaId, discordId }` |
| `uid.enviado` | Jogador informa/troca o UID (fica `pendente`) | `{ discordId, uid }` |
| `uid.status` | ADM aprova/bane/devolve o UID | `{ discordId, status }` |
| `host.permissao` | ADM libera/revoga host | `{ discordId, podeSerHost }` |
| `avaliacao.registrada` | Alguém avalia um colega (0–5 estrelas + texto) | `{ avaliacaoId, partidaId, avaliadoDiscordId, estrelas, comentario }` |
| `avaliacao.removida` | Avaliação apagada (pelo autor ou ADM) | `{ partidaId, avaliadoDiscordId }` |
| `cargo.concedido` / `cargo.retirado` | ADM entrega ou tira um cargo | `{ discordId, cargo: { id, nome } }` |
| `conquista.concedida` | ADM entrega uma conquista | `{ discordId, conquista: { id, nome, descricaoCurta }, motivo }` |
| `conquista.retirada` | ADM retira uma conquista | `{ discordId, conquista: { id, nome } }` |
| `teste` | Botão de teste do painel | `{}` |

`partida` = `{ id, titulo, hostDiscordId, dataHora (ISO/UTC), vagas, url, status, iniciadaEm, duracaoSegundos }`. `iniciadaEm` só existe depois do "Começar";
`duracaoSegundos` só em `partida.finalizada` (de partida que foi iniciada). O `avaliacao.*` **nunca** traz quem avaliou. `papel` = `participante` \| `reserva`.
Nos eventos `uid.*`, `status` = `pendente` \| `aprovado` \| `banido` (o `status` dentro de `partida` é o da partida).

### Avaliações que o site puxa do bot

Além de você mandar (`POST /api/junko/avaliacoes/`), o chefe pode clicar em **Importar avaliações do bot agora** em `/adm/junko/`.
O site faz `GET <endereço do bot><rota>` (rota padrão `/avaliacoes`, configurável no painel), com `?desde=<ISO da última importação>` e a credencial
de saída no `Authorization`, e espera:

```json
{ "avaliacoes": [{ "externoId": "b-123", "avaliadoDiscordId": "5678…", "estrelas": 5, "comentario": "ótimo jogador" }] }
```

(uma lista direta também vale). Os mesmos campos e regras do `POST` acima. Se a rota ainda não existe (HTTP 404), o painel avisa.

### Exemplo de receptor (Python / aiohttp)

```python
from aiohttp import web

async def eventos(request: web.Request):
    # se você configurou credencial no painel, confira:
    # if request.headers.get("Authorization") != f"Bearer {CREDENCIAL}": return web.Response(status=401)
    corpo = await request.json()
    evento, dados = corpo["evento"], corpo["dados"]
    if evento == "partida.criada":
        ...  # ex.: postar no canal #partidas com dados["partida"]["url"]
    elif evento == "uid.enviado":
        ...  # ex.: avisar os moderadores: UID de <@dados["discordId"]> aguardando revisão
    return web.json_response({"ok": True})   # 2xx rápido

app = web.Application()
app.add_routes([web.post("/eventos", eventos)])
```

### Exemplo de receptor (Node / Express)

```js
app.post('/eventos', express.json(), (req, res) => {
  const { evento, dados } = req.body;
  if (evento === 'partida.criada') { /* postar no Discord */ }
  res.json({ ok: true });
});
```

### Exemplo de chamada ao site (curl)

```bash
curl -H "Authorization: Bearer $SHUICHI_API_KEY" https://shuichipull.vercel.app/api/junko/partidas/

curl -X POST -H "Authorization: Bearer $SHUICHI_API_KEY" -H "Content-Type: application/json" \
     -d '{"status":"aprovado"}' \
     https://shuichipull.vercel.app/api/junko/usuarios/123456789012345678/uid/
```

---

## 4. Segurança

- A chave do bot dá acesso de escrita (UID, inscrições): trate como senha, nunca em repositório público.
- O site guarda só o **hash** da chave; a credencial de saída (a que o bot exige) fica guardada no banco e nunca é
  exibida nem registrada na auditoria.
- O endereço do bot precisa ser `https` público (o painel recusa IP, `localhost` e rede interna).
- Ações do bot aparecem na auditoria do site com autor `junko-bot`.
