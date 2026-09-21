'use client';

import { useState } from 'react';
import type { EstadoBot } from '@/lib/junko/ping';
import type { ResultadoEnvio } from '@/lib/junko/enviar';
import type { ResultadoImportacaoBot } from '@/app/adm/junko/acoes';
import { ENDPOINTS_DO_SITE, EVENTOS_PARA_O_BOT } from '@/lib/junko/contrato';
import { URL_SITE } from '@/lib/junko/config';
import { desembrulhar, type Acao } from '@/lib/acao-cliente';
import { BotaoMini, Campo, estiloInput } from './campos-form';

export type LinhaLog = { id: number; quando: string; acao: string; alvo: string; detalhe: string | null };

function Cartao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="clip-dossier-card relative border-2 border-neutral-800 bg-[#0A0D0A] p-4">
      <span aria-hidden className="crt-lines pointer-events-none absolute inset-0 opacity-10" />
      <h2 className="relative mb-3 font-mono text-[11px] tracking-[.14em] text-alter-green">{titulo}</h2>
      <div className="relative space-y-3">{children}</div>
    </section>
  );
}

const mensagemDe = (e: unknown, padrao: string) => (e instanceof Error && e.message ? e.message : padrao);

export function PainelJunko({
  botInicial, urlInicial, ativoInicial, chaveApiConfigurada, chaveSaidaConfigurada, log,
  caminhoAvaliacoesInicial, ultimaImportacao,
  aoVerificar, aoGerarChave, aoSalvar, aoTestar, aoImportarAvaliacoes,
}: {
  botInicial: EstadoBot;
  urlInicial: string;
  ativoInicial: boolean;
  chaveApiConfigurada: boolean;
  chaveSaidaConfigurada: boolean;
  log: LinhaLog[];
  caminhoAvaliacoesInicial: string;
  /** Texto já formatado da última importação, ou null se nunca rodou. */
  ultimaImportacao: string | null;
  aoVerificar: () => Promise<EstadoBot>;
  aoGerarChave: () => Promise<string>;
  aoSalvar: (dados: { url: string; ativo: boolean; chaveSaida: string | null; caminhoAvaliacoes?: string }) => Acao;
  aoTestar: () => Promise<ResultadoEnvio>;
  aoImportarAvaliacoes: () => Promise<ResultadoImportacaoBot>;
}) {
  const [bot, setBot] = useState(botInicial);
  const [verificando, setVerificando] = useState(false);

  const [chaveNova, setChaveNova] = useState<string | null>(null);
  const [gerando, setGerando] = useState(false);
  const [copiada, setCopiada] = useState(false);
  const [temChave, setTemChave] = useState(chaveApiConfigurada);

  const [url, setUrl] = useState(urlInicial);
  const [ativo, setAtivo] = useState(ativoInicial);
  const [chaveSaida, setChaveSaida] = useState('');
  const [apagarChaveSaida, setApagarChaveSaida] = useState(false);
  const [temChaveSaida, setTemChaveSaida] = useState(chaveSaidaConfigurada);
  const [salvando, setSalvando] = useState(false);
  const [avisoConfig, setAvisoConfig] = useState<string | null>(null);

  const [caminhoAval, setCaminhoAval] = useState(caminhoAvaliacoesInicial);
  const [importando, setImportando] = useState(false);
  const [importacao, setImportacao] = useState<ResultadoImportacaoBot | null>(null);

  const [testando, setTestando] = useState(false);
  const [resultadoTeste, setResultadoTeste] = useState<ResultadoEnvio | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function verificar() {
    setErro(null);
    setVerificando(true);
    try { setBot(await aoVerificar()); } catch (e) { setErro(mensagemDe(e, 'Não deu para verificar.')); } finally { setVerificando(false); }
  }

  async function gerar() {
    setErro(null);
    setGerando(true);
    setCopiada(false);
    try {
      setChaveNova(await aoGerarChave());
      setTemChave(true);
    } catch (e) { setErro(mensagemDe(e, 'Não deu para gerar a chave.')); } finally { setGerando(false); }
  }

  async function copiar() {
    if (!chaveNova) return;
    try { await navigator.clipboard.writeText(chaveNova); setCopiada(true); } catch { setErro('Não deu para copiar — selecione e copie na mão.'); }
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setAvisoConfig(null);
    setSalvando(true);
    try {
      const enviar = apagarChaveSaida ? '' : chaveSaida.trim() ? chaveSaida : null;
      await desembrulhar(aoSalvar({ url, ativo, chaveSaida: enviar, caminhoAvaliacoes: caminhoAval }));
      if (enviar !== null) setTemChaveSaida(enviar !== '');
      setChaveSaida('');
      setApagarChaveSaida(false);
      setAvisoConfig('Configuração salva.');
    } catch (err) { setErro(mensagemDe(err, 'Não deu para salvar.')); } finally { setSalvando(false); }
  }

  async function importar() {
    setErro(null);
    setImportacao(null);
    setImportando(true);
    try { setImportacao(await aoImportarAvaliacoes()); } catch (e) { setErro(mensagemDe(e, 'Não deu para importar.')); } finally { setImportando(false); }
  }

  async function testar() {
    setErro(null);
    setResultadoTeste(null);
    setTestando(true);
    try { setResultadoTeste(await aoTestar()); } catch (e) { setErro(mensagemDe(e, 'Não deu para enviar o teste.')); } finally { setTestando(false); }
  }

  return (
    <div className="space-y-5">
      {erro && <p role="alert" className="text-[12px] text-red-400">{erro}</p>}

      <Cartao titulo="STATUS DO BOT">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`flex items-center gap-2 border-2 px-2.5 py-1 font-mono text-[12px] font-bold ${
              bot.online ? 'border-alter-green text-alter-green' : 'border-execution-pink text-execution-pink'
            }`}
          >
            <span aria-hidden className={`h-2 w-2 rounded-full ${bot.online ? 'bg-alter-green' : 'bg-execution-pink'} animate-pulse`} />
            {bot.online ? 'ONLINE' : 'OFFLINE'}
          </span>
          {bot.ms !== undefined && <span className="font-mono text-[11px] text-neutral-400">{bot.ms} ms</span>}
          {bot.mensagem && <span className="text-[12px] text-neutral-300">“{bot.mensagem}”</span>}
          {bot.erro && <span className="text-[12px] text-red-300">{bot.erro}</span>}
          <BotaoMini desabilitado={verificando} aoClicar={() => void verificar()}>{verificando ? 'Verificando…' : 'Verificar agora'}</BotaoMini>
        </div>
      </Cartao>

      <Cartao titulo="1 · CHAVE PARA O BOT FALAR COM O SITE">
        <p className="text-[12px] leading-relaxed text-neutral-400">
          O bot manda esta chave no cabeçalho <code>Authorization: Bearer …</code> em todo pedido às rotas
          <code> /api/junko/</code>. O site guarda só o hash: a chave aparece aqui uma única vez.
          Gerar outra <b>invalida a anterior na hora</b>.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`font-mono text-[11px] ${temChave ? 'text-alter-green' : 'text-amber'}`}>
            {temChave ? '● chave ativa' : '○ nenhuma chave — a API do bot está fechada'}
          </span>
          <BotaoMini desabilitado={gerando} aoClicar={() => void gerar()}>{gerando ? 'Gerando…' : temChave ? 'Gerar nova chave' : 'Gerar chave'}</BotaoMini>
        </div>
        {chaveNova && (
          <div className="border-2 border-amber bg-amber/5 p-3">
            <p className="mb-1 font-mono text-[10px] tracking-[.1em] text-amber">COPIE AGORA — NÃO VAI APARECER DE NOVO</p>
            <code className="block break-all bg-[#050805] p-2 font-mono text-[12px] text-[#F2F2F5]" data-testid="chave-nova">{chaveNova}</code>
            <div className="mt-2 flex items-center gap-2">
              <BotaoMini aoClicar={() => void copiar()}>{copiada ? 'Copiada ✓' : 'Copiar'}</BotaoMini>
              <BotaoMini aoClicar={() => setChaveNova(null)}>Já guardei</BotaoMini>
            </div>
          </div>
        )}
      </Cartao>

      <Cartao titulo="2 · ENVIO DE EVENTOS DO SITE PARA O BOT">
        <form onSubmit={(e) => void salvar(e)} className="space-y-3">
          <Campo rotulo="Endereço do bot" dica="O site envia os eventos por POST para <endereço>/eventos.">
            <input value={url} onChange={(e) => setUrl(e.target.value)} className={`${estiloInput} font-mono`} />
          </Campo>
          <Campo
            rotulo="Credencial que o bot exige (opcional)"
            dica={temChaveSaida ? 'Já configurada — deixe em branco para manter.' : 'Vai no cabeçalho Authorization: Bearer, se o bot pedir.'}
          >
            <input
              type="password"
              autoComplete="off"
              value={chaveSaida}
              onChange={(e) => setChaveSaida(e.target.value)}
              placeholder={temChaveSaida ? '••••••••' : ''}
              className={`${estiloInput} font-mono`}
            />
          </Campo>
          {temChaveSaida && (
            <label className="flex items-center gap-2 text-[12px] text-neutral-400">
              <input type="checkbox" checked={apagarChaveSaida} onChange={(e) => setApagarChaveSaida(e.target.checked)} />
              apagar a credencial guardada
            </label>
          )}
          <Campo rotulo="Rota das avaliações no bot" dica="O site puxa as avaliações do bot em <endereço><rota> (padrão /avaliacoes).">
            <input value={caminhoAval} onChange={(e) => setCaminhoAval(e.target.value)} className={`${estiloInput} font-mono`} />
          </Campo>
          <label className="flex items-start gap-2 text-[12px] text-neutral-300">
            <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} className="mt-0.5" />
            <span>
              Enviar eventos ao bot
              <span className="block text-[11px] text-neutral-500">
                Ligue só depois que o bot tiver a rota <code>POST /eventos</code> — senão cada evento vira uma falha no log.
              </span>
            </span>
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="submit"
              disabled={salvando}
              className="border-2 border-alter-green bg-alter-green/10 px-3 py-1.5 font-mono text-[11px] font-bold tracking-[.1em] text-alter-green hover:bg-alter-green hover:text-[#08090D] disabled:opacity-50"
            >
              {salvando ? 'Salvando…' : 'Salvar'}
            </button>
            <BotaoMini desabilitado={testando} aoClicar={() => void testar()}>{testando ? 'Enviando…' : 'Enviar evento de teste'}</BotaoMini>
            {avisoConfig && <span role="status" className="font-mono text-[11px] text-alter-green">{avisoConfig}</span>}
          </div>
        </form>
        {resultadoTeste && (
          <p role="status" className={`font-mono text-[12px] ${resultadoTeste.enviado ? 'text-alter-green' : 'text-red-300'}`}>
            {resultadoTeste.enviado
              ? `✓ O bot recebeu o teste (HTTP ${resultadoTeste.status}).`
              : `✗ Não chegou: ${resultadoTeste.motivo ?? 'falha desconhecida'}.`}
          </p>
        )}
      </Cartao>

      <Cartao titulo="3 · AVALIAÇÕES SITE ⇄ BOT">
        <p className="text-[12px] leading-relaxed text-neutral-400">
          <b>Do bot pro site:</b> o bot manda as avaliações dele em <code>POST /api/junko/avaliacoes/</code>, ou você puxa
          agora pelo botão abaixo. Entram no perfil da pessoa com o selo &quot;via Junko&quot; e contam na média; repetir não duplica.
          <br />
          <b>Do site pro bot:</b> cada avaliação dada aqui vai como evento <code>avaliacao.registrada</code> e fica disponível
          em <code>GET /api/junko/avaliacoes/</code>. Nos dois sentidos, <b>quem avaliou nunca é revelado</b>.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <BotaoMini desabilitado={importando} aoClicar={() => void importar()}>
            {importando ? 'Importando…' : 'Importar avaliações do bot agora'}
          </BotaoMini>
          <span className="font-mono text-[10px] text-neutral-500">
            {ultimaImportacao ? `última importação: ${ultimaImportacao}` : 'nunca importou'}
          </span>
        </div>
        {importacao && importacao.ok && (
          <div role="status" className="font-mono text-[12px]">
            <p className="text-alter-green">✓ {importacao.importadas} avaliaç{importacao.importadas === 1 ? 'ão importada' : 'ões importadas'}.</p>
            {importacao.ignoradas.length > 0 && (
              <details className="mt-1 text-amber">
                <summary className="cursor-pointer">{importacao.ignoradas.length} ignorada(s)</summary>
                <ul className="mt-1 space-y-0.5 text-[11px] text-neutral-400">
                  {importacao.ignoradas.slice(0, 20).map((i, n) => (
                    <li key={n}>{i.externoId ?? '?'} — {i.motivo}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}
        {importacao && !importacao.ok && (
          <p role="status" className="font-mono text-[12px] text-red-300">✗ {importacao.erro}</p>
        )}
      </Cartao>

      <Cartao titulo="CONTRATO">
        <div>
          <p className="mb-1 font-mono text-[10px] tracking-[.1em] text-neutral-400">O BOT CHAMA O SITE ({URL_SITE})</p>
          <ul className="space-y-0.5">
            {ENDPOINTS_DO_SITE.map((e) => (
              <li key={e.metodo + e.caminho} className="text-[12px] text-neutral-300">
                <code className="text-cyber-cyan">{e.metodo} {e.caminho}</code> — {e.descricao}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-1 font-mono text-[10px] tracking-[.1em] text-neutral-400">O SITE AVISA O BOT (POST …/eventos)</p>
          <ul className="space-y-0.5">
            {EVENTOS_PARA_O_BOT.map((e) => (
              <li key={e.evento} className="text-[12px] text-neutral-300">
                <code className="text-amber">{e.evento}</code> — {e.quando}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-[11px] text-neutral-500">Formato completo dos dados: <code>docs/junko-bot-api.md</code> no repositório.</p>
      </Cartao>

      <Cartao titulo="ÚLTIMOS REGISTROS DA INTEGRAÇÃO">
        {log.length === 0 ? (
          <p className="text-[12px] text-neutral-500">Nada registrado ainda.</p>
        ) : (
          <ul className="space-y-1">
            {log.map((l) => (
              <li key={l.id} className="flex flex-wrap gap-x-2 font-mono text-[11px] text-neutral-400">
                <span className="text-neutral-500">{l.quando}</span>
                <span className={l.acao === 'junko.falha' ? 'text-red-300' : 'text-alter-green'}>{l.acao}</span>
                <span>{l.alvo}</span>
                {l.detalhe && <span className="text-neutral-500">— {l.detalhe}</span>}
              </li>
            ))}
          </ul>
        )}
      </Cartao>
    </div>
  );
}
