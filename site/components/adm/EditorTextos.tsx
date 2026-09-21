'use client';

import { useState } from 'react';
import { TEXTOS_SITE, preencherVariaveis, type TextoEditavel } from '@/lib/textos-site';
import { desembrulhar, type Acao, mensagemDeErro } from '@/lib/acao-cliente';
import { BotaoMini, Campo, estiloInput } from './campos-form';

/** Números de exemplo só pra prévia — a página pública usa os reais. */
const EXEMPLOS = { total: 42, jogos: 3, locais: 30, loot: 20 };

const PAGINAS: { rota: string; titulo: string }[] = [
  { rota: '/', titulo: 'Página inicial' },
  { rota: '/elenco/', titulo: 'Elenco' },
  { rota: '/itens/', titulo: 'Itens' },
  { rota: '/mapa/', titulo: 'Mapa' },
  { rota: '/faq/', titulo: 'FAQ' },
  { rota: '/mecanicas/', titulo: 'Mecânicas' },
  { rota: '/eventos/', titulo: 'Eventos' },
  { rota: '/codigos/', titulo: 'Códigos' },
];

export function EditorTextos({
  salvos, aoSalvar,
}: {
  /** chave → texto que o ADM já salvou (ausente ou vazio = usando o padrão). */
  salvos: Record<string, string>;
  aoSalvar: (chave: string, valor: string) => Acao;
}) {
  return (
    <div className="space-y-8">
      {PAGINAS.map((p) => {
        const textos = TEXTOS_SITE.filter((t) => t.pagina === p.rota);
        if (textos.length === 0) return null;
        return (
          <section key={p.rota} id={p.rota === '/' ? 'home' : p.rota.replaceAll('/', '')}>
            <div className="mb-3 flex items-baseline gap-3 border-b border-neutral-800 pb-1">
              <h2 className="font-mono text-[12px] tracking-[.12em] text-alter-green">{p.titulo.toUpperCase()}</h2>
              <a href={p.rota} target="_blank" rel="noreferrer" className="font-mono text-[10px] text-cyber-cyan hover:underline">
                ver na página ↗
              </a>
            </div>
            <div className="space-y-4">
              {textos.map((t) => (
                <LinhaTexto key={t.chave} texto={t} salvo={salvos[t.chave] ?? ''} aoSalvar={aoSalvar} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function LinhaTexto({
  texto, salvo, aoSalvar,
}: { texto: TextoEditavel; salvo: string; aoSalvar: (chave: string, valor: string) => Acao }) {
  const [valor, setValor] = useState(salvo || texto.padrao);
  const [gravado, setGravado] = useState(salvo);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  // "Salvar" com o texto igual ao padrão grava vazio: o site continua
  // seguindo o padrão caso ele mude num deploy futuro.
  const paraGravar = valor.trim() === texto.padrao ? '' : valor.trim();
  const mudou = paraGravar !== gravado;
  const usandoPadrao = gravado === '';

  async function enviar(novo: string) {
    setErro(null);
    setOk(false);
    setOcupado(true);
    try {
      await desembrulhar(aoSalvar(texto.chave, novo));
      setGravado(novo);
      if (novo === '') setValor(texto.padrao);
      setOk(true);
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não deu para salvar. Tenta de novo?'));
    } finally {
      setOcupado(false);
    }
  }

  const campoComum = {
    value: valor,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setValor(e.target.value); setOk(false); },
    className: estiloInput,
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); void enviar(paraGravar); }} className="space-y-1.5">
      <Campo rotulo={texto.rotulo}>
        {texto.longo ? <textarea rows={3} {...campoComum} /> : <input {...campoComum} />}
      </Campo>

      <p className="text-[11px] text-neutral-500">
        Como fica: <span className="text-neutral-300">{preencherVariaveis(valor.trim() || texto.padrao, EXEMPLOS)}</span>
        {texto.variaveis && (
          <> · variáveis: {texto.variaveis.map((v) => <code key={v} className="mr-1">{`{${v}}`}</code>)}
            (preenchidas com o número real no site)</>
        )}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          disabled={ocupado || !mudou}
          className="border-2 border-alter-green bg-alter-green/10 px-3 py-1 font-mono text-[10px] font-bold tracking-[.1em] text-alter-green hover:bg-alter-green hover:text-[#08090D] disabled:opacity-50"
        >
          {ocupado ? 'Salvando…' : 'Salvar'}
        </button>
        {!usandoPadrao && (
          <BotaoMini desabilitado={ocupado} aoClicar={() => void enviar('')}>Voltar ao padrão</BotaoMini>
        )}
        <span className="font-mono text-[10px] text-neutral-500">{usandoPadrao ? 'usando o texto padrão' : 'texto personalizado'}</span>
        {ok && <span role="status" className="font-mono text-[10px] text-alter-green">Salvo — já está no site.</span>}
        {erro && <span role="alert" className="font-mono text-[10px] text-red-400">{erro}</span>}
      </div>
    </form>
  );
}
