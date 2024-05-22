
const mandaMail = document.getElementById("mandaMail");
 async function inviaEmailAdmin(oggetto, testo) {
    try {
      const response = await fetch('/inviaEmailAdmin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oggetto: oggetto,
          testo: testo
        }),
      });
  
      const data = await response.json();
      console.log('Success:', data);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  import {Registrazione} from "./../script.js";
  let inserisciUtente = document.getElementById("inserisciUtente");
  let conferma = document.getElementById("conferma");

conferma.onclick = () => {
    Registrazione(inserisciUtente.value).then((dati) => {
        console.log(dati);
    })
}