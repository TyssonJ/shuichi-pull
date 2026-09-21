'use client';

import type { Item } from '@/lib/schema-itens';
import { itemParaDados, type DadosItemExtra } from '@/lib/adm/item-extra';
import { GerenciadorCrud, type LinhaCrud } from './GerenciadorCrud';
import { FormularioItemAdm, type ItemOpcao, type LocalOpcao } from './FormularioItemAdm';

type Props = {
  itensAtivos: Item[];
  /** Ids dos itens criados pelo painel (os outros vêm do guia). */
  idsExtras: string[];
  removidos: { id: string; nome: string }[];
  locais: LocalOpcao[];
  aoCriar: (dados: DadosItemExtra) => Promise<void>;
  aoAtualizar: (id: string, dados: DadosItemExtra) => Promise<void>;
  aoExcluir: (id: string, nome: string) => Promise<void>;
  aoRestaurar: (id: string) => Promise<void>;
};

export function GerenciarItens({
  itensAtivos, idsExtras, removidos, locais, aoCriar, aoAtualizar, aoExcluir, aoRestaurar,
}: Props) {
  const extras = new Set(idsExtras);
  const linhas: LinhaCrud[] = [
    // Os criados pelo painel primeiro: é o que o ADM acabou de mexer.
    ...itensAtivos.filter((i) => extras.has(i.id)),
    ...itensAtivos.filter((i) => !extras.has(i.id)),
  ].map((i) => ({
    id: i.id, nome: i.nome.pt, imagem: i.icone, extra: extras.has(i.id),
    detalhe: `${i.categoria.pt} · ${i.raridade.pt}`,
  }));

  const itensOpcao: ItemOpcao[] = itensAtivos.map((i) => ({
    id: i.id, nomePt: i.nome.pt, nomeEn: i.nome.en, icone: i.icone,
  }));

  return (
    <GerenciadorCrud
      singular="item"
      plural="itens"
      linhas={linhas}
      removidos={removidos}
      aoExcluir={aoExcluir}
      aoRestaurar={aoRestaurar}
      formulario={({ editandoId, aoConcluir }) => {
        const atual = editandoId ? itensAtivos.find((i) => i.id === editandoId) : undefined;
        return (
          <FormularioItemAdm
            key={editandoId ?? 'novo'}
            inicial={atual ? itemParaDados(atual) : undefined}
            locais={locais}
            itensOpcao={itensOpcao}
            textoBotao={editandoId ? 'Salvar alterações' : 'Criar item'}
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
