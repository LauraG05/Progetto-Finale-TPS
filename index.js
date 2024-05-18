const leggiFile = require("./script.js");
const mysql = require("mysql2");
const conf = require("./conf.js");
const connection = mysql.createConnection(conf);

const csvFilePath = "EXP_PLANNING.csv";

const executeQuery = (sql, array) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, array, function (err, result) {
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

leggiFile(csvFilePath).then(async (data) => {
  let matrice = data.split("\n").map((element) => element.split(";"));

  const prof = [];
  const definitivo = [];

  for (let riga of matrice) {
    if (!prof.includes(riga[2])) {
      prof.push(riga[2]);
    }
  }
  
  const svuota = "DELETE FROM Docente";
  await executeQuery(svuota);
  for (let professore of prof) {
    const nominativo = professore.split("/");
    if (professore !== "DOC_COGN") {
      const insert = `INSERT INTO Docente (Nome_Docente, Cognome_Docente) VALUES (?, ?)`;
      await executeQuery(insert, [nominativo[1], nominativo[0]]);
    }

    const professoriOre = matrice.filter(
      (rigaTemp) => rigaTemp[2] === professore,
    );
    const oreUnite = [];

    for (let i = 3; i <= 37; i++) {
      let classe = undefined;

      professoriOre.forEach((ore) => {
        if (ore[i] === "\r") {
          classe = "A";
        } else if (ore[i].includes("\r")) {
          classe = ore[i].replace("\r", "");
        } else if (ore[i]) {
          classe = ore[i];
        }
      });

      if (!classe) {
        oreUnite.push("A");
      } else {
        oreUnite.push(classe);
      }
    }

    definitivo.push({
      docente: professore,
      ore: oreUnite,
    });
  }

  const classi = Array.from(new Set(matrice.map((riga) => riga[4]))); // elenco classi
  const svuota2 = "DELETE FROM Classe";
  await executeQuery(svuota2);
  for (let classe of classi) { // classe singola
    console.log("class");
    if (classe != "Lun._2_1" && classe != "") {
      const sql = `SELECT * FROM Classe WHERE Nome_Classe = ?`;
      const resp = await executeQuery(sql, classe);

      if (!resp.length) {
        const insert = `INSERT INTO Classe (Nome_Classe) VALUES (?)`;
        await executeQuery(insert, classe);
      }
    }
  }

  const svuota3 = "DELETE FROM  Ora";
  await executeQuery(svuota3);
  for (const docente of definitivo) {
    const nominativo = docente.docente.split("/");
    // restituzione id del docente con nome e cognome inserito
    // DOCENTI
    const idDocente =
      "SELECT ID_Docente FROM Docente WHERE Cognome_Docente = ? AND Nome_Docente = ?";
    const rsp = await executeQuery(idDocente, [nominativo[0], nominativo[1]]);

    // CLASSI
    if (rsp.length > 0) { // se ci sono docenti 
      let giorni = ["Lunedi","Martedi", "Mercoledi", "Giovedi", "Venerdi"];
      let giorno = giorni[0];

      for (let index = 0; index < docente.ore.length; index++) { // ripetiamo giorni e ore per ogni singolo docente
        const classe = docente.ore[index];
        const idClasse = "SELECT ID_Classe FROM Classe WHERE Nome_Classe = ?";
        const idClasseRs = await executeQuery(idClasse, [classe]);

        // GIORNI
        // inserimento giorni
        if (index % 7 == 0) {
          giorno = giorni[index / 7]; // nomi ai giorni
        }
        const idGiorno = "SELECT ID_Giorno FROM Giorno WHERE Nome_Giorno = ?";
        const idGiornoRs = await executeQuery(idGiorno, [giorno]);

        // ORE
        const query = `INSERT INTO Ora (Nome_Ora, ID_Docente, ID_Giorno, ID_Classe) VALUES (?, ?, ?, ?)`;
        console.log("index");
       if (rsp.length > 0 && idGiornoRs.length > 0 && idClasseRs.length > 0) { // se tutte le tabelle sono piene (doc., giorno, classe)
          await executeQuery(query, [
            index,
            rsp[0].ID_Docente,
            idGiornoRs[0].ID_Giorno,
            idClasseRs[0].ID_Classe,
          ]);
       }
      }
    }
  }
});
