type Linha = {
  id: number; autor: string; acao: string; alvo: string;
  valorAntigo: string | null; valorNovo: string | null; criadoEm: Date;
};

export function TabelaAuditoria({ linhas }: { linhas: Linha[] }) {
  if (linhas.length === 0) {
    return <p>Nenhuma entrada de auditoria ainda.</p>;
  }

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr><th>Quando</th><th>Autor</th><th>Ação</th><th>Alvo</th><th>De</th><th>Para</th></tr>
      </thead>
      <tbody>
        {linhas.map((l) => (
          <tr key={l.id}>
            <td>{l.criadoEm.toLocaleString('pt-BR')}</td>
            <td>{l.autor}</td>
            <td>{l.acao}</td>
            <td>{l.alvo}</td>
            <td>{l.valorAntigo ?? '—'}</td>
            <td>{l.valorNovo ?? '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
