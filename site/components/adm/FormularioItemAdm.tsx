'use client';

import { useState } from 'react';
import { RARIDADES } from '@/lib/vocabulario';
import type { Texto } from '@/lib/schema';
import type { Craft, Spawn } from '@/lib/schema-itens';
import type { DadosItemExtra } from '@/lib/adm/item-extra';
import { BotaoMini, Campo, Secao, estiloInput, paraNumero } from './campos-form';

export type LocalOpcao = {
  id: string; nome: Texto; andar: Texto | null;
  conteineres: { fonteId: string; nome: Texto }[];
};
export type ItemOpcao = { id: string; nomePt: string; nomeEn: string; icone: string | null };

type LinhaIngrediente = { nome: string; qtd: string };
type LinhaBancada = { pt: string; en: string };
type LinhaSpawn = { localId: string; fonteId: string; chance: string; qtdMin: string; qtdMax: string };

type Estado = {
  nomePt: string; nomeEn: string; categoriaPt: string; categoriaEn: string; ramoPt: string; ramoEn: string;
  raridadePt: string; peso: string; icone: string;
  descricaoPt: string; descricaoEn: string; efeitoPt: string; efeitoEn: string;
  lojaVendedor: string; lojaPreco: string;
  craftAtivo: boolean; ingredientes: LinhaIngrediente[]; bancadas: LinhaBancada[]; craftChance: string;
  spawns: LinhaSpawn[];
};

const VAZIO: Estado = {
  nomePt: '', nomeEn: '', categoriaPt: '', categoriaEn: '', ramoPt: '', ramoEn: '',
  raridadePt: RARIDADES[0].pt, peso: '', icone: '',
  descricaoPt: '', descricaoEn: '', efeitoPt: '', efeitoEn: '',
  lojaVendedor: '', lojaPreco: '',
  craftAtivo: false, ingredientes: [{ nome: '', qtd: '1' }], bancadas: [], craftChance: '100%',
  spawns: [],
};

function estadoDe(d: DadosItemExtra): Estado {
  return {
    nomePt: d.nomePt, nomeEn: d.nomeEn === d.nomePt ? '' : d.nomeEn,
    categoriaPt: d.categoriaPt, categoriaEn: d.categoriaEn === d.categoriaPt ? '' : d.categoriaEn,
    ramoPt: d.ramoPt, ramoEn: d.ramoEn === d.ramoPt ? '' : d.ramoEn,
    raridadePt: d.raridadePt, peso: d.peso === null ? '' : String(d.peso), icone: d.icone ?? '',
    descricaoPt: d.descricaoPt ?? '', descricaoEn: d.descricaoEn === d.descricaoPt ? '' : d.descricaoEn ?? '',
    efeitoPt: d.efeitoPt ?? '', efeitoEn: d.efeitoEn === d.efeitoPt ? '' : d.efeitoEn ?? '',
    lojaVendedor: d.loja?.vendedor ?? '', lojaPreco: d.loja ? String(d.loja.preco) : '',
    craftAtivo: d.craft !== null,
    ingredientes: d.craft?.ingredientes.map((i) => ({ nome: i.nome.pt, qtd: String(i.qtd) })) ?? [{ nome: '', qtd: '1' }],
    bancadas: d.craft?.bancadas.map((b) => ({ pt: b.pt, en: b.en === b.pt ? '' : b.en })) ?? [],
    craftChance: d.craft?.chance ?? '100%',
    spawns: d.spawns.map((s) => ({
      localId: s.localId, fonteId: s.fonteId, chance: String(s.chance),
      qtdMin: String(s.qtdMin), qtdMax: String(s.qtdMax),
    })),
  };
}

