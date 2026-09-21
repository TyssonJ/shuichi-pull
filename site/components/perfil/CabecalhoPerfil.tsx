import { fundoDoPreset, type Banner } from '@/lib/perfil-visual';
import { SeloCargo } from './SeloCargo';
import { TextoComEmojis } from './TextoComEmojis';
import type { EmojiPerfil } from '@/lib/estilo-perfil';

/** Faixa do topo do perfil. Recebe o sprite já resolvido (quem monta a
 * página sabe o caminho do personagem), então funciona igual no servidor,
 * na página pública, e no cliente, na prévia do editor. */
export function BannerPerfil({ banner, spritePersonagem }: { banner: Banner; spritePersonagem: string | null }) {
  return (
    <div className="relative h-28 overflow-hidden sm:h-36" aria-hidden>
      {banner.tipo === 'preset' && (
        <div className="absolute inset-0" style={{ background: fundoDoPreset(banner.valor) }} />
      )}

      {banner.tipo === 'personagem' && (
        <>
          <div className="absolute inset-0" style={{ background: fundoDoPreset('noite') }} />
          {spritePersonagem && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt=""
              src={spritePersonagem}
              className="absolute right-4 top-0 h-[190%] w-auto max-w-none opacity-80 [mask-image:linear-gradient(to_left,black_45%,transparent)] [-webkit-mask-image:linear-gradient(to_left,black_45%,transparent)]"
            />
          )}
        </>
      )}

      {banner.tipo === 'url' && (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt="" src={banner.valor} referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-cover" />
      )}

      <span className="crt-lines pointer-events-none absolute inset-0 opacity-25" />
      <span className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#050805] to-transparent" />
    </div>
  );
}

export function CabecalhoPerfil({
  nome, avatar, nomeOriginal = null, avatarOriginal = null, desde, titulo, reputacao, cargos = [], bio, emojis = [], banner, spritePersonagem, editarHref,
}: {
  /** Em destaque: o apelido e o ícone escolhidos no site (ou, sem eles, os do Discord). */
  nome: string;
  avatar: string | null;
  /** Os do Discord, em tamanho menor ao lado — só quando a pessoa personalizou. */
  nomeOriginal?: string | null;
  avatarOriginal?: string | null;
  /** Texto já formatado, ex.: "21/09/2026". */
  desde: string;
  titulo: string | null;
  reputacao: { rotulo: string; cor: string } | null;
  /** Cargos que um ADM entregou (nome + cor). */
  cargos?: { id: number; nome: string; cor: string }[];
  bio: string | null;
  /** Emojis do dono do perfil (só valem aqui): ":codigo:" na descrição vira imagem. */
  emojis?: EmojiPerfil[];
  banner: Banner;
  spritePersonagem: string | null;
  /** Só o dono do perfil recebe: mostra o botão que leva ao editor. */
  editarHref?: string;
}) {
  return (
    <div className="clip-dossier-card relative overflow-hidden border-2 border-alter-green/40 bg-[#050805]">
      <BannerPerfil banner={banner} spritePersonagem={spritePersonagem} />

      {editarHref && (
        <a
          href={editarHref}
          className="absolute left-3 top-3 z-10 border-2 border-alter-green bg-[#050805]/80 px-2.5 py-1 font-mono text-[10px] font-bold tracking-[.12em] text-alter-green backdrop-blur-sm hover:bg-alter-green hover:text-[#08090D]"
        >
          ✎ EDITAR PERFIL
        </a>
      )}

      <div className="relative px-4 pb-4">
        <p className="absolute right-4 top-2 font-mono text-[8px] tracking-[.25em] text-alter-green/70">
          [ ARQUIVO DE ESTUDANTE // CONFIDENCIAL ]
        </p>

        <div className="-mt-9 flex items-end gap-3">
          <span className="relative shrink-0">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="" className="h-[72px] w-[72px] rounded-full border-[3px] border-alter-green bg-[#050805] object-cover object-top" />
            ) : (
              <span className="block h-[72px] w-[72px] rounded-full border-[3px] border-alter-green bg-[#0E0E13]" />
            )}
            {avatarOriginal && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarOriginal}
                alt="Ícone original do Discord"
                title="Ícone original do Discord"
                className="absolute -bottom-1 -right-2 h-7 w-7 rounded-full border-2 border-[#050805] bg-[#050805]"
              />
            )}
          </span>
          <div className="min-w-0 pb-1">
            <h1 className="truncate text-3xl font-black leading-none tracking-tight text-[#F2F2F5]">{nome}</h1>
            {nomeOriginal && (
              <p className="mt-0.5 truncate font-mono text-[10px] text-dim" title="Nome no Discord">
                no Discord: <b className="text-[#B9B9C6]">{nomeOriginal}</b>
              </p>
            )}
            <p className="mt-1 font-mono text-[9px] tracking-[.1em] text-dim">NO ARQUIVO DESDE {desde}</p>
          </div>
        </div>

        {(titulo || reputacao || cargos.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {titulo && (
              <span className="rounded-[2px] border border-alter-green px-1.5 py-0.5 font-mono text-[9px] tracking-[.1em] text-alter-green">
                {titulo}
              </span>
            )}
            {cargos.map((c) => <SeloCargo key={c.id} nome={c.nome} cor={c.cor} />)}
            {reputacao && (
              <span
                className="rounded-[2px] border px-1.5 py-0.5 font-mono text-[9px] tracking-[.1em]"
                style={{ color: reputacao.cor, borderColor: reputacao.cor }}
              >
                {reputacao.rotulo}
              </span>
            )}
          </div>
        )}

        {bio && (
          <p className="mt-3 max-w-prose whitespace-pre-line text-[13px] leading-relaxed text-[#C8C8D4]"><TextoComEmojis texto={bio} emojis={emojis} /></p>
        )}
      </div>
    </div>
  );
}
