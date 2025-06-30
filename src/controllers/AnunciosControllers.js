import supabase from '../config/supabaseClient.js';

export default class AnunciosController {
  async getAnuncios(req, res) {
    const { data, error } = await supabase.from('anuncios').select('*').eq('ativo', true);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  }

  async getAnunciosVendidosPorUsuario(req, res) {
  const { usuarioId } = req.params;

  const { data, error } = await supabase
    .from('anuncios')
    .select('*')
    .eq('usuario_id', usuarioId)
    .eq('ativo', false);

  if (error) return res.status(500).json({ erro: error.message });

  res.status(200).json(data);
}


  async getAnunciosById(req, res) {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('anuncios')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return res.status(404).json({ error: 'Anúncio não encontrado' });
    res.json(data);
  }

  async postAnuncios(req, res) {
    const { titulo, descricao, preco, foto, usuarioId } = req.body;

    const campos = {
      titulo,
      descricao,
      preco,
      usuario_id: usuarioId,
      foto,
      ativo: true
    };

    const faltando = Object.entries(campos)
      .filter(([_, v]) => v === undefined || v === null || v === '')
      .map(([k]) => k);

    if (faltando.length > 0) {
      return res.status(400).json({
        error: 'Campos obrigatórios faltando',
        camposFaltantes: faltando
      });
    }

    const { data, error } = await supabase
      .from('anuncios')
      .insert([campos])
      .select('id')
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({
      id: data.id,
      message: 'Anúncio criado com sucesso',
      links: {
        consulta: `/anuncios/${data.id}`
      }
    });
  }

  async getAnunciosByUsuarioId(req, res) {
    const { usuarioId } = req.params;
    const { data, error } = await supabase
      .from('anuncios')
      .select('*')
      .eq('ativo', true)
      .eq('usuario_id', usuarioId);

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  }
  async putAnuciosById(req, res) {
    const { id } = req.params;
    const { titulo, descricao, preco, usuarioId, foto } = req.body;

    const { data, error: findError } = await supabase
      .from('anuncios')
      .select('*')
      .eq('id', id)
      .eq('usuario_id', usuarioId)
      .single();

    if (findError) {
      return res.status(404).json({ mensagem: 'Anúncio não encontrado ou não pertence ao usuário' });
    }

    const { error } = await supabase
      .from('anuncios')
      .update({ titulo, descricao, preco, foto })
      .eq('id', id)
      .eq('usuario_id', usuarioId);

    if (error) {
      return res.status(500).json({
        erro: 'Erro ao atualizar anúncio',
        detalhes: error.message
      });
    }

    res.status(200).json({ mensagem: 'Anúncio atualizado com sucesso' });
  }

  async deleteAnunciosById(req, res) {
    const { id } = req.params;

    const { error } = await supabase
      .from('anuncios')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({
        erro: 'Erro ao excluir anúncio',
        detalhes: error.message
      });
    }

    res.status(200).json({ mensagem: 'Anúncio excluído com sucesso' });
  }
}
