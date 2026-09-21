'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { SalaChat } from './SalaChat';
import { apagarMensagemAction, enviarMensagemAction } from '@/app/chat/acoes';
import { EVENTO_ABRIR_CHAT, SALA_GERAL, type PersonagemChat } from '@/lib/chat';
import { aoFicarOcioso } from '@/lib/ocioso';

type SalaInfo = { id: string; nome: string };
type Info = { eu: string; ehAdm: boolean; salas: SalaInfo[] };

/**
 * Chat do Alter Ego: botão fixo no canto (só pra quem está logado) que abre um
 * painel com a sala geral e as salas das partidas em que a pessoa está. No
 * celular o painel ocupa a tela toda.
 */
export function ChatFlutuante() {
  const pathname = usePathname() ?? '/';
  const [info, setInfo] = useState<Info | null>(null);
  const [aberto, setAberto] = useState(false);
  const [sala, setSala] = useState(SALA_GERAL);
  const [personagens, setPersonagens] = useState<PersonagemChat[]>([]);

  const carregarSalas = useCallback(async () => {
    try {
      const r = await fetch('/api/chat/salas/', { cache: 'no-store' });
      // 401 = ninguém logado: o botão simplesmente não existe.
      if (r.ok) setInfo((await r.json()) as Info);
      else setInfo(null);
    } catch {
      // Sem rede: o botão fica como estava.
    }
  }, []);

  // Nao compete com o carregamento da pagina: espera o navegador ficar ocioso.
  useEffect(() => aoFicarOcioso(() => void carregarSalas()), [carregarSalas]);

  const abrir = useCallback((salaPedida?: string) => {
    if (salaPedida) setSala(salaPedida);
    setAberto(true);
    void carregarSalas();
    void fetch('/api/chat/personagens/').then((r) => (r.ok ? r.json() : null)).then((j) => {
      if (j?.personagens) setPersonagens(j.personagens as PersonagemChat[]);
    }).catch(() => {});
  }, [carregarSalas]);

  useEffect(() => {
    function aoPedir(e: Event) {
      abrir((e as CustomEvent<{ sala?: string }>).detail?.sala);
    }
    window.addEventListener(EVENTO_ABRIR_CHAT, aoPedir);
    return () => window.removeEventListener(EVENTO_ABRIR_CHAT, aoPedir);
  }, [abrir]);

  useEffect(() => {
    if (!aberto) return;
    const fechar = (e: KeyboardEvent) => { if (e.key === 'Escape') setAberto(false); };
    window.addEventListener('keydown', fechar);
    return () => window.removeEventListener('keydown', fechar);
  }, [aberto]);

  // O painel do ADM tem o próprio layout cheio; o chat fica fora dele.
  if (!info || pathname.startsWith('/adm')) return null;

  // A sala pode ter sumido (partida terminou): volta pra geral.
  const salaAtiva = info.salas.some((s) => s.id === sala) ? sala : SALA_GERAL;

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => abrir()}
        aria-label="Abrir o chat"
        className="fixed bottom-5 left-5 z-50 rounded-[3px] border-2 border-alter-green bg-[#0A0A0D] px-3 py-2 font-mono text-[11px] font-bold tracking-[.1em] text-alter-green shadow-lg hover:bg-alter-green hover:text-[#08090D]"
      >
        💬 CHAT
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-label="Chat do Alter Ego"
      className="fixed inset-0 z-[60] flex h-dvh flex-col bg-[#0E0E13] sm:inset-auto sm:bottom-5 sm:left-5 sm:h-[34rem] sm:w-[24rem] sm:rounded-[4px] sm:border-2 sm:border-alter-green sm:shadow-2xl"
    >
      <div className="flex items-center justify-between border-b border-line px-3 py-2">
        <p className="font-mono text-[10px] tracking-[.14em] text-alter-green">ALTER_EGO // CHAT</p>
        <button
          type="button"
          onClick={() => setAberto(false)}
          aria-label="Fechar o chat"
          className="rounded-[2px] border border-line px-2 py-0.5 font-mono text-[12px] text-dim hover:border-alter-green hover:text-alter-green"
        >
          ✕
        </button>
      </div>

      {info.salas.length > 1 && (
        <div role="tablist" aria-label="Salas" className="flex gap-1 overflow-x-auto border-b border-line px-2 py-1.5">
          {info.salas.map((s) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={salaAtiva === s.id}
              onClick={() => setSala(s.id)}
              className={`max-w-[10rem] shrink-0 truncate border-2 px-2.5 py-1 font-mono text-[10px] tracking-[.08em] ${
                salaAtiva === s.id ? 'border-alter-green bg-alter-green text-[#08090D]' : 'border-line text-dim hover:border-alter-green hover:text-alter-green'
              }`}
            >
              {s.id === SALA_GERAL ? s.nome : `🎮 ${s.nome}`}
            </button>
          ))}
        </div>
      )}

      <SalaChat
        key={salaAtiva}
        sala={salaAtiva}
        eu={info.eu}
        ehAdm={info.ehAdm}
        personagens={personagens}
        aoEnviar={enviarMensagemAction}
        aoApagar={apagarMensagemAction}
      />
    </div>
  );
}
