'use client';

import { useState } from 'react';
import { CabecalhoPerfil } from '@/components/perfil/CabecalhoPerfil';
import { desembrulhar, type Acao, mensagemDeErro } from '@/lib/acao-cliente';
import { APELIDO_MAX, identidadeDe, validarApelido, type TipoAvatar } from '@/lib/identidade';
import {
  BIO_MAX, BANNER_PADRAO, PRESETS_BANNER, HOSTS_IMAGEM_PERMITIDOS, fundoDoPreset, validarUrlBanner,
  type Banner, type TipoBanner,
} from '@/lib/perfil-visual';

/** `sprite` é o corpo inteiro (banner); `retrato` é o de meio-corpo (ícone). */
type PersonagemBanner = { id: string; nome: string; sprite: string; retrato: string };

const ABAS_ICONE: { tipo: TipoAvatar; rotulo: string }[] = [
  { tipo: 'discord', rotulo: 'DISCORD' },
  { tipo: 'personagem', rotulo: 'PERSONAGEM' },
  { tipo: 'url', rotulo: 'IMAGEM' },
];

const ABAS: { tipo: TipoBanner; rotulo: string }[] = [
  { tipo: 'preset', rotulo: 'FUNDOS' },
  { tipo: 'personagem', rotulo: 'PERSONAGEM' },
  { tipo: 'url', rotulo: 'IMAGEM' },
];

const estiloCampo =
  'w-full rounded-[3px] border border-line bg-[#141419] px-2 py-1.5 text-[12px] text-[#D6D6E0] placeholder:text-dim/60 focus:border-alter-green focus:outline-none';

