import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import UsuarioControllers from './controllers/UsuarioControllers.js';
import AnunciosController from './controllers/AnunciosControllers.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const usuariosController = new UsuarioControllers();
const anunciosController = new AnunciosController();

app.get('/usuarios', usuariosController.getUsers.bind(usuariosController));
app.get('/usuarios/:id', usuariosController.getUsersById.bind(usuariosController));
app.get('/usuarios/email/:email', usuariosController.getUserByEmail.bind(usuariosController));
app.post('/usuarios', usuariosController.postUsers.bind(usuariosController));
app.put('/usuarios/:id', usuariosController.putUsers.bind(usuariosController));
app.delete('/usuarios/:id', usuariosController.deleteUsers.bind(usuariosController));

app.get('/anuncios', anunciosController.getAnuncios.bind(anunciosController));
app.get('/anuncios/:id', anunciosController.getAnunciosById.bind(anunciosController));
app.post('/anuncios', anunciosController.postAnuncios.bind(anunciosController));
app.put('/anuncios/:id', anunciosController.putAnuciosById.bind(anunciosController));
app.delete('/anuncios/:id', anunciosController.deleteAnunciosById.bind(anunciosController));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
