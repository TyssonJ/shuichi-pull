import type { Metadata } from 'next';
import './globals.css';
import { BarraEgo } from '@/components/alter-ego/BarraEgo';
import { Rodape } from '@/components/layout/Rodape';
import { CamadaAmbiente } from '@/components/ambiente/CamadaAmbiente';
import { AlertaGlobalPartida } from '@/components/partidas/AlertaGlobalPartida';
import { ChatFlutuante } from '@/components/chat/ChatFlutuante';
import { SCRIPT_MODO_LEVE } from '@/lib/modo-leve';

export const metadata: Metadata = {
  title: 'Shuichi Pull — o arquivo da comunidade BR/PT de Shinri Trial',
  description:
    'Tudo sobre o Shinri Trial, o Danganronpa Online do Garry\'s Mod: personagens, itens, mapa e mecânicas, em português.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: o script do <head> acrescenta `data-leve` no <html> antes do React
    // hidratar (jeito documentado de evitar o "pisca": guia do Next sobre isso).
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_MODO_LEVE }} />
      </head>
      <body className="bg-bg">
        <CamadaAmbiente />
        <BarraEgo />
        <main>{children}</main>
        <Rodape />
        <AlertaGlobalPartida />
        <ChatFlutuante />
      </body>
    </html>
  );
}
