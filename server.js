const fs = require("fs");
const executeQuery = require("./db.js");
const conf = require("./conf.js");
const express = require("express");
const app = express();
const http = require("http");

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const path = require("path");
app.use("/", express.static(path.join(__dirname, "public")));

app.get("/ottieniNomiProf", (req, resp) => {
   const sql = "SELECT Cognome_Docente FROM Docente";
   executeQuery(sql).then((results) => {
      const elencoProf = results.map((row) => row.Cognome_Docente);
      resp.json({ result: "ok", prof: elencoProf });
   });
});

const restituisciStatoProf = async (ora, cognome, nomeGiorno) => {
   let sql = `SELECT Classe.Nome_Classe
      FROM Classe
      JOIN Ora ON Classe.ID_Classe = Ora.ID_Classe
      JOIN Docente ON Ora.ID_Docente = Docente.ID_Docente
      JOIN Giorno ON Ora.ID_Giorno = Giorno.ID_Giorno
      WHERE Ora.Nome_Ora = '%1'
         AND Docente.Cognome_Docente LIKE '%%2%'
         AND Giorno.Nome_Giorno = '%3';
      `;

   sql = sql.replace("%1", ora);
   sql = sql.replace("%2", cognome);
   sql = sql.replace("%3", nomeGiorno);

   console.log(sql);

   try {
      const response = await executeQuery(sql, undefined);
      return response;
   } catch (e) {
      log(e);
      return null;
   }
}

app.post("/restituisciStatoProf", async (req, resp) => {
   const cognome = req.body.cognome;
   let giorniSettimana = ["Domenica", "Lunedi", "Martedi", "Mercoledi", "Giovedi", "Venerdi", "Sabato"];
   let dataCorrente = new Date();
   let indiceGiorno = dataCorrente.getDay();
   let nomeGiorno = giorniSettimana[indiceGiorno];

   let ora = "";
   let dataCorrente1 = new Date();
   let oraCorrente = dataCorrente1.getHours();
   let minutiCorrenti = dataCorrente1.getMinutes();
   minutiCorrenti = minutiCorrenti < 10 ? "0" + minutiCorrenti : minutiCorrenti;

   console.log("giorno: ", { nomeGiorno }, "ore: ", { oraCorrente }, { minutiCorrenti });
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
   } else {
      ora = "???"
   }


   try {
      const response = await restituisciStatoProf(ora, cognome, nomeGiorno);
      resp.json({
         result: response,
      });
   } catch (error) {
      console.error("Errore nell'esecuzione della query:", error);
      resp.status(500).json({ error: "Errore durante l'esecuzione della query" });
   }

});

const ottieniOrarioTot = async (cognome) => {
   let sql = `SELECT Giorno.Nome_Giorno, Ora.Nome_Ora, Classe.Nome_Classe
      FROM Classe
      JOIN Ora ON Classe.ID_Classe = Ora.ID_Classe
      JOIN Docente ON Ora.ID_Docente = Docente.ID_Docente
      JOIN Giorno ON Ora.ID_Giorno = Giorno.ID_Giorno
      WHERE Docente.Cognome_Docente LIKE '%%1%'     
      ORDER BY Giorno.ID_Giorno, Ora.ID_Ora    
      `;

   sql = sql.replace("%1", cognome);
   
   console.log(sql);

   try {
      const response = await executeQuery(sql, undefined);
      return response;
   } catch (e) {
      console.log(e);
      return null;
   }
}

app.post("/ottieniOrarioTot", async (req, resp) => {
   const cognome = req.body.cognome.trim();
   console.log("cognome secondo servizio; " + cognome);
   
   try {
      const response = await ottieniOrarioTot(cognome);
      resp.json({
         result: response,
      });
   } catch (error) {
      console.error("Errore nell'esecuzione della query:", error);
      resp.status(500).json({ error: "Errore durante l'esecuzione della query" });
   }
})

const server = http.createServer(app);
server.listen(3040, () => {
   console.log("---> server running on port 3040");
});

//SOLO PER TEST
//const ora = "Prima";
//const nomeGiorno = "Lunedi";
// const cognome = "VALENTI";
// ottieniOrarioTot(cognome).then((response) => {
//    console.log(response);
// })
