'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { JanelaEgo } from './JanelaEgo';
import { usePersistencia } from './usePersistencia';
import { buscar, type Resultado } from '@/lib/busca';
import type { EstadoEgo } from '@/lib/alter-ego';

const SECOES = [
  { numero: '01', nome: 'Elenco', url: '/elenco/' },
  { numero: '02', nome: 'Itens', url: '/itens/' },
  { numero: '03', nome: 'Mapa', url: '/mapa/' },
  { numero: '04', nome: 'Mecânicas', url: '/mecanicas/' },
  { numero: '05', nome: 'Eventos', url: '/eventos/' },
  { numero: '06', nome: 'Códigos', url: '/codigos/' },
  { numero: '07', nome: 'FAQ', url: '/faq/' },
  { numero: '08', nome: 'Começar', url: '/comecar/' },
];

export function BarraEgo() {
  const [termo, setTermo] = useState('');
  const [barraVisivel, setBarraVisivel] = useState(true);
  const [flutuanteAberta, setFlutuanteAberta] = usePersistencia('ego-flutuante-aberta', false);
  const alvo = useRef<HTMLDivElement>(null);

  // A busca é derivada do termo: calcular no render evita um segundo render
  // a cada tecla.
  const resultados: Resultado[] = useMemo(() => buscar(termo), [termo]);

  // A barra "sai de cena" quando o topo da página some.
  useEffect(() => {
    const el = alvo.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(([e]) => setBarraVisivel(e.isIntersecting));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const estado: EstadoEgo =
    termo.length < 2 ? 'ocioso'
    : resultados.length > 0 ? 'busca-com-resultado'
    : 'busca-sem-resultado';

  function Busca({ id }: { id: string }) {
    return (
      <div className="relative flex-1">
        <input
          id={id}
          type="search"
          role="searchbox"
          aria-label="Buscar no Shuichi Pull"
          placeholder="buscar item, local, personagem…"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          className="w-full rounded-[3px] border border-cyber-cyan/40 bg-[#0A0A10] px-2 py-1.5 font-mono text-[10px] uppercase tracking-[.08em] text-[#D6D6E0] placeholder:text-dim focus:border-cyber-cyan focus:outline-none"
        />
        {termo.length >= 2 && (
          <ul className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-[3px] border border-cyber-cyan/20 bg-sur">
            {resultados.length === 0 ? (
              <li className="px-2 py-2 text-[10px] text-dim">Não achei nada... tenta outro nome?</li>
            ) : (
              resultados.map((r) => (
                <li key={r.id}>
                  <Link href={r.url} className="block px-2 py-1.5 hover:bg-cyber-cyan/10">
                    <span className="block text-[11px] text-[#D6D6E0]">{r.titulo}</span>
                    <span className="block font-mono text-[8px] text-dim">{r.subtitulo}</span>
                  </Link>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    );
  }

  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (barraVisivel) {
          document.getElementById('busca-header')?.focus();
          return;
        }
        if (!flutuanteAberta) setFlutuanteAberta(true);
        // A janela flutuante só existe no DOM depois do próximo render —
        // requestAnimationFrame garante que já montou antes de focar.
        requestAnimationFrame(() => document.getElementById('busca-flutuante')?.focus());
      }
    }
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [barraVisivel, flutuanteAberta, setFlutuanteAberta]);

  return (
    <>
      <div ref={alvo} aria-hidden className="h-px" />

      <header className="sticky top-0 z-40 flex items-center gap-2 border-b-2 border-cyber-cyan/40 bg-[#0A0A0D] px-2 py-1.5">
        <div className="w-[52px] shrink-0">
          <JanelaEgo estado={estado} variaveis={{ n: resultados.length }} compacta />
        </div>
        <Busca id="busca-header" />
        <nav className="hidden gap-3 sm:flex">
          {SECOES.map((s) => (
            <Link key={s.url} href={s.url}
              className="group relative font-mono text-[9px] tracking-[.12em] text-dim hover:text-cyber-cyan">
              {s.numero}. {s.nome.toUpperCase()}
              <svg data-testid="reticula" aria-hidden viewBox="0 0 24 24"
                className="pointer-events-none absolute -right-3 -top-2 h-3 w-3 animate-spin-slow opacity-0 text-execution-pink group-hover:opacity-100">
                <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1" />
                <line x1="12" y1="0" x2="12" y2="6" stroke="currentColor" strokeWidth="1" />
                <line x1="12" y1="18" x2="12" y2="24" stroke="currentColor" strokeWidth="1" />
                <line x1="0" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="1" />
                <line x1="18" y1="12" x2="24" y2="12" stroke="currentColor" strokeWidth="1" />
              </svg>
            </Link>
          ))}
        </nav>
      </header>

      {!barraVisivel && !flutuanteAberta && (
        <button
          type="button"
          aria-label="Abrir a janela do Alter Ego"
          onClick={() => setFlutuanteAberta(true)}
          className="fixed bottom-5 right-5 z-50 h-11 w-11 overflow-hidden rounded-full border-2 border-[#6f9a58] shadow-lg"
        >
          <JanelaEgo estado="ocioso" compacta />
        </button>
      )}

      {flutuanteAberta && (
        <div data-testid="ego-flutuante" className="fixed bottom-5 right-5 z-50 w-40 shadow-2xl">
          <JanelaEgo
            estado={estado}
            variaveis={{ n: resultados.length }}
            onFechar={() => setFlutuanteAberta(false)}
          />
          <div className="mt-1"><Busca id="busca-flutuante" /></div>
        </div>
      )}
    </>
  );
}
