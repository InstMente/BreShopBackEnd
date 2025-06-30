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

  test('Login com email não encontrado deve retornar 401', async () => {
    req.body = {
      email: 'naoexiste@email.com',
      senha: 'senha123'
    };

    supabase.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: null })
          })
        })
      })
    });

    await controller.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ mensagem: 'Usuário não encontrado ou inativo.' });
  });

  test('Login com campos ausentes deve retornar 400', async () => {
    req.body = { email: '', senha: '' };

    await controller.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ mensagem: 'Email e senha são obrigatórios.' });
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

  test('Cadastro falha se CPF já cadastrado', async () => {
    req.body = {
      nome: 'Novo',
      email: 'novo@email.com',
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
          data: [{ cpf: '12345678900' }],
          error: null
        })
      })
    });

    await controller.postUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ mensagem: 'CPF já cadastrado.' });
  });

  test('Cadastro com sucesso deve retornar id do novo usuário', async () => {
    req.body = {
      nome: 'Novo',
      email: 'novo@email.com',
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

    supabase.from.mockReturnValueOnce({
      select: () => ({
        or: () => Promise.resolve({ data: [], error: null })
      })
    });

    bcrypt.hash.mockResolvedValue('senhaHasheada');

    supabase.from.mockReturnValueOnce({
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({
            data: { id: 1 },
            error: null
          })
        })
      })
    });

    await controller.postUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 1 });
  });

  // === GET USERS ===
  test('getUsers retorna lista de usuários', async () => {
    supabase.from.mockReturnValue({
      select: () => Promise.resolve({
        data: [{ id: 1, nome: 'Teste' }],
        error: null
      })
    });

    await controller.getUsers(req, res);

    expect(res.json).toHaveBeenCalledWith([{ id: 1, nome: 'Teste' }]);
  });

  test('getUsers sem usuários retorna 404', async () => {
    supabase.from.mockReturnValue({
      select: () => Promise.resolve({
        data: [],
        error: null
      })
    });

    await controller.getUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ mensagem: 'Nenhum usuário encontrado.' });
  });

  // === GET BY ID ===
  test('getUsersById retorna usuário', async () => {
    req.params.id = 1;

    supabase.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({
            data: { id: 1, nome: 'Teste' },
            error: null
          })
        })
      })
    });

    await controller.getUsersById(req, res);

    expect(res.json).toHaveBeenCalledWith({ id: 1, nome: 'Teste' });
  });

  test('getUsersById com usuário inexistente retorna 404', async () => {
    req.params.id = 999;

    supabase.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({
            data: null,
            error: { message: 'Não encontrado' }
          })
        })
      })
    });

    await controller.getUsersById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Usuário não encontrado.' });
  });

  // === DELETE ===
  test('deleteUsers com sucesso', async () => {
    req.params.id = 1;

    supabase.from.mockReturnValue({
      delete: () => ({
        eq: () => Promise.resolve({ error: null })
      })
    });

    await controller.deleteUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ mensagem: 'Usuário excluído com sucesso.' });
  });
});
