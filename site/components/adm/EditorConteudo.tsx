'use client';

import { useMemo, useState } from 'react';
import type { Colecao } from '@/lib/correcoes-merge';
import type { RegistroEditor } from '@/lib/adm/montar-registros';
import { urlPublicaDoRegistro } from '@/lib/adm/rotas-colecao';
import type { CampoEditor } from '@/lib/adm/campos-editor';
import { desembrulhar, type Acao, mensagemDeErro } from '@/lib/acao-cliente';
import { BotaoMini, Campo, estiloInput } from './campos-form';
import { PreviewConteudo, type TipoPreview } from './PreviewConteudo';

const LIMITE_SEM_BUSCA = 80;

/**
 * Editor visual de conteúdo: lista à esquerda, formulário e prévia (a
 * página como o público vê) à direita. Serve FAQ, mecânicas, personagens,
 * itens e locais — o que muda entre eles são os campos e o tipo de prévia.
 */
export function EditorConteudo({
  colecao, singular, campos, registros, removidos, preview, gruposExistentes = [], abertoInicial = null,
  aoSalvar, aoReverter, aoCriar, aoExcluir, aoRestaurar,
}: {
  colecao: Colecao;
  /** "pergunta", "card", "personagem"… — vai nos textos e botões. */
  singular: string;
  campos: CampoEditor[];
  registros: RegistroEditor[];
  removidos?: { id: string; titulo: string }[];
  preview: TipoPreview;
  gruposExistentes?: string[];
  /** Id do registro que já abre selecionado (vem do botão "Editar esta página"). */
  abertoInicial?: string | null;
  aoSalvar: (id: string, valores: Record<string, string>) => Acao;
  aoReverter: (id: string) => Acao;
  /** Só FAQ/mecânicas: criar e esconder. Devolve o id criado. */
  aoCriar?: (valores: Record<string, string>) => Acao<string>;
  aoExcluir?: (id: string) => Acao;
  aoRestaurar?: (id: string) => Acao;
}) {
  // null = nada aberto; 'novo' = formulário em branco; senão, o id.
  const [aberto, setAberto] = useState<string | null>(
    abertoInicial && registros.some((r) => r.id === abertoInicial) ? abertoInicial : null,
  );
  const [busca, setBusca] = useState('');

  const visiveis = useMemo(() => {
    const t = busca.trim().toLowerCase();
    const lista = t
      ? registros.filter((r) => r.titulo.toLowerCase().includes(t) || r.id.includes(t) || (r.grupo ?? '').toLowerCase().includes(t))
      : registros;
    return t ? lista : lista.slice(0, LIMITE_SEM_BUSCA);
  }, [registros, busca]);

  const selecionado = aberto && aberto !== 'novo' ? registros.find((r) => r.id === aberto) ?? null : null;
  const podeCriar = Boolean(aoCriar);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder={`buscar ${singular}…`}
          aria-label={`Buscar ${singular}`}
          className={`${estiloInput} max-w-xs`}
        />
        {podeCriar && (
          <button
            type="button"
            onClick={() => setAberto('novo')}
            className="border-2 border-alter-green px-3 py-1.5 font-mono text-[11px] font-bold tracking-[.1em] text-alter-green hover:bg-alter-green hover:text-[#08090D]"
          >
            + NOVA {singular.toUpperCase()}
          </button>
        )}
        <span className="font-mono text-[10px] text-neutral-500">{registros.length} no site</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
        <ul className="max-h-[70vh] space-y-1 overflow-y-auto pr-1" aria-label={`Lista de ${singular}`}>
          {visiveis.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => setAberto(r.id)}
                aria-current={aberto === r.id}
                className={`flex w-full items-start gap-2 rounded-[3px] border px-2 py-1.5 text-left text-[12px] ${
                  aberto === r.id
                    ? 'border-alter-green bg-alter-green/10 text-[#F2F2F5]'
                    : 'border-neutral-800 text-neutral-300 hover:border-neutral-600'
                }`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{r.titulo}</span>
                  {r.grupo && <span className="block truncate font-mono text-[9px] text-neutral-500">{r.grupo}</span>}
                </span>
                {r.origem === 'novo' && (
                  <span className="shrink-0 border border-alter-green px-1 font-mono text-[8px] text-alter-green">NOVO</span>
                )}
                {r.alterado && (
                  <span className="shrink-0 border border-amber px-1 font-mono text-[8px] text-amber">EDITADO</span>
                )}
              </button>
            </li>
          ))}
          {visiveis.length === 0 && <li className="text-[12px] text-neutral-500">Nada com esse nome.</li>}
          {!busca.trim() && registros.length > LIMITE_SEM_BUSCA && (
            <li className="font-mono text-[10px] text-neutral-500">Mostrando {LIMITE_SEM_BUSCA} — use a busca pra achar o resto.</li>
          )}
        </ul>

        <div className="min-w-0">
          {aberto === null && (
            <p className="rounded-[4px] border border-dashed border-neutral-800 p-6 text-center text-[12px] text-neutral-500">
              Escolha {singular === 'pergunta' || singular === 'mecânica' ? 'uma' : 'um'} {singular} na lista
              {podeCriar ? ` ou crie ${singular === 'pergunta' ? 'uma nova' : 'um novo'}` : ''} pra editar e ver como fica no site.
            </p>
          )}

          {aberto === 'novo' && podeCriar && (
            <FormularioRegistro
              key="novo"
              colecao={colecao} singular={singular} campos={campos} preview={preview}
              gruposExistentes={gruposExistentes}
              registro={null}
              aoSalvar={async (valores) => {
                const id = await desembrulhar(aoCriar!(valores));
                setAberto(id);
              }}
              aoReverter={async () => {}}
              aoExcluir={undefined}
            />
          )}

          {selecionado && (
            <FormularioRegistro
              key={selecionado.id}
              colecao={colecao} singular={singular} campos={campos} preview={preview}
              gruposExistentes={gruposExistentes}
              registro={selecionado}
              aoSalvar={(valores) => desembrulhar(aoSalvar(selecionado.id, valores))}
              aoReverter={() => desembrulhar(aoReverter(selecionado.id))}
              aoExcluir={aoExcluir ? async () => { await desembrulhar(aoExcluir(selecionado.id)); setAberto(null); } : undefined}
            />
          )}
        </div>
      </div>

      {removidos && removidos.length > 0 && aoRestaurar && (
        <Removidos removidos={removidos} singular={singular} aoRestaurar={aoRestaurar} />
      )}
    </div>
  );
}

