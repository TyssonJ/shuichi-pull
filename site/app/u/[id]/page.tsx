import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { repositorioUsuarios } from '@/db/repositorios/usuarios';
import { repositorioPartidas } from '@/db/repositorios/partidas';
import { listarPersonagensComCorrecoes } from '@/lib/dados-corrigidos';
import { tituloPorPartidas } from '@/lib/titulos';
import { formatarDataBR } from '@/lib/fuso';
import { PainelComTrilhas } from '@/components/layout/PainelComTrilhas';
import { CabecalhoPerfil } from '@/components/perfil/CabecalhoPerfil';
import { AvaliacoesRecebidas } from '@/components/perfil/AvaliacoesRecebidas';
import { Conquistas } from '@/components/perfil/Conquistas';
import { MoldePerfil } from '@/components/perfil/MoldePerfil';
import { BlogDoPerfil } from '@/components/perfil/BlogDoPerfil';
import { JunkoNoPerfil } from '@/components/perfil/JunkoNoPerfil';
import { repositorioPerfilPosts } from '@/db/repositorios/perfil-posts';
import { publicarPostAction, apagarPostAction } from '@/app/conta/post-acoes';
import { repositorioPerfilEstilos } from '@/db/repositorios/perfil-estilos';
import { repositorioCargos } from '@/db/repositorios/cargos';
import { repositorioConquistas } from '@/db/repositorios/conquistas';
import { repositorioPartidaAvaliacoes } from '@/db/repositorios/partida-avaliacoes';
import { resumirAvaliacoes, reputacao } from '@/lib/avaliacoes-perfil';
import { bannerDoRegistro } from '@/lib/perfil-visual';
import { identidadeDe } from '@/lib/identidade';
import { spriteInteiroDoPersonagem } from '@/lib/sprites';
import { auth } from '@/auth';
import { removerAvaliacaoAdmAction } from './acoes';

const formatarData = (d: Date) => formatarDataBR(d, true);

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const usuario = await repositorioUsuarios.buscar(id);
  return { title: usuario ? `${usuario.apelido ?? usuario.discordNome} — Shuichi Pull` : 'Perfil não encontrado — Shuichi Pull' };
}

function Estatistica({ valor, rotulo, cor }: { valor: number; rotulo: string; cor: string }) {
  return (
    <div className="clip-dossier-card border border-line bg-[#0E0E13] p-2.5 text-center">
      <p className="font-mono text-2xl font-black leading-none" style={{ color: cor }}>{valor}</p>
      <p className="mt-1 font-mono text-[8px] uppercase tracking-[.1em] text-dim">{rotulo}</p>
    </div>
  );
}

const DESFECHO_COR = {
  vitoria: { borda: 'border-alter-green/50', texto: 'text-alter-green', rotulo: 'VITÓRIA' },
  derrota: { borda: 'border-execution-pink/50', texto: 'text-execution-pink', rotulo: 'DERROTA' },
  tragedia: { borda: 'border-line', texto: 'text-dim', rotulo: 'TRAGÉDIA' },
} as const;

