'use client';

import { useState } from 'react';
import type { DadosPersonagemExtra } from '@/lib/adm/personagem-extra';
import { BotaoMini, Campo, Secao, estiloInput, paraNumero } from './campos-form';

type LinhaEtiqueta = { pt: string; en: string; bom: boolean };

type Estado = {
  nome: string; jogo: string;
  talentoPt: string; talentoEn: string; descricaoPt: string; descricaoEn: string;
  velocidade: string; mochila: string; percepcao: string; vida: string;
  sprite: string;
  etiquetas: LinhaEtiqueta[];
  personalidade: string; aparencia: string; historia: string; segredo: string;
};

const VAZIO: Estado = {
  nome: '', jogo: '',
  talentoPt: '', talentoEn: '', descricaoPt: '', descricaoEn: '',
  velocidade: '190', mochila: '15', percepcao: '5', vida: '100',
  sprite: '', etiquetas: [],
  personalidade: '', aparencia: '', historia: '', segredo: '',
};

function estadoDe(d: DadosPersonagemExtra): Estado {
  return {
    nome: d.nome, jogo: d.jogo,
    talentoPt: d.talentoPt, talentoEn: d.talentoEn === d.talentoPt ? '' : d.talentoEn,
    descricaoPt: d.descricaoPt, descricaoEn: d.descricaoEn === d.descricaoPt ? '' : d.descricaoEn,
    velocidade: String(d.velocidade), mochila: String(d.mochila),
    percepcao: String(d.percepcao), vida: String(d.vida),
    sprite: d.sprite ?? '',
    etiquetas: d.etiquetas.map((e) => ({ pt: e.pt, en: e.en === e.pt ? '' : e.en, bom: e.bom })),
    personalidade: d.personalidade ?? '', aparencia: d.aparencia ?? '',
    historia: d.historia ?? '', segredo: d.segredo ?? '',
  };
}

