/**
 * Só roda no navegador: lê a duração de um vídeo sem enviá-lo. O servidor não
 * abre o arquivo, então o limite de minutos é conferido aqui (o teto de
 * tamanho no token de envio é a trava que o cliente não consegue driblar).
 */
export function lerDuracaoDoVideo(arquivo: File): Promise<number> {
  return new Promise((resolver, rejeitar) => {
    const endereco = URL.createObjectURL(arquivo);
    const video = document.createElement('video');
    video.preload = 'metadata';
    const limpar = () => URL.revokeObjectURL(endereco);
    video.onloadedmetadata = () => { limpar(); resolver(video.duration); };
    video.onerror = () => { limpar(); rejeitar(new Error('Não consegui ler esse vídeo.')); };
    video.src = endereco;
  });
}

/** Nome seguro pro caminho do Blob: sem espaços nem caracteres estranhos. */
export function nomeSeguro(nome: string): string {
  const limpo = nome.normalize('NFD').replace(/\p{M}/gu, '').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
  return (limpo || 'arquivo').slice(-60);
}
