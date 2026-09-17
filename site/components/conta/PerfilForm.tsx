'use client';

import { useState } from 'react';

type Personagem = { id: string; nome: string };

export function PerfilForm({
  uuidInicial, mainsIniciais, personagens, aoSalvar,
}: {
  uuidInicial: string;
  mainsIniciais: string[];
  personagens: Personagem[];
  aoSalvar: (dados: { uuidGmod: string | null; mains: string[] }) => Promise<void>;
}) {
  const [uuid, setUuid] = useState(uuidInicial);
  const [mains, setMains] = useState<string[]>(mainsIniciais);
  const [busca, setBusca] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function alternarMain(id: string) {
    setSalvo(false);
    setMains((atual) => (atual.includes(id) ? atual.filter((m) => m !== id) : [...atual, id]));
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      await aoSalvar({ uuidGmod: uuid.trim() || null, mains });
      setSalvo(true);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não deu para salvar. Tenta de novo?');
    } finally {
      setSalvando(false);
    }
  }

  const filtrados = personagens.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <form onSubmit={salvar} className="mt-6 space-y-6">
      {erro && <p role="alert" className="font-mono text-[10px] text-alerta">{erro}</p>}

      <label className="block">
        <span className="mb-1 block font-mono text-[9px] tracking-[.14em] text-dim">
          UUID DO GARRY&apos;S MOD
        </span>
        <input
          value={uuid}
          onChange={(e) => { setUuid(e.target.value); setSalvo(false); }}
          placeholder="STEAM_0:1:xxxxxxxx"
          className="w-full max-w-xs rounded-[3px] border border-line bg-[#141419] px-2 py-1.5 font-mono text-[11px] text-[#D6D6E0] placeholder:text-dim/60 focus:border-alter-green focus:outline-none"
        />
      </label>

      <div>
        <span className="mb-1 block font-mono text-[9px] tracking-[.14em] text-dim">
          SEUS MAINS {mains.length > 0 && `(${mains.length})`}
        </span>
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="buscar personagem…"
          className="mb-2 w-full max-w-xs rounded-[3px] border border-line bg-[#141419] px-2 py-1.5 font-mono text-[10px] text-[#D6D6E0] placeholder:text-dim/60 focus:border-alter-green focus:outline-none"
        />
        <div className="max-h-52 max-w-md overflow-y-auto rounded-[3px] border border-line">
          <ul className="flex flex-wrap gap-1.5 p-2">
            {filtrados.map((p) => {
              const ativo = mains.includes(p.id);
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => alternarMain(p.id)}
                    className={`rounded-[2px] border px-1.5 py-0.5 font-mono text-[9px] transition-colors ${
                      ativo
                        ? 'border-alter-green bg-ego-escuro text-[#D6D6E0]'
                        : 'border-line text-dim hover:border-alter-green/50 hover:text-[#D6D6E0]'
                    }`}
                  >
                    {p.nome}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={salvando}
          className="rounded-[3px] border-2 border-alter-green bg-ego-escuro px-3 py-1.5 font-mono text-[10px] tracking-[.1em] text-[#D6D6E0] transition-colors hover:bg-alter-green hover:text-[#08090D] disabled:opacity-60"
        >
          {salvando ? 'Salvando…' : 'Salvar perfil'}
        </button>
        {salvo && (
          <span className="font-mono text-[9px] text-alter-green">salvo ✓</span>
        )}
      </div>
    </form>
  );
}