function FormularioRegistro({
  colecao, singular, campos, preview, gruposExistentes, registro, aoSalvar, aoReverter, aoExcluir,
}: {
  colecao: Colecao;
  singular: string;
  campos: CampoEditor[];
  preview: TipoPreview;
  gruposExistentes: string[];
  /** null = criando um novo. */
  registro: RegistroEditor | null;
  aoSalvar: (valores: Record<string, string>) => Promise<void>;
  aoReverter: () => Promise<void>;
  aoExcluir?: () => Promise<void>;
}) {
  const inicial = useMemo(() => {
    const base: Record<string, string> = {};
    for (const c of campos) base[c.chave] = registro?.valores[c.chave] ?? '';
    return base;
  }, [campos, registro]);

  const [valores, setValores] = useState(inicial);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [confirmandoExcluir, setConfirmandoExcluir] = useState(false);

  const criando = registro === null;
  const mudou = campos.some((c) => valores[c.chave] !== inicial[c.chave]);
  const doGuia = registro?.origem === 'guia';
  const listaId = `grupos-${colecao}`;

  async function executar(acao: () => Promise<void>, ok: string) {
    setErro(null);
    setMensagem(null);
    setOcupado(true);
    try {
      await acao();
      setMensagem(ok);
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não deu para concluir. Tenta de novo?'));
    } finally {
      setOcupado(false);
    }
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); void executar(() => aoSalvar(valores), criando ? 'Criado — já está no site.' : 'Salvo — já está no site.'); }}
      className="space-y-3"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="min-w-0 flex-1 truncate font-mono text-[11px] tracking-[.1em] text-alter-green">
          {criando ? `NOVA ${singular.toUpperCase()}` : `EDITANDO: ${registro.titulo}`}
        </h2>
        {registro && (
          <a
            href={urlPublicaDoRegistro(colecao, registro.id)}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[10px] text-cyber-cyan hover:underline"
          >
            ver na página ↗
          </a>
        )}
      </div>

      {erro && <p role="alert" className="text-[12px] text-red-400">{erro}</p>}
      {mensagem && !mudou && <p role="status" className="text-[12px] text-alter-green">{mensagem}</p>}

      {campos.map((c) => {
        const fixo = c.soNovo && !criando;
        const original = registro?.originais?.[c.chave];
        const difere = doGuia && original !== undefined && valores[c.chave] !== original;
        const ehGrupo = c.soNovo && criando;

        return (
          <Campo
            key={c.chave}
            rotulo={c.rotulo}
            dica={difere ? `Original do guia: ${original || '(vazio)'}` : undefined}
          >
            {c.longo ? (
              <textarea
                value={valores[c.chave]}
                onChange={(e) => setValores((v) => ({ ...v, [c.chave]: e.target.value }))}
                rows={c.chave === 'resposta' || c.chave === 'texto' ? 9 : 5}
                className={`${estiloInput} leading-relaxed`}
              />
            ) : (
              <input
                value={valores[c.chave]}
                onChange={(e) => setValores((v) => ({ ...v, [c.chave]: e.target.value }))}
                disabled={fixo}
                list={ehGrupo ? listaId : undefined}
                className={`${estiloInput} disabled:opacity-60`}
              />
            )}
          </Campo>
        );
      })}

      {(preview === 'faq' || preview === 'mecanica') && (
        <p className="text-[11px] text-neutral-500">
          Formatação: <code>**negrito**</code>, <code>`código`</code>, linhas começando com <code>- </code> viram lista,
          e uma linha em branco separa parágrafos.
        </p>
      )}

      {criando && (
        <datalist id={listaId}>
          {gruposExistentes.map((g) => <option key={g} value={g} />)}
        </datalist>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          disabled={ocupado || (!criando && !mudou)}
          className="border-2 border-alter-green bg-alter-green/10 px-4 py-1.5 font-mono text-[11px] font-bold tracking-[.1em] text-alter-green hover:bg-alter-green hover:text-[#08090D] disabled:opacity-50"
        >
          {ocupado ? 'Salvando…' : criando ? `Criar ${singular}` : 'Salvar'}
        </button>

        {doGuia && registro.alterado && (
          <BotaoMini
            desabilitado={ocupado}
            aoClicar={() => void executar(async () => { await aoReverter(); setValores(registro.originais ?? inicial); }, 'Voltou ao texto original do guia.')}
          >
            Voltar ao original
          </BotaoMini>
        )}

        {aoExcluir && registro && !confirmandoExcluir && (
          <BotaoMini perigo desabilitado={ocupado} aoClicar={() => setConfirmandoExcluir(true)}>
            {doGuia ? `Tirar do site` : `Apagar ${singular}`}
          </BotaoMini>
        )}
        {aoExcluir && registro && confirmandoExcluir && (
          <span className="flex items-center gap-2 text-[12px] text-red-300">
            {doGuia ? 'Vem do guia: fica só oculta, dá pra restaurar.' : 'Vai sumir de vez.'}
            <BotaoMini perigo desabilitado={ocupado} aoClicar={() => void executar(aoExcluir, 'Removido.')}>Confirmar</BotaoMini>
            <BotaoMini aoClicar={() => setConfirmandoExcluir(false)}>Cancelar</BotaoMini>
          </span>
        )}
      </div>

      <PreviewConteudo tipo={preview} valores={valores} />
    </form>
  );
}

