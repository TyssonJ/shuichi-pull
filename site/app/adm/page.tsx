import { listarPersonagensComCorrecoes } from '@/lib/dados-corrigidos';
import { listarItensComCorrecoes } from '@/lib/itens-corrigidos';
import { listarEventos } from '@/lib/eventos';
import { repositorioPartidas } from '@/db/repositorios/partidas';
import { repositorioUsuarios } from '@/db/repositorios/usuarios';
import { sessaoAdm } from '@/lib/adm/sessao';
import { CartaoStatus } from '@/components/adm/CartaoStatus';

export default async function AdmIndex() {
  const [personagens, itens, eventos, partidas, usuarios, sessao] = await Promise.all([
    listarPersonagensComCorrecoes(),
    listarItensComCorrecoes(),
    listarEventos(),
    repositorioPartidas.listarAbertas(),
    repositorioUsuarios.listarTodos(),
    sessaoAdm(),
  ]);

  const partidasAgendadas = partidas.filter((p) => p.status === 'agendada').length;
  const uidsPendentes = usuarios.filter((u) => u.uuidStatus === 'pendente' && u.uuidGmod).length;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-bold">Painel</h1>
      <p className="text-sm text-neutral-400">Visão geral do site — clique num cartão pra gerenciar.</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <CartaoStatus valor={partidasAgendadas} rotulo="Partidas agendadas" url="/adm/partidas" cor="text-green-400" />
        <CartaoStatus
          valor={uidsPendentes}
          rotulo="UIDs pendentes"
          url="/adm/usuarios"
          cor={uidsPendentes > 0 ? 'text-amber-400' : 'text-neutral-100'}
        />
        <CartaoStatus valor={usuarios.length} rotulo="Usuários" url="/adm/usuarios" />
        <CartaoStatus valor={eventos.length} rotulo="Eventos" url="/adm/eventos" />
        <CartaoStatus valor={itens.length} rotulo="Itens" url="/adm/itens" />
        <CartaoStatus valor={personagens.length} rotulo="Personagens" url="/adm/personagens" />
      </div>

      <div className="flex flex-wrap gap-2 border-t border-neutral-800 pt-4">
        <a href="/adm/configuracoes" className="rounded border border-neutral-700 px-3 py-1.5 text-sm hover:border-neutral-500">
          Configurações do site
        </a>
        {sessao?.papel === 'chefe' && (
          <a href="/adm/auditoria" className="rounded border border-neutral-700 px-3 py-1.5 text-sm hover:border-neutral-500">
            Auditoria de ações
          </a>
        )}
      </div>
    </div>
  );
}
