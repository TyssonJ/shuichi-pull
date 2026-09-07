import Link from 'next/link';

export default function SemAcesso() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-neutral-950 text-neutral-100">
      <h1 className="text-xl font-bold">Sem acesso</h1>
      <p className="max-w-sm text-center text-sm text-neutral-400">
        Sua conta do Discord não está na lista de administradores do Shuichi Pull.
        Se acha que deveria estar, fale com quem já é ADM.
      </p>
      <Link href="/" className="text-sm text-teal-400 underline">Voltar para o site</Link>
    </main>
  );
}
