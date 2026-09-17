import { auth } from '@/auth';
import { PainelComTrilhas } from '@/components/layout/PainelComTrilhas';
import { FormularioNovaPartida } from '@/components/partidas/FormularioNovaPartida';

export const metadata = { title: 'Nova partida — Shuichi Pull' };

export default async function PaginaNovaPartida() {
  const sessao = await auth();

  return (
    <PainelComTrilhas>
      <p className="font-mono text-[8px] tracking-[.2em] text-dim">ARQUIVO 09</p>
      <h1 className="mb-6 text-4xl font-black tracking-tight text-[#F2F2F5]">
        NOVA PARTIDA
      </h1>

      {sessao?.user?.discordId ? (
        <FormularioNovaPartida />
      ) : (
        <p className="text-[12px] text-dim">
          Precisa <a href="/conta/" className="text-alter-green hover:underline">entrar com o Discord</a> pra criar uma partida.
        </p>
      )}
    </PainelComTrilhas>
  );
}
