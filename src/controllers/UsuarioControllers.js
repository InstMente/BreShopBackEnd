import ConexaoMySql from '../config/ConexaoMySql.js';

export default class UsuarioControllers {
    async getUsers(req, res) {
        try {
            const [usuarios] = await ConexaoMySql.query('SELECT * FROM usuarios');
            if (usuarios.length === 0) {

                res.status(404).json({ mensagem: 'Usuário não encontrado no banco de dados!' })

            }
            res.json(usuarios);
        } catch (err) {
            res.status(500).json({ mensagem: 'Erro ao listar usuários', detalhes: err });
        }
    }

    async getUsersById(req, res) {
        try {
            const { id } = req.params;
            const [usuario] = await ConexaoMySql.query('SELECT * FROM usuarios WHERE id = ?', [id]);
            if (usuario.length === 0) return res.status(404).json({ erro: 'Usuário não encontrado' });
            res.json(usuario[0]);
        } catch (err) {
            res.status(500).json({ mensagem: 'Erro ao buscar usuário', detalhes: err });
        }
    }

    async postUsers(req, res) {
        try {
            const { nome, email, telefone, dataNascimento, cpf, cep, cidade, bairro, rua, numeroCasa, senha } = req.body;
            if (!nome || !email || !telefone || !dataNascimento || !cpf || !cep || !cidade || !bairro || !rua || !numeroCasa || !senha) {
                return res.status(400).json({ mensagem: 'Campos Obrigatórios ausentes' })
            }
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
                    return res.status(409).json({ mensagem: 'CPF já cadastrado' });
                }
                if (user.nome === nome) {
                    return res.status(409).json({ mensagem: 'Nome já utilizado' })
                }
            }
            const [resultado] = await ConexaoMySql.query(
                `INSERT INTO usuarios (nome, email, telefone, dataNascimento, cpf, cep, cidade, bairro, rua, numeroCasa, senha)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, MD5(?))`,
                [nome, email, telefone, dataNascimento, cpf, cep, cidade, bairro, rua, numeroCasa, senha]
            );
            res.status(201).json({ id: resultado.insertId });
        } catch (err) {
            res.status(500).json({ mensagem: 'Erro ao adicionar usuário', detalhes: err });
        }
    }

    async putUsers(req, res) {
        try {
            const validarEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const { id } = req.params;
            const { nome, email, telefone, dataNascimento, cpf, cep, cidade, bairro, rua, numeroCasa, senha } = req.body;
            if (!nome || !email || !telefone || !dataNascimento || !cpf || !cep || !cidade || !bairro || !rua || !numeroCasa || !senha) {
                return res.status(400).json({ mensagem: 'Campos Obrigatórios ausentes' })
            }
            const [verificacaoUserExistente] = await ConexaoMySql.query(
                'SELECT id FROM usuarios WHERE (email = ? OR cpf = ?) AND id != ?',
                [email, cpf, id]
            );

            if (verificacaoUserExistente.length > 0) {
                const user = verificacaoUserExistente[0];
                if (!user.email) {
                    return res.status(400).json({ mensagem: "Campo email é obrigatório" })
                }
                if (user.email == email) {
                    return res.status(409).json({ mensagem: 'Email já utilizado' })
                }
                if (validarEmail.test(user.email)) {
                    return res.status(200).json({ mensagem: "Email válido" })
                } else {
                    return res.status(422).json({ mensagem: 'Email inválido' })
                }
            }

            const [usuario] = await ConexaoMySql.query('SELECT * FROM usuarios WHERE id = ?', [id]);
            if (usuario.length === 0) {
                return res.status(404).json({ mensagem: 'Usuário não encontrado' });
            }

            await ConexaoMySql.query(
                `UPDATE usuarios 
       SET nome = ?, email = ?, telefone = ?, dataNascimento = ?, cpf = ?, cep = ?, 
           cidade = ?, bairro = ?, rua = ?, numeroCasa = ?, senha = MD5(?)
       WHERE id = ?`,
                [nome, email, telefone, dataNascimento, cpf, cep, cidade, bairro, rua, numeroCasa, senha, id]
            );

            res.status(200).json({ mensagem: 'Usuário atualizado com sucesso' });
        } catch (err) {
            res.status(500).json({ mensagem: 'Erro ao atualizar usuário'});
        }
    }

    async deleteUsers(req, res) {
        try {
            const { id } = req.params;
            await ConexaoMySql.query('DELETE FROM usuarios WHERE id = ?', [id]);
            res.status(200).json({ mensagem: 'Usuário excluído com sucesso' });
        } catch (err) {
            res.status(500).json({ mensagem: 'Erro ao excluir usuário' });
        }
    }
}
