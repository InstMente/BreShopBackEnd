import ConexaoMySql from '../config/ConexaoMySql.js';

export default class UsuarioControllers {
    async getUsers(req, res) {
        try {
            const [usuarios] = await ConexaoMySql.query('SELECT * FROM usuarios');
            res.json(usuarios);
        } catch (err) {
            res.status(500).json({ erro: 'Erro ao listar usuários', detalhes: err });
        }
    }

    async getUsersById(req, res) {
        try {
            const { id } = req.params;
            const [usuario] = await ConexaoMySql.query('SELECT * FROM usuarios WHERE id = ?', [id]);
            if (usuario.length === 0) return res.status(404).json({ erro: 'Usuário não encontrado' });
            res.json(usuario[0]);
        } catch (err) {
            res.status(500).json({ erro: 'Erro ao buscar usuário', detalhes: err });
        }
    }

    async postUsers(req, res) {
        try {
            const { nome, email, telefone, dataNascimento, cpf, cep, cidade, bairro, rua, numeroCasa, senha } = req.body;
            const [verificacaoUserExistente] = await ConexaoMySql.query(
                'SELECT email, cpf FROM usuarios WHERE email = ? OR cpf = ?', 
                [email, cpf]
            );
    
            if (verificacaoUserExistente.length > 0) {
                const user = verificacaoUserExistente[0];
                
                
                if (user.email === email) {
                    return res.status(409).json({ erro: 'Email já cadastrado' });
                }
                if (user.cpf === cpf) {
                    return res.status(409).json({ erro: 'CPF já cadastrado' });
                }
            }
            const [resultado] = await ConexaoMySql.query(
                `INSERT INTO usuarios (nome, email, telefone, dataNascimento, cpf, cep, cidade, bairro, rua, numeroCasa, senha)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [nome, email, telefone, dataNascimento, cpf, cep, cidade, bairro, rua, numeroCasa, senha]
            );
            res.status(201).json({ id: resultado.insertId });
        } catch (err) {
            res.status(500).json({ erro: 'Erro ao adicionar usuário', detalhes: err });
        }
    }

    async putUsers(req, res) {
        try {
            const { id } = req.params;
            const { nome, email, telefone, dataNascimento, cpf, cep, cidade, bairro, rua, numeroCasa, senha } = req.body;
            const [verificacaoUserExistente] = await ConexaoMySql.query(
                'SELECT email, cpf FROM usuarios WHERE email = ? OR cpf = ?', 
                [email, cpf]
            );
    
            if (verificacaoUserExistente.length > 0) {
                const user = verificacaoUserExistente[0];
                
                if (user.email === email) {
                    return res.status(409).json({ erro: 'Email já cadastrado' });
                }
                if (user.cpf === cpf) {
                    return res.status(409).json({ erro: 'CPF já cadastrado' });
                }
            }

            const [usuario] = await ConexaoMySql.query('SELECT * FROM usuarios WHERE id = ?', [id]);
            if (usuario.length === 0) {
                return res.status(404).json({ erro: 'Usuário não encontrado' });
            }

            await ConexaoMySql.query(
                `UPDATE usuarios 
       SET nome = ?, email = ?, telefone = ?, dataNascimento = ?, cpf = ?, cep = ?, 
           cidade = ?, bairro = ?, rua = ?, numeroCasa = ?, senha = ?
       WHERE id = ?`,
                [nome, email, telefone, dataNascimento, cpf, cep, cidade, bairro, rua, numeroCasa, senha, id]
            );

            res.status(200).json({ mensagem: 'Usuário atualizado com sucesso' });
        } catch (err) {
            res.status(500).json({ erro: 'Erro ao atualizar usuário', detalhes: err });
        }
    }

    async deleteUsers(req, res) {
        try {
            const { id } = req.params;
            await ConexaoMySql.query('DELETE FROM usuarios WHERE id = ?', [id]);
            res.status(200).json({ mensagem: 'Usuário excluído com sucesso' });
        } catch (err) {
            res.status(500).json({ erro: 'Erro ao excluir usuário', detalhes: err });
        }
    }
}
