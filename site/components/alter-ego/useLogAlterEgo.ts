'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import { logAleatorio, logDaSecao, logDeBoot, type LinhaLog } from '@/lib/alter-ego-log';

const INTERVALO_MIN_MS = 30_000;
const INTERVALO_MAX_MS = 45_000;

type Estado = {
  linha: LinhaLog | null;
  montado: boolean;
  ultimoPathname: string | null;
  temporizadorId: ReturnType<typeof setTimeout> | null;
};

// Loja única de módulo: toda instância do hook (cabeçalho, trilha de cada
// página) lê e escreve o mesmo estado. É isso que faz as duas aparições do
// Alter Ego falarem a mesma coisa ao mesmo tempo, com um único temporizador
// de rodízio pra página inteira — não sorteios independentes (spec seção 5
// e seção 8).
function criarLoja() {
  const estado: Estado = { linha: null, montado: false, ultimoPathname: null, temporizadorId: null };
  const assinantes = new Set<() => void>();

  function notificar() {
    assinantes.forEach((fn) => fn());
  }

  function agendarProxima() {
    if (estado.temporizadorId) clearTimeout(estado.temporizadorId);
    const duracao = INTERVALO_MIN_MS + Math.random() * (INTERVALO_MAX_MS - INTERVALO_MIN_MS);
    estado.temporizadorId = setTimeout(() => {
      estado.linha = logAleatorio(estado.linha?.tag);
      notificar();
      agendarProxima();
    }, duracao);
  }

  function definirLinha(linha: LinhaLog | null) {
    estado.linha = linha;
    notificar();
    agendarProxima();
  }

  // Chamado pelo efeito de cada instância do hook, a cada render seu.
  // Idempotente: só reage de verdade na primeira chamada (boot) e quando o
  // pathname muda de verdade desde a última chamada de QUALQUER instância —
  // por isso duas instâncias na mesma página convergem pro mesmo estado em
  // vez de disparar boot/seção em dobro.
  function sincronizar(pathname: string) {
    if (!estado.montado) {
      estado.montado = true;
      estado.ultimoPathname = pathname;
      definirLinha(logDeBoot());
      return;
    }
    if (pathname !== estado.ultimoPathname) {
      estado.ultimoPathname = pathname;
      const daSecao = logDaSecao(pathname);
      if (daSecao) definirLinha(daSecao);
    }
  }

  function forcarNovaLinha() {
    definirLinha(logAleatorio(estado.linha?.tag));
  }

  function subscribe(fn: () => void) {
    assinantes.add(fn);
    return () => assinantes.delete(fn);
  }

  function getSnapshot() {
    return estado.linha;
  }

  function resetarParaTeste() {
    if (estado.temporizadorId) clearTimeout(estado.temporizadorId);
    estado.linha = null;
    estado.montado = false;
    estado.ultimoPathname = null;
    estado.temporizadorId = null;
    assinantes.clear();
  }

  return { sincronizar, forcarNovaLinha, subscribe, getSnapshot, resetarParaTeste };
}

const loja = criarLoja();

function getServerSnapshot() {
  return null;
}

export function useLogAlterEgo() {
  const pathname = usePathname() ?? '';
  const linha = useSyncExternalStore(loja.subscribe, loja.getSnapshot, getServerSnapshot);

  useEffect(() => {
    loja.sincronizar(pathname);
  }, [pathname]);

  return { tag: linha?.tag ?? '', texto: linha?.texto ?? '', forcarNovaLinha: loja.forcarNovaLinha };
}

// Exportado só pra teste: a loja agora é um singleton de módulo
// compartilhado entre TODAS as instâncias do hook (de propósito — é
// exatamente esse compartilhamento que a spec pede), então cada `it()`
// precisa zerar o estado pra não vazar entre casos de teste.
export function __resetarLogAlterEgoParaTeste() {
  loja.resetarParaTeste();
}
