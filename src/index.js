import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

import UsuarioControllers from './controllers/UsuarioControllers.js';
import AnunciosController from './controllers/AnunciosControllers.js';
import ComprasController from './controllers/ComprasController.js';

dotenv.config();

const app = express();
app.use(cors()); // Permite requisições de qualquer origem, configure se quiser restringir
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'yQ82vP@r7L!w8$TfZ^dWbNcRmE1xUoOjVsKgqI+lhEjG0Y5XAzHs9MnCfBtPuDl';

// Middleware para autenticação JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ mensagem: 'Token não fornecido.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ mensagem: 'Token inválido ou expirado.' });

    req.user = user; // dados decodificados do token disponíveis em req.user
    next();
  });
}

const usuariosController = new UsuarioControllers();
const anunciosController = new AnunciosController();
const comprasController = new ComprasController();


app.post('/usuarios/login', usuariosController.login.bind(usuariosController));
app.post('/usuarios', usuariosController.postUsers.bind(usuariosController));


app.get('/usuarios', authenticateToken, usuariosController.getUsers.bind(usuariosController));
app.get('/usuarios/:id', authenticateToken, usuariosController.getUsersById.bind(usuariosController));
app.get('/usuarios/email/:email', usuariosController.getUserByEmail.bind(usuariosController));
app.get('/usuarios/logado', authenticateToken, usuariosController.getLoggedUser.bind(usuariosController));
app.put('/usuarios/:id', usuariosController.putUsers.bind(usuariosController));
app.delete('/usuarios/:id', authenticateToken, usuariosController.deleteUsers.bind(usuariosController));


app.put('/usuarios/recuperar-senha', usuariosController.recuperarSenha.bind(usuariosController));
app.get('/anuncios', anunciosController.getAnuncios.bind(anunciosController));
app.get('/anuncios/vendidos/:usuarioId', anunciosController.getAnunciosVendidosPorUsuario.bind(anunciosController));
app.get('/anuncios/usuario/:usuarioId', anunciosController.getAnunciosByUsuarioId.bind(anunciosController));
app.get('/anuncios/:id', anunciosController.getAnunciosById.bind(anunciosController));
app.post('/anuncios', anunciosController.postAnuncios.bind(anunciosController));
app.put('/anuncios/:id', anunciosController.putAnuciosById.bind(anunciosController));
app.delete('/anuncios/:id', anunciosController.deleteAnunciosById.bind(anunciosController));
app.post('/compras', comprasController.registrarCompra.bind(comprasController))
app.post('/compras/consultar', comprasController.compradorid.bind(comprasController))


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
