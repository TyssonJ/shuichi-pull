import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { auth } from '@/auth';
import { repositorioMidias } from '@/db/repositorios/midias';
import { LIMITES_UPLOAD, UPLOADS_POR_DIA, ehTipoUpload } from '@/lib/midia';

/**
 * Autoriza o envio direto do navegador pro Vercel Blob. O arquivo NÃO passa
 * por aqui (a função só aceita corpo de poucos MB); esta rota decide antes se
 * pode: precisa estar logado, o uso tem tipo e tamanho máximos próprios e há
 * teto de envios por dia. Depois que o Blob termina, ele nos chama de volta
 * (onUploadCompleted) e a mídia fica registrada pra cota e pra limpeza.
 */
export async function POST(request: Request) {
  let corpo: HandleUploadBody;
  try {
    corpo = (await request.json()) as HandleUploadBody;
  } catch {
    return Response.json({ erro: 'Corpo inválido.' }, { status: 400 });
  }

  try {
    const resposta = await handleUpload({
      body: corpo,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const sessao = await auth();
        const discordId = sessao?.user?.discordId;
        if (!discordId) throw new Error('Entre com o Discord para enviar arquivos.');

        let tipo: unknown;
        try { tipo = (JSON.parse(clientPayload ?? '{}') as { tipo?: unknown }).tipo; } catch { tipo = undefined; }
        if (!ehTipoUpload(tipo)) throw new Error('Tipo de envio inválido.');
        // O nome vem do navegador: só aceita a pasta do próprio tipo, sem "..".
        if (!pathname.startsWith(`${tipo}/`) || pathname.includes('..')) throw new Error('Nome de arquivo inválido.');

        if ((await repositorioMidias.contarDoDia(discordId)) >= UPLOADS_POR_DIA) {
          throw new Error('Você já enviou muitos arquivos hoje. Tenta de novo amanhã.');
        }

        const regra = LIMITES_UPLOAD[tipo];
        return {
          allowedContentTypes: regra.tipos,
          maximumSizeInBytes: regra.maxBytes,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ discordId, tipo }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const dados = JSON.parse(tokenPayload ?? '{}') as { discordId?: string; tipo?: unknown };
        if (dados.discordId && ehTipoUpload(dados.tipo)) {
          await repositorioMidias.registrar({
            url: blob.url, discordId: dados.discordId, tipo: dados.tipo, tipoMime: blob.contentType ?? null,
          });
        }
      },
    });
    return Response.json(resposta);
  } catch (e) {
    // Aqui a mensagem chega ao navegador (é uma resposta HTTP, não server action).
    return Response.json({ erro: e instanceof Error ? e.message : 'Falha no envio.' }, { status: 400 });
  }
}
