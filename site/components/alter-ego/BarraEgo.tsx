'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { JanelaEgo } from './JanelaEgo';
import { usePersistencia } from './usePersistencia';
import { useLogAlterEgo } from './useLogAlterEgo';
import { buscar, type Resultado } from '@/lib/busca';
import {
  falaDaSecao, kaomojiDaSecao, secaoDoCaminho, type EstadoEgo,
} from '@/lib/alter-ego';
import { SECOES } from '@/lib/secoes';

function Busca({
  id,
  termo,
  resultados,
  setTermo,
  emFoco = false,
  aoFocar,
  aoDesfocar,
}: {
  id: string;
  termo: string;
  resultados: Resultado[];
  setTermo: (termo: string) => void;
  emFoco?: boolean;
  aoFocar?: () => void;
  aoDesfocar?: () => void;
}) {
  return (
    <div className="relative flex-1">
      <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 font-mono text-[10px] text-cyber-cyan">
        &gt;
      </span>
      <input
        id={id}
        type="search"
        role="searchbox"
        aria-label="Buscar no Shuichi Pull"
        placeholder={emFoco ? 'digite pra consultar os registros…' : 'buscar item, local, personagem…'}
        value={termo}
        onChange={(e) => setTermo(e.target.value)}
        onFocus={aoFocar}
        onBlur={aoDesfocar}
        className="w-full rounded-[3px] border border-cyber-cyan/40 bg-[#0A0A10] py-1.5 pl-6 pr-2 font-mono text-[10px] uppercase tracking-[.08em] text-[#D6D6E0] placeholder:text-dim focus:border-cyber-cyan focus:outline-none"
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

/** De quanto em quanto tempo ele arrisca um novo comentário na mesma página. */
const INTERVALO_FALA = 2 * 60 * 1000;

export function BarraEgo() {
  const pathname = usePathname();
  const [termo, setTermo] = useState('');
  const [barraVisivel, setBarraVisivel] = useState(true);
  const [flutuanteAberta, setFlutuanteAberta] = usePersistencia('ego-flutuante-aberta', false);
  const [falaPagina, setFalaPagina] = useState<string | null>(null);
  const [temAlgoADizer, setTemAlgoADizer] = useState(false);
  const alvo = useRef<HTMLDivElement>(null);
  const [buscaEmFoco, setBuscaEmFoco] = useState(false);
  const { tag: logTag, texto: logTexto } = useLogAlterEgo();
  // Marca que o Ctrl+K pediu pra abrir a janela flutuante e focar a busca
  // dela assim que ela existir no DOM — ver o useEffect logo abaixo do
  // handler de teclado.
  const focarFlutuanteRef = useRef(false);

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

  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (barraVisivel) {
          document.getElementById('busca-header')?.focus();
          return;
        }
        if (flutuanteAberta) {
          document.getElementById('busca-flutuante')?.focus();
        } else {
          // A janela flutuante só existe no DOM depois que o React montar
          // o próximo render — o useEffect abaixo (que roda só depois que
          // o DOM já foi atualizado) faz o foco de verdade, sem depender
          // de nenhum timer real.
          focarFlutuanteRef.current = true;
          setFlutuanteAberta(true);
        }
      }
    }
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [barraVisivel, flutuanteAberta, setFlutuanteAberta]);

  // Termina o pedido de foco do Ctrl+K assim que a janela flutuante
  // realmente existe no DOM — useEffect só roda depois que o React já
  // aplicou a mudança, então não há corrida como havia com
  // requestAnimationFrame (que podia disparar antes do commit).
  useEffect(() => {
    if (flutuanteAberta && focarFlutuanteRef.current) {
      focarFlutuanteRef.current = false;
      document.getElementById('busca-flutuante')?.focus();
    }
  }, [flutuanteAberta]);

  return (
    <>
      <div ref={alvo} aria-hidden className="h-px" />

      {/* Escondido, o cabeçalho sai da rota do teclado com `inert` — senão o
          foco continuaria entrando numa barra que ninguém enxerga. */}
      <header
        inert={!barraVisivel}
        className={`sticky top-0 z-40 border-b-2 border-cyber-cyan/40 bg-[#0A0A0D] px-2 py-1.5 transition-all duration-200 ${
          barraVisivel ? '' : 'pointer-events-none -translate-y-full opacity-0'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex shrink-0 flex-col items-center gap-1">
            <div className="w-[52px] overflow-hidden rounded-[4px] border border-alter-green shadow-[0_0_8px_rgba(0,255,102,0.35)]">
              <JanelaEgo estado={estado} variaveis={{ n: resultados.length }} compacta />
            </div>
            <p className="flex items-center gap-1 font-mono text-[6px] tracking-[.1em] text-alter-green">
              <span className="h-1 w-1 animate-pulse rounded-full bg-alter-green" aria-hidden />
              CORE: ONLINE
            </p>
          </div>

          <div className="flex-1">
            <Busca
              id="busca-header" termo={termo} resultados={resultados} setTermo={setTermo}
              emFoco={buscaEmFoco} aoFocar={() => setBuscaEmFoco(true)} aoDesfocar={() => setBuscaEmFoco(false)}
            />
            {!buscaEmFoco && (
              <p data-testid="log-alterego" className="mt-1 truncate font-mono text-[8px] tracking-[.02em]">
                <span className="text-alter-green">[{logTag}]</span>{' '}
                <span className="text-dim">{logTexto}</span>
              </p>
            )}
          </div>

          <nav aria-label="Navegação principal" className="hidden flex-wrap gap-1.5 sm:flex">
            {SECOES.map((s) => {
              const ativa = pathname?.startsWith(s.url);
              return (
                <Link
                  key={s.url}
                  href={s.url}
                  aria-current={ativa ? 'page' : undefined}
                  className={`group relative rounded-[2px] border px-1.5 py-0.5 font-mono text-[8px] tracking-[.08em] ${
                    ativa
                      ? 'border-execution-pink text-execution-pink'
                      : 'border-execution-pink/30 text-dim hover:text-execution-pink'
                  }`}
                >
                  {s.numero} {'//'} {s.nome.toUpperCase()}
                  <svg data-testid="reticula" aria-hidden viewBox="0 0 24 24"
                    className="pointer-events-none absolute -right-2 -top-1.5 h-2.5 w-2.5 opacity-0 text-execution-pink transition-opacity group-hover:opacity-100 group-hover:animate-spin-slow">
                    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1" />
                    <line x1="12" y1="0" x2="12" y2="6" stroke="currentColor" strokeWidth="1" />
                    <line x1="12" y1="18" x2="12" y2="24" stroke="currentColor" strokeWidth="1" />
                    <line x1="0" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="1" />
                    <line x1="18" y1="12" x2="24" y2="12" stroke="currentColor" strokeWidth="1" />
                  </svg>
                </Link>
              );
            })}
          </nav>
        </div>
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
          <div className="mt-1">
            <Busca id="busca-flutuante" termo={termo} resultados={resultados} setTermo={setTermo} />
          </div>
        </div>
      )}
    </>
  );
}
