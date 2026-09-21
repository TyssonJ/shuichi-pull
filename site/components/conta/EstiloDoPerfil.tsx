'use client';

import { useState } from 'react';
import { EnviarArquivo } from '@/components/midia/EnviarArquivo';
import { FundoLateral } from '@/components/perfil/FundoLateral';
import { TextoComEmojis } from '@/components/perfil/TextoComEmojis';
import { desembrulhar, mensagemDeErro, type Acao } from '@/lib/acao-cliente';
import {
  EMOJIS_MAX, ESTILO_VAZIO, estiloVazio, estilosIguais, validarEstilo, type EstiloPerfil,
} from '@/lib/estilo-perfil';

export type EstadoDoPedido = {
  status: 'nenhum' | 'pendente' | 'rejeitado';
  motivo: string | null;
  temPublicado: boolean;
};

const estiloCampo =
  'w-full rounded-[3px] border border-line bg-[#141419] px-2 py-1.5 text-[12px] text-[#D6D6E0] placeholder:text-dim/60 focus:border-alter-green focus:outline-none';
const COR_PADRAO = '#00ff66';

/** Prévia do que vai pro ar: cor de tema, fundo lateral e emojis num miniperfil. */
export function PreviaEstilo({ estilo, nome = 'Seu nome' }: { estilo: EstiloPerfil; nome?: string }) {
  const cor = estilo.corTema ?? COR_PADRAO;
  const exemplo = estilo.emojis[0] ? `Oi! :${estilo.emojis[0].codigo}:` : 'Oi! Essa é a descrição do perfil.';
  return (
    <div className="relative h-36 overflow-hidden rounded-[3px] border border-line bg-[#08090D]">
      <FundoLateral estilo={estilo} modo="previa" />
      <div
        className="absolute inset-y-3 left-[24%] right-[24%] z-10 overflow-hidden border-2 bg-[#050805] p-2.5"
        style={{ borderColor: `${cor}66` }}
      >
        <p className="truncate text-sm font-black" style={{ color: cor }}>{nome}</p>
        <span className="mt-1 inline-block rounded-[2px] border px-1 font-mono text-[8px] tracking-[.1em]" style={{ borderColor: cor, color: cor }}>
          DETETIVE
        </span>
        <p className="mt-1.5 text-[11px] leading-snug text-[#C8C8D4]">
          <TextoComEmojis texto={exemplo} emojis={estilo.emojis} />
        </p>
      </div>
    </div>
  );
}