export function PersonalizarPerfil({
  nome, avatar, apelidoInicial, avatarInicial, desde, titulo, bioInicial, bannerInicial, personagens, aoSalvar,
}: {
  /** Nome e ícone do DISCORD (os originais, que sempre aparecem). */
  nome: string;
  avatar: string | null;
  apelidoInicial: string;
  avatarInicial: { tipo: TipoAvatar; valor: string };
  desde: string;
  titulo: string | null;
  bioInicial: string;
  bannerInicial: Banner;
  personagens: PersonagemBanner[];
  aoSalvar: (dados: {
    bio: string; bannerTipo: string; bannerValor: string; apelido: string; avatarTipo: string; avatarValor: string;
  }) => Acao;
}) {
  const [bio, setBio] = useState(bioInicial);
  const [tipo, setTipo] = useState<TipoBanner>(bannerInicial.tipo);
  const [presetId, setPresetId] = useState(bannerInicial.tipo === 'preset' ? bannerInicial.valor : BANNER_PADRAO.valor);
  const [personagemId, setPersonagemId] = useState(bannerInicial.tipo === 'personagem' ? bannerInicial.valor : '');
  const [url, setUrl] = useState(bannerInicial.tipo === 'url' ? bannerInicial.valor : '');
  const [busca, setBusca] = useState('');
  const [apelido, setApelido] = useState(apelidoInicial);
  const [avTipo, setAvTipo] = useState<TipoAvatar>(avatarInicial.tipo);
  const [avPersonagemId, setAvPersonagemId] = useState(avatarInicial.tipo === 'personagem' ? avatarInicial.valor : '');
  const [avUrl, setAvUrl] = useState(avatarInicial.tipo === 'url' ? avatarInicial.valor : '');
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const urlValidada = url.trim() ? validarUrlBanner(url) : null;
  const personagemEscolhido = personagens.find((p) => p.id === personagemId);

  // Rascunho que a prévia mostra. Se o que foi digitado ainda não vale
  // (link incompleto, nenhum personagem escolhido), a prévia segura o
  // banner padrão em vez de quebrar ou mostrar imagem inválida.
  const bannerRascunho: Banner =
    tipo === 'preset' ? { tipo, valor: presetId }
    : tipo === 'personagem' && personagemEscolhido ? { tipo, valor: personagemEscolhido.id }
    : tipo === 'url' && urlValidada?.ok ? { tipo, valor: urlValidada.valor }
    : BANNER_PADRAO;

  // Identidade na prévia: só aplica o que já vale (apelido válido, ícone resolvível).
  const apelidoV = validarApelido(apelido);
  const avUrlValidada = avUrl.trim() ? validarUrlBanner(avUrl) : null;
  const iconePersonagem = personagens.find((p) => p.id === avPersonagemId)?.retrato ?? null;
  const avatarPrevia =
    avTipo === 'personagem' ? iconePersonagem
    : avTipo === 'url' && avUrlValidada?.ok ? avUrlValidada.valor
    : null;
  const ident = identidadeDe({
    discordNome: nome, discordAvatar: avatar,
    apelido: apelidoV.ok ? apelidoV.valor : null, avatarUrl: avatarPrevia,
  });
  const avatarValorParaSalvar = avTipo === 'personagem' ? avPersonagemId : avTipo === 'url' ? avUrl : '';

  const valorParaSalvar = tipo === 'preset' ? presetId : tipo === 'personagem' ? personagemId : url;
  const filtrados = personagens.filter((p) => p.nome.toLowerCase().includes(busca.toLowerCase()));

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      await desembrulhar(aoSalvar({
        bio, bannerTipo: tipo, bannerValor: valorParaSalvar, apelido, avatarTipo: avTipo, avatarValor: avatarValorParaSalvar,
      }));
      setSalvo(true);
    } catch (err) {
      setErro(mensagemDeErro(err, 'Não deu para salvar. Tenta de novo?'));
    } finally {
      setSalvando(false);
    }
  }

  function alterar(fn: () => void) {
    fn();
    setSalvo(false);
  }

  return (
    <form onSubmit={salvar} className="mt-6 space-y-4 border-t border-line pt-6">
      <h2 className="font-mono text-[10px] tracking-[.14em] text-dim">PERSONALIZAR PERFIL PÚBLICO</h2>

      <div>
        <p className="mb-1.5 font-mono text-[9px] tracking-[.14em] text-dim">PRÉVIA — É ASSIM QUE VÃO TE VER</p>
        <CabecalhoPerfil
          nome={ident.nome}
          avatar={ident.avatar}
          nomeOriginal={ident.nomeOriginal}
          avatarOriginal={ident.avatarOriginal}
          desde={desde}
          titulo={titulo}
          reputacao={null}
          bio={bio.trim() || null}
          banner={bannerRascunho}
          spritePersonagem={bannerRascunho.tipo === 'personagem' ? personagemEscolhido?.sprite ?? null : null}
        />
      </div>

      {erro && <p role="alert" className="font-mono text-[10px] text-alerta">{erro}</p>}

      <label className="block">
        <span className="mb-1 flex max-w-lg items-baseline justify-between font-mono text-[9px] tracking-[.14em] text-dim">
          DESCRIÇÃO
          <span className={bio.length > BIO_MAX ? 'text-alerta' : ''}>{bio.length}/{BIO_MAX}</span>
        </span>
        <textarea
          value={bio}
          onChange={(e) => alterar(() => setBio(e.target.value))}
          rows={3}
          placeholder="Fale um pouco de você: como joga, seus horários, o que curte no Shinri Trial…"
          className={`${estiloCampo} max-w-lg`}
        />
      </label>

      <div className="space-y-3">
        <span className="block font-mono text-[9px] tracking-[.14em] text-dim">NOME E ÍCONE NO SITE</span>

        <label className="block">
          <span className="mb-1 flex max-w-lg items-baseline justify-between font-mono text-[9px] tracking-[.14em] text-dim">
            APELIDO
            <span>{[...apelido.trim()].length}/{APELIDO_MAX}</span>
          </span>
          <input
            value={apelido}
            onChange={(e) => alterar(() => setApelido(e.target.value))}
            placeholder={`Deixe vazio pra usar ${nome}`}
            className={`${estiloCampo} max-w-lg`}
          />
          {!apelidoV.ok && <p role="alert" className="mt-1 text-[10px] text-alerta">{apelidoV.erro}</p>}
        </label>

        <div>
          <span className="mb-1 block font-mono text-[9px] tracking-[.14em] text-dim">ÍCONE</span>
          <div role="tablist" className="mb-2 flex gap-1">
            {ABAS_ICONE.map((a) => (
              <button
                key={a.tipo}
                type="button"
                role="tab"
                aria-selected={avTipo === a.tipo}
                onClick={() => alterar(() => setAvTipo(a.tipo))}
                className={`border-2 px-3 py-1 font-mono text-[10px] tracking-[.1em] ${
                  avTipo === a.tipo
                    ? 'border-alter-green bg-alter-green text-[#08090D]'
                    : 'border-line text-dim hover:border-alter-green hover:text-alter-green'
                }`}
              >
                {a.rotulo}
              </button>
            ))}
          </div>

          {avTipo === 'discord' && <p className="text-[11px] text-dim">Usa o ícone da sua conta do Discord.</p>}

          {avTipo === 'personagem' && (
            <select
              aria-label="Personagem do ícone"
              value={avPersonagemId}
              onChange={(e) => alterar(() => setAvPersonagemId(e.target.value))}
              className={`${estiloCampo} max-w-xs`}
            >
              <option value="">— escolha um personagem —</option>
              {personagens.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          )}

          {avTipo === 'url' && (
            <div className="max-w-lg">
              <input
                aria-label="Link da imagem do ícone"
                value={avUrl}
                onChange={(e) => alterar(() => setAvUrl(e.target.value))}
                placeholder="https://i.imgur.com/seu-icone.png"
                className={`${estiloCampo} font-mono text-[11px]`}
              />
              {avUrlValidada && !avUrlValidada.ok && (
                <p role="alert" className="mt-1 text-[10px] text-alerta">{avUrlValidada.erro}</p>
              )}
            </div>
          )}
        </div>

        <p className="max-w-lg text-[10px] leading-relaxed text-dim">
          Seu nome e ícone do Discord continuam aparecendo, menores, ao lado dos que você escolher — assim ninguém se passa por outra pessoa.
        </p>
      </div>

      <div>
        <span className="mb-1.5 block font-mono text-[9px] tracking-[.14em] text-dim">BANNER</span>
        <div role="tablist" className="mb-3 flex gap-1">
          {ABAS.map((a) => (
            <button
              key={a.tipo}
              type="button"
              role="tab"
              aria-selected={tipo === a.tipo}
              onClick={() => alterar(() => setTipo(a.tipo))}
              className={`border-2 px-3 py-1 font-mono text-[10px] tracking-[.1em] ${
                tipo === a.tipo
                  ? 'border-alter-green bg-alter-green text-[#08090D]'
                  : 'border-line text-dim hover:border-alter-green hover:text-alter-green'
              }`}
            >
              {a.rotulo}
            </button>
          ))}
        </div>

        {tipo === 'preset' && (
          <ul className="grid max-w-lg grid-cols-3 gap-2">
            {PRESETS_BANNER.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  aria-pressed={presetId === p.id}
                  onClick={() => alterar(() => setPresetId(p.id))}
                  className={`block w-full border-2 text-left ${presetId === p.id ? 'border-alter-green' : 'border-line hover:border-alter-green/60'}`}
                >
                  <span className="block h-10" style={{ background: fundoDoPreset(p.id) }} />
                  <span className="block px-1.5 py-1 font-mono text-[9px] text-[#D6D6E0]">{p.rotulo}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {tipo === 'personagem' && (
          <div>
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="buscar personagem…"
              className={`${estiloCampo} mb-2 max-w-xs font-mono text-[10px]`}
            />
            <ul className="flex max-h-44 max-w-lg flex-wrap gap-1.5 overflow-y-auto rounded-[3px] border border-line p-2">
              {filtrados.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    aria-pressed={personagemId === p.id}
                    onClick={() => alterar(() => setPersonagemId(p.id))}
                    className={`rounded-[3px] border px-2 py-1 text-[12px] ${
                      personagemId === p.id
                        ? 'border-alter-green bg-alter-green/15 text-alter-green'
                        : 'border-line text-[#D6D6E0] hover:border-alter-green'
                    }`}
                  >
                    {p.nome}
                  </button>
                </li>
              ))}
              {filtrados.length === 0 && <li className="text-[11px] text-dim">Ninguém com esse nome.</li>}
            </ul>
          </div>
        )}

        {tipo === 'url' && (
          <div className="max-w-lg">
            <input
              value={url}
              onChange={(e) => alterar(() => setUrl(e.target.value))}
              placeholder="https://i.imgur.com/seu-banner.png"
              className={`${estiloCampo} font-mono text-[11px]`}
            />
            {urlValidada && !urlValidada.ok && (
              <p role="alert" className="mt-1 text-[10px] text-alerta">{urlValidada.erro}</p>
            )}
            <p className="mt-1.5 text-[10px] leading-relaxed text-dim">
              Hospedagens aceitas: {HOSTS_IMAGEM_PERMITIDOS.join(', ')}. Links de anexo do Discord
              expiram em poucas horas, então não funcionam aqui. Imagem larga (ex.: 1200×300) fica melhor.
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={salvando || bio.length > BIO_MAX || !apelidoV.ok}
          className="rounded-[3px] border-2 border-alter-green bg-ego-escuro px-4 py-2 font-mono text-[11px] tracking-[.1em] text-[#D6D6E0] hover:bg-alter-green hover:text-[#08090D] disabled:opacity-60"
        >
          {salvando ? 'Salvando…' : 'Salvar personalização'}
        </button>
        {salvo && <span role="status" className="font-mono text-[10px] text-alter-green">Salvo — já aparece no seu perfil.</span>}
      </div>
    </form>
  );
}
