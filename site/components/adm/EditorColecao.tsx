'use client';

import { useState } from 'react';
import { obterCaminho, type MapaCorrecoes } from '@/lib/correcoes-merge';

type Campo = { rotulo: string; caminho: string };
type Registro = { id: string; [chave: string]: unknown };

export function EditorColecao({
  registros, campos, correcoes, aoSalvar, aoReverter,
}: {
  registros: Registro[];
  campos: Campo[];
  correcoes: MapaCorrecoes;
  aoSalvar: (args: { registroId: string; campo: string; valor: string; valorBase: string }) => Promise<void>;
  aoReverter: (args: { registroId: string; campo: string }) => Promise<void>;
}) {
  const [aberto, setAberto] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const idsBase = new Set(registros.map((r) => r.id));
  const orfaos = [...correcoes.keys()].filter((id) => !idsBase.has(id));

  async function salvarCampo(campo: string, valor: string, valorBase: string) {
    if (!aberto) return;
    setErro(null);
    try {
      await aoSalvar({ registroId: aberto, campo, valor, valorBase });
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não deu para salvar. Tenta de novo?');
    }
  }

  async function reverterCampo(campo: string) {
    if (!aberto) return;
    setErro(null);
    try {
      await aoReverter({ registroId: aberto, campo });
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não deu para reverter. Tenta de novo?');
    }
  }

  return (
    <div className="flex gap-6">
      <ul className="w-64 flex-shrink-0">
        {registros.map((r) => (
          <li key={r.id}>
            <button type="button" onClick={() => { setAberto(r.id); setErro(null); }}
              className={aberto === r.id ? 'font-bold' : ''}>
              <span>{r.id}</span> {correcoes.has(r.id) && '●'}
            </button>
          </li>
        ))}
      </ul>

      {aberto && (
        <div className="flex-1">
          {erro && <p role="alert" className="mb-2 text-red-400">{erro}</p>}
          {campos.map((campo) => {
            const registro = registros.find((r) => r.id === aberto)!;
            const correcao = correcoes.get(aberto)?.get(campo.caminho);
            const valorBaseAtual = obterCaminho(registro, campo.caminho) ?? '';
            const valorMostrado = correcao?.valor ?? valorBaseAtual;
            const conflito = correcao && correcao.valorBase !== valorBaseAtual;

            return (
              <div key={campo.caminho} className="mb-4">
                <label>{campo.rotulo}
                  <input
                    defaultValue={valorMostrado}
                    onBlur={(e) => {
                      const valor = e.target.value;
                      if (valor !== valorMostrado) salvarCampo(campo.caminho, valor, valorBaseAtual);
                    }}
                  />
                </label>
                {conflito && (
                  <p className="text-amber-400">
                    O jogo mudou isto para <b>{valorBaseAtual}</b>. Sua correção (<b>{correcao.valor}</b>) continua valendo.
                  </p>
                )}
                {correcao && (
                  <button type="button" onClick={() => reverterCampo(campo.caminho)}>
                    Reverter
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {orfaos.length > 0 && (
        <div className="w-64">
          <h2>Correções sem registro correspondente</h2>
          <ul>
            {orfaos.map((id) => <li key={id}>{id}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
