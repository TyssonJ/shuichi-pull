import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CabecalhoPerfil } from './CabecalhoPerfil';
import { AvaliacoesRecebidas } from './AvaliacoesRecebidas';
import { resumirAvaliacoes, type AvaliacaoRecebida } from '@/lib/avaliacoes-perfil';

const base = {
  desde: '17/09/2026', titulo: null, reputacao: null, bio: null,
  banner: { tipo: 'preset' as const, valor: 'terminal' }, spritePersonagem: null,
};

describe('CabecalhoPerfil — identidade', () => {
  it('sem personalização: só o nome e o ícone, sem originais', () => {
    render(<CabecalhoPerfil {...base} nome="tysson" avatar="https://cdn/a.png" />);
    expect(screen.getByRole('heading', { name: 'tysson' })).toBeInTheDocument();
    expect(screen.queryByText(/no Discord/)).toBeNull();
    expect(screen.queryByAltText('Ícone original do Discord')).toBeNull();
  });

  it('com apelido e ícone: destaque personalizado e o Discord original pequeno ao lado', () => {
    render(
      <CabecalhoPerfil
        {...base} nome="Shuichi" avatar="/sprites/shuichi.webp"
        nomeOriginal="tysson" avatarOriginal="https://cdn/a.png"
      />,
    );
    expect(screen.getByRole('heading', { name: 'Shuichi' })).toBeInTheDocument();
    expect(screen.getByText('tysson', { selector: 'b' })).toBeInTheDocument();
    expect(screen.getByAltText('Ícone original do Discord')).toHaveAttribute('src', 'https://cdn/a.png');
  });

  it('o botão de editar só aparece para o dono do perfil', () => {
    const { rerender } = render(<CabecalhoPerfil {...base} nome="a" avatar={null} />);
    expect(screen.queryByRole('link', { name: /EDITAR PERFIL/ })).toBeNull();
    rerender(<CabecalhoPerfil {...base} nome="a" avatar={null} editarHref="/conta/" />);
    expect(screen.getByRole('link', { name: /EDITAR PERFIL/ })).toHaveAttribute('href', '/conta/');
  });
});

describe('AvaliacoesRecebidas', () => {
  const av = (id: number, estrelas: number, comentario: string | null, origem: 'site' | 'junko' = 'site'): AvaliacaoRecebida => ({
    id, estrelas, comentario, criadoEm: new Date(2026, 8, id), origem,
  });

  it('sem avaliação: convida a avaliar de 0 a 5 estrelas', () => {
    render(<AvaliacoesRecebidas resumo={resumirAvaliacoes([])} moderar={false} aoRemover={vi.fn()} />);
    expect(screen.getByText(/nota de 0 a 5 estrelas/)).toBeInTheDocument();
  });

  it('mostra média, contagem, distribuição e os comentários com o selo "via Junko"', () => {
    const resumo = resumirAvaliacoes([av(1, 5, 'ótimo'), av(2, 4, 'bom', 'junko'), av(3, 4, null)]);
    render(<AvaliacoesRecebidas resumo={resumo} moderar={false} aoRemover={vi.fn()} />);
    expect(screen.getByText('4,3')).toBeInTheDocument();
    expect(screen.getByText('3 avaliações')).toBeInTheDocument();
    expect(screen.getByLabelText('Distribuição das notas').querySelectorAll('li')).toHaveLength(6);
    expect(screen.getByText('ótimo')).toBeInTheDocument();
    expect(screen.getAllByText('VIA JUNKO')).toHaveLength(1);
  });

  it('só ADM vê o botão de apagar', () => {
    const resumo = resumirAvaliacoes([av(1, 3, 'meh')]);
    const { rerender } = render(<AvaliacoesRecebidas resumo={resumo} moderar={false} aoRemover={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /apagar/ })).toBeNull();
    rerender(<AvaliacoesRecebidas resumo={resumo} moderar aoRemover={vi.fn()} />);
    expect(screen.getByRole('button', { name: /apagar/ })).toBeInTheDocument();
  });

  it('a página inteira nunca cita quem avaliou', () => {
    const resumo = resumirAvaliacoes([av(1, 5, 'ótimo')]);
    const { container } = render(<AvaliacoesRecebidas resumo={resumo} moderar={false} aoRemover={vi.fn()} />);
    expect(container.textContent).not.toMatch(/avaliador/i);
  });
});
