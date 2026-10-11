import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import mysql from "mysql2/promise";
import connection, { DB_CONFIG } from "./config/sequelize-config.js";

import enemiesRoutes from "./routes/enemies.js";
import levelsRoutes from "./routes/levels.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middlewares para processar requisições
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, "public")));

// Arquivos enviados por upload
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// Rotas dos controllers
app.use("/", enemiesRoutes);
app.use("/", levelsRoutes);

// Página inicial
app.get("/", (req, res) => {
  res.render("index");
});

// Página de história
app.get("/history", (req, res) => {
  res.render("history");
});

// Links antigos redirecionam para as páginas com dados do banco
app.get("/enemies", (req, res) => res.redirect("/inimigos"));
app.get("/levels", (req, res) => res.redirect("/mapas"));

// Erros de upload (formato/tamanho da imagem)
app.use((err, req, res, next) => {
  console.error(err);
  const msg = err.code === "LIMIT_FILE_SIZE" ? "A imagem deve ter no máximo 5MB." : err.message || "Erro interno.";
  res.status(400).send(`${msg} <a href="javascript:history.back()">Voltar</a>`);
});

// Tratamento de rotas inexistentes
app.use((req, res) => {
  res.status(404).send("Página não encontrada.");
});

// Conexão com o banco de dados e inicialização do servidor
const PORT = process.env.PORT || 8080;

async function iniciarServidor() {
  try {
    // Cria o banco caso ainda não exista
    const conn = await mysql.createConnection({
      host: DB_CONFIG.host,
      port: DB_CONFIG.port,
      user: DB_CONFIG.username,
      password: DB_CONFIG.password,
    });
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\``);
    await conn.end();

    await connection.authenticate();
    await connection.sync(); // cria as tabelas inimigos e mapas

    console.log("Banco conectado com sucesso!");

    app.listen(PORT, () => {
      console.log(`Servidor iniciado em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Erro ao conectar ao banco:", error);
    process.exit(1);
  }
}

iniciarServidor();