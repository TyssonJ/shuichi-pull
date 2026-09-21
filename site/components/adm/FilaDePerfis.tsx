'use client';

import { useState } from 'react';
import { PreviaEstilo } from '@/components/conta/EstiloDoPerfil';
import { desembrulhar, mensagemDeErro, type Acao } from '@/lib/acao-cliente';
import type { EstiloPerfil } from '@/lib/estilo-perfil';

export type PedidoDePerfil = {
  discordId: string;
  /** Nome no Discord (+ apelido do site, se houver). */
  nome: string;
  estilo: EstiloPerfil;
  /** "há 3 h" / data já formatada. */
  quando: string;
  rejeitado?: boolean;
};

function Detalhes({ estilo }: { estilo: EstiloPerfil }) {
  return (
    <div className="space-y-2 text-[12px] text-neutral-300">
      <p className="flex items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[.08em] text-neutral-500">Cor</span>
        {estilo.corTema ? (
          <>
            <span className="inline-block h-4 w-4 rounded-[2px] border border-neutral-600" style={{ background: estilo.corTema }} />
            <code>{estilo.corTema}</code>
          </>
        ) : <span className="text-neutral-500">padrão</span>}
      </p>
      {estilo.fundoEsquerdo && (
        <div className="flex flex-wrap gap-2">
          {[['Esquerda', estilo.fundoEsquerdo], ['Direita', estilo.fundoDireito ?? estilo.fundoEsquerdo]].map(([rotulo, url]) => (
            <a key={rotulo} href={url} target="_blank" rel="noreferrer" className="block" title={`Abrir fundo — ${rotulo}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Fundo — ${rotulo}`} referrerPolicy="no-referrer" className="h-24 w-40 rounded-[3px] border border-neutral-700 object-cover" />
              <span className="font-mono text-[10px] text-neutral-500">{rotulo}{rotulo === 'Direita' && !estilo.fundoDireito ? ' (espelho)' : ''}</span>
            </a>
          ))}
        </div>
      )}
      {estilo.emojis.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Emojis">
          {estilo.emojis.map((e) => (
            <li key={e.codigo} className="flex items-center gap-1.5 rounded-[3px] border border-neutral-700 px-1.5 py-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={e.url} alt={`:${e.codigo}:`} referrerPolicy="no-referrer" className="h-8 w-8 object-contain" />
              <code className="text-[11px]">:{e.codigo}:</code>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CartaoPedido({
  pedido, aoAprovar, aoRejeitar,
}: {
  pedido: PedidoDePerfil;
  aoAprovar: (discordId: string) => Acao;
  aoRejeitar: (discordId: string, motivo: string) => Acao;
}) {
  const [rejeitando, setRejeitando] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function rodar(fn: () => Acao) {
    setOcupado(true);
    setErro(null);
    try {
      await desembrulhar(fn());
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não deu certo. Tenta de novo?'));
    } finally {
      setOcupado(false);
    }
  }

  return (
    <li className="space-y-3 rounded-[4px] border border-neutral-800 p-3">
      <div className="flex flex-wrap items-baseline gap-x-3">
        <a href={`/u/${pedido.discordId}/`} target="_blank" rel="noreferrer" className="font-bold text-cyber-cyan hover:underline">
          {pedido.nome} ↗
        </a>
        <span className="font-mono text-[10px] text-neutral-500">{pedido.quando}</span>
      </div>
      <PreviaEstilo estilo={pedido.estilo} nome={pedido.nome} />
      <Detalhes estilo={pedido.estilo} />

      {erro && <p role="alert" className="text-xs text-alerta">{erro}</p>}

      {rejeitando ? (
        <div className="space-y-2">
          <label className="block text-xs">
            <span className="font-mono uppercase tracking-[.08em] text-neutral-400">Motivo da rejeição (a pessoa vai ver)</span>
            <input
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="ex.: a imagem de fundo tem conteúdo impróprio"
              className="mt-1 w-full rounded-[3px] border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-sm text-neutral-100 focus:border-alter-green focus:outline-none"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={ocupado}
              onClick={() => rodar(() => aoRejeitar(pedido.discordId, motivo))}
              className="rounded-[3px] border border-alerta px-3 py-1 text-xs text-alerta hover:bg-alerta hover:text-black disabled:opacity-50"
            >
              Confirmar rejeição
            </button>
            <button type="button" onClick={() => setRejeitando(false)} className="text-xs text-neutral-400 hover:text-neutral-200">
              voltar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            disabled={ocupado}
            onClick={() => rodar(() => aoAprovar(pedido.discordId))}
            className="rounded-[3px] border-2 border-alter-green px-3 py-1 text-xs font-bold text-alter-green hover:bg-alter-green hover:text-black disabled:opacity-50"
          >
            Aprovar
          </button>
          <button
            type="button"
            disabled={ocupado}
            onClick={() => setRejeitando(true)}
            className="rounded-[3px] border border-neutral-600 px-3 py-1 text-xs text-neutral-300 hover:border-alerta hover:text-alerta disabled:opacity-50"
          >
            Rejeitar…
          </button>
        </div>
      )}
    </li>
  );
}

export function FilaDePerfis({
  pedidos, publicados, aoAprovar, aoRejeitar, aoRemover,
}: {
  pedidos: PedidoDePerfil[];
  publicados: PedidoDePerfil[];
  aoAprovar: (discordId: string) => Acao;
  aoRejeitar: (discordId: string, motivo: string) => Acao;
  aoRemover: (discordId: string) => Acao;
}) {
  const [erro, setErro] = useState<string | null>(null);

  async function remover(discordId: string) {
    setErro(null);
    try {
      await desembrulhar(aoRemover(discordId));
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não deu para remover.'));
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-2 font-mono text-[11px] uppercase tracking-[.12em] text-alter-green">
          Aguardando aprovação ({pedidos.length})
        </h2>
        {pedidos.length === 0 ? (
          <p className="rounded-[4px] border border-dashed border-neutral-800 p-4 text-center text-[12px] text-neutral-500">
            Nenhum pedido esperando. Quando alguém mandar cor, fundo ou emojis, aparece aqui.
          </p>
        ) : (
          <ul className="space-y-3">
            {pedidos.map((p) => (
              <CartaoPedido key={p.discordId} pedido={p} aoAprovar={aoAprovar} aoRejeitar={aoRejeitar} />
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-2 font-mono text-[11px] uppercase tracking-[.12em] text-neutral-400">
          No ar agora ({publicados.length})
        </h2>
        {erro && <p role="alert" className="mb-2 text-xs text-alerta">{erro}</p>}
        {publicados.length === 0 ? (
          <p className="text-[12px] text-neutral-500">Ninguém com estilo publicado.</p>
        ) : (
          <ul className="space-y-1.5">
            {publicados.map((p) => (
              <li key={p.discordId} className="flex flex-wrap items-center gap-2 rounded-[3px] border border-neutral-800 px-2 py-1.5">
                <a href={`/u/${p.discordId}/`} target="_blank" rel="noreferrer" className="text-[13px] text-cyber-cyan hover:underline">
                  {p.nome} ↗
                </a>
                <span className="font-mono text-[10px] text-neutral-500">
                  {[p.estilo.corTema && 'cor', p.estilo.fundoEsquerdo && 'fundo', p.estilo.emojis.length > 0 && `${p.estilo.emojis.length} emoji(s)`].filter(Boolean).join(' · ')}
                </span>
                <button
                  type="button"
                  onClick={() => remover(p.discordId)}
                  className="ml-auto rounded-[3px] border border-neutral-700 px-2 py-0.5 text-xs text-neutral-300 hover:border-alerta hover:text-alerta"
                >
                  Remover do ar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
