import { db } from '../db/client';
import { eventos as tabelaEventos, codigos as tabelaCodigos } from '../db/schema';
import { listarEventos, listarCodigos, type Evento, type Codigo } from '../lib/eventos';

export function mapearEvento(evento: Evento) {
  return {
    id: evento.id,
    tipo: evento.tipo,
    titulo: evento.titulo,
    data: evento.data,
    ate: evento.ate,
    destaque: evento.destaque,
    autor: evento.autor,
    resumo: evento.resumo,
    corpo: evento.corpo,
  };
}

export function mapearCodigo(codigo: Codigo) {
  return {
    codigo: codigo.codigo,
    recompensa: codigo.recompensa,
    descricao: codigo.descricao,
    expiraEm: codigo.expiraEm,
    fonte: codigo.fonte,
  };
}

/** Roda uma vez, manualmente — não é chamado por nenhum código de produção.
 * Depois de rodar, content/eventos.json e content/codigos.json saem do repo. */
export async function migrar() {
  const eventos = listarEventos().map(mapearEvento);
  const codigos = listarCodigos().map(mapearCodigo);

  if (eventos.length > 0) await db.insert(tabelaEventos).values(eventos);
  if (codigos.length > 0) await db.insert(tabelaCodigos).values(codigos);

  console.log(`Migrados: ${eventos.length} eventos, ${codigos.length} códigos.`);
}

if (require.main === module) {
  migrar().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
}
