import supabase from '../config/supabaseClient.js';

export default class UsuarioControllers {
    async getUsers(req, res) {
        const { data, error } = await supabase.from('usuarios').select('*');
        if (error || data.length === 0) return res.status(404).json({ mensagem: 'Usuário não encontrado no banco de dados!' });
        res.json(data);
    }

    async getUsersById(req, res) {
        const { id } = req.params;
        const { data, error } = await supabase.from('usuarios').select('*').eq('id', id).single();
        if (error) return res.status(404).json({ erro: 'Usuário não encontrado' });
        res.json(data);
    }

    async getUserByEmail(req, res) {
        const { email } = req.params;

        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !data) return res.status(404).json({ mensagem: 'Usuário não encontrado' });

        res.json(data);
    }

    async postUsers(req, res) {
        const { nome, email, telefone, datanascimento, cpf, cep, cidade, bairro, rua, numerocasa, senha } = req.body;

        if (!nome || !email || !telefone || !datanascimento || !cpf || !cep || !cidade || !bairro || !rua || !numerocasa || !senha) {
            return res.status(400).json({ mensagem: 'Campos Obrigatórios ausentes' });
        }

        const { data: existing } = await supabase
            .from('usuarios')
            .select('email, cpf')
            .or(`email.eq.${email},cpf.eq.${cpf}`);

        if (existing && existing.length > 0) {
            const user = existing[0];
            if (user.email === email) return res.status(409).json({ erro: 'Email já cadastrado' });
            if (user.cpf === cpf) return res.status(409).json({ mensagem: 'CPF já cadastrado' });
        }

        const { data, error } = await supabase
            .from('usuarios')
            .insert([{ nome, email, telefone, datanascimento, cpf, cep, cidade, bairro, rua, numerocasa, senha }])
            .select('id')
            .single();

        if (error) return res.status(500).json({ mensagem: 'Erro ao adicionar usuário', detalhes: error.message });
        res.status(201).json({ id: data.id });
    }

    async putUsers(req, res) {
        const { id } = req.params;
        const { nome, email, telefone, datanascimento, cpf, cep, cidade, bairro, rua, numerocasa, senha } = req.body;

        if (!nome || !email || !telefone || !datanascimento || !cpf || !cep || !cidade || !bairro || !rua || !numerocasa || !senha) {
            return res.status(400).json({ mensagem: 'Campos Obrigatórios ausentes' });
        }

        const { data: existing } = await supabase
            .from('usuarios')
            .select('id')
            .or(`email.eq.${email},cpf.eq.${cpf}`)
            .neq('id', id);

        if (existing.length > 0) return res.status(409).json({ mensagem: 'Email ou CPF já utilizado' });

        const { error } = await supabase
            .from('usuarios')
            .update({ nome, email, telefone, datanascimento, cpf, cep, cidade, bairro, rua, numerocasa, senha })
            .eq('id', id);

        if (error) return res.status(500).json({ mensagem: 'Erro ao atualizar usuário', detalhes: error.message });
        res.status(200).json({ mensagem: 'Usuário atualizado com sucesso' });
    }

    async deleteUsers(req, res) {
        const { id } = req.params;
        const { error } = await supabase.from('usuarios').delete().eq('id', id);
        if (error) return res.status(500).json({ mensagem: 'Erro ao excluir usuário', detalhes: error.message });
        res.status(200).json({ mensagem: 'Usuário excluído com sucesso' });
    }
}