export function FormularioPersonagemAdm({
  inicial, jogos, textoBotao, aoSalvar, aoCancelar,
}: {
  inicial?: DadosPersonagemExtra;
  /** Jogos que já existem no elenco — só sugestão, dá pra digitar um novo. */
  jogos: string[];
  textoBotao: string;
  aoSalvar: (dados: DadosPersonagemExtra) => Promise<void>;
  aoCancelar?: () => void;
}) {
  const [f, setF] = useState<Estado>(inicial ? estadoDe(inicial) : VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const set = <K extends keyof Estado>(k: K, v: Estado[K]) => setF((e) => ({ ...e, [k]: v }));

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (!f.nome.trim()) { setErro('Dá um nome pro personagem.'); return; }
    if (!f.jogo.trim()) { setErro('Dá o jogo de origem.'); return; }
    setSalvando(true);
    try {
      await aoSalvar({
        nome: f.nome, jogo: f.jogo,
        talentoPt: f.talentoPt, talentoEn: f.talentoEn,
        descricaoPt: f.descricaoPt, descricaoEn: f.descricaoEn,
        // Sem clamp aqui: fora da faixa o servidor recusa dizendo qual campo.
        velocidade: paraNumero(f.velocidade) ?? 190,
        mochila: paraNumero(f.mochila) ?? 15,
        percepcao: paraNumero(f.percepcao) ?? 5,
        vida: paraNumero(f.vida) ?? 100,
        sprite: f.sprite.trim() || null,
        etiquetas: f.etiquetas,
        personalidade: f.personalidade.trim() || null, aparencia: f.aparencia.trim() || null,
        historia: f.historia.trim() || null, segredo: f.segredo.trim() || null,
      });
      if (!inicial) setF(VAZIO);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não deu para salvar. Tenta de novo?');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4">
      {erro && <p role="alert" className="rounded border border-red-900 bg-red-950/40 p-2 text-sm text-red-300">{erro}</p>}

      <Secao titulo="Identificação" descricao="EN em branco repete o PT.">
        <Campo rotulo="Nome"><input className={estiloInput} value={f.nome} onChange={(e) => set('nome', e.target.value)} /></Campo>
        <Campo rotulo="Jogo de origem">
          <input className={estiloInput} list="jogos-opcao" value={f.jogo} onChange={(e) => set('jogo', e.target.value)} />
          <datalist id="jogos-opcao">{jogos.map((j) => <option key={j} value={j} />)}</datalist>
        </Campo>
        <Campo rotulo="Talento (PT)"><input className={estiloInput} value={f.talentoPt} onChange={(e) => set('talentoPt', e.target.value)} placeholder="Programador Supremo" /></Campo>
        <Campo rotulo="Talento (EN)"><input className={estiloInput} value={f.talentoEn} onChange={(e) => set('talentoEn', e.target.value)} placeholder="Ultimate Programmer" /></Campo>
        <Campo rotulo="Descrição (PT)"><textarea className={estiloInput} rows={3} value={f.descricaoPt} onChange={(e) => set('descricaoPt', e.target.value)} /></Campo>
        <Campo rotulo="Descrição (EN)"><textarea className={estiloInput} rows={3} value={f.descricaoEn} onChange={(e) => set('descricaoEn', e.target.value)} /></Campo>
      </Secao>

      <Secao titulo="Atributos" descricao="Velocidade 100–400 · mochila 1–200 · percepção 1–10 · vida a partir de 1.">
        <Campo rotulo="Velocidade"><input className={estiloInput} inputMode="numeric" value={f.velocidade} onChange={(e) => set('velocidade', e.target.value)} /></Campo>
        <Campo rotulo="Mochila"><input className={estiloInput} inputMode="numeric" value={f.mochila} onChange={(e) => set('mochila', e.target.value)} /></Campo>
        <Campo rotulo="Percepção"><input className={estiloInput} inputMode="numeric" value={f.percepcao} onChange={(e) => set('percepcao', e.target.value)} /></Campo>
        <Campo rotulo="Vida"><input className={estiloInput} inputMode="numeric" value={f.vida} onChange={(e) => set('vida', e.target.value)} /></Campo>
      </Secao>

      <Secao titulo="Imagem">
        <Campo rotulo="Sprite (URL, opcional)" dica="Sem imagem, a ficha usa a silhueta padrão." className="sm:col-span-2">
          <input className={estiloInput} value={f.sprite} onChange={(e) => set('sprite', e.target.value)} placeholder="https://…" />
          {f.sprite.trim() && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={f.sprite} alt="" className="mt-1 h-24 w-24 rounded border border-neutral-700 object-contain" />
          )}
        </Campo>
      </Secao>

      <Secao titulo="Etiquetas" descricao="Traços que aparecem na ficha — marque os que são vantagem.">
        <div className="flex flex-col gap-2 sm:col-span-2">
          {f.etiquetas.map((et, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <input className={`${estiloInput} flex-1`} placeholder="PT" value={et.pt}
                onChange={(e) => set('etiquetas', f.etiquetas.map((x, k) => (k === i ? { ...x, pt: e.target.value } : x)))} />
              <input className={`${estiloInput} flex-1`} placeholder="EN (opcional)" value={et.en}
                onChange={(e) => set('etiquetas', f.etiquetas.map((x, k) => (k === i ? { ...x, en: e.target.value } : x)))} />
              <label className="flex items-center gap-1 text-xs text-neutral-300">
                <input type="checkbox" checked={et.bom}
                  onChange={(e) => set('etiquetas', f.etiquetas.map((x, k) => (k === i ? { ...x, bom: e.target.checked } : x)))} />
                vantagem
              </label>
              <BotaoMini perigo aoClicar={() => set('etiquetas', f.etiquetas.filter((_, k) => k !== i))}>×</BotaoMini>
            </div>
          ))}
          <div><BotaoMini aoClicar={() => set('etiquetas', [...f.etiquetas, { pt: '', en: '', bom: true }])}>+ etiqueta</BotaoMini></div>
        </div>
      </Secao>

      <Secao titulo="Perfil expandido" descricao="Tudo opcional. Personalidade e aparência ficam abertas na ficha; história e segredo ficam atrás do cofre do Alter Ego (têm spoiler).">
        <Campo rotulo="Personalidade"><textarea className={estiloInput} rows={3} value={f.personalidade} onChange={(e) => set('personalidade', e.target.value)} /></Campo>
        <Campo rotulo="Aparência"><textarea className={estiloInput} rows={3} value={f.aparencia} onChange={(e) => set('aparencia', e.target.value)} /></Campo>
        <Campo rotulo="História (cofre)"><textarea className={estiloInput} rows={3} value={f.historia} onChange={(e) => set('historia', e.target.value)} /></Campo>
        <Campo rotulo="Segredo (cofre)"><textarea className={estiloInput} rows={3} value={f.segredo} onChange={(e) => set('segredo', e.target.value)} /></Campo>
      </Secao>

      <div className="flex gap-2">
        <button
          type="submit" disabled={salvando}
          className="rounded-[3px] border-2 border-alter-green bg-ego-escuro px-4 py-2 font-mono text-xs font-bold tracking-[.1em] text-neutral-100 hover:bg-alter-green hover:text-neutral-950 disabled:opacity-60"
        >
          {salvando ? 'Salvando…' : textoBotao}
        </button>
        {aoCancelar && <BotaoMini aoClicar={aoCancelar}>Cancelar</BotaoMini>}
      </div>
    </form>
  );
}
