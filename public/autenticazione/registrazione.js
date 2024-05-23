
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

  async function controlloMail (email) {
    if(email.includes("@itis-molinari.eu")){
       return true;
    }
  }

conferma.onclick = () => {
    Registrazione(inserisciUtente.value).then((response) => {

    if(controlloMail(inserisciUtente.value)){
        console.log(response.result);
        if (response.result === true) {
          sessionStorage.setItem("token", data.token);
            window.location.href = './accesso.html';
        } else {
            console.log('Registrazione non riuscita. Riprova.');
        }
      }
    }).catch((error) => {
        console.error('Errore:', error);
        alert('Si è verificato un errore. Riprova più tardi.');
    });
}