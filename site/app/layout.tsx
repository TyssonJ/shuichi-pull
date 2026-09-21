import type { Metadata } from 'next';
import './globals.css';
import { BarraEgo } from '@/components/alter-ego/BarraEgo';
import { Rodape } from '@/components/layout/Rodape';
import { CamadaAmbiente } from '@/components/ambiente/CamadaAmbiente';
import { AlertaGlobalPartida } from '@/components/partidas/AlertaGlobalPartida';

export const metadata: Metadata = {
  title: 'Shuichi Pull — o arquivo da comunidade BR/PT de Shinri Trial',
  description:
    'Tudo sobre o Shinri Trial, o Danganronpa Online do Garry\'s Mod: personagens, itens, mapa e mecânicas, em português.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-bg">
        <CamadaAmbiente />
        <BarraEgo />
        <main>{children}</main>
        <Rodape />
        <AlertaGlobalPartida />
      </body>
    </html>
  );
}
