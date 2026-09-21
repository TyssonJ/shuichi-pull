'use client';

import { useRouter } from 'next/navigation';
import { FormularioPartida } from './FormularioPartida';
import { criarPartidaAction } from '@/app/partidas/acoes';
import { desembrulhar } from '@/lib/acao-cliente';

export function FormularioNovaPartida() {
  const router = useRouter();

  async function aoSalvar(dados: { titulo: string; dataHora: string; regras: string | null; capaUrl: string | null; vagas: number }) {
    const id = await desembrulhar(criarPartidaAction(dados));
    router.push(`/partidas/${id}/`);
  }

  return <FormularioPartida aoSalvar={aoSalvar} textoBotao="Criar partida" />;
}
