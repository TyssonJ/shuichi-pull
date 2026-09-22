# Cliente de referência pra o Junko Bot chamar a API do Shuichi Pull.
#
# Isto NÃO roda aqui — é código pronto pra colar no repositório do bot (Python
# + aiohttp, mesma stack que o bot já usa em api.py). O contrato completo,
# com todos os campos e códigos de erro, está em docs/junko-bot-api.md.
#
# Como o bot ganha acesso, em 3 passos:
#   1. Alguém com papel de CHEFE no site entra em /adm/junko/ e clica em
#      "Gerar chave". O site mostra a chave (jk_...) UMA vez só — depois disso
#      ele guarda só o hash e não tem como mostrar de novo.
#   2. Essa chave vira uma variável de ambiente no servidor do bot, por
#      exemplo SHUICHI_API_KEY (nunca commitada no repositório do bot).
#   3. Toda chamada do bot pro site leva essa chave no cabeçalho:
#        Authorization: Bearer jk_...
#      O site confere a chave a cada pedido — sem ela (ou errada) ele recusa
#      antes de tocar em qualquer dado (ver ChaveInvalida/SemChave abaixo).
#
# Instalação no bot: `pip install aiohttp` (provavelmente já tem).
#
# Uso típico dentro do bot:
#   from shuichi_pull import ShuichiPullClient, ErroDoSite
#
#   shuichi = ShuichiPullClient(chave=os.environ["SHUICHI_API_KEY"])
#   ...
#   partidas = await shuichi.partidas()
#   await shuichi.definir_status_uid(discord_id, "aprovado")
#   await shuichi.fechar()  # ao desligar o bot

from __future__ import annotations

import aiohttp

BASE_PADRAO = "https://shuichipull.vercel.app"


class ErroDoSite(Exception):
    """O site recusou o pedido. `status` é o código HTTP; `dados` é o corpo JSON (tem "erro" e,
    em erro de validação, "problemas"). Ex.: 401 = chave errada, 404 = não existe, 409 = regra
    de negócio (partida cheia, já encerrada…)."""

    def __init__(self, status: int, dados: dict):
        self.status = status
        self.dados = dados
        super().__init__(f"HTTP {status}: {dados.get('erro', dados)}")


class ShuichiPullClient:
    """Fala com a API do Shuichi Pull (/api/junko/...). Uma instância por processo do bot —
    ela reaproveita a conexão HTTP; feche com `await fechar()` ao desligar."""

    def __init__(self, chave: str, base_url: str = BASE_PADRAO, timeout_s: float = 8.0):
        self._chave = chave
        self._base = base_url.rstrip("/")
        self._sessao: aiohttp.ClientSession | None = None
        self._timeout = aiohttp.ClientTimeout(total=timeout_s)

    def _sessao_ativa(self) -> aiohttp.ClientSession:
        if self._sessao is None or self._sessao.closed:
            self._sessao = aiohttp.ClientSession(
                headers={"Authorization": f"Bearer {self._chave}"}, timeout=self._timeout
            )
        return self._sessao

    async def fechar(self) -> None:
        if self._sessao and not self._sessao.closed:
            await self._sessao.close()

    async def _pedir(self, metodo: str, caminho: str, **kwargs) -> dict:
        # O site exige a barra no final das rotas — sem ela ele redireciona (308)
        # e muitos clientes não repetem o método/cabeçalho no redirecionamento.
        if not caminho.endswith("/"):
            caminho += "/"
        url = f"{self._base}{caminho}"
        async with self._sessao_ativa().request(metodo, url, **kwargs) as resp:
            corpo = await resp.json()
            if resp.status >= 400:
                raise ErroDoSite(resp.status, corpo)
            return corpo

    # ---- leitura ----------------------------------------------------------

    async def status(self) -> dict:
        """Confere se a chave e a conexão estão ok. {"ok": true, "site": ..., "eventosAtivos": bool}"""
        return await self._pedir("GET", "/api/junko/status")

    async def partidas(self) -> dict:
        """{"partidas": [...próximas agendadas, até 20], "emAndamento": [...rolando agora]}"""
        return await self._pedir("GET", "/api/junko/partidas")

    async def usuario(self, discord_id: str) -> dict:
        """Perfil de alguém no site (UID, estatísticas, mains...). Lança ErroDoSite(404) se a
        pessoa nunca entrou no site."""
        return await self._pedir("GET", f"/api/junko/usuarios/{discord_id}")

    async def avaliacoes(self, desde: str | None = None, limite: int = 100) -> dict:
        """Avaliações dadas NO SITE, mais antigas primeiro. Pagina: chame de novo passando
        `proximo` da resposta como `desde`, até ele vir null."""
        params = {"limite": str(limite)}
        if desde:
            params["desde"] = desde
        return await self._pedir("GET", "/api/junko/avaliacoes", params=params)

    # ---- escrita ------------------------------------------------------------
    # Ficam na auditoria do site com autor "junko-bot" e NÃO geram evento de volta pro bot (sem eco).

    async def definir_status_uid(self, discord_id: str, status: str) -> dict:
        """`status` = "aprovado" | "banido" | "pendente"."""
        return await self._pedir(
            "POST", f"/api/junko/usuarios/{discord_id}/uid", json={"status": status}
        )

    async def inscrever(
        self, partida_id: int, discord_id: str, tipo: str = "participante", personagem_id: str | None = None
    ) -> dict:
        """`tipo` = "participante" | "reserva". Mesmas regras do site: pode lançar ErroDoSite
        com 409 (sala cheia / já encerrada), 403 (pediu Monokuma sem ser o host), 404 ou 400."""
        corpo = {"discordId": discord_id, "tipo": tipo, "personagemId": personagem_id}
        return await self._pedir("POST", f"/api/junko/partidas/{partida_id}/inscricao", json=corpo)

    async def sair_da_partida(self, partida_id: int, discord_id: str) -> dict:
        return await self._pedir(
            "DELETE", f"/api/junko/partidas/{partida_id}/inscricao", json={"discordId": discord_id}
        )

    async def enviar_avaliacoes(self, avaliacoes: list[dict]) -> dict:
        """Lote de até 100. Cada item precisa de externoId, avaliadoDiscordId, estrelas (0-5);
        comentario/avaliadorDiscordId/criadoEm são opcionais. Repetir o mesmo externoId atualiza,
        não duplica. {"ok": true, "importadas": N, "ignoradas": [{"externoId", "motivo"}]}"""
        return await self._pedir("POST", "/api/junko/avaliacoes", json={"avaliacoes": avaliacoes})


# ---- exemplo mínimo -------------------------------------------------------
if __name__ == "__main__":
    import asyncio
    import os

    async def principal():
        shuichi = ShuichiPullClient(chave=os.environ["SHUICHI_API_KEY"])
        try:
            print(await shuichi.status())
            print(await shuichi.partidas())
        except ErroDoSite as e:
            print(f"o site recusou: {e}")
        finally:
            await shuichi.fechar()

    asyncio.run(principal())
