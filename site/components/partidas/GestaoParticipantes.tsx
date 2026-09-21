'use client';

import { useState } from 'react';
import { desembrulhar, mensagemDeErro, type Acao } from '@/lib/acao-cliente';
import { ID_MONOKUMA } from '@/lib/monokuma';

export type InscritoGerido = {
  discordId: string;
  nome: string;
  personagemId: string | null;
  tipo: 'participante' | 'reserva';
  convidado: boolean;
};

const VAGA_GENERICA = '';

/**
 * Painel do host sobre quem entrou: trocar o personagem ou a vaga
 * (titular/reserva), tirar alguém da partida e a checklist de "já convidei
 * pra party". As regras (vagas, Monokuma só do host) são conferidas de novo
 * no servidor — aqui é só a mão do host.
 */
export function GestaoParticipantes({
  partidaId, hostDiscordId, inscritos, personagens, aoTrocar, aoRemover, aoConvidado,
}: {
  partidaId: number;
  hostDiscordId: string;
  inscritos: InscritoGerido[];
  personagens: { id: string; nome: string }[];
  aoTrocar: (partidaId: number, discordId: string, personagemId: string | null, tipo: 'participante' | 'reserva') => Acao;
  aoRemover: (partidaId: number, discordId: string) => Acao;
  aoConvidado: (partidaId: number, discordId: string, convidado: boolean) => Acao;
}) {
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  // Marcação otimista da checklist: o clique responde na hora e volta atrás se o servidor recusar.
  const [convidados, setConvidados] = useState<Record<string, boolean>>(
    Object.fromEntries(inscritos.map((i) => [i.discordId, i.convidado])),
  );

  async function rodar(chave: string, acao: () => Promise<unknown>, desfazer?: () => void) {
    setErro(null);
    setOcupado(chave);
    try {
      await acao();
    } catch (e) {
      desfazer?.();
      setErro(mensagemDeErro(e, 'Não deu certo. Tenta de novo?'));
    } finally {
      setOcupado(null);
    }
  }

  function marcar(i: InscritoGerido, valor: boolean) {
    setConvidados((c) => ({ ...c, [i.discordId]: valor }));
    void rodar(
      `c-${i.discordId}`,
      () => desembrulhar(aoConvidado(partidaId, i.discordId, valor)),
      () => setConvidados((c) => ({ ...c, [i.discordId]: !valor })),
    );
  }

  const total = inscritos.length;
  const feitos = inscritos.filter((i) => convidados[i.discordId]).length;

  if (total === 0) return null;

  return (
    <section className="mt-4 rounded-[4px] border border-line bg-sur p-3" aria-label="Gestão dos inscritos">
      <div className="mb-2 flex flex-wrap items-baseline gap-x-3">
        <h3 className="font-mono text-[10px] tracking-[.14em] text-execution-pink">GESTÃO DOS INSCRITOS</h3>
        <span className="font-mono text-[10px] text-dim">
          convidados pra party: <b className="text-[#F2F2F5]">{feitos}/{total}</b>
        </span>
      </div>
      <div aria-hidden className="mb-3 h-1.5 overflow-hidden bg-neutral-800">
        <div className="h-full bg-alter-green transition-all" style={{ width: `${(feitos / total) * 100}%` }} />
      </div>

      {erro && <p role="alert" className="mb-2 font-mono text-[10px] text-alerta">{erro}</p>}

      <ul className="space-y-1.5">
        {inscritos.map((i) => {
          const ehHost = i.discordId === hostDiscordId;
          const parado = ocupado !== null && ocupado.endsWith(i.discordId);
          return (
            <li key={i.discordId} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-[3px] border border-line/70 bg-[#0E0E13] px-2 py-1.5">
              <label className="flex min-w-[9rem] items-center gap-2 text-[12px] text-[#D6D6E0]">
                <input
                  type="checkbox"
                  checked={convidados[i.discordId] ?? false}
                  onChange={(e) => marcar(i, e.target.checked)}
                  aria-label={`Já convidei ${i.nome} pra party`}
                />
                <span className={convidados[i.discordId] ? 'text-alter-green' : ''}>{i.nome}</span>
              </label>

              <select
                aria-label={`Personagem de ${i.nome}`}
                disabled={parado}
                value={i.personagemId ?? VAGA_GENERICA}
                onChange={(e) => void rodar(`p-${i.discordId}`, () =>
                  desembrulhar(aoTrocar(partidaId, i.discordId, e.target.value || null, i.tipo)))}
                className="rounded-[3px] border border-line bg-[#141419] px-1.5 py-1 font-mono text-[10px] text-[#D6D6E0] focus:border-alter-green focus:outline-none"
              >
                <option value={VAGA_GENERICA}>vaga genérica</option>
                {ehHost && <option value={ID_MONOKUMA}>MONOKUMA (host)</option>}
                {personagens.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>

              <select
                aria-label={`Vaga de ${i.nome}`}
                disabled={parado}
                value={i.tipo}
                onChange={(e) => void rodar(`t-${i.discordId}`, () =>
                  desembrulhar(aoTrocar(partidaId, i.discordId, i.personagemId, e.target.value as 'participante' | 'reserva')))}
                className="rounded-[3px] border border-line bg-[#141419] px-1.5 py-1 font-mono text-[10px] text-[#D6D6E0] focus:border-alter-green focus:outline-none"
              >
                <option value="participante">titular</option>
                <option value="reserva">reserva</option>
              </select>

              {confirmando === i.discordId ? (
                <span className="ml-auto flex items-center gap-2 font-mono text-[9px]">
                  <span className="text-alerta">Tirar {i.nome} da partida?</span>
                  <button
                    type="button"
                    disabled={parado}
                    onClick={() => void rodar(`r-${i.discordId}`, async () => {
                      await desembrulhar(aoRemover(partidaId, i.discordId));
                      setConfirmando(null);
                    })}
                    className="rounded-[3px] border border-alerta px-1.5 py-0.5 text-alerta hover:bg-alerta hover:text-[#08090D]"
                  >
                    Expulsar
                  </button>
                  <button type="button" onClick={() => setConfirmando(null)} className="text-dim hover:text-[#D6D6E0]">cancelar</button>
                </span>
              ) : (
                <button
                  type="button"
                  disabled={parado}
                  onClick={() => setConfirmando(i.discordId)}
                  className="ml-auto font-mono text-[9px] text-dim hover:text-alerta disabled:opacity-50"
                >
                  expulsar
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
