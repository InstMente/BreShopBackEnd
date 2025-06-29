import UsuarioControllers from '../controllers/UsuarioControllers.js';
import supabase from '../config/supabaseClient.js';
import bcrypt from 'bcrypt';

jest.mock('../config/supabaseClient.js');
jest.mock('bcrypt');

describe('Testes do UsuarioController', () => {
  let controller;
  let req, res;

  beforeEach(() => {
    controller = new UsuarioControllers();

    req = {
      body: {},
      params: {},
      headers: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  // === LOGIN ===
  test('Login com sucesso deve retornar token', async () => {
    req.body = {
      email: 'teste@email.com',
      senha: 'senha123'
    };

    supabase.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: () => Promise.resolve({
              data: {
                id: 1,
                nome: 'Teste',
                email: 'teste@email.com',
                senha: 'senhaHasheada'
              },
              error: null
            })
          })
        })
      })
    });

    bcrypt.compare.mockResolvedValue(true);

    await controller.login(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      token: expect.any(String)
    }));
  });

  test('Login com senha incorreta deve retornar 401', async () => {
    req.body = {
      email: 'teste@email.com',
      senha: 'senha123'
    };

    supabase.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: () => Promise.resolve({
              data: {
                id: 1,
                nome: 'Teste',
                email: 'teste@email.com',
                senha: 'senhaErrada'
              },
              error: null
            })
          })
        })
      })
    });

    bcrypt.compare.mockResolvedValue(false);

    await controller.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ mensagem: 'Senha incorreta.' });
  });

  // === CADASTRO ===
  test('Cadastro falha se email já cadastrado', async () => {
    req.body = {
      nome: 'Novo',
      email: 'teste@email.com',
      telefone: '999999999',
      datanascimento: '2000-01-01',
      cpf: '12345678900',
      cep: '88000000',
      cidade: 'Floripa',
      bairro: 'Centro',
      rua: 'Rua A',
      numerocasa: '123',
      senha: 'senha123'
    };

    supabase.from.mockReturnValue({
      select: () => ({
        or: () => Promise.resolve({
          data: [{ email: 'teste@email.com' }],
          error: null
        })
      })
    });

    await controller.postUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ mensagem: 'Email já cadastrado.' });
  });
});
