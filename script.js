const fs = require("fs");

const mysql = require("mysql2");
const conf = require("./conf.js");
const { resolve } = require("dns");
const { arrayBuffer } = require("stream/consumers");
const express = require("express");
const { Z_ASCII } = require("zlib");
const app = express();
const connection = mysql.createConnection(conf);

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
  const sql = "SELECT Nome_Docente FROM Docente";
  executeQuery(sql).then((results) => {
    const elencoProf = results.map((row) => row.Nome_Docente);
    resp.json({ result: "ok", prof: elencoProf });
  });
});

app.post("/restitusciStatoProf", (res, resp) => {
  const nome = res.body.nome;
  const cognome = res.body.cognome;
  if (nome && cognome !== "") {
    resp.json({
      result: "ok " + cognome + " " + nome,
    });
  }
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
