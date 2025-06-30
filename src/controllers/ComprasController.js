
import supabase from '../config/supabaseClient.js';

class ComprasController {
  async registrarCompra(req, res) {
    const { anuncioId, compradorId } = req.body;

    const { data: anuncio, error: anuncioErro } = await supabase
      .from('anuncios')
      .select('*')
      .eq('id', anuncioId)
      .single();

    if (anuncioErro || !anuncio) return res.status(404).json({ erro: 'Anúncio não encontrado' });

    const { error: vendaErro } = await supabase.from('vendas').insert([{
      anuncio_id: anuncio.id,
      comprador_id: compradorId,
      vendedor_id: anuncio.usuario_id,
      preco: anuncio.preco
    }]);

    if (vendaErro) return res.status(500).json({ erro: 'Erro ao registrar venda' });

    const { error: inativarErro } = await supabase
      .from('anuncios')
      .update({ ativo: false })
      .eq('id', anuncio.id);

    if (inativarErro) return res.status(500).json({ erro: 'Erro ao inativar anúncio' });

    return res.status(200).json({ mensagem: 'Compra registrada e anúncio inativado' });
  }

  async compradorid(req, res) {
  const { anuncio_id } = req.body;

  if (!anuncio_id) {
    return res.status(400).json({ erro: 'anuncio_id é obrigatório' });
  }

  const { data, error } = await supabase
    .from('vendas')
    .select('preco')
    .eq('anuncio_id', anuncio_id)
    .single(); // só um resultado

  if (error || !data) {
    return res.status(404).json({ erro: 'Venda não encontrada para esse anúncio.' });
  }

  return res.status(200).json(data);
}



}

export default ComprasController;
