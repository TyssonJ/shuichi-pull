'use client';

import { useState } from 'react';
import { EnviarArquivo } from '@/components/midia/EnviarArquivo';
import { TextoComEmojis } from './TextoComEmojis';
import { desembrulhar, mensagemDeErro, type Acao } from '@/lib/acao-cliente';
import type { EmojiPerfil } from '@/lib/estilo-perfil';
import { formatarSegundos, VIDEO_PERFIL_MAX_SEGUNDOS } from '@/lib/midia';
import { POST_ANEXOS_MAX, POST_TEXTO_MAX, POSTS_MAX_POR_PESSOA, type AnexoPost } from '@/lib/perfil-posts';

export type PostExibido = { id: number; texto: string; anexos: AnexoPost[]; quando: string };
type AnexoEnviado = { url: string; video: boolean; duracaoSegundos: number | null };

const estiloCampo =
  'w-full rounded-[3px] border border-line bg-[#141419] px-2 py-1.5 text-[13px] text-[#D6D6E0] placeholder:text-dim/60 focus:border-alter-green focus:outline-none';

function Anexo({ a }: { a: AnexoPost }) {
  if (a.tipo === 'video') {
    return (
      <div>
        <video controls preload="metadata" playsInline src={a.url} className="max-h-96 w-full rounded-[3px] border border-line bg-black" />
        {a.duracaoSegundos !== null && <p className="mt-0.5 font-mono text-[9px] text-dim">vídeo · {formatarSegundos(a.duracaoSegundos)}</p>}
      </div>
    );
  }
  return (
    <a href={a.url} target="_blank" rel="noreferrer" className="block">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={a.url} alt="Imagem do post" loading="lazy" className="max-h-96 w-auto max-w-full rounded-[3px] border border-line object-contain" />
    </a>
  );
}

function Escrever({ aoPublicar }: { aoPublicar: (dados: { texto: string; anexos: AnexoEnviado[] }) => Acao<number> }) {
  const [texto, setTexto] = useState('');
  const [anexos, setAnexos] = useState<AnexoEnviado[]>([]);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const temVideo = anexos.some((a) => a.video);
  const cheio = anexos.length >= POST_ANEXOS_MAX;
  const vazio = texto.trim().length === 0 && anexos.length === 0;

  async function publicar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setOcupado(true);
    try {
      await desembrulhar(aoPublicar({ texto, anexos }));
      setTexto('');
      setAnexos([]);
    } catch (err) {
      setErro(mensagemDeErro(err, 'Não deu para publicar. Tenta de novo?'));
    } finally {
      setOcupado(false);
    }
  }

  return (
    <form onSubmit={publicar} className="mb-4 space-y-2 rounded-[3px] border border-line bg-sur p-3">
      <label className="block">
        <span className="mb-1 flex items-baseline justify-between font-mono text-[9px] tracking-[.14em] text-dim">
          NOVO POST
          <span className={[...texto].length > POST_TEXTO_MAX ? 'text-alerta' : ''}>{[...texto].length}/{POST_TEXTO_MAX}</span>
        </span>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={3}
          placeholder="Conte uma história de partida, mostre um clipe, escreva o que quiser…"
          className={estiloCampo}
        />
      </label>

      {anexos.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Arquivos do post">
          {anexos.map((a) => (
            <li key={a.url} className="flex items-center gap-1.5 rounded-[3px] border border-line px-2 py-1">
              {a.video ? (
                <span className="font-mono text-[10px] text-[#D6D6E0]">
                  🎞 vídeo{a.duracaoSegundos !== null ? ` · ${formatarSegundos(a.duracaoSegundos)}` : ''}
                </span>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.url} alt="" className="h-8 w-8 object-cover" />
              )}
              <button
                type="button"
                aria-label={a.video ? 'Tirar o vídeo' : 'Tirar a imagem'}
                onClick={() => setAnexos(anexos.filter((x) => x.url !== a.url))}
                className="font-mono text-[10px] text-dim hover:text-alerta"
              >
                tirar
              </button>
            </li>
          ))}
        </ul>
      )}

      {!cheio && (
        <div className="flex flex-wrap gap-2">
          <EnviarArquivo
            tipo="imagem"
            rotulo="+ IMAGEM"
            aoConcluir={(a) => setAnexos((atual) => [...atual, { url: a.url, video: false, duracaoSegundos: null }])}
          />
          {!temVideo && (
            <EnviarArquivo
              tipo="video-perfil"
              rotulo={`+ VÍDEO (ATÉ ${formatarSegundos(VIDEO_PERFIL_MAX_SEGUNDOS)})`}
              aoConcluir={(a) => setAnexos((atual) => [...atual, { url: a.url, video: true, duracaoSegundos: a.duracaoSegundos }])}
            />
          )}
        </div>
      )}

      {erro && <p role="alert" className="font-mono text-[10px] text-alerta">{erro}</p>}

      <button
        type="submit"
        disabled={ocupado || vazio || [...texto].length > POST_TEXTO_MAX}
        className="rounded-[3px] border-2 border-alter-green bg-ego-escuro px-4 py-1.5 font-mono text-[11px] tracking-[.1em] text-[#D6D6E0] hover:bg-alter-green hover:text-[#08090D] disabled:opacity-50"
      >
        {ocupado ? 'Publicando…' : 'Publicar'}
      </button>
    </form>
  );
}

