import supabase from '../config/supabaseClient.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'yQ82vP@r7L!w8$TfZ^dWbNcRmE1xUoOjVsKgqI+lhEjG0Y5XAzHs9MnCfBtPuDl';

export default class UsuarioControllers {
  async login(req, res) {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ mensagem: 'Email e senha são obrigatórios.' });
    }

    try {
      const { data: usuario, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !usuario) {
        return res.status(401).json({ mensagem: 'Usuário não encontrado.' });
      }

      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (!senhaValida) {
        return res.status(401).json({ mensagem: 'Senha incorreta.' });
      }

      const token = jwt.sign(
        { id: usuario.id, nome: usuario.nome, email: usuario.email },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.json({ token });
    } catch (error) {
      console.error('Erro ao autenticar:', error);
      res.status(500).json({ mensagem: 'Erro interno no servidor.' });
    }
  }

  async postUsers(req, res) {
    const { nome, email, telefone, datanascimento, cpf, cep, cidade, bairro, rua, numerocasa, senha } = req.body;

    if (!nome || !email || !telefone || !datanascimento || !cpf || !cep || !cidade || !bairro || !rua || !numerocasa || !senha) {
      return res.status(400).json({ mensagem: 'Campos obrigatórios ausentes.' });
    }

    try {
      const { data: existing } = await supabase
        .from('usuarios')
        .select('email, cpf')
        .or(`email.eq.${email},cpf.eq.${cpf}`);

      if (existing?.length > 0) {
        const user = existing[0];
        if (user.email === email) return res.status(409).json({ mensagem: 'Email já cadastrado.' });
        if (user.cpf === cpf) return res.status(409).json({ mensagem: 'CPF já cadastrado.' });
      }

      const senhaHash = await bcrypt.hash(senha, 10);

      const { data, error } = await supabase
        .from('usuarios')
        .insert([{ nome, email, telefone, datanascimento, cpf, cep, cidade, bairro, rua, numerocasa, senha: senhaHash }])
        .select('id')
        .single();

      if (error) return res.status(500).json({ mensagem: 'Erro ao adicionar usuário.', detalhes: error.message });

      res.status(201).json({ id: data.id });
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      res.status(500).json({ mensagem: 'Erro interno no servidor.' });
    }
  }

  async getUsers(req, res) {
    const { data, error } = await supabase.from('usuarios').select('*');
    if (error || data.length === 0) return res.status(404).json({ mensagem: 'Nenhum usuário encontrado.' });
    res.json(data);
  }

  async getUsersById(req, res) {
    const { id } = req.params;
    const { data, error } = await supabase.from('usuarios').select('*').eq('id', id).single();
    if (error) return res.status(404).json({ erro: 'Usuário não encontrado.' });
    res.json(data);
  }

  async getUserByEmail(req, res) {
    const { email } = req.params;

    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) return res.status(404).json({ mensagem: 'Usuário não encontrado.' });

    res.json(data);
  }

  async getLoggedUser(req, res) {
    try {
      const authHeader = req.headers['authorization'];
      if (!authHeader) return res.status(401).json({ mensagem: 'Token não fornecido.' });

      const token = authHeader.replace('Bearer ', '');

      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (err) {
        return res.status(401).json({ mensagem: 'Token inválido ou expirado.' });
      }

      const { data: usuario, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', decoded.id)
        .single();

      if (error || !usuario) return res.status(404).json({ mensagem: 'Usuário não encontrado.' });

      delete usuario.senha;

      return res.json(usuario);
    } catch (error) {
      return res.status(500).json({ mensagem: 'Erro no servidor', detalhes: error.message });
    }
  }

  async putUsers(req, res) {
    const { id } = req.params;
    const { nome, email, telefone, datanascimento, cpf, cep, cidade, bairro, rua, numerocasa, senha } = req.body;

    if (!nome || !email || !telefone || !datanascimento || !cpf || !cep || !cidade || !bairro || !rua || !numerocasa || !senha) {
      return res.status(400).json({ mensagem: 'Campos obrigatórios ausentes.' });
    }

    try {
      const { data: existing } = await supabase
        .from('usuarios')
        .select('id')
        .or(`email.eq.${email},cpf.eq.${cpf}`)
        .neq('id', id);

      if (existing.length > 0) return res.status(409).json({ mensagem: 'Email ou CPF já utilizado.' });

      const { data: userAtual, error: errUser } = await supabase.from('usuarios').select('senha').eq('id', id).single();
      if (errUser) return res.status(404).json({ mensagem: 'Usuário não encontrado.' });

      let senhaHash = senha;
      const senhaMudou = !(await bcrypt.compare(senha, userAtual.senha));
      if (senhaMudou) senhaHash = await bcrypt.hash(senha, 10);

      const { error } = await supabase
        .from('usuarios')
        .update({ nome, email, telefone, datanascimento, cpf, cep, cidade, bairro, rua, numerocasa, senha: senhaHash })
        .eq('id', id);

      if (error) return res.status(500).json({ mensagem: 'Erro ao atualizar usuário.', detalhes: error.message });

      res.status(200).json({ mensagem: 'Usuário atualizado com sucesso.' });
    } catch (error) {
      res.status(500).json({ mensagem: 'Erro interno no servidor.', detalhes: error.message });
    }
  }

  async deleteUsers(req, res) {
    const { id } = req.params;
    try {
      const { error } = await supabase.from('usuarios').delete().eq('id', id);
      if (error) return res.status(500).json({ mensagem: 'Erro ao excluir usuário.', detalhes: error.message });
      res.status(200).json({ mensagem: 'Usuário excluído com sucesso.' });
    } catch (error) {
      res.status(500).json({ mensagem: 'Erro interno no servidor.', detalhes: error.message });
    }
  }
}