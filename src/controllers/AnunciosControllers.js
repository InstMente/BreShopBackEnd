import ConexaoMySql from "../config/ConexaoMySql.js";

export default class AnunciosController {
    async getAnuncios(req, res) {
        try {
            const [anuncios] = await ConexaoMySql.execute('SELECT * FROM anuncios');
            res.json(anuncios); // Sempre retorna o array, mesmo vazio
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

            // Validação mais robusta
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
}