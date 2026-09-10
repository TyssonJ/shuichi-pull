import Link from 'next/link';
import { auth, signIn } from '@/auth';

export default async function SemAcesso() {
  const sessao = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-neutral-950 text-neutral-100">
      <h1 className="text-xl font-bold">Sem acesso</h1>
      {sessao ? (
        <p className="max-w-sm text-center text-sm text-neutral-400">
          Sua conta do Discord não está na lista de administradores do Shuichi Pull.
          Se acha que deveria estar, fale com quem já é ADM.
        </p>
      ) : (
        <>
          <p className="max-w-sm text-center text-sm text-neutral-400">
            Entre com sua conta do Discord para acessar o painel.
          </p>
          <form
            action={async () => {
              'use server';
              await signIn('discord');
            }}
          >
            <button
              type="submit"
              className="rounded bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500"
            >
              Entrar com Discord
            </button>
          </form>
        </>
      )}
      <Link href="/" className="text-sm text-teal-400 underline">Voltar para o site</Link>
    </main>
  );
}
