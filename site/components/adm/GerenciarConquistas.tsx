'use client';

import { useState } from 'react';
import {
  validarConquista, CONQUISTA_NOME_MAX, CONQUISTA_CURTA_MAX, CONQUISTA_LONGA_MAX, MOTIVO_MAX, type DadosConquista,
} from '@/lib/conquistas';
import { desembrulhar, mensagemDeErro, type Acao } from '@/lib/acao-cliente';
import { EnviarArquivo } from '@/components/midia/EnviarArquivo';
import { BotaoMini, Campo, estiloInput } from './campos-form';
import type { UsuarioOpcao } from './GerenciarCargos';

export type ConquistaGerida = DadosConquista & { id: number; portadores: { discordId: string; nome: string }[] };

const VAZIA: DadosConquista = { nome: '', descricaoCurta: '', descricaoLonga: '', iconeUrl: '' };

export function GerenciarConquistas({
  conquistas, usuarios, aoCriar, aoAtualizar, aoExcluir, aoConceder, aoRetirar,
}: {
  conquistas: ConquistaGerida[];
  usuarios: UsuarioOpcao[];
  aoCriar: (dados: DadosConquista) => Acao<number>;
  aoAtualizar: (id: number, dados: DadosConquista) => Acao;
  aoExcluir: (id: number) => Acao;
  aoConceder: (discordId: string, conquistaId: number, motivo?: string) => Acao;
  aoRetirar: (discordId: string, conquistaId: number) => Acao;
}) {
  const [aberto, setAberto] = useState<number | 'novo' | null>(null);
  const selecionada = typeof aberto === 'number' ? conquistas.find((c) => c.id === aberto) ?? null : null;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
      <div>
        <button
          type="button"
          onClick={() => setAberto('novo')}
          className="mb-3 border-2 border-alter-green px-3 py-1.5 font-mono text-[11px] font-bold tracking-[.1em] text-alter-green hover:bg-alter-green hover:text-[#08090D]"
        >
          + NOVA CONQUISTA
        </button>
        <ul className="space-y-1.5" aria-label="Lista de conquistas">
          {conquistas.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setAberto(c.id)}
                aria-current={aberto === c.id}
                className={`flex w-full items-center gap-2 rounded-[3px] border px-2 py-1.5 text-left ${
                  aberto === c.id ? 'border-alter-green bg-alter-green/10' : 'border-neutral-800 hover:border-neutral-600'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.iconeUrl} alt="" className="h-8 w-8 shrink-0 rounded-[2px] border border-neutral-700 object-cover" />
                <span className="min-w-0 flex-1 truncate text-[12px] text-neutral-200">{c.nome}</span>
                <span className="font-mono text-[10px] text-neutral-500">{c.portadores.length}</span>
              </button>
            </li>
          ))}
          {conquistas.length === 0 && <li className="text-[12px] text-neutral-500">Nenhuma conquista criada ainda.</li>}
        </ul>
      </div>

      <div className="min-w-0">
        {aberto === null && (
          <p className="rounded-[4px] border border-dashed border-neutral-800 p-6 text-center text-[12px] text-neutral-500">
            Crie a conquista (ícone quadrado, nome e descrições) e depois entregue a quem merece. Dá pra retirar quando quiser.
          </p>
        )}
        {aberto === 'novo' && (
          <FormularioConquista
            key="novo" conquista={null}
            aoSalvar={async (dados) => { const id = await desembrulhar(aoCriar(dados)); setAberto(id); }}
          />
        )}
        {selecionada && (
          <div className="space-y-5">
            <FormularioConquista
              key={selecionada.id} conquista={selecionada}
              aoSalvar={(dados) => desembrulhar(aoAtualizar(selecionada.id, dados))}
              aoExcluir={async () => { await desembrulhar(aoExcluir(selecionada.id)); setAberto(null); }}
            />
            <Entrega conquista={selecionada} usuarios={usuarios} aoConceder={aoConceder} aoRetirar={aoRetirar} />
          </div>
        )}
      </div>
    </div>
  );
}

function FormularioConquista({
  conquista, aoSalvar, aoExcluir,
}: {
  conquista: ConquistaGerida | null;
  aoSalvar: (dados: DadosConquista) => Promise<void>;
  aoExcluir?: () => Promise<void>;
}) {
  const inicial: DadosConquista = conquista
    ? { nome: conquista.nome, descricaoCurta: conquista.descricaoCurta, descricaoLonga: conquista.descricaoLonga, iconeUrl: conquista.iconeUrl }
    : VAZIA;
  const [dados, setDados] = useState<DadosConquista>(inicial);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  const mudou = (Object.keys(inicial) as (keyof DadosConquista)[]).some((k) => dados[k] !== inicial[k]);
  const validado = validarConquista(dados);
  const editar = (campo: keyof DadosConquista, valor: string) => { setDados((d) => ({ ...d, [campo]: valor })); setOk(false); };

  async function executar(acao: () => Promise<void>, sucesso: boolean) {
    setErro(null);
    setOk(false);
    setOcupado(true);
    try { await acao(); setOk(sucesso); } catch (e) { setErro(mensagemDeErro(e, 'Não deu para concluir. Tenta de novo?')); } finally { setOcupado(false); }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); void executar(() => aoSalvar(dados), true); }} className="space-y-3">
      <h2 className="font-mono text-[11px] tracking-[.1em] text-alter-green">{conquista ? `EDITANDO: ${conquista.nome}` : 'NOVA CONQUISTA'}</h2>
      {erro && <p role="alert" className="text-[12px] text-red-400">{erro}</p>}
      {ok && !mudou && <p role="status" className="text-[12px] text-alter-green">Salvo.</p>}

      <div className="flex items-start gap-3">
        <div className="shrink-0">
          <p className="mb-1 font-mono text-[10px] uppercase tracking-[.08em] text-neutral-400">Ícone</p>
          {dados.iconeUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={dados.iconeUrl} alt="Prévia do ícone" className="h-16 w-16 rounded-[3px] border border-neutral-700 object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-[3px] border border-dashed border-neutral-700 text-[10px] text-neutral-600">sem ícone</div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <EnviarArquivo tipo="icone" rotulo="ENVIAR ÍCONE" aoConcluir={(a) => editar('iconeUrl', a.url)} />
          <Campo rotulo="ou link da imagem (quadrada)">
            <input
              aria-label="Link do ícone"
              value={dados.iconeUrl}
              onChange={(e) => editar('iconeUrl', e.target.value)}
              placeholder="https://i.imgur.com/…"
              className={`${estiloInput} font-mono text-[12px]`}
            />
          </Campo>
        </div>
      </div>

      <Campo rotulo="Nome" dica={`${[...dados.nome].length}/${CONQUISTA_NOME_MAX}`}>
        <input value={dados.nome} onChange={(e) => editar('nome', e.target.value)} className={estiloInput} />
      </Campo>
      <Campo rotulo="Descrição curta (aparece no cartão)" dica={`${dados.descricaoCurta.length}/${CONQUISTA_CURTA_MAX}`}>
        <input value={dados.descricaoCurta} onChange={(e) => editar('descricaoCurta', e.target.value)} className={estiloInput} />
      </Campo>
      <Campo rotulo="Descrição completa (abre ao clicar na conquista)" dica={`${dados.descricaoLonga.length}/${CONQUISTA_LONGA_MAX}`}>
        <textarea rows={4} value={dados.descricaoLonga} onChange={(e) => editar('descricaoLonga', e.target.value)} className={`${estiloInput} leading-relaxed`} />
      </Campo>

      {!validado.ok && (mudou || !!conquista) && <p className="text-[11px] text-amber">{validado.erro}</p>}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          disabled={ocupado || !validado.ok || (!!conquista && !mudou)}
          className="border-2 border-alter-green bg-alter-green/10 px-4 py-1.5 font-mono text-[11px] font-bold tracking-[.1em] text-alter-green hover:bg-alter-green hover:text-[#08090D] disabled:opacity-50"
        >
          {ocupado ? 'Salvando…' : conquista ? 'Salvar' : 'Criar conquista'}
        </button>
        {aoExcluir && !confirmando && <BotaoMini perigo desabilitado={ocupado} aoClicar={() => setConfirmando(true)}>Apagar conquista</BotaoMini>}
        {aoExcluir && confirmando && (
          <span className="flex items-center gap-2 text-[12px] text-red-300">
            Tira a conquista de todo mundo.
            <BotaoMini perigo desabilitado={ocupado} aoClicar={() => void executar(aoExcluir, false)}>Confirmar</BotaoMini>
            <BotaoMini aoClicar={() => setConfirmando(false)}>Cancelar</BotaoMini>
          </span>
        )}
      </div>
    </form>
  );
}

function Entrega({
  conquista, usuarios, aoConceder, aoRetirar,
}: {
  conquista: ConquistaGerida;
  usuarios: UsuarioOpcao[];
  aoConceder: (discordId: string, conquistaId: number, motivo?: string) => Acao;
  aoRetirar: (discordId: string, conquistaId: number) => Acao;
}) {
  const [busca, setBusca] = useState('');
  const [escolhido, setEscolhido] = useState('');
  const [motivo, setMotivo] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const jaTem = new Set(conquista.portadores.map((p) => p.discordId));
  const candidatos = usuarios
    .filter((u) => !jaTem.has(u.discordId) && u.nome.toLowerCase().includes(busca.trim().toLowerCase()))
    .slice(0, 50);

  async function rodar(acao: () => Promise<unknown>) {
    setErro(null);
    setOcupado(true);
    try { await acao(); } catch (e) { setErro(mensagemDeErro(e, 'Não deu para concluir. Tenta de novo?')); } finally { setOcupado(false); }
  }

  return (
    <section className="rounded-[4px] border border-neutral-800 p-3">
      <h3 className="mb-2 font-mono text-[11px] tracking-[.1em] text-neutral-300">ENTREGAR A JOGADORES</h3>
      {erro && <p role="alert" className="mb-2 text-[12px] text-red-400">{erro}</p>}

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="buscar jogador…" aria-label="Buscar jogador" className={`${estiloInput} max-w-[11rem]`} />
        <select aria-label="Jogador" value={escolhido} onChange={(e) => setEscolhido(e.target.value)} className={`${estiloInput} max-w-[14rem]`}>
          <option value="">— escolha —</option>
          {candidatos.map((u) => <option key={u.discordId} value={u.discordId}>{u.nome}</option>)}
        </select>
        <input
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          maxLength={MOTIVO_MAX}
          placeholder="motivo (opcional)"
          aria-label="Motivo"
          className={`${estiloInput} max-w-[14rem]`}
        />
        <BotaoMini
          desabilitado={ocupado || !escolhido}
          aoClicar={() => void rodar(async () => { await desembrulhar(aoConceder(escolhido, conquista.id, motivo)); setEscolhido(''); setMotivo(''); })}
        >
          Entregar
        </BotaoMini>
      </div>

      {conquista.portadores.length === 0 ? (
        <p className="text-[12px] text-neutral-500">Ninguém com esta conquista ainda.</p>
      ) : (
        <ul className="flex flex-wrap gap-1.5" aria-label="Quem tem esta conquista">
          {conquista.portadores.map((p) => (
            <li key={p.discordId} className="flex items-center gap-1.5 rounded-[3px] border border-neutral-700 px-2 py-0.5 text-[12px] text-neutral-200">
              {p.nome}
              <button
                type="button"
                disabled={ocupado}
                aria-label={`Retirar a conquista de ${p.nome}`}
                onClick={() => void rodar(() => desembrulhar(aoRetirar(p.discordId, conquista.id)))}
                className="text-neutral-500 hover:text-red-400 disabled:opacity-50"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
