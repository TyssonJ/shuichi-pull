'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Item = { rotulo: string; url: string };

const OPERACAO: Item[] = [
  { rotulo: 'Painel', url: '/adm' },
  { rotulo: 'Partidas', url: '/adm/partidas' },
  { rotulo: 'Usuários', url: '/adm/usuarios' },
];

const CONTEUDO: Item[] = [
  { rotulo: 'Eventos', url: '/adm/eventos' },
  { rotulo: 'Códigos', url: '/adm/codigos' },
  { rotulo: 'Itens', url: '/adm/itens' },
  { rotulo: 'Personagens', url: '/adm/personagens' },
  { rotulo: 'Mapa', url: '/adm/mapa' },
  { rotulo: 'Mecânicas', url: '/adm/mecanicas' },
  { rotulo: 'FAQ', url: '/adm/faq' },
  { rotulo: 'Textos', url: '/adm/textos' },
];

const SISTEMA: Item[] = [
  { rotulo: 'Configurações', url: '/adm/configuracoes' },
];

const SISTEMA_CHEFE: Item[] = [
  { rotulo: 'Junko Bot', url: '/adm/junko' },
  { rotulo: 'ADMs', url: '/adm/administradores' },
  { rotulo: 'Auditoria', url: '/adm/auditoria' },
];

function semBarraFinal(caminho: string): string {
  return caminho.length > 1 ? caminho.replace(/\/+$/, '') : caminho;
}

/** "/adm" só é ativo na raiz — senão acenderia junto com toda página do painel. */
function estaAtivo(caminho: string, url: string): boolean {
  const atual = semBarraFinal(caminho);
  return url === '/adm' ? atual === '/adm' : atual === url || atual.startsWith(`${url}/`);
}

function Grupo({ titulo, itens, caminho }: { titulo: string; itens: Item[]; caminho: string }) {
  return (
    <div>
      <p className="mb-1 px-2 font-mono text-[9px] tracking-[.22em] text-alter-green/60">{titulo}</p>
      <ul className="flex flex-wrap gap-1.5 md:flex-col md:gap-0.5">
        {itens.map((i) => {
          const ativo = estaAtivo(caminho, i.url);
          return (
            <li key={i.url}>
              <Link
                href={i.url}
                aria-current={ativo ? 'page' : undefined}
                className={`block border px-2.5 py-1 text-[13px] transition-colors md:border-0 md:border-l-2 md:py-1.5 md:text-sm ${
                  ativo
                    ? 'border-execution-pink bg-execution-pink/10 font-bold text-execution-pink'
                    : 'border-neutral-700 text-neutral-300 md:border-transparent hover:border-alter-green hover:bg-alter-green/10 hover:text-alter-green'
                }`}
              >
                {i.rotulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function BarraLateral({ papel }: { papel: 'adm' | 'chefe' }) {
  const caminho = usePathname() ?? '';
  const sistema = papel === 'chefe' ? [...SISTEMA, ...SISTEMA_CHEFE] : SISTEMA;

  return (
    <nav
      aria-label="Navegação do painel"
      className="relative z-10 flex flex-col gap-4 overflow-y-auto border-b border-[#0F5A2E] bg-[#03100A] p-3 md:sticky md:top-0 md:h-screen md:w-56 md:shrink-0 md:border-b-0 md:border-r"
    >
      <div>
        <p className="font-mono text-[10px] font-bold tracking-[.2em] text-alter-green">[ ADMIN_CONSOLE ]</p>
        <p className="mt-0.5 font-mono text-[9px] tracking-[.16em] text-execution-pink">
          ACESSO: {papel.toUpperCase()}
        </p>
      </div>
      <Grupo titulo="OPERAÇÃO" itens={OPERACAO} caminho={caminho} />
      <Grupo titulo="CONTEÚDO" itens={CONTEUDO} caminho={caminho} />
      <Grupo titulo="SISTEMA" itens={sistema} caminho={caminho} />
    </nav>
  );
}
