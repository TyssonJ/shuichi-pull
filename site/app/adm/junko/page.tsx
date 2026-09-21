import { repositorioConfiguracoes } from '@/db/repositorios/configuracoes';
import { repositorioAuditoria } from '@/db/repositorios/auditoria';
import { sessaoAdm } from '@/lib/adm/sessao';
import { CFG_JUNKO } from '@/lib/junko/config';
import { lerConfigEnvio } from '@/lib/junko/servico';
import { pingarBot } from '@/lib/junko/ping';
import { formatarDataHoraBR } from '@/lib/fuso';
import { PainelJunko } from '@/components/adm/PainelJunko';
import {
  gerarChaveJunkoAction, salvarConfigJunkoAction, enviarTesteJunkoAction, verificarBotAction,
} from './acoes';

export default async function AdmJunko() {
  const sessao = await sessaoAdm();
  if (sessao?.papel !== 'chefe') {
    return (
      <div>
        <h1 className="mb-2 text-lg font-bold">Junko Bot</h1>
        <p className="text-sm text-neutral-400">Só o chefe configura a integração com o bot.</p>
      </div>
    );
  }

  const config = await lerConfigEnvio();
  const [bot, chaveHash, linhas] = await Promise.all([
    pingarBot(config.url),
    repositorioConfiguracoes.obter(CFG_JUNKO.chaveHash),
    repositorioAuditoria.listarAuditoria({ colecao: 'junko', limite: 15 }),
  ]);

  const log = linhas.map((l) => ({
    id: l.id,
    quando: formatarDataHoraBR(l.criadoEm),
    acao: l.acao,
    alvo: l.alvo,
    detalhe: l.acao === 'junko.falha' ? l.valorNovo : null,
  }));

  return (
    <div>
      <h1 className="mb-1 text-lg font-bold">Junko Bot</h1>
      <p className="mb-5 text-sm text-neutral-400">
        Ponte entre o site e o bot do Discord: o bot lê e altera coisas do site (UID, inscrição em partida) e o
        site avisa o bot do que acontece (partida nova, UID pendente…).
      </p>
      <PainelJunko
        botInicial={bot}
        urlInicial={config.url}
        ativoInicial={config.ativo}
        chaveApiConfigurada={Boolean(chaveHash)}
        chaveSaidaConfigurada={Boolean(config.chave)}
        log={log}
        aoVerificar={verificarBotAction}
        aoGerarChave={gerarChaveJunkoAction}
        aoSalvar={salvarConfigJunkoAction}
        aoTestar={enviarTesteJunkoAction}
      />
    </div>
  );
}
