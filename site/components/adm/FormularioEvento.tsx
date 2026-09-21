'use client';

import { useState } from 'react';
import type { Evento } from '@/lib/eventos';
import { mensagemDeErro } from '@/lib/acao-cliente';

const VAZIO: Evento = {
  id: '', tipo: 'noticia', titulo: '', data: '', ate: null, destaque: false,
  autor: '', resumo: '', corpo: '', imagemUrl: null,
};

export function FormularioEvento({
  evento, aoSalvar,
}: { evento: Evento | null; aoSalvar: (dados: Evento) => Promise<void> }) {
  const [dados, setDados] = useState<Evento>(evento ?? VAZIO);
  const [erro, setErro] = useState<string | null>(null);

  function campo<K extends keyof Evento>(chave: K, valor: Evento[K]) {
    setDados((d) => ({ ...d, [chave]: valor }));
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    try {
      await aoSalvar(dados);
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não deu para salvar. Tenta de novo?'));
    }
  }

  return (
    <form className="flex flex-col gap-2" onSubmit={enviar}>
      <label>Id
        <input value={dados.id} onChange={(e) => campo('id', e.target.value)} disabled={!!evento} />
      </label>
      <label>Tipo
        <select value={dados.tipo} onChange={(e) => campo('tipo', e.target.value as Evento['tipo'])}>
          <option value="evento">Evento</option>
          <option value="noticia">Notícia</option>
          <option value="atualizacao">Atualização</option>
        </select>
      </label>
      <label>Título
        <input value={dados.titulo} onChange={(e) => campo('titulo', e.target.value)} />
      </label>
      <label>Data
        <input type="date" value={dados.data} onChange={(e) => campo('data', e.target.value)} />
      </label>
      <label>Até (opcional)
        <input type="date" value={dados.ate ?? ''} onChange={(e) => campo('ate', e.target.value || null)} />
      </label>
      <label>
        <input type="checkbox" checked={dados.destaque} onChange={(e) => campo('destaque', e.target.checked)} />
        Destaque
      </label>
      <label>Autor
        <input value={dados.autor} onChange={(e) => campo('autor', e.target.value)} />
      </label>
      <label>Resumo
        <textarea value={dados.resumo} onChange={(e) => campo('resumo', e.target.value)} />
      </label>
      <label>Corpo
        <textarea value={dados.corpo} onChange={(e) => campo('corpo', e.target.value)} />
      </label>
      <label>Imagem de capa (opcional, URL)
        <input value={dados.imagemUrl ?? ''} onChange={(e) => campo('imagemUrl', e.target.value || null)} />
      </label>
      {dados.imagemUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={dados.imagemUrl} alt="" className="h-24 w-auto rounded border border-neutral-700 object-contain" />
      )}
      <button type="submit">Salvar</button>
      {erro && <p role="alert" className="text-red-400">{erro}</p>}
    </form>
  );
}
