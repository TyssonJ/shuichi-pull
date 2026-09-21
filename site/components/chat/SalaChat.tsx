'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { EnviarArquivo } from '@/components/midia/EnviarArquivo';
import { MensagemChat, type MensagemTela } from './MensagemChat';
import { desembrulhar, mensagemDeErro, type Acao } from '@/lib/acao-cliente';
import {
  CHAT_TEXTO_MAX, INTERVALO_CONSULTA_MS, janelaVisivelMs, juntarMensagens, sugerirMencoes, type PersonagemChat,
} from '@/lib/chat';
import { CHAT_VIDEO_MAX_SEGUNDOS, formatarSegundos } from '@/lib/midia';

export type AnexoParaEnviar = { url: string; video: boolean; duracaoSegundos: number | null };

type Consulta = { online: number; ids: number[]; mensagens: MensagemTela[]; erro?: string };

/**
 * Uma sala aberta: consulta o servidor de poucos em poucos segundos (Vercel
 * não tem websocket), mostra o histórico da janela e deixa escrever. Quem usa
 * remonta com `key={sala}` ao trocar de sala, então o estado nasce limpo.
 */
export function SalaChat({
  sala, eu, ehAdm, personagens, aoEnviar, aoApagar,
}: {
  sala: string;
  /** Discord id de quem está logado. */
  eu: string;
  ehAdm: boolean;
  personagens: PersonagemChat[];
  aoEnviar: (dados: { sala: string; texto: string; anexo: AnexoParaEnviar | null }) => Acao<number>;
  aoApagar: (mensagemId: number) => Acao;
}) {
  const [mensagens, setMensagens] = useState<MensagemTela[]>([]);
  const [online, setOnline] = useState<number | null>(null);
  const [carregado, setCarregado] = useState(false);
  const [erroConexao, setErroConexao] = useState<string | null>(null);
  const [cutucada, setCutucada] = useState(0);
  const [texto, setTexto] = useState('');
  const [cursor, setCursor] = useState(0);
  const [anexo, setAnexo] = useState<AnexoParaEnviar | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);

  const ultimoId = useRef<number | undefined>(undefined);
  const lista = useRef<HTMLUListElement>(null);
  const noFim = useRef(true);
  const campo = useRef<HTMLTextAreaElement>(null);

  const porId = useMemo(() => new Map(personagens.map((p) => [p.id, p])), [personagens]);
  const sugestao = sugerirMencoes(texto, cursor, personagens);

  useEffect(() => {
    let vivo = true;
    let emVoo = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function consultar() {
      // Aba em segundo plano não gasta consulta nem bateria: só espera a vez.
      if (document.visibilityState !== 'hidden') {
        emVoo = true;
        try {
          const depois = ultimoId.current;
          const r = await fetch(`/api/chat/?sala=${encodeURIComponent(sala)}${depois ? `&depois=${depois}` : ''}`, { cache: 'no-store' });
          if (!vivo) return;
          const j = (await r.json().catch(() => null)) as Consulta | null;
          if (!r.ok || !j) {
            setErroConexao(j?.erro ?? 'Não deu pra carregar o chat.');
            // Sem login ou sem acesso a essa sala: insistir não adianta.
            if (r.status === 401 || r.status === 403) return;
          } else {
            setErroConexao(null);
            setOnline(j.online);
            setCarregado(true);
            setMensagens((atual) => juntarMensagens(atual, j.mensagens, j.ids, { desdeMs: Date.now() - janelaVisivelMs(ehAdm) }));
            for (const m of j.mensagens) ultimoId.current = Math.max(ultimoId.current ?? 0, m.id);
          }
        } catch {
          if (vivo) setErroConexao('Sem conexão. Tentando de novo…');
        } finally {
          emVoo = false;
        }
      }
      if (vivo) timer = setTimeout(consultar, INTERVALO_CONSULTA_MS);
    }

    // Quem volta pra aba vê o chat atualizado na hora, sem esperar o próximo ciclo.
    function aoVoltar() {
      if (document.visibilityState !== 'visible' || emVoo || !vivo) return;
      if (timer) clearTimeout(timer);
      void consultar();
    }

    void consultar();
    document.addEventListener('visibilitychange', aoVoltar);
    return () => {
      vivo = false;
      document.removeEventListener('visibilitychange', aoVoltar);
      if (timer) clearTimeout(timer);
    };
  }, [sala, ehAdm, cutucada]);

  // Mensagem nova rola a conversa pro fim — mas só se a pessoa já estava lá
  // embaixo; quem subiu pra reler não é puxado de volta.
  useEffect(() => {
    const el = lista.current;
    if (el && noFim.current) el.scrollTop = el.scrollHeight;
  }, [mensagens]);

  function aoRolar() {
    const el = lista.current;
    if (el) noFim.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
  }

  async function enviar() {
    if (enviando || (texto.trim().length === 0 && !anexo)) return;
    setErroEnvio(null);
    setEnviando(true);
    try {
      await desembrulhar(aoEnviar({ sala, texto, anexo }));
      setTexto('');
      setCursor(0);
      setAnexo(null);
      noFim.current = true;
      setCutucada((n) => n + 1); // consulta já, sem esperar o próximo ciclo
    } catch (e) {
      setErroEnvio(mensagemDeErro(e, 'Não deu pra enviar. Tenta de novo?'));
    } finally {
      setEnviando(false);
    }
  }

  async function apagar(id: number) {
    try {
      await desembrulhar(aoApagar(id));
      setMensagens((atual) => atual.filter((m) => m.id !== id));
    } catch (e) {
      setErroEnvio(mensagemDeErro(e, 'Não deu pra apagar.'));
    }
  }

  function escolherMencao(p: PersonagemChat) {
    if (!sugestao) return;
    const antes = texto.slice(0, sugestao.inicio);
    const depois = texto.slice(cursor);
    const novo = `${antes}@${p.id} ${depois}`;
    setTexto(novo);
    const pos = antes.length + p.id.length + 2;
    setCursor(pos);
    setTimeout(() => {
      campo.current?.focus();
      campo.current?.setSelectionRange(pos, pos);
    }, 0);
  }

  const janelaTexto = ehAdm ? '24 h' : '4 h';

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <p className="border-b border-line px-3 py-1 font-mono text-[9px] tracking-[.1em] text-dim">
        <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-alter-green align-middle" aria-hidden />
        {online === null ? 'conectando…' : `${online} online aqui`} · histórico de {janelaTexto}
      </p>

      {erroConexao && <p role="alert" className="border-b border-alerta/40 bg-alerta/10 px-3 py-1 font-mono text-[10px] text-alerta">{erroConexao}</p>}

      <ul ref={lista} onScroll={aoRolar} aria-label="Mensagens" aria-live="polite" className="min-h-0 flex-1 overflow-y-auto py-1">
        {carregado && mensagens.length === 0 && (
          <li className="px-3 py-6 text-center text-[12px] text-dim">Nada por aqui nas últimas {janelaTexto}. Manda o primeiro recado!</li>
        )}
        {mensagens.map((m) => (
          <MensagemChat key={m.id} m={m} personagens={porId} podeApagar={ehAdm || m.autorId === eu} aoApagar={apagar} />
        ))}
      </ul>

      <div className="relative border-t border-line p-2">
        {sugestao && sugestao.opcoes.length > 0 && (
          <ul role="listbox" aria-label="Personagens" className="absolute inset-x-2 bottom-full z-10 mb-1 max-h-40 overflow-y-auto rounded-[3px] border border-line bg-sur">
            {sugestao.opcoes.map((p) => (
              <li key={p.id} role="option" aria-selected={false}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => escolherMencao(p)}
                  className="flex w-full items-center gap-2 px-2 py-1.5 text-left text-[12px] hover:bg-white/5"
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: p.cor }} aria-hidden />
                  <span style={{ color: p.cor }} className="font-bold">{p.nome}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {anexo && (
          <p className="mb-1 flex items-center gap-2 font-mono text-[10px] text-[#D6D6E0]">
            {anexo.video ? `🎞 vídeo${anexo.duracaoSegundos !== null ? ` · ${formatarSegundos(anexo.duracaoSegundos)}` : ''}` : '🖼 imagem'} pronta
            <button type="button" onClick={() => setAnexo(null)} className="text-dim hover:text-alerta">tirar</button>
          </p>
        )}
        {erroEnvio && <p role="alert" className="mb-1 font-mono text-[10px] text-alerta">{erroEnvio}</p>}

        <textarea
          ref={campo}
          value={texto}
          onChange={(e) => { setTexto(e.target.value); setCursor(e.target.selectionStart); }}
          onSelect={(e) => setCursor(e.currentTarget.selectionStart)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              void enviar();
            }
          }}
          rows={2}
          maxLength={CHAT_TEXTO_MAX}
          aria-label="Escrever mensagem"
          placeholder="Escreva… (@ menciona um personagem)"
          className="w-full resize-none rounded-[3px] border border-line bg-[#141419] px-2 py-1.5 text-[13px] text-[#D6D6E0] placeholder:text-dim/60 focus:border-alter-green focus:outline-none"
        />
        <div className="mt-1 flex items-center gap-2">
          {!anexo && (
            <>
              <EnviarArquivo tipo="imagem" rotulo="🖼" aoConcluir={(a) => setAnexo({ url: a.url, video: false, duracaoSegundos: null })} />
              <EnviarArquivo
                tipo="chat-video" rotulo={`🎞 ≤${formatarSegundos(CHAT_VIDEO_MAX_SEGUNDOS)}`}
                aoConcluir={(a) => setAnexo({ url: a.url, video: true, duracaoSegundos: a.duracaoSegundos })}
              />
            </>
          )}
          <button
            type="button"
            onClick={() => void enviar()}
            disabled={enviando || (texto.trim().length === 0 && !anexo)}
            className="ml-auto rounded-[3px] border-2 border-alter-green px-3 py-1 font-mono text-[11px] tracking-[.1em] text-alter-green hover:bg-alter-green hover:text-[#08090D] disabled:opacity-40"
          >
            {enviando ? '…' : 'ENVIAR'}
          </button>
        </div>
      </div>
    </div>
  );
}
