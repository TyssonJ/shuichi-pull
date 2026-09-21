import { listarPersonagensComCorrecoes } from '@/lib/dados-corrigidos';
import { listarItensComCorrecoes } from '@/lib/itens-corrigidos';
import { repositorioPartidas } from '@/db/repositorios/partidas';
import { repositorioUsuarios } from '@/db/repositorios/usuarios';
import { repositorioAuditoria } from '@/db/repositorios/auditoria';
import { repositorioPerfilEstilos } from '@/db/repositorios/perfil-estilos';
import { sessaoAdm } from '@/lib/adm/sessao';
import { agoraMs } from '@/lib/agora';
import {
  atividadePorDia, linhaDeLog, segmentosDeStatus, segmentosDeUid,
} from '@/lib/adm/painel';
import { CartaoStatus } from '@/components/adm/CartaoStatus';
import { AcaoRapida } from '@/components/adm/AcaoRapida';
import { GraficoBarra } from '@/components/adm/GraficoBarra';
import { GraficoDias } from '@/components/adm/GraficoDias';
import { LogAlterEgo } from '@/components/adm/LogAlterEgo';

const DIA = 86_400_000;

export default async function AdmIndex() {
  const agora = agoraMs();
  const [personagens, itens, partidas, usuarios, sessao, perfisPendentes] = await Promise.all([
    listarPersonagensComCorrecoes(),
    listarItensComCorrecoes(),
    repositorioPartidas.listarTodas(),
    repositorioUsuarios.listarTodos(),
    sessaoAdm(),
    repositorioPerfilEstilos.contarPendentes(),
  ]);

  // Auditoria é só pro chefe (a própria página já é): o gráfico e o log
  // mostram quem fez o quê, então seguem a mesma regra.
  const ehChefe = sessao?.papel === 'chefe';
  const semana = ehChefe
    ? await repositorioAuditoria.listarAuditoria({ desde: new Date(agora - 8 * DIA), limite: 500 })
    : [];

  const agendadas = partidas.filter((p) => p.status === 'agendada');
  const proximas24h = agendadas.filter((p) => {
    const t = p.dataHora.getTime();
    return t >= agora && t <= agora + DIA;
  }).length;
  const uidsPendentes = usuarios.filter((u) => u.uuidStatus === 'pendente' && u.uuidGmod).length;

  const nomes = new Map(usuarios.map((u) => [u.discordId, u.discordNome]));
  const log = semana.slice(0, 10).map((l) => ({ chave: l.id, ...linhaDeLog(l, nomes) }));

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="font-mono text-[10px] tracking-[.25em] text-alter-green/70">
          [ ADMIN_CONSOLE // {sessao?.papel?.toUpperCase() ?? 'ADM'} ]
        </p>
        <h1 className="text-3xl font-black tracking-tight text-neutral-100">PAINEL</h1>
        <p className="text-sm text-neutral-400">Visão geral do site — clique num cartão pra gerenciar.</p>
      </header>

      <div className="flex flex-wrap gap-2">
        <AcaoRapida href="/partidas/nova/" destaque>+ Nova partida</AcaoRapida>
        <AcaoRapida href="/adm/itens">+ Novo item</AcaoRapida>
        <AcaoRapida href="/adm/personagens">+ Novo personagem</AcaoRapida>
        <AcaoRapida href="/adm/eventos">+ Novo evento</AcaoRapida>
        <AcaoRapida href="/adm/usuarios">Revisar UIDs</AcaoRapida>
        <AcaoRapida href="/" novaAba>Ver o site ↗</AcaoRapida>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-7">
        <CartaoStatus valor={agendadas.length} rotulo="Partidas agendadas" url="/adm/partidas" cor="#00FF66" />
        <CartaoStatus valor={proximas24h} rotulo="Começam em 24h" url="/adm/partidas" cor="#FF007F" />
        <CartaoStatus
          valor={uidsPendentes} rotulo="UIDs pendentes" url="/adm/usuarios"
          cor={uidsPendentes > 0 ? '#F59E0B' : '#D6D6E0'} alerta={uidsPendentes > 0}
        />
        <CartaoStatus
          valor={perfisPendentes} rotulo="Perfis aguardando" url="/adm/perfis"
          cor={perfisPendentes > 0 ? '#F59E0B' : '#D6D6E0'} alerta={perfisPendentes > 0}
        />
        <CartaoStatus valor={usuarios.length} rotulo="Usuários" url="/adm/usuarios" cor="#00F0FF" />
        <CartaoStatus valor={itens.length} rotulo="Itens" url="/adm/itens" />
        <CartaoStatus valor={personagens.length} rotulo="Personagens" url="/adm/personagens" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <GraficoBarra titulo="Partidas por status" segmentos={segmentosDeStatus(partidas)} />
        <GraficoBarra titulo="UIDs dos usuários" segmentos={segmentosDeUid(usuarios)} />
        {ehChefe && (
          <GraficoDias
            titulo="Ações do painel — 7 dias"
            dias={atividadePorDia(semana, 7, new Date(agora))}
          />
        )}
      </div>

      {ehChefe && <LogAlterEgo linhas={log} />}

      <div className="flex flex-wrap gap-2 border-t border-neutral-800 pt-4">
        <AcaoRapida href="/adm/configuracoes">Configurações do site</AcaoRapida>
        {ehChefe && <AcaoRapida href="/adm/auditoria">Auditoria completa</AcaoRapida>}
        {ehChefe && <AcaoRapida href="/adm/administradores">Administradores</AcaoRapida>}
      </div>
    </div>
  );
}
