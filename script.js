const fs = require("fs");

const mysql = require("mysql2");
const conf = require("./conf.js");
const { resolve } = require("dns");
const { arrayBuffer } = require("stream/consumers");
const express = require("express");
const { Z_ASCII } = require("zlib");
const app = express();
const connection = mysql.createConnection(conf);
const http = require ("http");
const server = http.createServer(app);
const path = require ("path");
app.use("/", express.static(path.join(__dirname, "public")));

server.listen(3040, () => {
  console.log("---> server running on port 3040");
});

const executeQuery = (sql) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, function (err, result) {
      if (err) {
        console.error(err);
        reject();
      }
      console.log("done");
      resolve(result);
    });
  });
};

const csvFilePath = "EXP_PLANNING.csv";

const leggiFile = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(csvFilePath, "utf8", (err, data) => {
      if (err) {
        console.error("Errore nella lettura del file: ", err);
        return;
      }
      resolve(data);
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

app.post("/restitusciStatoProf", async (req, resp) => {
  const cognome = req.body;
  console.log(cognome);
  let giorniSettimana = ["Domenica", "Lunedi", "Martedi", "Mercoledi", "Giovedi", "Venerdi", "Sabato"];
  let dataCorrente = new Date();
  let indiceGiorno = dataCorrente.getDay();
  let nomeGiorno = giorniSettimana[indiceGiorno];

  let ora = req.body.ora;
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
  
  const sql = "SELECT Nome_Classe FROM Classe " +
              "INNER JOIN Ora ON Ora.ID_Classe = Classe.ID_Classe " +
              "INNER JOIN Giorno ON Ora.ID_Giorno = Giorno.ID_Giorno " +
              "INNER JOIN Docente ON Ora.ID_Docente = Docente.ID_Docente " +
              "WHERE Docente.Cognome_Docente = ? AND Ora.Nome_Ora = ? AND Giorno.Nome_Giorno = ?";

  executeQuery(sql, [cognome, ora, nomeGiorno]).then((response) => {
    resp.json({
      result: response
    });
  }).catch((error) => {
    console.error("Errore nell'esecuzione della query:", error);
    resp.status(500).json({ error: "Errore nell'esecuzione della query" });
  });
});

/*
          fetch("/ottieniNomiProf")
          .then(resp => resp.json())
          .then(resp => console.log(resp.result));

app.post("/salutami", (res, resp) => {
  const nome = res.body.nome;
  if (nome && nome != "") {
    resp.json({ result: "ciao " + nome });
  }
});
*/
/*
  fetch("/salutami",{
  method: "POST",
  headers: {
  "content-type": "application/json"
  },
  body: JSON.stringify({
  nome: "Laura"
  })
  })
  .then(resp => resp.json())
  .then(resp => console.log(resp.result));
*/
// verrà preso il csv e inserito all'interno di una matrice
// dalla matrice inserito in un array di dizionari (?) e inserito nell'SQL
/*
app.get("/insert", (nome) => {
  const template = `
   INSERT INTO Docente (Nome_Docente) VALUES ('$NAME')
      `;
  let sql = template.replace("$NAME", nome);
  console.log(sql);
  return executeQuery(sql);
});
*/
//insert("ProfEs");

//const csv = require("csv-parser");
/*
let elencoDocenti = [
  {
    ID1_prof: {
      cognome: cognome,
      nome: nome,

      elenco_giorni: [
        {
          Lunedì: [
            {
              Lun_1_1: {
                attività: attività,
                classe: classe,
              },
              Lun_2_1: {
                attività: attività,
                classe: classe,
              },
              Lun_3_1: {
                attività: attività,
                classe: classe,
              },
            },
          ],

          Martedì: [
            {
              Mar_1_1: {
                attività: attività,
                classe: classe,
              },
              Mar_2_1: {
                attività: attività,
                classe: classe,
              },
              Mar_3_1: {
                attività: attività,
                classe: classe,
              },
            },
          ],
        },
      ],
    },
  },
];
*/
