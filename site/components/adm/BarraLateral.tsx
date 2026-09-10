import Link from 'next/link';

const ITENS_COMUNS = [
  { rotulo: 'Eventos', url: '/adm/eventos' },
  { rotulo: 'Códigos', url: '/adm/codigos' },
  { rotulo: 'Itens', url: '/adm/itens' },
  { rotulo: 'Personagens', url: '/adm/personagens' },
  { rotulo: 'Mapa', url: '/adm/mapa' },
  { rotulo: 'Mecânicas', url: '/adm/mecanicas' },
  { rotulo: 'Textos', url: '/adm/faq' },
];

const ITENS_CHEFE = [
  { rotulo: 'ADMs', url: '/adm/administradores' },
  { rotulo: 'Auditoria', url: '/adm/auditoria' },
];

export function BarraLateral({ papel }: { papel: 'adm' | 'chefe' }) {
  const itens = papel === 'chefe' ? [...ITENS_COMUNS, ...ITENS_CHEFE] : ITENS_COMUNS;
  return (
    <nav aria-label="Navegação do painel" className="flex flex-col gap-1 p-3">
      {itens.map((i) => (
        <Link key={i.url} href={i.url} className="rounded px-2 py-1.5 text-sm hover:bg-neutral-800">
          {i.rotulo}
        </Link>
      ))}
    </nav>
  );
}
