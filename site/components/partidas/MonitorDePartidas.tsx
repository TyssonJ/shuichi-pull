'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { algumaMudou, estaEmMovimento, type EstadoConhecido } from '@/lib/estado-partida';

/** De quanto em quanto tempo confere se o estado mudou (uma consulta pequena, só com a aba visível). */
const INTERVALO_MS = 15_000;

/**
 * Mantém a página de partida (ou o lobby) fiel ao que está acontecendo: quando
 * o host aperta "Começar" a contagem vira cronômetro, quando finaliza o
 * cronômetro para e a duração aparece — sem ninguém precisar recarregar. Não
 * mostra nada. Só vigia partidas que ainda podem mudar e pausa com a aba oculta.
 */
export function MonitorDePartidas({ partidas }: { partidas: EstadoConhecido[] }) {
  const router = useRouter();
  // Chave estável: só reinicia a vigia quando o que a página sabe muda de verdade.
  const chave = JSON.stringify(partidas);

  useEffect(() => {
    const conhecidas = JSON.parse(chave) as EstadoConhecido[];
    const vigiadas = conhecidas.filter((p) => estaEmMovimento(p.status));
    if (vigiadas.length === 0) return;

    let vivo = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const ids = vigiadas.map((p) => p.id).join(',');

    async function conferir() {
      if (document.visibilityState !== 'hidden') {
        try {
          const r = await fetch(`/api/partidas/estado/?ids=${ids}`, { cache: 'no-store' });
          if (r.ok && vivo) {
            const { estados } = (await r.json()) as { estados: Record<string, { status: string; iniciadaEm: string | null }> };
            if (vivo && algumaMudou(vigiadas, estados)) router.refresh();
          }
        } catch { /* sem rede: tenta no próximo ciclo */ }
      }
      // Sempre agenda a próxima: se a recarga trouxer dados novos, este efeito é
      // refeito (a chave muda) e o timer antigo é cancelado; se não trouxer, a
      // vigia continua, sem laço apertado (15 s entre conferências).
      if (vivo) timer = setTimeout(conferir, INTERVALO_MS);
    }

    // Quem volta pra aba confere na hora, sem esperar o ciclo.
    function aoVoltar() {
      if (document.visibilityState === 'visible' && vivo) {
        if (timer) clearTimeout(timer);
        void conferir();
      }
    }

    timer = setTimeout(conferir, INTERVALO_MS);
    document.addEventListener('visibilitychange', aoVoltar);
    return () => {
      vivo = false;
      if (timer) clearTimeout(timer);
      document.removeEventListener('visibilitychange', aoVoltar);
    };
  }, [chave, router]);

  return null;
}
