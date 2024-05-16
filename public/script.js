const divElenco = document.getElementById("elenco");
const orarioBut = document.getElementById("visualizzaOrario");

let elencoProfN = ["Mario", "Luigi", "Filippo", "aaa"];
let elencoProfC = ["Rossi", "Neri", "Bianchi", "aaa"];

const modal = document.getElementById("myModal")


const render = (div) => {
    let nominativo = [];
    prendiNomiProf().then(response => {
         nominativo = response;
         console.log(nominativo);
  
  const template = `
  <div style="padding-top: 10px; padding-left: 20px;">
    <button type="button" class="btn btn-Prof">%NOME</button>
  </div>`;

  let html = "";
  for (let i = 0; i < nominativo.length; i++) {
    let row = template.replace("%NOME", nominativo[i]);
    html += row;
  }
  div.innerHTML = html;

  const buttonsProf = document.querySelectorAll(".btn-Prof");

  buttonsProf.forEach((button, index) => {
    button.onclick = async () => {
      let oraCorrente = new Date();
      const currentHour = oraCorrente.getHours();
      const currentMinute = oraCorrente.getMinutes();

      await showModal1(nominativo[index], currentHour, currentMinute);
    };
  });
  filtraRisultati();
});
};

const showModal1 = async (nominativo, ora, minuto) => {
   await restituisciStatoProf(nominativo).then((response) => {
    console.log(response);
    modal.style.display = "block";
    modal.querySelector("h5").innerText = `${nominativo}`
    modal.querySelector("p").innerText = `Locazione di ${nominativo} alle ${ora}.${minuto}\n\nClasse: ${""}\nFino alle: ${""}`;
  });
}

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

/*
let nominativo = [];
console.log(elencoProfC.length);
for (let i = 0; i < elencoProfC.length; i++) {
  nominativo.push(elencoProfN[i] + " " + elencoProfC[i]);
}
nominativo.sort(); //ordine alfabetico
console.log(nominativo);
*/
const showModal2 = (elencoOre, elencoClassi) => {
  modal.querySelector(".infos").setAttribute("hidden", true)
  modal.querySelector(".tabella").removeAttribute("hidden");
  modal.querySelector(".oraCol").innerHTML = elencoOre;
  modal.querySelector(".classeCol").innerHTML = elencoClassi;
  modal.style.display = "block";
  console.log(elencoOre, elencoClassi);
  ``;
}
elencoOre = [
  {
    ora: "8:00",
    classe: "5Cinf",
  },
  {
    ora: "9:00",
    classe: "5Cinf",
  },
  {
    ora: "10:00",
    classe: "5Cinf",
  },
  {
    ora: "11:00",
    classe: "5Cinf",
  },
  {
    ora: "12:00",
    classe: "5Cinf",
  },];

orarioBut.onclick = () => {
  elencoOre.forEach((element) => {
    showModal2(element.ora, element.classe);
  })

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

