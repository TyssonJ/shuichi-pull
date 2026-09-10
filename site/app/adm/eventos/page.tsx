import { listarEventos } from '@/lib/eventos';
import { salvarEvento, excluirEvento } from './acoes';
import { FormularioEvento } from '@/components/adm/FormularioEvento';

export default async function AdmEventos() {
  const eventos = await listarEventos();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-bold">Eventos</h1>
      <FormularioEvento evento={null} aoSalvar={salvarEvento} />
      <ul className="flex flex-col gap-2">
        {eventos.map((e) => (
          <li key={e.id} className="flex items-center justify-between rounded border border-neutral-800 p-2">
            <span>{e.titulo} — {e.data}</span>
            <form action={excluirEvento.bind(null, e.id)}>
              <button type="submit" className="text-red-400">Excluir</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
