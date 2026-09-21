import Link from 'next/link';
import { corLegivel } from '@/lib/chat';
import { formatarDataBR } from '@/lib/fuso';
import type { PerfilDoBot } from '@/lib/junko/estatisticas-bot';

const numero = (n: number) => n.toLocaleString('pt-BR');

function Tile({ valor, rotulo, cor }: { valor: string; rotulo: string; cor: string }) {
  return (
    <div className="clip-dossier-card border border-line bg-[#0E0E13] p-2.5 text-center">
      <p className="font-mono text-2xl font-black leading-none" style={{ color: cor }}>{valor}</p>
      <p className="mt-1 font-mono text-[8px] uppercase tracking-[.1em] text-dim">{rotulo}</p>
    </div>
  );
}

/**
 * O que o Junko Bot sabe da pessoa: economia (JCoins, resgate diário), o título
 * que ela equipou e os números das partidas contadas no Discord. Fica separado
 * das estatísticas do site porque são fontes diferentes.
 */
export function CartaoJunko({ perfil }: { perfil: PerfilDoBot }) {
  const cor = perfil.corTitulo ? corLegivel(perfil.corTitulo) : '#D6D6E0';
  return (
    <section className="mt-6" aria-label="Junko Bot">
      <h2 className="mb-2 font-mono text-[10px] tracking-[.14em] text-dim">
        JUNKO BOT — ECONOMIA E PARTIDAS NO DISCORD
      </h2>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        <Tile valor={numero(perfil.jcoins)} rotulo="JCoins" cor="#F5D30E" />
        <Tile valor={numero(perfil.partidas)} rotulo="Partidas" cor="#D6D6E0" />
        <Tile valor={numero(perfil.vitorias)} rotulo="Vitórias" cor="#00FF66" />
        <Tile valor={numero(perfil.mvps)} rotulo="MVPs" cor="#F5D30E" />
        <Tile valor={numero(perfil.sequenciaDiaria)} rotulo="Sequência diária" cor="#00F0FF" />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] text-dim">
        {perfil.titulo && (
          <span
            className="rounded-[2px] border px-1.5 py-0.5 font-mono text-[9px] tracking-[.1em]"
            style={{ color: cor, borderColor: cor }}
            title="Título equipado no Junko Bot"
          >
            {perfil.titulo}
          </span>
        )}
        {perfil.mains && <span>mains no bot: <b className="text-[#D6D6E0]">{perfil.mains}</b></span>}
        {perfil.ultimoDiarioEm && <span>último resgate diário: {formatarDataBR(new Date(perfil.ultimoDiarioEm), true)}</span>}
        <Link href="/ranking/" className="ml-auto font-mono text-[10px] text-cyber-cyan hover:underline">ver o ranking →</Link>
      </div>
    </section>
  );
}
