// Model Levels

//Importando o arquivo de conexão
import connection from "../config/sequelize-config.js";

// Importando a biblioteca sequelize
import Sequelize from "sequelize";

// Construindo tabelas
const Levels = connection.define("mapas", {
    nome: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    descricao: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
    foto: {
        type: Sequelize.STRING,
        allowNull: false,
    },
});



// Exportando o modulo
export default Levels;