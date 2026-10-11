// Rota de importacao da tabela inimigos
import express from "express";
import Enemies from "../models/Enemies.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Criar a pasta uploads caso não exista
const pastaUploads = path.join(__dirname, "../uploads");

if (!fs.existsSync(pastaUploads)) {
  fs.mkdirSync(pastaUploads, { recursive: true });
}

// Configuração do armazenamento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, pastaUploads);
  },

  filename: (req, file, cb) => {
    const extensao = path.extname(file.originalname);
    cb(null, `${Date.now()}${extensao}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const extensao = path.extname(file.originalname).toLowerCase();
    const extensoesPermitidas = [".jpg", ".jpeg", ".png", ".webp"];

    if (extensoesPermitidas.includes(extensao)) {
      cb(null, true);
    } else {
      cb(new Error("Formato de imagem não permitido."));
    }
  },
});

// ROTA PARA LISTAR INIMIGOS
router.get("/inimigos", async (req, res) => {
  try {
    const inimigos = await Enemies.findAll();

    res.render("enemies", {
      inimigos: inimigos,
    });
  } catch (error) {
    console.error("Erro ao listar inimigos:", error);
    res.status(500).send("Erro ao listar inimigos.");
  }
});

// ROTA PARA CADASTRAR INIMIGOS COM FOTO
router.post(
  "/inimigos/cadastrar",
  upload.single("foto"),
  async (req, res) => {
    try {
      const nome = (req.body.nome || "").trim();
      const descricao = (req.body.descricao || "").trim();
      if (!nome || !descricao) {
        return res.status(400).send("Preencha nome e descrição.");
      }

      if (!req.file) {
        return res.status(400).send("Selecione uma foto.");
      }

      await Enemies.create({
        nome: nome,
        descricao: descricao,
        foto: `/uploads/${req.file.filename}`,
      });

      res.redirect("/inimigos");
    } catch (error) {
      console.error("Erro ao cadastrar inimigo:", error);
      res.status(500).send("Erro ao cadastrar inimigo.");
    }
  }
);

// ROTA DE EXCLUSAO DO CARD
router.post("/inimigos/excluir/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const inimigo = await Enemies.findByPk(id);

    if (!inimigo) {
      return res.status(404).send("Inimigo não encontrado.");
    }

    // Excluir o registro do banco
    await inimigo.destroy();

    // Excluir a foto, se existir
    if (inimigo.foto) {
      const nomeArquivo = path.basename(inimigo.foto);
      const caminhoFoto = path.join(pastaUploads, nomeArquivo);

      try {
        await fs.promises.unlink(caminhoFoto);
      } catch (erroArquivo) {
        if (erroArquivo.code !== "ENOENT") {
          console.error("Erro ao excluir foto:", erroArquivo);
        }
      }
    }

    return res.redirect("/inimigos");
  } catch (error) {
    console.error("Erro ao excluir inimigo:", error);
    return res.status(500).send("Erro ao excluir inimigo.");
  }
});


export default router;