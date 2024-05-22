const divElenco = document.getElementById("elenco");
const orarioBut = document.getElementById("visualizzaOrario");

const modal = document.getElementById("modalDocente");

const calcolaOraAttuale = () => {
  let ora = "";
  let dataCorrente1 = new Date();
  let oraCorrente = dataCorrente1.getHours();
  let minutiCorrenti = dataCorrente1.getMinutes();
  minutiCorrenti = minutiCorrenti < 10 ? "0" + minutiCorrenti : minutiCorrenti;
// oraCorrente=9;
// minutiCorrenti=20;
 console.log(oraCorrente);
 console.log(minutiCorrenti)
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
    ora="Fuori da orario scolastico"
  }
return ora;  
};

const render = (div) => {
    let nominativi = [];
    prendiNomiProf().then(response => {
         nominativi = response;
  
  const template = `
  <div class="AOO" style="padding-top: 10px; padding-left: 20px;">
    <button type="button" class="btn btn-Prof">%NOME</button>
  </div>`;

  let html = "";
  for (let i = 0; i < nominativi.length; i++) {
    console.log(nominativi.lenght);
    let row = template.replace("%NOME", nominativi[i]);
    html += row;
  }
  div.innerHTML = html;

  const buttonsProf = document.querySelectorAll(".btn-Prof");
  buttonsProf.forEach((button, index) => {
    button.onclick = async () => {
      let ora = calcolaOraAttuale();
      console.log("ora: "+ora);
      await showModalDocente(nominativi[index], ora);
    };
  });
  filtraRisultati();
});
render2(document.getElementById("dinamico"));
};  


const showModalDocente = async (nominativo, ora) => {
  modal.querySelector(".infos").removeAttribute("hidden")
  modal.querySelector(".tabella").setAttribute("hidden", true)
  const response = await restituisciStatoProf(nominativo);
  console.log("response secondo servizio");
  console.log(response);
  modal.style.display = "block";
  modal.querySelector("h5").innerText = `${nominativo}`;
  // senza "?" da undefined in Nome_Classe ???
  modal.querySelector("p").innerText = `Locazione di ${nominativo} alla ${ora} ora \nSi trova in: ${response.result[0]?.Nome_Classe || "nessuna classe"}`;
  modal.querySelector("#visualizzaOrario").setAttribute("docente", nominativo);
};

const filtraRisultati = () => {
  const valoreFiltro = document.getElementById("CERCAPROF").value.toLowerCase();
  const buttonsProf = document.querySelectorAll(".btn-Prof");
  const divDaEliminare = document.querySelectorAll(".AOO");

  divDaEliminare.forEach((div) => {
    let showDiv = false;
    const buttonsInDiv = div.querySelectorAll(".btn-Prof");

    buttonsInDiv.forEach((button) => {
      const buttonsProfContenuto = button.textContent.toLowerCase();
      if (buttonsProfContenuto.includes(valoreFiltro)) {
        button.style.display = "inline-block";
        showDiv = true; 
      } else {
        button.style.display = "none";
      }
    });

    if (showDiv) {
      div.removeAttribute("hidden");
    } else {
      div.setAttribute("hidden", true);
    }
  });
}


window.onclick = (event) => {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

//////////////////////////////// fetch //////////////////////////

const prendiNomiProf = () => {
  return new Promise((resolve, reject) => {
    fetch("/ottieniNomiProf")
      .then((resp) => resp.json())
      .then((resp) => {
        resolve(resp.prof);
      })
      .catch(error => reject(error));
  });
};

const restituisciStatoProf = async (cognomeInput) => {
  console.log(cognomeInput);
  const response = await fetch("/restituisciStatoProf", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ cognome: cognomeInput }),
  });
  const data = await response.json();
  return data;
};

const ottieniOrarioTot = async (cognomeInput) => {
  console.log(cognomeInput);
  const response = await fetch("/ottieniOrarioTot", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ cognome: cognomeInput }),
  });
  const data = await response.json();
  console.log(data);
  return data.result;
};

export const Registrazione = async (utenteInput) => {
  const response = await fetch("/Registrazione", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ email: utenteInput }),
  });
  const data = await response.json();
  console.log(data);
  return data.result;
};

//////////////////////////////////////////////////////////////

const render2 =  async () => {
  let nominativi;
  try {
    nominativi = await prendiNomiProf();
  } catch (error) {
    console.error("Error fetching nominativo:", error);
    return;
  }
  
  console.log("response terzo servizio");

  const buttonsOrario = document.querySelectorAll(".ORARIOBUTTON");
  buttonsOrario.forEach((button) => {
    button.onclick = () => {
      const nominativo = button.getAttribute("docente");
      showModal2(nominativo, document.getElementById("dinamico"));
    };
  });
};

const renderOrario = (orarioTot) => {
   let table = `<table class="table table-striped">
                     <thead>
                        <tr>
                           <th scope="col">Ora</th>
                           <th scope="col">Lunedì</th>
                           <th scope="col">Martedì</th>
                           <th scope="col">Mercoledì</th>
                           <th scope="col">Giovedì</th>
                           <th scope="col">Venerdì</th>
                        </tr>
                     </thead>
                  <tbody>
                     %BODY%
                  </tbody> 
                  </table>`;

 const elencoOre = ["Prima", "Seconda", "Terza", "Quarta", "Quinta", "Sesta", "Settima"];
 const elencoGiorni = ["Lunedi", "Martedi", "Mercoledi", "Giovedi", "Venerdi"]; 
 let rowTemplate = `<tr> <td>%lun</td><td>%mar</td><td>%mer</td><td>%gio</td><td>%ven</td> </tr>`;
 let rows = "";
 elencoOre.forEach((ora) => {
   let row = '<tr><td>' +  ora + '</td>';
   elencoGiorni.forEach((giorno) => {
      const element = orarioTot.find((element) => element.Nome_Giorno === giorno && element.Nome_Ora === ora);
      const data = element ? element.Nome_Classe : "";
      row += '<td>' + data + '</td>';
   })
   row += '</tr>';
   rows += row;
 })
 table = table.replace("%BODY", rows);
 return table;
}

const showModal2 = async (nominativo, div) => {
  modal.querySelector(".infos").setAttribute("hidden", true);
  modal.querySelector(".tabella").removeAttribute("hidden");
  modal.style.display = "block";

  let orarioTot;
  try {
    orarioTot = await ottieniOrarioTot(nominativo);
  } catch (error) {
    console.error("Error fetching orarioTot:", error);
    return;
  }
  console.log("response orario tot: "+orarioTot);
  console.log("response orario tot classe: " + orarioTot[0]?.Nome_Classe);


  div.innerHTML = renderOrario(orarioTot);

};

render2();
render(divElenco);

