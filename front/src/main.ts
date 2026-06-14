import './style.css';

const API_URL = "http://localhost:8080"

type Cours = {
  id_cours: number;
  nom: string;
  description: string;
  niveau: string;
  max_participants: number;
  nb_inscrits: number;
}
type Adherent = {
  id_adherent: number;
  nom: string;
  prenom: string;
  email: string;
}

const tableBody = document.querySelector("#courses-table-body") as HTMLTableSectionElement;

function niveauToNumber(niveau: string): number {
  if (niveau.toLowerCase() === "débutant" || niveau.toLowerCase() === "debutant") return 1;
  if (niveau.toLowerCase() === "intermédiaire" || niveau.toLowerCase() === "intermediaire") return 2;
  if (niveau.toLowerCase() === "avancé" || niveau.toLowerCase() === "avance") return 3;
  return 1;
}

async function chargerCours() {
  const response = await fetch(`${API_URL}/cours`);
  const cours: Cours[] = await response.json();

  tableBody.innerHTML = ``;

  for (const unCours of cours) {
    const niveauNumber = niveauToNumber(unCours.niveau);

    tableBody.innerHTML += `
      <tr>
        <td>${unCours.nom}</td>
        <td>${unCours.description}</td>
        <td>
          <div class="level level-${niveauNumber}">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </td>
        <td>
          <span class="places">${unCours.nb_inscrits}/${unCours.max_participants}</span>
        </td>
        <td>
          <button class="btn-inscrits" data-id="${unCours.id_cours}">
            Voir inscrits
          </button>
        </td>
      </tr>
    `;
  }

  activerBoutonsInscrits();
} 

function activerBoutonsInscrits() {
  const boutons = document.querySelectorAll(".btn-inscrits");

  boutons.forEach((bouton) => {
    bouton.addEventListener("click", async () => {
      const idCours = (bouton as HTMLButtonElement).dataset.id;
      await afficherAdherentsDuCours(Number(idCours));
    });
  });
}

async function afficherAdherentsDuCours(idCours: number) {
  const response = await fetch(`${API_URL}/cours/${idCours}/adherents`);
  const adherents: Adherent[] = await response.json();

  let message = "Adhérents inscrits:\n";

  for (const adherent of adherents) {
    message += `- ${adherent.prenom} ${adherent.nom} (${adherent.email})\n`;
  }

  alert(message)
}

chargerCours();