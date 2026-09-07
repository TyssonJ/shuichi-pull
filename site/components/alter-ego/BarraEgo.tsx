'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { JanelaEgo } from './JanelaEgo';
import { usePersistencia } from './usePersistencia';
import { buscar, type Resultado } from '@/lib/busca';
import {
  falaDaSecao, kaomojiDaSecao, secaoDoCaminho, type EstadoEgo,
} from '@/lib/alter-ego';

const SECOES = [
  { nome: 'Começar', url: '/comecar/' },
  { nome: 'Elenco', url: '/elenco/' },
  { nome: 'Itens', url: '/itens/' },
  { nome: 'Mapa', url: '/mapa/' },
  { nome: 'Mecânicas', url: '/mecanicas/' },
  { nome: 'Eventos', url: '/eventos/' },
  { nome: 'Códigos', url: '/codigos/' },
  { nome: 'FAQ', url: '/faq/' },
];

/** De quanto em quanto tempo ele arrisca um novo comentário na mesma página. */
const INTERVALO_FALA = 2 * 60 * 1000;

export function BarraEgo() {
  const [termo, setTermo] = useState('');
  const [barraVisivel, setBarraVisivel] = useState(true);
  const [flutuanteAberta, setFlutuanteAberta] = usePersistencia('ego-flutuante-aberta', false);
  const [falaPagina, setFalaPagina] = useState<string | null>(null);
  const [temAlgoADizer, setTemAlgoADizer] = useState(false);
  const alvo = useRef<HTMLDivElement>(null);

  const secao = secaoDoCaminho(usePathname() ?? '/');

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

  // O sorteio roda só no cliente: sortear durante o render do servidor daria
  // uma fala no HTML e outra na hidratação.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFalaPagina(falaDaSecao(secao));
    setTemAlgoADizer(true);
    const timer = setInterval(() => {
      setFalaPagina(falaDaSecao(secao));
      setTemAlgoADizer(true);
    }, INTERVALO_FALA);
    return () => clearInterval(timer);
  }, [secao]);

  // Quem abriu a janela já ouviu o que ele tinha para dizer.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (flutuanteAberta) setTemAlgoADizer(false);
  }, [flutuanteAberta]);

  const estado: EstadoEgo =
    termo.length < 2 ? 'ocioso'
    : resultados.length > 0 ? 'busca-com-resultado'
    : 'busca-sem-resultado';

  // Enquanto se busca, o que importa é o resultado — o comentário da página
  // só aparece quando ele não tem nada mais útil a dizer.
  const fala = estado === 'ocioso' ? falaPagina ?? undefined : undefined;

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

      {/* Escondido, o cabeçalho sai da rota do teclado com `inert` — senão o
          foco continuaria entrando numa barra que ninguém enxerga. */}
      <header
        inert={!barraVisivel}
        className={`sticky top-0 z-40 flex items-center gap-2 border-b-2 border-teal-escuro bg-[#0A0A0D] px-2 py-1.5 transition-all duration-200 ${
          barraVisivel ? '' : 'pointer-events-none -translate-y-full opacity-0'
        }`}
      >
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
          data-testid="ego-bolinha"
          data-tremendo={temAlgoADizer ? 'sim' : 'nao'}
          aria-label="Abrir a janela do Alter Ego"
          onClick={() => setFlutuanteAberta(true)}
          className="fixed bottom-5 right-5 z-50 flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#6f9a58] bg-gradient-to-b from-ego-claro to-ego-escuro text-[11px] leading-none text-[#F2FFE8] shadow-lg [text-shadow:0_0_9px_#b6ff7e] data-[tremendo=sim]:animate-tremor"
        >
          {kaomojiDaSecao(secao)}
        </button>
      )}

      {flutuanteAberta && (
        <div data-testid="ego-flutuante" className="fixed bottom-5 right-5 z-50 w-40 shadow-2xl">
          <JanelaEgo
            estado={estado}
            variaveis={{ n: resultados.length }}
            fala={fala}
            onFechar={() => setFlutuanteAberta(false)}
          />
          <div className="mt-1">{busca}</div>
        </div>
      )}
    </>
  );
}