export function FormularioItemAdm({
  inicial, locais, itensOpcao, textoBotao, aoSalvar, aoCancelar,
}: {
  inicial?: DadosItemExtra;
  locais: LocalOpcao[];
  itensOpcao: ItemOpcao[];
  textoBotao: string;
  aoSalvar: (dados: DadosItemExtra) => Promise<void>;
  aoCancelar?: () => void;
}) {
  const [f, setF] = useState<Estado>(inicial ? estadoDe(inicial) : VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const set = <K extends keyof Estado>(k: K, v: Estado[K]) => setF((e) => ({ ...e, [k]: v }));

  function montarCraft(): Craft | null {
    if (!f.craftAtivo) return null;
    const ingredientes = f.ingredientes
      .filter((i) => i.nome.trim())
      .map((i) => {
        const achado = itensOpcao.find((o) => o.nomePt.toLowerCase() === i.nome.trim().toLowerCase());
        const qtd = Math.max(1, Math.round(paraNumero(i.qtd) ?? 1));
        return achado
          ? { id: achado.id, nome: { pt: achado.nomePt, en: achado.nomeEn }, qtd, icone: achado.icone }
          : { id: null, nome: { pt: i.nome.trim(), en: i.nome.trim() }, qtd, icone: null };
      });
    if (ingredientes.length === 0) throw new Error('A receita precisa de pelo menos um ingrediente.');
    return {
      ingredientes,
      bancadas: f.bancadas.filter((b) => b.pt.trim()).map((b) => ({ pt: b.pt.trim(), en: b.en.trim() || b.pt.trim() })),
      chance: f.craftChance.trim() || '100%',
    };
  }

  function montarSpawns(): Spawn[] {
    return f.spawns.map((s) => {
      const local = locais.find((l) => l.id === s.localId);
      const conteiner = local?.conteineres.find((c) => c.fonteId === s.fonteId);
      if (!local || !conteiner) throw new Error('Escolha o local e o contêiner de cada ponto de spawn.');
      return {
        fonteId: conteiner.fonteId, local: local.nome, localId: local.id, andar: local.andar,
        conteiner: conteiner.nome,
        chance: paraNumero(s.chance) ?? 0,
        qtdMin: Math.max(0, Math.round(paraNumero(s.qtdMin) ?? 1)),
        qtdMax: Math.max(0, Math.round(paraNumero(s.qtdMax) ?? 1)),
      };
    });
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (!f.nomePt.trim()) { setErro('Dá um nome pro item.'); return; }
    setSalvando(true);
    try {
      const raridade = RARIDADES.find((r) => r.pt === f.raridadePt) ?? RARIDADES[0];
      const preco = paraNumero(f.lojaPreco);
      await aoSalvar({
        nomePt: f.nomePt, nomeEn: f.nomeEn,
        categoriaPt: f.categoriaPt, categoriaEn: f.categoriaEn,
        ramoPt: f.ramoPt, ramoEn: f.ramoEn,
        raridadePt: raridade.pt, raridadeEn: raridade.en, nivelRaridade: raridade.nivel,
        peso: paraNumero(f.peso), icone: f.icone.trim() || null,
        descricaoPt: f.descricaoPt.trim() || null, descricaoEn: f.descricaoEn.trim() || null,
        efeitoPt: f.efeitoPt.trim() || null, efeitoEn: f.efeitoEn.trim() || null,
        loja: f.lojaVendedor.trim() ? { vendedor: f.lojaVendedor.trim(), preco: Math.max(0, preco ?? 0) } : null,
        craft: montarCraft(),
        spawns: montarSpawns(),
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

      <Secao titulo="Identificação" descricao="EN em branco repete o PT — o site mostra os dois idiomas.">
        <Campo rotulo="Nome (PT)"><input className={estiloInput} value={f.nomePt} onChange={(e) => set('nomePt', e.target.value)} /></Campo>
        <Campo rotulo="Nome (EN)"><input className={estiloInput} value={f.nomeEn} onChange={(e) => set('nomeEn', e.target.value)} /></Campo>
        <Campo rotulo="Categoria (PT)"><input className={estiloInput} value={f.categoriaPt} onChange={(e) => set('categoriaPt', e.target.value)} placeholder="Diversos" /></Campo>
        <Campo rotulo="Categoria (EN)"><input className={estiloInput} value={f.categoriaEn} onChange={(e) => set('categoriaEn', e.target.value)} placeholder="Miscellaneous" /></Campo>
        <Campo rotulo="Ramo (PT)"><input className={estiloInput} value={f.ramoPt} onChange={(e) => set('ramoPt', e.target.value)} placeholder="Diversos" /></Campo>
        <Campo rotulo="Ramo (EN)"><input className={estiloInput} value={f.ramoEn} onChange={(e) => set('ramoEn', e.target.value)} placeholder="Miscellaneous" /></Campo>
        <Campo rotulo="Raridade">
          <select className={estiloInput} value={f.raridadePt} onChange={(e) => set('raridadePt', e.target.value)}>
            {RARIDADES.map((r) => <option key={r.pt} value={r.pt}>{r.pt} ({r.en})</option>)}
          </select>
        </Campo>
        <Campo rotulo="Peso (kg, opcional)"><input className={estiloInput} inputMode="decimal" value={f.peso} onChange={(e) => set('peso', e.target.value)} /></Campo>
        <Campo rotulo="Imagem (URL, opcional)" className="sm:col-span-2">
          <input className={estiloInput} value={f.icone} onChange={(e) => set('icone', e.target.value)} placeholder="https://…" />
          {f.icone.trim() && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={f.icone} alt="" className="mt-1 h-14 w-14 rounded border border-neutral-700 object-contain" />
          )}
        </Campo>
      </Secao>

      <Secao titulo="Textos">
        <Campo rotulo="Descrição (PT)"><textarea className={estiloInput} rows={3} value={f.descricaoPt} onChange={(e) => set('descricaoPt', e.target.value)} /></Campo>
        <Campo rotulo="Descrição (EN)"><textarea className={estiloInput} rows={3} value={f.descricaoEn} onChange={(e) => set('descricaoEn', e.target.value)} /></Campo>
        <Campo rotulo="Efeito (PT)"><textarea className={estiloInput} rows={2} value={f.efeitoPt} onChange={(e) => set('efeitoPt', e.target.value)} /></Campo>
        <Campo rotulo="Efeito (EN)"><textarea className={estiloInput} rows={2} value={f.efeitoEn} onChange={(e) => set('efeitoEn', e.target.value)} /></Campo>
      </Secao>

      <Secao titulo="Loja" descricao="Deixe o vendedor em branco se o item não é vendido.">
        <Campo rotulo="Vendedor"><input className={estiloInput} value={f.lojaVendedor} onChange={(e) => set('lojaVendedor', e.target.value)} /></Campo>
        <Campo rotulo="Preço"><input className={estiloInput} inputMode="numeric" value={f.lojaPreco} onChange={(e) => set('lojaPreco', e.target.value)} /></Campo>
      </Secao>

      <Secao titulo="Receita de craft">
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" checked={f.craftAtivo} onChange={(e) => set('craftAtivo', e.target.checked)} />
          Este item pode ser fabricado
        </label>
        {f.craftAtivo && (
          <div className="flex flex-col gap-2 sm:col-span-2">
            <datalist id="itens-opcao">
              {itensOpcao.map((o) => <option key={o.id} value={o.nomePt} />)}
            </datalist>
            <p className="font-mono text-[11px] uppercase tracking-[.08em] text-neutral-400">Ingredientes</p>
            {f.ingredientes.map((ing, i) => (
              <div key={i} className="flex gap-2">
                <input
                  list="itens-opcao" className={estiloInput} placeholder="Nome (escolha da lista ou digite um novo)"
                  value={ing.nome}
                  onChange={(e) => set('ingredientes', f.ingredientes.map((x, k) => (k === i ? { ...x, nome: e.target.value } : x)))}
                />
                <input
                  className={`${estiloInput} w-20`} inputMode="numeric" aria-label="Quantidade" value={ing.qtd}
                  onChange={(e) => set('ingredientes', f.ingredientes.map((x, k) => (k === i ? { ...x, qtd: e.target.value } : x)))}
                />
                <BotaoMini perigo aoClicar={() => set('ingredientes', f.ingredientes.filter((_, k) => k !== i))}>×</BotaoMini>
              </div>
            ))}
            <div><BotaoMini aoClicar={() => set('ingredientes', [...f.ingredientes, { nome: '', qtd: '1' }])}>+ ingrediente</BotaoMini></div>

            <p className="mt-2 font-mono text-[11px] uppercase tracking-[.08em] text-neutral-400">Bancadas onde se fabrica</p>
            {f.bancadas.map((b, i) => (
              <div key={i} className="flex gap-2">
                <input className={estiloInput} placeholder="PT" value={b.pt}
                  onChange={(e) => set('bancadas', f.bancadas.map((x, k) => (k === i ? { ...x, pt: e.target.value } : x)))} />
                <input className={estiloInput} placeholder="EN (opcional)" value={b.en}
                  onChange={(e) => set('bancadas', f.bancadas.map((x, k) => (k === i ? { ...x, en: e.target.value } : x)))} />
                <BotaoMini perigo aoClicar={() => set('bancadas', f.bancadas.filter((_, k) => k !== i))}>×</BotaoMini>
              </div>
            ))}
            <div><BotaoMini aoClicar={() => set('bancadas', [...f.bancadas, { pt: '', en: '' }])}>+ bancada</BotaoMini></div>

            <Campo rotulo="Chance de sucesso"><input className={`${estiloInput} w-32`} value={f.craftChance} onChange={(e) => set('craftChance', e.target.value)} /></Campo>
          </div>
        )}
      </Secao>

      <Secao titulo="Onde o item aparece (spawn)" descricao="Cada ponto coloca o item num contêiner de um local — ele passa a aparecer no mapa também.">
        <div className="flex flex-col gap-2 sm:col-span-2">
          {f.spawns.map((s, i) => {
            const local = locais.find((l) => l.id === s.localId);
            const mudar = (parcial: Partial<LinhaSpawn>) =>
              set('spawns', f.spawns.map((x, k) => (k === i ? { ...x, ...parcial } : x)));
            return (
              <div key={i} className="grid gap-2 rounded border border-neutral-800 p-2 sm:grid-cols-[1fr_1fr_5rem_4rem_4rem_auto]">
                <select className={estiloInput} aria-label="Local" value={s.localId} onChange={(e) => mudar({ localId: e.target.value, fonteId: '' })}>
                  <option value="">Local…</option>
                  {locais.map((l) => <option key={l.id} value={l.id}>{l.nome.pt}{l.andar ? ` — ${l.andar.pt}` : ''}</option>)}
                </select>
                <select className={estiloInput} aria-label="Contêiner" value={s.fonteId} disabled={!local} onChange={(e) => mudar({ fonteId: e.target.value })}>
                  <option value="">Contêiner…</option>
                  {local?.conteineres.map((c) => <option key={c.fonteId} value={c.fonteId}>{c.nome.pt}</option>)}
                </select>
                <input className={estiloInput} aria-label="Chance (%)" placeholder="%" inputMode="decimal" value={s.chance} onChange={(e) => mudar({ chance: e.target.value })} />
                <input className={estiloInput} aria-label="Quantidade mínima" placeholder="mín" inputMode="numeric" value={s.qtdMin} onChange={(e) => mudar({ qtdMin: e.target.value })} />
                <input className={estiloInput} aria-label="Quantidade máxima" placeholder="máx" inputMode="numeric" value={s.qtdMax} onChange={(e) => mudar({ qtdMax: e.target.value })} />
                <BotaoMini perigo aoClicar={() => set('spawns', f.spawns.filter((_, k) => k !== i))}>×</BotaoMini>
              </div>
            );
          })}
          <div><BotaoMini aoClicar={() => set('spawns', [...f.spawns, { localId: '', fonteId: '', chance: '10', qtdMin: '1', qtdMax: '1' }])}>+ ponto de spawn</BotaoMini></div>
        </div>
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
