import { after } from 'next/server';
import { auth } from '@/auth';
import { repositorioChat } from '@/db/repositorios/chat';
import { podeAcessarSala } from '@/lib/chat-acesso';
import {
  CHAT_MENSAGENS_POR_CONSULTA, PRESENCA_TTL_MS, RETENCAO_MS, janelaVisivelMs, lerSala,
} from '@/lib/chat';
import { identidadeDe } from '@/lib/identidade';
import { apagarMidia } from '@/lib/midia-servidor';

const SEM_CACHE = { headers: { 'Cache-Control': 'no-store' } };

/**
 * Consulta do chat (o navegador chama de ~3 em ~3 s enquanto o painel está
 * aberto). Serve também de batimento de presença. Sem `depois`: as mensagens
 * mais recentes da janela; com `depois=<id>`: só as novas. `ids` lista o que
 * ainda existe, pro navegador tirar da tela o que um ADM apagou.
 */
export async function GET(req: Request) {
  const sessao = await auth();
  const discordId = sessao?.user?.discordId;
  if (!discordId) return Response.json({ erro: 'Entre com o Discord pra usar o chat.' }, { status: 401, ...SEM_CACHE });

  const url = new URL(req.url);
  const sala = lerSala(url.searchParams.get('sala') ?? '');
  if (!sala) return Response.json({ erro: 'Sala inválida.' }, { status: 400, ...SEM_CACHE });

  const ehAdm = Boolean(sessao.user.papel);
  if (!(await podeAcessarSala(sala, { discordId, ehAdm }))) {
    return Response.json({ erro: 'Você não está nessa sala.' }, { status: 403, ...SEM_CACHE });
  }

  const nomeDaSala = url.searchParams.get('sala')!;
  const depoisBruto = url.searchParams.get('depois');
  const depois = depoisBruto && /^\d{1,9}$/.test(depoisBruto) ? Number(depoisBruto) : undefined;
  const agora = new Date();
  const desde = new Date(agora.getTime() - janelaVisivelMs(ehAdm));

  const [mensagens, ids] = await Promise.all([
    repositorioChat.listar(nomeDaSala, { desde, depoisDe: depois, limite: CHAT_MENSAGENS_POR_CONSULTA }),
    repositorioChat.idsNaJanela(nomeDaSala, desde, CHAT_MENSAGENS_POR_CONSULTA),
    repositorioChat.marcarPresenca(discordId, nomeDaSala, agora),
  ]);
  const online = await repositorioChat.contarOnline(nomeDaSala, new Date(agora.getTime() - PRESENCA_TTL_MS));

  // Limpeza oportunista: sem cron, quem está usando o chat mantém a casa em ordem.
  if (Math.random() < 0.05) {
    after(async () => {
      const urls = await repositorioChat.purgar(new Date(Date.now() - RETENCAO_MS));
      await Promise.all(urls.map((u) => apagarMidia(u)));
    });
  }

  return Response.json({
    online,
    ids,
    mensagens: mensagens.map((m) => {
      const i = identidadeDe({
        discordNome: m.autor.discordNome ?? 'Alguém', discordAvatar: m.autor.discordAvatar,
        apelido: m.autor.apelido, avatarUrl: m.autor.avatarUrl,
      });
      return {
        id: m.id,
        autorId: m.autorDiscordId,
        autorNome: i.nome,
        autorNomeOriginal: i.nomeOriginal,
        autorAvatar: i.avatar,
        autorEhAdm: m.autor.ehAdm,
        texto: m.texto,
        anexos: m.anexos,
        criadoEm: m.criadoEm.toISOString(),
      };
    }),
  }, SEM_CACHE);
}
