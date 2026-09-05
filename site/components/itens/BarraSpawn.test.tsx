import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BarraSpawn } from './BarraSpawn';
import type { Spawn } from '@/lib/schema-itens';

const spawns: Spawn[] = [
  {
    fonteId: 'src_000', local: { pt: 'Ginásio', en: 'Gym' }, localId: 'gym',
    andar: { pt: '1º andar', en: '1F' }, conteiner: { pt: 'Armários', en: 'Lockers' },
    chance: 70, qtdMin: 1, qtdMax: 2,
  },
  {
    fonteId: 'src_001', local: { pt: 'Cozinha', en: 'Kitchen' }, localId: 'kitchen',
    andar: null, conteiner: { pt: 'Geladeira', en: 'Fridge' },
    chance: 20, qtdMin: 1, qtdMax: 1,
  },
];

describe('BarraSpawn', () => {
  it('mostra local, contêiner e a chance em número', () => {
    render(<BarraSpawn spawns={spawns} />);
    expect(screen.getByText('Armários')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ginásio/ }))
      .toHaveAttribute('href', expect.stringContaining('/mapa/gym'));
  });

  it('mostra a faixa de quantidade quando ela varia', () => {
    render(<BarraSpawn spawns={spawns} />);
    expect(screen.getByText('1–2 un.')).toBeInTheDocument();
    expect(screen.getByText('1 un.')).toBeInTheDocument();
  });

  it('mostra o andar quando conhecido', () => {
    render(<BarraSpawn spawns={spawns} />);
    expect(screen.getByText('1º andar')).toBeInTheDocument();
  });

  it('avisa quando o item não spawna em lugar nenhum', () => {
    render(<BarraSpawn spawns={[]} />);
    expect(screen.getByText(/não aparece em nenhum contêiner mapeado/i)).toBeInTheDocument();
  });

  it('desenha uma barra por spawn', () => {
    render(<BarraSpawn spawns={spawns} />);
    expect(screen.getAllByTestId('barra')).toHaveLength(2);
  });
});
