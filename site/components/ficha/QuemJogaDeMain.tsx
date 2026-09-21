import Link from 'next/link';

export type JogadorMain = { discordId: string; nome: string; avatar: string | null };

/** Quem marcou este personagem como MAIN. Cada pessoa leva ao próprio perfil. */
export function QuemJogaDeMain({ jogadores }: { jogadores: JogadorMain[] }) {
  // Numa string só: as barras duplas soltas no JSX pareceriam comentário pro linter.
  const titulo = `— // QUEM JOGA DE MAIN${jogadores.length > 0 ? ` (${jogadores.length})` : ''} // —`;

  return (
    <section className="mt-10 xl:col-span-3 xl:mt-14" aria-label="Quem joga de main">
      <h2 className="mb-3 flex items-center gap-2 font-serif text-[11px] tracking-[.14em] text-[#B9B9C6]">
        <span className="h-px flex-1 bg-line" />
        {titulo}
        <span className="h-px flex-1 bg-line" />
      </h2>

      {jogadores.length === 0 ? (
        <p className="text-center text-[12px] text-dim">
          Ninguém marcou como main ainda. Marque o seu em <Link href="/conta/" className="text-alter-green hover:underline">Minha conta</Link>.
        </p>
      ) : (
        <ul className="flex flex-wrap justify-center gap-2">
          {jogadores.map((j) => (
            <li key={j.discordId}>
              <Link
                href={`/u/${j.discordId}/`}
                className="flex items-center gap-2 rounded-[3px] border border-line bg-sur px-2 py-1 hover:border-alter-green"
              >
                {j.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={j.avatar} alt="" loading="lazy" decoding="async" className="h-6 w-6 rounded-full object-cover object-top" />
                ) : (
                  <span aria-hidden className="h-6 w-6 rounded-full bg-neutral-800" />
                )}
                <span className="text-[12px] text-[#D6D6E0]">{j.nome}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
