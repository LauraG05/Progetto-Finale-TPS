const fs = require("fs");
const mysql = require("mysql2");
const conf = require("./conf.js");
const express = require("express");
const app = express();
const connection = mysql.createConnection(conf);
const http = require("http");

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const server = http.createServer(app);
const path = require("path");
app.use("/", express.static(path.join(__dirname, "public")));

server.listen(3040, () => {
  console.log("---> server running on port 3040");
});

const executeQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, function (err, result) {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        console.log("done");
        resolve(result);
      }
    });
  });
};

const csvFilePath = "EXP_PLANNING.csv";

const leggiFile = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(csvFilePath, "utf8", (err, data) => {
      if (err) {
        console.error("Errore nella lettura del file: ", err);
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

module.exports = leggiFile;

app.get("/ottieniNomiProf", (req, resp) => {
  const sql = "SELECT Cognome_Docente FROM Docente";
  executeQuery(sql).then((results) => {
    const elencoProf = results.map((row) => row.Cognome_Docente);
    resp.json({ result: "ok", prof: elencoProf });
  });
});

app.post("/restituisciStatoProf", async (req, resp) => {
  const cognome = req.body.cognome;
  console.log(cognome);
  let giorniSettimana = ["Domenica", "Lunedi", "Martedi", "Mercoledi", "Giovedi", "Venerdi", "Sabato"];
  let dataCorrente = new Date();
  let indiceGiorno = dataCorrente.getDay();
  let nomeGiorno = giorniSettimana[indiceGiorno];

let ora = "";
let dataCorrente1 = new Date();
let oraCorrente = dataCorrente1.getHours();
let minutiCorrenti = dataCorrente1.getMinutes();
minutiCorrenti = minutiCorrenti < 10 ? "0" + minutiCorrenti : minutiCorrenti;
oraCorrente=9;
minutiCorrenti=20;
// minuti separati
if ((oraCorrente === 8 && minutiCorrenti >= 0) && (oraCorrente < 8 || (oraCorrente === 8 && minutiCorrenti < 55))) {
  ora = "Prima";
} else if ((oraCorrente === 8 && minutiCorrenti >= 55) || (oraCorrente === 9 && minutiCorrenti < 50)) {
  ora = "Seconda";
} else if ((oraCorrente === 9 && minutiCorrenti >= 50) || (oraCorrente === 10 && minutiCorrenti < 40)) {
  ora = "Terza";
} else if ((oraCorrente === 10 && minutiCorrenti >= 40) || (oraCorrente === 11 && minutiCorrenti < 45)) {
  ora = "Quarta";
} else if ((oraCorrente === 11 && minutiCorrenti >= 45) || (oraCorrente === 12 && minutiCorrenti < 35)) {
  ora = "Quinta";
} else if ((oraCorrente === 12 && minutiCorrenti >= 35) || (oraCorrente === 13 && minutiCorrenti < 40)) {
  ora = "Sesta";
} else if ((oraCorrente === 13 && minutiCorrenti >= 40) || (oraCorrente === 14 && minutiCorrenti < 30)) {
  ora = "Settima";
}else{
  ora="???"
}

/*
  const sql = `SELECT Classe.Nome_Classe
  FROM Classe
  JOIN Ora ON Classe.ID_Classe = Ora.ID_Classe
  JOIN Docente ON Ora.ID_Docente = Docente.ID_Docente
  JOIN Giorno ON Ora.ID_Giorno = Giorno.ID_Giorno
  WHERE Ora.Nome_Ora = ?
    AND Docente.ID_Docente LIKE ?
    AND Giorno.Nome_Giorno = ?;
  `;
 */
  
  const sql = `SELECT Classe.Nome_Classe
  FROM Classe
  JOIN Ora ON Classe.ID_Classe = Ora.ID_Classe
  JOIN Docente ON Ora.ID_Docente = Docente.ID_Docente
  JOIN Giorno ON Ora.ID_Giorno = Giorno.ID_Giorno
  WHERE Ora.Nome_Ora = ?
    AND Docente.Cognome_Docente LIKE ?
    AND Giorno.Nome_Giorno = ?;
  `;
  

 // console.log("Parametri query:", {ora, cognome: "%" + cognome + "%", nomeGiorno });
  executeQuery(sql, [ora, "%"+cognome+"%", nomeGiorno]).then((response) => {
    resp.json({
      result: response,
    });
  }).catch((error) => {
    console.error("Errore nell'esecuzione della query:", error);
    resp.status(500).json({ error: "Errore durante l'esecuzione della query" });
  });
});

app.post("/ottieniOrarioTot", async (req, resp) => {
  const cognome = req.body.cognome;
  console.log(cognome);
  let giorniSettimana = ["Domenica", "Lunedi", "Martedi", "Mercoledi", "Giovedi", "Venerdi", "Sabato"];
  let dataCorrente = new Date();
  let indiceGiorno = dataCorrente.getDay();
  let nomeGiorno = giorniSettimana[indiceGiorno];

  
  const sql = `SELECT Classe.Nome_Classe
  FROM Classe
  JOIN Ora ON Classe.ID_Classe = Ora.ID_Classe
  JOIN Docente ON Ora.ID_Docente = Docente.ID_Docente
  JOIN Giorno ON Ora.ID_Giorno = Giorno.ID_Giorno
  WHERE Ora.Nome_Ora = ?
    AND Docente.Cognome_Docente LIKE ?
    AND Giorno.Nome_Giorno = ?;
  `;
  
  const elencoOre = ["Prima", "Seconda", "Terza", "Quarta", "Quinta", "Sesta", "Settima"];

 elencoOre.forEach((ore) => {
  console.log("Parametri query:", {ore, cognome: "%" + cognome + "%", nomeGiorno });
  executeQuery(sql, [elencoOre[i], "%"+cognome+"%", nomeGiorno]).then((response) => {
    resp.json({
      result: response,
    });
  }).catch((error) => {
    console.error("Errore nell'esecuzione della query:", error);
    resp.status(500).json({ error: "Errore durante l'esecuzione della query" });
  });
 })
});

