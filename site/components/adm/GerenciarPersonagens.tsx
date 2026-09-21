'use client';

import type { Personagem } from '@/lib/schema';
import { personagemParaDados, type DadosPersonagemExtra } from '@/lib/adm/personagem-extra';
import { GerenciadorCrud, type LinhaCrud } from './GerenciadorCrud';
import { FormularioPersonagemAdm } from './FormularioPersonagemAdm';

type Props = {
  personagensAtivos: Personagem[];
  /** Ids dos personagens criados pelo painel (os outros vêm do guia). */
  idsExtras: string[];
  removidos: { id: string; nome: string }[];
  aoCriar: (dados: DadosPersonagemExtra) => Promise<void>;
  aoAtualizar: (id: string, dados: DadosPersonagemExtra) => Promise<void>;
  aoExcluir: (id: string, nome: string) => Promise<void>;
  aoRestaurar: (id: string) => Promise<void>;
};

export function GerenciarPersonagens({
  personagensAtivos, idsExtras, removidos, aoCriar, aoAtualizar, aoExcluir, aoRestaurar,
}: Props) {
  const extras = new Set(idsExtras);
  const linhas: LinhaCrud[] = [
    ...personagensAtivos.filter((p) => extras.has(p.id)),
    ...personagensAtivos.filter((p) => !extras.has(p.id)),
  ].map((p) => ({
    id: p.id, nome: p.nome, imagem: p.sprite, extra: extras.has(p.id), detalhe: p.jogo,
  }));

  const jogos = [...new Set(personagensAtivos.map((p) => p.jogo))];

  return (
    <GerenciadorCrud
      singular="personagem"
      plural="personagens"
      linhas={linhas}
      removidos={removidos}
      aoExcluir={aoExcluir}
      aoRestaurar={aoRestaurar}
      formulario={({ editandoId, aoConcluir }) => {
        const atual = editandoId ? personagensAtivos.find((p) => p.id === editandoId) : undefined;
        return (
          <FormularioPersonagemAdm
            key={editandoId ?? 'novo'}
            inicial={atual ? personagemParaDados(atual) : undefined}
            jogos={jogos}
            textoBotao={editandoId ? 'Salvar alterações' : 'Criar personagem'}
            aoSalvar={async (dados) => {
              if (editandoId) await aoAtualizar(editandoId, dados);
              else await aoCriar(dados);
              aoConcluir();
            }}
            aoCancelar={aoConcluir}
          />
        );
      }}
    />
  );
}
