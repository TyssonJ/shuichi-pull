import { describe, it, expect } from 'vitest';
import { atalhoDeEdicao } from './atalho-edicao';

describe('atalhoDeEdicao', () => {
  it('a home leva aos textos da home', () => {
    expect(atalhoDeEdicao('/')?.href).toBe('/adm/textos/#home');
  });

  it('páginas de conteúdo levam ao editor delas, com ou sem barra final', () => {
    expect(atalhoDeEdicao('/faq/')?.href).toBe('/adm/faq/');
    expect(atalhoDeEdicao('/faq')?.href).toBe('/adm/faq/');
    expect(atalhoDeEdicao('/mecanicas/')?.href).toBe('/adm/mecanicas/');
    expect(atalhoDeEdicao('/eventos/')?.href).toBe('/adm/eventos/');
    expect(atalhoDeEdicao('/codigos/')?.href).toBe('/adm/codigos/');
  });

  it('página de um registro abre o editor já naquele registro', () => {
    expect(atalhoDeEdicao('/elenco/kaede-akamatsu/')).toEqual({
      href: '/adm/personagens/?abrir=kaede-akamatsu', rotulo: 'Editar esta página',
    });
    expect(atalhoDeEdicao('/itens/espada/')?.href).toBe('/adm/itens/?abrir=espada');
    expect(atalhoDeEdicao('/mapa/biblioteca/')?.href).toBe('/adm/mapa/?abrir=biblioteca');
  });

  it('listagens levam ao editor da coleção', () => {
    expect(atalhoDeEdicao('/elenco/')?.href).toBe('/adm/personagens/');
  });

  it('partidas e perfis levam à gestão', () => {
    expect(atalhoDeEdicao('/partidas/12/')?.href).toBe('/adm/partidas/');
    expect(atalhoDeEdicao('/u/123/')?.href).toBe('/adm/usuarios/');
  });

  it('dentro do painel, na API e em rota desconhecida não há atalho', () => {
    expect(atalhoDeEdicao('/adm/faq/')).toBeNull();
    expect(atalhoDeEdicao('/api/x/')).toBeNull();
    expect(atalhoDeEdicao('/conta/')).toBeNull();
  });

  it('id com caracteres especiais é escapado', () => {
    expect(atalhoDeEdicao('/itens/a b/')?.href).toBe('/adm/itens/?abrir=a%20b');
  });
});