export default async function PerfilPublico({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const usuario = await repositorioUsuarios.buscar(id);
  if (!usuario) notFound();

  const [{ historico, estatisticas }, personagens, recebidas, sessao, cargos, conquistas, estiloLinha, posts] = await Promise.all([
    repositorioPartidas.perfilDoUsuario(id),
    listarPersonagensComCorrecoes(),
    repositorioPartidaAvaliacoes.listarRecebidas(id),
    auth(),
    repositorioCargos.cargosDoUsuario(id),
    repositorioConquistas.conquistasDoUsuario(id),
    repositorioPerfilEstilos.buscar(id),
    repositorioPerfilPosts.listar(id),
  ]);
  const estilo = estiloLinha?.publicado ?? null;
  const souAdm = Boolean(sessao?.user?.papel);
  const souDono = sessao?.user?.discordId === id;
  const identidade = identidadeDe(usuario);
  const resumo = resumirAvaliacoes(recebidas);
  const banner = bannerDoRegistro(usuario.bannerTipo, usuario.bannerValor, new Set(personagens.map((p) => p.id)));
  const personagemDoBanner = banner.tipo === 'personagem' ? personagens.find((p) => p.id === banner.valor) : undefined;
  const spriteDoBanner = personagemDoBanner
    ? spriteInteiroDoPersonagem(personagemDoBanner.id) ?? personagemDoBanner.sprite
    : null;
  async function removerAvaliacao(avaliacaoId: number) {
    'use server';
    await removerAvaliacaoAdmAction(id, avaliacaoId);
  }
  const porId = new Map(personagens.map((p) => [p.id, p]));
  const mains = usuario.mains.map((mid) => porId.get(mid)).filter((p) => p !== undefined);
  const titulo = tituloPorPartidas(estatisticas.total);

  return (
    <MoldePerfil estilo={estilo}>
    <PainelComTrilhas as="article">
      <CabecalhoPerfil
        nome={identidade.nome}
        avatar={identidade.avatar}
        nomeOriginal={identidade.nomeOriginal}
        avatarOriginal={identidade.avatarOriginal}
        desde={formatarData(usuario.criadoEm)}
        titulo={titulo}
        reputacao={reputacao(resumo)}
        cargos={cargos}
        bio={usuario.bio}
        emojis={estilo?.emojis}
        banner={banner}
        spritePersonagem={spriteDoBanner}
        editarHref={souDono ? '/conta/' : undefined}
      />

      <section className="mt-6">
        <h2 className="mb-2 font-mono text-[10px] tracking-[.14em] text-dim">
          ESTATÍSTICAS DE COMBATE E INVESTIGAÇÃO
        </h2>
        {estatisticas.total === 0 ? (
          <p className="text-[12px] text-dim">Nenhuma partida finalizada ainda.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            <Estatistica valor={estatisticas.total} rotulo="Partidas" cor="#D6D6E0" />
            <Estatistica valor={estatisticas.vitorias} rotulo="Vitórias" cor="#00FF66" />
            <Estatistica valor={estatisticas.derrotas} rotulo="Derrotas" cor="#FF007F" />
            <Estatistica valor={estatisticas.tragedias} rotulo="Tragédias" cor="#7A7A88" />
            <Estatistica valor={estatisticas.mvps} rotulo="MVPs" cor="#F5D30E" />
            <Estatistica valor={estatisticas.comoBlackened} rotulo="Como Blackened" cor="#FF007F" />
            <Estatistica valor={estatisticas.comoDetetive} rotulo="Como Detetive" cor="#00F0FF" />
            <Estatistica valor={estatisticas.casosResolvidos} rotulo="Casos Resolvidos" cor="#00FF66" />
            <Estatistica valor={estatisticas.assassinado} rotulo="Assassinado(a)" cor="#FF3B3B" />
            <Estatistica valor={estatisticas.afk} rotulo="AFK / Quedas" cor="#F59E0B" />
          </div>
        )}
      </section>

      {mains.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 font-mono text-[10px] tracking-[.14em] text-dim">MAINS</h2>
          <ul className="flex flex-wrap gap-2">
            {mains.map((p) => (
              <li key={p!.id}>
                <Link
                  href={`/elenco/${p!.id}/`}
                  className="flex items-center gap-1.5 rounded-[3px] border border-line bg-sur px-2 py-1 hover:border-alter-green"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p!.sprite} alt="" className="h-6 w-6 object-contain" />
                  <span className="text-[12px] text-[#D6D6E0]">{p!.nome}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Conquistas
        conquistas={conquistas.map((c) => ({
          id: c.id, nome: c.nome, descricaoCurta: c.descricaoCurta, descricaoLonga: c.descricaoLonga,
          iconeUrl: c.iconeUrl, concedidaEm: formatarData(c.concedidaEm), motivo: c.motivo,
        }))}
      />

      {/* O bot é externo e pode demorar: o resto do perfil não espera por ele. */}
      <Suspense fallback={null}>
        <JunkoNoPerfil discordId={id} />
      </Suspense>

      <BlogDoPerfil
        posts={posts.map((p) => ({ id: p.id, texto: p.texto, anexos: p.anexos, quando: formatarData(p.criadoEm) }))}
        emojis={estilo?.emojis}
        aoPublicar={souDono ? publicarPostAction : undefined}
        aoApagar={souDono || souAdm ? apagarPostAction : undefined}
      />

      <AvaliacoesRecebidas resumo={resumo} moderar={souAdm} aoRemover={removerAvaliacao} />

      <section className="mt-6">
        <h2 className="mb-2 font-mono text-[10px] tracking-[.14em] text-dim">
          HISTÓRICO DE PARTIDAS{estatisticas.total > 0 && ` — ${estatisticas.total} finalizada${estatisticas.total > 1 ? 's' : ''}`}
        </h2>
        {historico.length === 0 ? (
          <p className="text-[12px] text-dim">Nenhuma partida finalizada ainda.</p>
        ) : (
          <ul className="max-h-[32rem] space-y-1.5 overflow-y-auto pr-1">
            {historico.map((p) => {
              const d = p.desfecho ? DESFECHO_COR[p.desfecho] : null;
              return (
                <li key={p.id}>
                  <Link
                    href={`/partidas/${p.id}/`}
                    className={`flex flex-wrap items-baseline gap-x-2 rounded-[3px] border ${d?.borda ?? 'border-line'} bg-sur px-2 py-1.5 text-[13px] text-[#D6D6E0] hover:border-cyber-cyan`}
                  >
                    <span className="font-bold">{p.titulo}</span>
                    {p.eraBlackened && (
                      <span className="font-mono text-[9px] text-execution-pink">BLACKENED</span>
                    )}
                    {d && <span className={`font-mono text-[9px] ${d.texto}`}>{d.rotulo}</span>}
                    <span className="ml-auto font-mono text-[10px] text-dim">
                      {formatarData(p.dataHora)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </PainelComTrilhas>
    </MoldePerfil>
  );
}
