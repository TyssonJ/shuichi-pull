import { exigirChaveJunko } from '@/lib/junko/autenticar';
import { lerConfigEnvio } from '@/lib/junko/servico';

/** O bot chama isto pra checar que a URL e a chave estão certas. */
export async function GET(request: Request) {
  const negado = await exigirChaveJunko(request);
  if (negado) return negado;

  const config = await lerConfigEnvio();
  return Response.json({
    ok: true,
    site: 'shuichipull',
    agora: new Date().toISOString(),
    eventosAtivos: config.ativo,
  });
}
