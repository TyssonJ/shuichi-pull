'use client';

import { useState } from 'react';
import { validarCargo, CARGO_NOME_MAX } from '@/lib/cargos';
import { desembrulhar, mensagemDeErro, type Acao } from '@/lib/acao-cliente';
import { SeloCargo } from '@/components/perfil/SeloCargo';
import { BotaoMini, Campo, estiloInput } from './campos-form';

export type CargoGerido = { id: number; nome: string; cor: string; portadores: { discordId: string; nome: string }[] };
export type UsuarioOpcao = { discordId: string; nome: string };

const COR_INICIAL = '#00ff66';

export function GerenciarCargos({
  cargos, usuarios, aoCriar, aoAtualizar, aoExcluir, aoConceder, aoRetirar,
}: {
  cargos: CargoGerido[];
  usuarios: UsuarioOpcao[];
  aoCriar: (dados: { nome: string; cor: string }) => Acao<number>;
  aoAtualizar: (id: number, dados: { nome: string; cor: string }) => Acao;
  aoExcluir: (id: number) => Acao;
  aoConceder: (discordId: string, cargoId: number) => Acao;
  aoRetirar: (discordId: string, cargoId: number) => Acao;
}) {
  // null = nada aberto; 'novo' = formulário em branco; senão, o id do cargo.
  const [aberto, setAberto] = useState<number | 'novo' | null>(null);
  const selecionado = typeof aberto === 'number' ? cargos.find((c) => c.id === aberto) ?? null : null;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)]">
      <div>
        <button
          type="button"
          onClick={() => setAberto('novo')}
          className="mb-3 border-2 border-alter-green px-3 py-1.5 font-mono text-[11px] font-bold tracking-[.1em] text-alter-green hover:bg-alter-green hover:text-[#08090D]"
        >
          + NOVO CARGO
        </button>
        <ul className="space-y-1.5" aria-label="Lista de cargos">
          {cargos.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setAberto(c.id)}
                aria-current={aberto === c.id}
                className={`flex w-full items-center justify-between gap-2 rounded-[3px] border px-2 py-1.5 ${
                  aberto === c.id ? 'border-alter-green bg-alter-green/10' : 'border-neutral-800 hover:border-neutral-600'
                }`}
              >
                <SeloCargo nome={c.nome} cor={c.cor} />
                <span className="font-mono text-[10px] text-neutral-500">{c.portadores.length} pessoa(s)</span>
              </button>
            </li>
          ))}
          {cargos.length === 0 && <li className="text-[12px] text-neutral-500">Nenhum cargo criado ainda.</li>}
        </ul>
      </div>

      <div className="min-w-0">
        {aberto === null && (
          <p className="rounded-[4px] border border-dashed border-neutral-800 p-6 text-center text-[12px] text-neutral-500">
            Escolha um cargo ou crie um novo. Depois é só entregar a quem você quiser — o selo aparece no perfil da pessoa.
          </p>
        )}
        {aberto === 'novo' && (
          <FormularioCargo
            key="novo" cargo={null}
            aoSalvar={async (dados) => { const id = await desembrulhar(aoCriar(dados)); setAberto(id); }}
          />
        )}
        {selecionado && (
          <div className="space-y-5">
            <FormularioCargo
              key={selecionado.id} cargo={selecionado}
              aoSalvar={(dados) => desembrulhar(aoAtualizar(selecionado.id, dados))}
              aoExcluir={async () => { await desembrulhar(aoExcluir(selecionado.id)); setAberto(null); }}
            />
            <Entrega cargo={selecionado} usuarios={usuarios} aoConceder={aoConceder} aoRetirar={aoRetirar} />
          </div>
        )}
      </div>
    </div>
  );
}

