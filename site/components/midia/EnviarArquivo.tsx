'use client';

import { useRef, useState } from 'react';
import { upload } from '@vercel/blob/client';
import {
  LIMITES_UPLOAD, VIDEO_PERFIL_MAX_SEGUNDOS, CHAT_VIDEO_MAX_SEGUNDOS, validarArquivoDeUpload, formatarTamanho, formatarSegundos,
  type TipoUpload,
} from '@/lib/midia';
import { lerDuracaoDoVideo, nomeSeguro } from '@/lib/midia-cliente';
import { mensagemDeErro } from '@/lib/acao-cliente';

export type ArquivoEnviado = { url: string; mime: string; tamanho: number; duracaoSegundos: number | null };

const MAX_SEGUNDOS: Partial<Record<TipoUpload, number>> = {
  'video-perfil': VIDEO_PERFIL_MAX_SEGUNDOS,
  'chat-video': CHAT_VIDEO_MAX_SEGUNDOS,
};

/**
 * Botão de enviar imagem ou vídeo. Confere tipo, tamanho e (em vídeo) a
 * duração ANTES de gastar banda, manda direto pro Blob com barra de progresso
 * e devolve o endereço público. Quem usa decide o que fazer com ele.
 */
export function EnviarArquivo({
  tipo, rotulo, aoConcluir, className = '',
}: {
  tipo: TipoUpload;
  rotulo?: string;
  aoConcluir: (arquivo: ArquivoEnviado) => void;
  className?: string;
}) {
  const entrada = useRef<HTMLInputElement>(null);
  const [progresso, setProgresso] = useState<number | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function escolher(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    e.target.value = '';
    if (!arquivo) return;
    setErro(null);

    const regra = validarArquivoDeUpload(tipo, { tamanho: arquivo.size, mime: arquivo.type });
    if (!regra.ok) { setErro(regra.erro); return; }

    let duracao: number | null = null;
    try {
      if (arquivo.type.startsWith('video/')) {
        duracao = await lerDuracaoDoVideo(arquivo);
        const teto = MAX_SEGUNDOS[tipo];
        if (teto && duracao > teto) {
          setErro(`O vídeo tem ${formatarSegundos(duracao)}; o máximo é ${formatarSegundos(teto)}.`);
          return;
        }
      }
      setProgresso(0);
      const r = await upload(`${tipo}/${nomeSeguro(arquivo.name)}`, arquivo, {
        access: 'public',
        handleUploadUrl: '/api/midia/upload/',
        clientPayload: JSON.stringify({ tipo }),
        multipart: arquivo.size > 5 * 1024 * 1024,
        onUploadProgress: ({ percentage }) => setProgresso(Math.round(percentage)),
      });
      aoConcluir({ url: r.url, mime: arquivo.type, tamanho: arquivo.size, duracaoSegundos: duracao === null ? null : Math.round(duracao) });
    } catch (err) {
      setErro(mensagemDeErro(err, 'Não deu para enviar. Tenta de novo?'));
    } finally {
      setProgresso(null);
    }
  }

  const enviando = progresso !== null;
  return (
    <span className={`inline-flex flex-col gap-1 ${className}`}>
      <input
        ref={entrada}
        type="file"
        accept={LIMITES_UPLOAD[tipo].tipos.join(',')}
        onChange={(e) => void escolher(e)}
        className="sr-only"
        aria-label={rotulo ?? 'Enviar arquivo'}
        tabIndex={-1}
      />
      <button
        type="button"
        disabled={enviando}
        onClick={() => entrada.current?.click()}
        className="self-start rounded-[3px] border border-cyber-cyan/60 px-2.5 py-1 font-mono text-[10px] tracking-[.08em] text-cyber-cyan hover:bg-cyber-cyan/10 disabled:opacity-60"
      >
        {enviando ? `Enviando… ${progresso}%` : `↑ ${rotulo ?? 'ENVIAR ARQUIVO'}`}
      </button>
      <span className="font-mono text-[9px] text-dim">
        até {formatarTamanho(LIMITES_UPLOAD[tipo].maxBytes)}
        {MAX_SEGUNDOS[tipo] ? ` · ${formatarSegundos(MAX_SEGUNDOS[tipo]!)}` : ''}
      </span>
      {erro && <span role="alert" className="text-[10px] text-alerta">{erro}</span>}
    </span>
  );
}
