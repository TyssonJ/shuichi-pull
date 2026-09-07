import { listarCodigos } from '@/lib/eventos';
import { salvarCodigo, excluirCodigo } from './acoes';
import { FormularioCodigo } from '@/components/adm/FormularioCodigo';

export default async function AdmCodigos() {
  const codigos = await listarCodigos();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-bold">Códigos</h1>
      <FormularioCodigo codigo={null} aoSalvar={salvarCodigo} />
      <ul className="flex flex-col gap-2">
        {codigos.map((c) => (
          <li key={c.codigo} className="flex items-center justify-between rounded border border-neutral-800 p-2">
            <span>{c.codigo} — {c.recompensa}</span>
            <form action={excluirCodigo.bind(null, c.codigo)}>
              <button type="submit" className="text-red-400">Excluir</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