function Removidos({
  removidos, singular, aoRestaurar,
}: {
  removidos: { id: string; titulo: string }[];
  singular: string;
  aoRestaurar: (id: string) => Acao;
}) {
  const [erro, setErro] = useState<string | null>(null);
  const [ocupadoId, setOcupadoId] = useState<string | null>(null);

  async function restaurar(id: string) {
    setErro(null);
    setOcupadoId(id);
    try {
      await desembrulhar(aoRestaurar(id));
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não deu para restaurar. Tenta de novo?'));
    } finally {
      setOcupadoId(null);
    }
  }

  return (
    <section className="mt-6 border-t border-neutral-800 pt-4">
      <h2 className="mb-2 font-mono text-[11px] tracking-[.1em] text-neutral-400">
        ESCONDIDAS DO SITE ({removidos.length})
      </h2>
      {erro && <p role="alert" className="mb-2 text-[12px] text-red-400">{erro}</p>}
      <ul className="space-y-1">
        {removidos.map((r) => (
          <li key={r.id} className="flex items-center gap-2 text-[12px] text-neutral-400">
            <span className="min-w-0 flex-1 truncate">{r.titulo}</span>
            <BotaoMini desabilitado={ocupadoId === r.id} aoClicar={() => void restaurar(r.id)}>
              Restaurar {singular}
            </BotaoMini>
          </li>
        ))}
      </ul>
    </section>
  );
}
