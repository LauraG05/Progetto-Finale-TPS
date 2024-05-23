
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

  import {Accesso} from "./../script.js";

  let inserisciUtente = document.getElementById("inserisciUtente");
  let inserisciPassword = document.getElementById("inserisciPass");
  let conferma = document.getElementById("conferma");

  conferma.onclick = () => {
    console.log("??");
    Accesso(inserisciUtente.value, inserisciPassword.value).then((response) => {
        if (response.result.response === true) {
          sessionStorage.setItem("token", response.result.token);
            window.location.href = '../index.html';
        } else {
            console.log('Accesso non riuscito. Riprova.');
        }
    }).catch((error) => {
        console.error('Errore:', error);
        alert('Si è verificato un errore. Riprova più tardi.');
    });
}
