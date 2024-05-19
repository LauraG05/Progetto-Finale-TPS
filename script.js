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

app.get("/restituisciStatoProf", async (req, resp) => {
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
  let oraFormattata = parseFloat(oraCorrente + "." + minutiCorrenti);

  if (oraFormattata >= 8.00 && oraFormattata <= 8.55) {
    ora = "Prima";
  } else if (oraFormattata >= 8.55 && oraFormattata <= 9.50) {
    ora = "Seconda";
  } else if (oraFormattata >= 9.50 && oraFormattata <= 10.40) {
    ora = "Terza";
  } else if (oraFormattata >= 10.40 && oraFormattata <= 11.45) {
    ora = "Quarta";
  } else if (oraFormattata >= 11.45 && oraFormattata <= 12.35) {
    ora = "Quinta";
  } else if (oraFormattata >= 12.35 && oraFormattata <= 13.40) {
    ora = "Sesta";
  } else if (oraFormattata >= 13.40 && oraFormattata <= 14.30) {
    ora = "Settima";
  }

  
  // questa query non va neanche su dbeaver
  // ricordarsi di switchare fetch da post a get perché inseriremo cognome dal body
  const sql = `SELECT Classe.Nome_Classe
  FROM Classe
  JOIN Ora ON Classe.ID_Classe = Ora.ID_Classe
  JOIN Docente ON Ora.ID_Docente = Docente.ID_Docente
  JOIN Giorno ON Ora.ID_Giorno = Giorno.ID_Giorno
  WHERE Ora.Nome_Ora = 'Settima'
    AND Docente.Cognome_Docente = 'VALENTI'
    AND Giorno.Nome_Giorno = 'Martedi';
  `;

  
  const sqlCorr =  `SELECT Cognome_Docente FROM Docente
  JOIN Ora ON Docente.ID_Docente = Ora.ID_Docente 
  JOIN Classe ON Ora.ID_Classe = Classe.ID_Classe 
  JOIN Giorno ON Ora.ID_Giorno = Giorno.ID_Giorno
  WHERE Ora.Nome_Ora = 'Settima' AND Classe.Nome_Classe='5C-INF' AND Giorno.Nome_Giorno = 'Martedi'`
  
  executeQuery(sql).then((response) => {
    resp.json({
      result: response,
    });
  }).catch((error) => {
    console.error("Errore nell'esecuzione della query:", error);
    resp.status(500).json({ error: "Errore nell'esecuzione della query" });
  });
/*
  executeQuery(sql, [cognome, ora, nomeGiorno]).then((response) => {
    resp.json({
      result: response,
      response: ["aa", "bb"]
    });
  }).catch((error) => {
    console.error("Errore nell'esecuzione della query:", error);
    resp.status(500).json({ error: "Errore nell'esecuzione della query" });
  });*/

/*

  // query minori ??? spezziamo 
  
  // selezionare solo le classi di una determinata ora
const selectOraQuery = `
SELECT ID_Classe
FROM Ora
WHERE Nome_Ora = 'Settima';
`;

// selezionare solo i docenti di un determinato cognome
const selectDocenteQuery = `
SELECT ID_Docente
FROM Docente
WHERE Cognome_Docente = 'VALENTI';
`;

// selezionare solo i giorni di un determinato nome
const selectGiornoQuery = `
SELECT ID_Giorno
FROM Giorno
WHERE Nome_Giorno = 'Martedi';
`;

Promise.all([
  executeQuery(selectClassiQuery),
  executeQuery(selectOraQuery),
  executeQuery(selectDocenteQuery),
  executeQuery(selectGiornoQuery)
])
  .then((results) => {
    const classiResult = results[0];
    const oraResult = results[1];
    const docenteResult = results[2];
    const giornoResult = results[3];
    
    console.log("Risultati delle quert:", classiResult, oraResult, docenteResult, giornoResult);
  })
  .catch((error) => {
    console.error("Errore durante l'esecuzione delle query:", error);
  });
  */
});
