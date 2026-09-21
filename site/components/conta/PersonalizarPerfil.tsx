'use client';

import { useState } from 'react';
import { CabecalhoPerfil } from '@/components/perfil/CabecalhoPerfil';
import { desembrulhar, type Acao, mensagemDeErro } from '@/lib/acao-cliente';
import {
  BIO_MAX, BANNER_PADRAO, PRESETS_BANNER, HOSTS_IMAGEM_PERMITIDOS, fundoDoPreset, validarUrlBanner,
  type Banner, type TipoBanner,
} from '@/lib/perfil-visual';

type PersonagemBanner = { id: string; nome: string; sprite: string };

const ABAS: { tipo: TipoBanner; rotulo: string }[] = [
  { tipo: 'preset', rotulo: 'FUNDOS' },
  { tipo: 'personagem', rotulo: 'PERSONAGEM' },
  { tipo: 'url', rotulo: 'IMAGEM' },
];

const estiloCampo =
  'w-full rounded-[3px] border border-line bg-[#141419] px-2 py-1.5 text-[12px] text-[#D6D6E0] placeholder:text-dim/60 focus:border-alter-green focus:outline-none';

export function PersonalizarPerfil({
  nome, avatar, desde, titulo, bioInicial, bannerInicial, personagens, aoSalvar,
}: {
  nome: string;
  avatar: string | null;
  desde: string;
  titulo: string | null;
  bioInicial: string;
  bannerInicial: Banner;
  personagens: PersonagemBanner[];
  aoSalvar: (dados: { bio: string; bannerTipo: string; bannerValor: string }) => Acao;
}) {
  const [bio, setBio] = useState(bioInicial);
  const [tipo, setTipo] = useState<TipoBanner>(bannerInicial.tipo);
  const [presetId, setPresetId] = useState(bannerInicial.tipo === 'preset' ? bannerInicial.valor : BANNER_PADRAO.valor);
  const [personagemId, setPersonagemId] = useState(bannerInicial.tipo === 'personagem' ? bannerInicial.valor : '');
  const [url, setUrl] = useState(bannerInicial.tipo === 'url' ? bannerInicial.valor : '');
  const [busca, setBusca] = useState('');
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

  const valorParaSalvar = tipo === 'preset' ? presetId : tipo === 'personagem' ? personagemId : url;
  const filtrados = personagens.filter((p) => p.nome.toLowerCase().includes(busca.toLowerCase()));

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      await desembrulhar(aoSalvar({ bio, bannerTipo: tipo, bannerValor: valorParaSalvar }));
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
          nome={nome}
          avatar={avatar}
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
          disabled={salvando || bio.length > BIO_MAX}
          className="rounded-[3px] border-2 border-alter-green bg-ego-escuro px-4 py-2 font-mono text-[11px] tracking-[.1em] text-[#D6D6E0] hover:bg-alter-green hover:text-[#08090D] disabled:opacity-60"
        >
          {salvando ? 'Salvando…' : 'Salvar personalização'}
        </button>
        {salvo && <span role="status" className="font-mono text-[10px] text-alter-green">Salvo — já aparece no seu perfil.</span>}
      </div>
    </form>
  );
}
