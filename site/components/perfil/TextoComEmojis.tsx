import { segmentarComEmojis, type EmojiPerfil } from '@/lib/estilo-perfil';

/** Texto com os ":códigos:" trocados pelas imagens de emoji do dono do perfil.
 * Só monta elementos (nunca HTML cru), então o texto da pessoa não injeta nada. */
export function TextoComEmojis({ texto, emojis }: { texto: string; emojis: EmojiPerfil[] }) {
  if (emojis.length === 0) return <>{texto}</>;
  return (
    <>
      {segmentarComEmojis(texto, emojis).map((s, i) =>
        s.tipo === 'texto' ? (
          <span key={i}>{s.texto}</span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={s.url}
            alt={`:${s.codigo}:`}
            title={`:${s.codigo}:`}
            referrerPolicy="no-referrer"
            className="mx-0.5 inline-block h-5 w-5 align-text-bottom object-contain"
          />
        ),
      )}
    </>
  );
}