/**
 * Blog do perfil: lista de posts (texto + imagens/vídeo). O dono vê o
 * formulário de novo post; dono e ADM podem apagar. Os emojis são os do dono
 * do perfil, então funcionam aqui dentro como na descrição.
 */
export function BlogDoPerfil({
  posts, emojis = [], aoPublicar, aoApagar,
}: {
  posts: PostExibido[];
  emojis?: EmojiPerfil[];
  /** Só o dono do perfil recebe. */
  aoPublicar?: (dados: { texto: string; anexos: AnexoEnviado[] }) => Acao<number>;
  /** Dono e ADM recebem. */
  aoApagar?: (id: number) => Acao;
}) {
  const [erro, setErro] = useState<string | null>(null);

  async function apagar(id: number) {
    setErro(null);
    try {
      await desembrulhar(aoApagar!(id));
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não deu para apagar.'));
    }
  }

  if (posts.length === 0 && !aoPublicar) return null;

  return (
    <section className="mt-6" aria-label="Blog">
      <h2 className="mb-2 font-mono text-[10px] tracking-[.14em] text-dim">
        BLOG{posts.length > 0 && ` (${posts.length})`}
      </h2>
      {aoPublicar && <Escrever aoPublicar={aoPublicar} />}
      {aoPublicar && posts.length >= POSTS_MAX_POR_PESSOA && (
        <p className="mb-2 text-[11px] text-dim">Limite de {POSTS_MAX_POR_PESSOA} posts — apague algum pra publicar outro.</p>
      )}
      {erro && <p role="alert" className="mb-2 font-mono text-[10px] text-alerta">{erro}</p>}
      <ul className="space-y-3">
        {posts.map((p) => (
          <li key={p.id} className="space-y-2 rounded-[3px] border border-line bg-sur p-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-mono text-[9px] text-dim">{p.quando}</span>
              {aoApagar && (
                <button
                  type="button"
                  onClick={() => apagar(p.id)}
                  aria-label="Apagar post"
                  className="font-mono text-[10px] text-dim hover:text-alerta"
                >
                  apagar
                </button>
              )}
            </div>
            {p.texto && (
              <p className="whitespace-pre-line break-words text-[13px] leading-relaxed text-[#D6D6E0]">
                <TextoComEmojis texto={p.texto} emojis={emojis} />
              </p>
            )}
            {p.anexos.length > 0 && (
              <div className="space-y-2">
                {p.anexos.map((a) => <Anexo key={a.url} a={a} />)}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
