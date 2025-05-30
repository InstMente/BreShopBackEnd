import ConexaoMySql from "../config/ConexaoMySql.js";

export default class AnunciosController {
    async getAnuncios(req, res) {
        try {
            const [anuncios] = await ConexaoMySql.execute('SELECT * FROM anuncios');
            res.json(anuncios);
        } catch (error) {
            console.error('Erro ao listar anúncios:', error);
            res.status(500).json({
                error: 'Erro ao listar anúncios',
                detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    async getAnunciosById(req, res) {
        try {
            const { id } = req.params;
            const [anuncios] = await ConexaoMySql.execute('SELECT * FROM anuncios WHERE id = ?', [id]);

            if (anuncios.length === 0) {
                return res.status(404).json({
                    error: 'Anúncio não encontrado'
                });
            }

            res.json(anuncios[0]);
        } catch (error) {
            console.error('Erro ao buscar anúncio:', error);
            res.status(500).json({
                error: 'Erro ao buscar anúncio',
                detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    async postAnuncios(req, res) {
        try {
            const { titulo, descricao, preco, usuarioId, foto } = req.body;
            const camposObrigatorios = { titulo, descricao, preco, usuarioId, foto };
            const camposFaltantes = Object.entries(camposObrigatorios)
                .filter(([_, value]) => !value)
                .map(([key]) => key);

            if (camposFaltantes.length > 0) {
                return res.status(400).json({
                    error: 'Campos obrigatórios faltando',
                    camposFaltantes
                });
            }

            const [result] = await ConexaoMySql.execute(
                'INSERT INTO anuncios (titulo, descricao, preco, foto, usuario_id) VALUES (?, ?, ?, ?, ?)',
                [titulo, descricao, preco, foto, usuarioId]
            );

            res.status(201).json({
                id: result.insertId,
                message: 'Anúncio criado com sucesso',
                links: {
                    consulta: `/anuncios/${result.insertId}`
                }
            });
        } catch (err) {
            console.error('Erro ao criar anúncio:', err);
            res.status(500).json({
                error: 'Erro ao criar anúncio',
                detalhes: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        }
    }

    async putAnuciosById(req, res) {
        try {
            const { id } = req.params;
            const { titulo, descricao, preco, usuarioId, foto } = req.body;


            const [anuncios] = await ConexaoMySql.query(
                'SELECT * FROM anuncios WHERE id = ? AND usuario_id = ?',
                [id, usuarioId]
            );

            if (anuncios.length === 0) {
                return res.status(404).json({ mensagem: 'Anúncio não encontrado' });
            }

            await ConexaoMySql.query(
                `UPDATE anuncios SET titulo = ?, descricao = ?, preco = ?, foto = ? WHERE id = ? AND usuario_id = ?`,
                [titulo, descricao, preco, foto, id, usuarioId]
            );

            res.status(200).json({ mensagem: 'Anúncio atualizado com sucesso' });

        } catch (error) {
            res.status(500).json({ erro: 'Erro ao atualizar anúncio', detalhes: error.message });
        }
    }

    async deleteAnunciosById(req, res) {
        try {
            const { id } = req.params;
            const [anuncios] = await ConexaoMySql.query('SELECT * FROM anuncios WHERE id=?', [id]);
            
            await ConexaoMySql.query('DELETE FROM anuncios WHERE id = ?', [id]);
            res.status(200).json({ mensagem: 'Anúncio exclúido com sucesso' })
        } catch (error) {
            res.status(500).json({
                erro: 'Erro ao excluir  anúncio', detalhes, error
            })
        }
    }
}