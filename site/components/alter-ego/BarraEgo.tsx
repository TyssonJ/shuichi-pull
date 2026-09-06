'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { JanelaEgo } from './JanelaEgo';
import { usePersistencia } from './usePersistencia';
import { buscar, type Resultado } from '@/lib/busca';
import type { EstadoEgo } from '@/lib/alter-ego';

const SECOES = [
  { nome: 'Começar', url: '/comecar/' },
  { nome: 'Elenco', url: '/elenco/' },
  { nome: 'Itens', url: '/itens/' },
  { nome: 'Mapa', url: '/mapa/' },
  { nome: 'Mecânicas', url: '/mecanicas/' },
  { nome: 'FAQ', url: '/faq/' },
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

  const busca = (
    <div className="relative flex-1">
      <input
        type="search"
        role="searchbox"
        aria-label="Buscar no Shuichi Pull"
        placeholder="buscar item, local, personagem…"
        value={termo}
        onChange={(e) => setTermo(e.target.value)}
        className="w-full rounded-[3px] border border-[#2E2E3A] bg-[#141419] px-2 py-1.5 font-mono text-[10px] text-[#D6D6E0] placeholder:text-[#6E6E7E]"
      />
      {termo.length >= 2 && (
        <ul className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-[3px] border border-line bg-sur">
          {resultados.length === 0 ? (
            <li className="px-2 py-2 text-[10px] text-dim">Não achei nada... tenta outro nome?</li>
          ) : (
            resultados.map((r) => (
              <li key={r.id}>
                <Link href={r.url} className="block px-2 py-1.5 hover:bg-[#22222C]">
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

  return (
    <>
      <div ref={alvo} aria-hidden className="h-px" />

      <header className="sticky top-0 z-40 flex items-center gap-2 border-b-2 border-teal-escuro bg-[#0A0A0D] px-2 py-1.5">
        <div className="w-[52px] shrink-0">
          <JanelaEgo estado={estado} variaveis={{ n: resultados.length }} compacta />
        </div>
        {busca}
        <nav className="hidden gap-3 sm:flex">
          {SECOES.map((s) => (
            <Link key={s.url} href={s.url}
              className="font-mono text-[9px] tracking-[.12em] text-[#B9C9C6] hover:text-teal">
              {s.nome.toUpperCase()}
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
          <div className="mt-1">{busca}</div>
        </div>
      )}
    </>
  );
}
