import { repositorioConfiguracoes } from '@/db/repositorios/configuracoes';
import { TOGGLES, obterToggle } from '@/lib/configuracoes';
import { definirConfiguracaoAction } from './acoes';
import { ListaToggles } from '@/components/adm/ListaToggles';

export default async function AdmConfiguracoes() {
  const config = await repositorioConfiguracoes.listar();
  const valores = Object.fromEntries(TOGGLES.map((t) => [t.chave, obterToggle(config, t.chave)]));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-bold">Configurações do site</h1>
      <p className="text-sm text-neutral-400">
        Toggles de exibição pro site público. Mais opções entram aqui conforme forem pedidas —
        não precisa de migração pra adicionar uma nova.
      </p>
      <ListaToggles toggles={TOGGLES} valores={valores} aoSalvar={definirConfiguracaoAction} />
    </div>
  );
}
