const executeQuery = require("./db.js");
const fs = require('fs');
//const middleware = require("./middleware.js");

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

  const giorni = ["Lunedi", "Martedi", "Mercoledi", "Giovedi", "Venerdi"];
  const oreNomi = ["Prima", "Seconda", "Terza", "Quarta", "Quinta", "Sesta", "Settima"];

  for (const docente of definitivo) {
    const nominativo = docente.docente.split("/");
    const idDocente = "SELECT ID_Docente FROM Docente WHERE Cognome_Docente = ? AND Nome_Docente = ?";
    const rsp = await executeQuery(idDocente, [nominativo[0], nominativo[1]]);

    if (rsp.length > 0) { // se ci sono docenti 
      const idDocenteValue = rsp[0].ID_Docente; // trova id docente

      for (let giornoIndex = 0; giornoIndex < giorni.length; giornoIndex++) {
        const giorno = giorni[giornoIndex];
        const idGiorno = "SELECT ID_Giorno FROM Giorno WHERE Nome_Giorno = ?";
        const idGiornoRs = await executeQuery(idGiorno, [giorno]);

        if (idGiornoRs.length > 0) {
          const idGiornoValue = idGiornoRs[0].ID_Giorno; // trova id giorno
 
          for (let oraIndex = 0; oraIndex < oreNomi.length; oraIndex++) {
            const ora = oreNomi[oraIndex];
            const classe = docente.ore[giornoIndex * 7 + oraIndex]; 
            // giornoIndex * 7 dà l'inizio del blocco di 7 ore per quel giorno
            // oraIndex scorre attraverso le 7 ore del giorno
            const idClasse = "SELECT ID_Classe FROM Classe WHERE Nome_Classe = ?";
            const idClasseRs = await executeQuery(idClasse, [classe]);

            if (idClasseRs.length > 0) {
              const idClasseValue = idClasseRs[0].ID_Classe;

              const query = `INSERT INTO Ora (Nome_Ora, ID_Docente, ID_Giorno, ID_Classe) VALUES (?, ?, ?, ?)`;
              await executeQuery(query, [
                ora,
                idDocenteValue,
                idGiornoValue,
                idClasseValue,
              ]);
            }
          }
        }
      }
    }
  }
});