function FormularioCargo({
  cargo, aoSalvar, aoExcluir,
}: {
  cargo: CargoGerido | null;
  aoSalvar: (dados: { nome: string; cor: string }) => Promise<void>;
  aoExcluir?: () => Promise<void>;
}) {
  const [nome, setNome] = useState(cargo?.nome ?? '');
  const [cor, setCor] = useState(cargo?.cor ?? COR_INICIAL);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  const validado = validarCargo({ nome, cor });
  const mudou = nome !== (cargo?.nome ?? '') || cor.toLowerCase() !== (cargo?.cor ?? COR_INICIAL);

  async function executar(acao: () => Promise<void>, sucesso: boolean) {
    setErro(null);
    setOk(false);
    setOcupado(true);
    try { await acao(); setOk(sucesso); } catch (e) { setErro(mensagemDeErro(e, 'Não deu para concluir. Tenta de novo?')); } finally { setOcupado(false); }
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); void executar(() => aoSalvar({ nome, cor }), true); }}
      className="space-y-3"
    >
      <h2 className="font-mono text-[11px] tracking-[.1em] text-alter-green">{cargo ? `EDITANDO: ${cargo.nome}` : 'NOVO CARGO'}</h2>
      {erro && <p role="alert" className="text-[12px] text-red-400">{erro}</p>}
      {ok && !mudou && <p role="status" className="text-[12px] text-alter-green">Salvo.</p>}

      <Campo rotulo="Nome do cargo" dica={`${[...nome].length}/${CARGO_NOME_MAX}`}>
        <input value={nome} onChange={(e) => setNome(e.target.value)} maxLength={CARGO_NOME_MAX + 8} className={estiloInput} />
      </Campo>

      <div className="flex flex-wrap items-end gap-3">
        <Campo rotulo="Cor">
          <span className="flex items-center gap-2">
            <input type="color" aria-label="Escolher a cor" value={/^#[0-9a-f]{6}$/i.test(cor) ? cor : COR_INICIAL} onChange={(e) => setCor(e.target.value)} className="h-9 w-12 cursor-pointer rounded border border-neutral-700 bg-transparent" />
            <input aria-label="Cor em hexadecimal" value={cor} onChange={(e) => setCor(e.target.value)} className={`${estiloInput} w-28 font-mono`} />
          </span>
        </Campo>
        <div>
          <p className="mb-1 font-mono text-[10px] uppercase tracking-[.08em] text-neutral-400">Como aparece</p>
          <SeloCargo nome={validado.ok ? validado.valor.nome : nome || 'Cargo'} cor={validado.ok ? validado.valor.cor : COR_INICIAL} />
        </div>
      </div>
      {!validado.ok && (nome !== '' || cargo) && <p className="text-[11px] text-amber">{validado.erro}</p>}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          disabled={ocupado || !validado.ok || (!!cargo && !mudou)}
          className="border-2 border-alter-green bg-alter-green/10 px-4 py-1.5 font-mono text-[11px] font-bold tracking-[.1em] text-alter-green hover:bg-alter-green hover:text-[#08090D] disabled:opacity-50"
        >
          {ocupado ? 'Salvando…' : cargo ? 'Salvar' : 'Criar cargo'}
        </button>
        {aoExcluir && !confirmando && <BotaoMini perigo desabilitado={ocupado} aoClicar={() => setConfirmando(true)}>Apagar cargo</BotaoMini>}
        {aoExcluir && confirmando && (
          <span className="flex items-center gap-2 text-[12px] text-red-300">
            Tira o cargo de todo mundo.
            <BotaoMini perigo desabilitado={ocupado} aoClicar={() => void executar(aoExcluir, false)}>Confirmar</BotaoMini>
            <BotaoMini aoClicar={() => setConfirmando(false)}>Cancelar</BotaoMini>
          </span>
        )}
      </div>
    </form>
  );
}

function Entrega({
  cargo, usuarios, aoConceder, aoRetirar,
}: {
  cargo: CargoGerido;
  usuarios: UsuarioOpcao[];
  aoConceder: (discordId: string, cargoId: number) => Acao;
  aoRetirar: (discordId: string, cargoId: number) => Acao;
}) {
  const [busca, setBusca] = useState('');
  const [escolhido, setEscolhido] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const jaTem = new Set(cargo.portadores.map((p) => p.discordId));
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
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="buscar jogador…"
          aria-label="Buscar jogador"
          className={`${estiloInput} max-w-[12rem]`}
        />
        <select aria-label="Jogador" value={escolhido} onChange={(e) => setEscolhido(e.target.value)} className={`${estiloInput} max-w-[16rem]`}>
          <option value="">— escolha —</option>
          {candidatos.map((u) => <option key={u.discordId} value={u.discordId}>{u.nome}</option>)}
        </select>
        <BotaoMini
          desabilitado={ocupado || !escolhido}
          aoClicar={() => void rodar(async () => { await desembrulhar(aoConceder(escolhido, cargo.id)); setEscolhido(''); })}
        >
          Entregar
        </BotaoMini>
      </div>

      {cargo.portadores.length === 0 ? (
        <p className="text-[12px] text-neutral-500">Ninguém com este cargo ainda.</p>
      ) : (
        <ul className="flex flex-wrap gap-1.5" aria-label="Quem tem este cargo">
          {cargo.portadores.map((p) => (
            <li key={p.discordId} className="flex items-center gap-1.5 rounded-[3px] border border-neutral-700 px-2 py-0.5 text-[12px] text-neutral-200">
              {p.nome}
              <button
                type="button"
                disabled={ocupado}
                aria-label={`Retirar o cargo de ${p.nome}`}
                onClick={() => void rodar(() => desembrulhar(aoRetirar(p.discordId, cargo.id)))}
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
