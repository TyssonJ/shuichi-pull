'use client';

import { useRouter } from 'next/navigation';
import { FormularioPartida } from './FormularioPartida';
import { criarPartidaAction } from '@/app/partidas/acoes';

export function FormularioNovaPartida() {
  const router = useRouter();

  async function aoSalvar(dados: { titulo: string; dataHora: string; regras: string | null }) {
    const id = await criarPartidaAction(dados);
    router.push(`/partidas/${id}/`);
  }

  return <FormularioPartida aoSalvar={aoSalvar} textoBotao="Criar partida" />;
}
