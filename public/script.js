const divElenco = document.getElementById("elenco");
const orarioBut = document.getElementById("visualizzaOrario");

let elencoProfN = ["Mario", "Luigi", "Filippo", "aaa"];
let elencoProfC = ["Rossi", "Neri", "Bianchi", "aaa"];

const modal = document.getElementById("myModal")

const calcolaOraAttuale = () => {
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
    ora="Fuori da orario scolastico"
  }
return ora;  
};

const render = (div) => {
    let nominativo = [];
    prendiNomiProf().then(response => {
         nominativo = response;
       //  console.log(nominativo.length);
  
  const template = `
  <div style="padding-top: 10px; padding-left: 20px;">
    <button type="button" class="btn btn-Prof">%NOME</button>
  </div>`;

  let html = "";
  for (let i = 0; i < nominativo.length; i++) {
    console.log(nominativo.lenght);
    let row = template.replace("%NOME", nominativo[i]);
    html += row;
  }
  div.innerHTML = html;

  const buttonsProf = document.querySelectorAll(".btn-Prof");
  buttonsProf.forEach((button, index) => {
    button.onclick = async () => {
      let ora = calcolaOraAttuale();
      console.log(ora);
      await showModal1(nominativo[index], ora);
    };
  });
  filtraRisultati();
});
render2(document.getElementById("dinamico"));
};  



const showModal1 = async (nominativo, ora) => {
  modal.querySelector(".infos").removeAttribute("hidden")
  modal.querySelector(".tabella").setAttribute("hidden", true)
  const response = await restituisciStatoProf(nominativo);
  console.log("response secondo servizio");
  console.log(response);
  modal.style.display = "block";
  modal.querySelector("h5").innerText = `${nominativo}`;
  modal.querySelector("p").innerText = `Locazione di ${nominativo} alla ${ora} ora \nClasse: ${response.result[0]?.Nome_Classe || "N/A"}`;
};

const filtraRisultati = () => {
  const valoreFiltro = document.getElementById("CERCAPROF").value.toLowerCase();
  const buttonsProf = document.querySelectorAll(".btn-Prof");
  buttonsProf.forEach((button) => {
    const buttonsProfContenuto = button.textContent.toLowerCase();
    if (buttonsProfContenuto.includes(valoreFiltro)) {
      button.style.display = "inline-block";
    } else {
      button.style.display = "none"; // se lettere non corrispondono
    }
  });
}

window.onclick = (event) => {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

const render2 = async (div) => {
  console.log("AAAAAAA");
  const nominativo = await prendiNomiProf();
  const response = await restituisciStatoProf(nominativo);
  const elencoOre = ["Prima", "Seconda", "Terza", "Quarta", "Quinta", "Sesta", "Settima"];

  let temp = `<tr><td class=%ORA></td><td class=%CLASSE></td></tr>`;
  let html = "";
  for (let i = 0; i < elencoOre.length; i++) {
    let row = temp.replace("%ORA", "elencoOre[i]");
    row = row.replace("%CLASSE", "response.result[0]?.Nome_Classe || "); // "N/A"
    html += row;
  }
  div.innerHTML = html;

  const buttonsOrario = document.querySelectorAll(".ORARIOBUTTON");
  buttonsOrario.forEach((but) => {
    but.onclick = () => {
      showModal2();
    };
  });
};


const showModal2 = () => {
modal.querySelector(".infos").setAttribute("hidden", true)
modal.querySelector(".tabella").removeAttribute("hidden");
modal.style.display = "block";
}

render(divElenco);


//////////////////////////////// fetch //////////////////////////

function prendiNomiProf () {
    return new Promise ((resolve, reject) => {
        fetch("/ottieniNomiProf")
        .then((resp) => resp.json())
        .then((resp) => {
          resolve(resp.prof);
        });  
    })
}
/*
function restituisciStatoProf () {
  return new Promise ((resolve, reject) => {
      fetch("/restituisciStatoProf")
      .then((resp) => resp.json())
      .then((data) => {
        resolve(data);
        console.log("Risultato della query:", data.result); // corretto
      });  
  })
}*/


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

/*
const ottieniOrario = async (cognomeInput) => {
    console.log(cognomeInput);
    const response = await fetch("/ottieniOrario", {
        method: "POST",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify({ cognome: cognomeInput }),
    });
    const data = await response.json(); 
    return data;
};*/

