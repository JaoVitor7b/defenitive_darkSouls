// Rota de importacao da pasta Mapas
import express from "express";
import Levels from "../models/Levels.js";
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

// ROTA PARA LISTAR mapas
router.get("/mapas", async (req, res) => {
  try {
    const mapas = await Levels.findAll();

    res.render("levels", {
      mapas: mapas,
    });
  } catch (error) {
    console.error("Erro ao listar mapas:", error);
    res.status(500).send("Erro ao listar mapas.");
  }
});

// ROTA PARA CADASTRAR mapas COM FOTO
router.post(
  "/mapas/cadastrar",
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

      await Levels.create({
        nome: nome,
        descricao: descricao,
        foto: `/uploads/${req.file.filename}`,
      });

      res.redirect("/mapas");
    } catch (error) {
      console.error("Erro ao cadastrar mapa:", error);
      res.status(500).send("Erro ao cadastrar mapa.");
    }
  }
);



// ROTA DE EXCLUSAO DO CARD
router.post("/mapas/excluir/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const mapa = await Levels.findByPk(id);

    if (!mapa) {
      return res.status(404).send("mapa não encontrado.");
    }

    // Excluir o registro do banco
    await mapa.destroy();

    // Excluir a foto, se existir
    if (mapa.foto) {
      const nomeArquivo = path.basename(mapa.foto);
      const caminhoFoto = path.join(pastaUploads, nomeArquivo);

      try {
        await fs.promises.unlink(caminhoFoto);
      } catch (erroArquivo) {
        if (erroArquivo.code !== "ENOENT") {
          console.error("Erro ao excluir foto:", erroArquivo);
        }
      }
    }

    return res.redirect("/mapas");
  } catch (error) {
    console.error("Erro ao excluir mapa:", error);
    return res.status(500).send("Erro ao excluir mapa.");
  }
});

export default router;