export function EstiloDoPerfil({
  inicial, estado, souAdm, nome, aoEnviar, aoCancelar,
}: {
  /** Ponto de partida do editor: o pedido em aberto, senão o que está no ar. */
  inicial: EstiloPerfil;
  estado: EstadoDoPedido;
  souAdm: boolean;
  nome: string;
  aoEnviar: (estilo: EstiloPerfil) => Acao<'pendente' | 'publicado' | 'removido'>;
  aoCancelar: () => Acao;
}) {
  const [cor, setCor] = useState(inicial.corTema ?? '');
  const [esquerdo, setEsquerdo] = useState(inicial.fundoEsquerdo ?? '');
  const [direito, setDireito] = useState(inicial.fundoDireito ?? '');
  const [emojis, setEmojis] = useState(inicial.emojis);
  const [novoCodigo, setNovoCodigo] = useState('');
  const [novaUrl, setNovaUrl] = useState('');
  const [status, setStatus] = useState(estado.status);
  const [motivo, setMotivo] = useState(estado.motivo);
  const [base, setBase] = useState(inicial);
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const rascunho = validarEstilo({ corTema: cor, fundoEsquerdo: esquerdo, fundoDireito: direito, emojis });
  const semMudanca = rascunho.ok && estilosIguais(rascunho.valor, base) && status !== 'rejeitado';
  const adicionar = validarEstilo({ emojis: [...emojis, { codigo: novoCodigo, url: novaUrl }] });

  function mudar(fn: () => void) {
    fn();
    setAviso(null);
    setErro(null);
  }

  async function enviar(estilo: EstiloPerfil) {
    setErro(null);
    setAviso(null);
    setOcupado(true);
    try {
      const r = await desembrulhar(aoEnviar(estilo));
      setBase(estilo);
      setMotivo(null);
      if (r === 'pendente') {
        setStatus('pendente');
        setAviso('Enviado! Um ADM vai conferir antes de aparecer pra todo mundo.');
      } else if (r === 'publicado') {
        setStatus('nenhum');
        setAviso(souAdm ? 'Pronto — já está no seu perfil.' : 'Voltou ao estilo que já está no seu perfil.');
      } else {
        setStatus('nenhum');
        setAviso('Estilo removido do seu perfil.');
      }
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não deu para enviar. Tenta de novo?'));
    } finally {
      setOcupado(false);
    }
  }

  async function cancelar() {
    setOcupado(true);
    setErro(null);
    try {
      await desembrulhar(aoCancelar());
      setStatus('nenhum');
      setMotivo(null);
      setAviso('Pedido cancelado.');
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não deu para cancelar.'));
    } finally {
      setOcupado(false);
    }
  }

  function limparTudo() {
    setCor('');
    setEsquerdo('');
    setDireito('');
    setEmojis([]);
    void enviar(ESTILO_VAZIO);
  }

  function adicionarEmoji() {
    if (!adicionar.ok) return;
    mudar(() => {
      setEmojis(adicionar.valor.emojis);
      setNovoCodigo('');
      setNovaUrl('');
    });
  }

  return (
    <section aria-labelledby="estilo-titulo" className="mt-6 space-y-4 border-t border-line pt-6">
      <div>
        <h2 id="estilo-titulo" className="font-mono text-[10px] tracking-[.14em] text-dim">TEMA, FUNDO E EMOJIS DO PERFIL</h2>
        <p className="mt-1 max-w-lg text-[11px] leading-relaxed text-dim">
          {souAdm
            ? 'Como você é ADM, o que enviar entra no ar na hora.'
            : 'Pra ninguém colocar nada impróprio, um ADM confere o que você mandar antes de aparecer pra todo mundo. Enquanto isso, seu perfil continua como está.'}
        </p>
      </div>

      {status === 'pendente' && (
        <p role="status" className="border-l-2 border-[#F59E0B] bg-[#F59E0B]/10 px-3 py-2 text-[12px] text-[#F5C36B]">
          Aguardando um ADM aprovar. Você pode continuar mexendo e reenviar (o pedido antigo é substituído).
        </p>
      )}
      {status === 'rejeitado' && (
        <p role="alert" className="border-l-2 border-alerta bg-alerta/10 px-3 py-2 text-[12px] text-[#F2F2F5]">
          Um ADM recusou o último pedido{motivo ? <>: <b>{motivo}</b></> : '.'} Ajuste e envie de novo, ou volte ao que já está no ar.
        </p>
      )}

      <div>
        <p className="mb-1.5 font-mono text-[9px] tracking-[.14em] text-dim">PRÉVIA</p>
        <PreviaEstilo estilo={rascunho.ok ? rascunho.valor : base} nome={nome} />
      </div>

      <div className="max-w-lg space-y-1">
        <span className="block font-mono text-[9px] tracking-[.14em] text-dim">COR DE TEMA</span>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="color"
            aria-label="Escolher cor de tema"
            value={/^#[0-9a-f]{6}$/i.test(cor) ? cor : COR_PADRAO}
            onChange={(e) => mudar(() => setCor(e.target.value))}
            className="h-8 w-10 cursor-pointer rounded-[3px] border border-line bg-transparent"
          />
          <input
            aria-label="Cor de tema em hexadecimal"
            value={cor}
            onChange={(e) => mudar(() => setCor(e.target.value))}
            placeholder="#00ff66 (vazio = padrão)"
            className={`${estiloCampo} max-w-[12rem] font-mono`}
          />
          {cor && (
            <button type="button" onClick={() => mudar(() => setCor(''))} className="font-mono text-[10px] text-dim hover:text-alter-green">
              usar o padrão
            </button>
          )}
        </div>
        <p className="text-[10px] text-dim">Substitui o verde de destaque só no seu perfil. Cores escuras demais não passam (sumiriam no fundo).</p>
      </div>

      <div className="max-w-lg space-y-3">
        <div>
          <span className="mb-1 block font-mono text-[9px] tracking-[.14em] text-dim">FUNDO DA ESQUERDA</span>
          <EnviarArquivo tipo="imagem" rotulo="ENVIAR IMAGEM" aoConcluir={(a) => mudar(() => setEsquerdo(a.url))} className="mb-2" />
          <input
            aria-label="Link do fundo da esquerda"
            value={esquerdo}
            onChange={(e) => mudar(() => setEsquerdo(e.target.value))}
            placeholder="https://i.imgur.com/seu-fundo.png"
            className={`${estiloCampo} font-mono text-[11px]`}
          />
        </div>
        <div>
          <span className="mb-1 block font-mono text-[9px] tracking-[.14em] text-dim">FUNDO DA DIREITA (OPCIONAL)</span>
          <EnviarArquivo tipo="imagem" rotulo="ENVIAR IMAGEM" aoConcluir={(a) => mudar(() => setDireito(a.url))} className="mb-2" />
          <input
            aria-label="Link do fundo da direita"
            value={direito}
            onChange={(e) => mudar(() => setDireito(e.target.value))}
            placeholder="vazio = espelha o da esquerda"
            className={`${estiloCampo} font-mono text-[11px]`}
          />
        </div>
        <p className="text-[10px] leading-relaxed text-dim">
          O meio do perfil não muda: a imagem fica só nas laterais e some aos poucos em direção ao centro, como na Steam.
          Só aparece em telas largas.
        </p>
      </div>

      <div className="max-w-lg space-y-2">
        <span className="block font-mono text-[9px] tracking-[.14em] text-dim">
          EMOJIS DO SEU PERFIL — {emojis.length}/{EMOJIS_MAX}
        </span>
        {emojis.length > 0 && (
          <ul className="space-y-1" aria-label="Emojis do perfil">
            {emojis.map((e) => (
              <li key={e.codigo} className="flex items-center gap-2 rounded-[3px] border border-line px-2 py-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={e.url} alt="" referrerPolicy="no-referrer" className="h-6 w-6 object-contain" />
                <code className="font-mono text-[11px] text-[#D6D6E0]">:{e.codigo}:</code>
                <button
                  type="button"
                  aria-label={`Remover o emoji ${e.codigo}`}
                  onClick={() => mudar(() => setEmojis(emojis.filter((x) => x.codigo !== e.codigo)))}
                  className="ml-auto font-mono text-[10px] text-dim hover:text-alerta"
                >
                  remover
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="space-y-2 rounded-[3px] border border-dashed border-line p-2">
          <input
            aria-label="Código do novo emoji"
            value={novoCodigo}
            onChange={(e) => mudar(() => setNovoCodigo(e.target.value))}
            placeholder="código, ex.: kappa"
            className={`${estiloCampo} max-w-[12rem] font-mono`}
          />
          <EnviarArquivo tipo="icone" rotulo="ENVIAR IMAGEM DO EMOJI" aoConcluir={(a) => mudar(() => setNovaUrl(a.url))} />
          <input
            aria-label="Link da imagem do emoji"
            value={novaUrl}
            onChange={(e) => mudar(() => setNovaUrl(e.target.value))}
            placeholder="ou cole o link da imagem"
            className={`${estiloCampo} font-mono text-[11px]`}
          />
          {(novoCodigo || novaUrl) && !adicionar.ok && <p role="alert" className="text-[10px] text-alerta">{adicionar.erro}</p>}
          <button
            type="button"
            onClick={adicionarEmoji}
            disabled={!adicionar.ok || !novoCodigo || !novaUrl}
            className="rounded-[3px] border border-alter-green px-2.5 py-1 font-mono text-[10px] tracking-[.1em] text-alter-green hover:bg-alter-green hover:text-[#08090D] disabled:opacity-40"
          >
            + ADICIONAR EMOJI
          </button>
        </div>
        <p className="text-[10px] leading-relaxed text-dim">
          Escreva <code className="text-[#D6D6E0]">:codigo:</code> na sua descrição e vira a imagem. Só funcionam no seu perfil.
        </p>
      </div>

      {!rascunho.ok && <p role="alert" className="font-mono text-[10px] text-alerta">{rascunho.erro}</p>}
      {erro && <p role="alert" className="font-mono text-[10px] text-alerta">{erro}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => rascunho.ok && void enviar(rascunho.valor)}
          disabled={ocupado || !rascunho.ok || semMudanca || (rascunho.ok && estiloVazio(rascunho.valor))}
          className="rounded-[3px] border-2 border-alter-green bg-ego-escuro px-4 py-2 font-mono text-[11px] tracking-[.1em] text-[#D6D6E0] hover:bg-alter-green hover:text-[#08090D] disabled:opacity-60"
        >
          {ocupado ? 'Enviando…' : souAdm ? 'Publicar no perfil' : 'Enviar para aprovação'}
        </button>
        {status === 'pendente' && (
          <button type="button" onClick={cancelar} disabled={ocupado} className="font-mono text-[10px] text-dim hover:text-alerta">
            cancelar pedido
          </button>
        )}
        {(estado.temPublicado || !estiloVazio(base)) && (
          <button type="button" onClick={limparTudo} disabled={ocupado} className="font-mono text-[10px] text-dim hover:text-alerta">
            remover todo o estilo
          </button>
        )}
        {aviso && <span role="status" className="font-mono text-[10px] text-alter-green">{aviso}</span>}
      </div>
    </section>
  );
}
