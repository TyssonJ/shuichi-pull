import { repositorioConfiguracoes } from '@/db/repositorios/configuracoes';
import { PREFIXO_TEXTO, TEXTOS_SITE } from '@/lib/textos-site';
import { EditorTextos } from '@/components/adm/EditorTextos';
import { salvarTextoAction } from './acoes';

export default async function AdmTextos() {
  const config = await repositorioConfiguracoes.listar();
  const salvos = Object.fromEntries(
    TEXTOS_SITE.map((t) => [t.chave, config[PREFIXO_TEXTO + t.chave] ?? '']),
  );

  return (
    <div>
      <h1 className="mb-1 text-lg font-bold">Textos do site</h1>
      <p className="mb-6 text-sm text-neutral-400">
        Títulos e introduções das páginas. Cada campo mostra como a frase fica; onde aparece{' '}
        <code>{'{total}'}</code>, o site troca pelo número real. Perguntas do FAQ e cards de mecânica
        têm o próprio editor, em FAQ e Mecânicas.
      </p>
      <EditorTextos salvos={salvos} aoSalvar={salvarTextoAction} />
    </div>
  );
}
