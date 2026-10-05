// =====================================================================
//  Mes Dépenses — gestionnaire de budget en FCFA
//  Auteur : Ibrahima SARR
//
//  Organisation du fichier :
//    1. Constantes (catégories, clés de sauvegarde)
//    2. État de l'application (les données en mémoire)
//    3. Sauvegarde dans le navigateur (localStorage)
//    4. Petites fonctions utiles (format des montants, dates…)
//    5. Actions (ajouter, supprimer, annuler, budget, export)
//    6. Affichage (on redessine l'écran à partir de l'état)
//    7. Démarrage
//
//  Principe important : on ne modifie JAMAIS l'écran directement quand
//  une donnée change. On modifie l'état, on sauvegarde, puis on appelle
//  afficher() qui reconstruit l'écran. Comme ça, l'écran est toujours
//  le reflet exact des données.
// =====================================================================


// ---------------------------------------------------------------------
// 1. CONSTANTES
// ---------------------------------------------------------------------

// Les catégories possibles. Pour en ajouter une, il suffit d'ajouter
// une ligne ici : le formulaire, le filtre et les barres s'adaptent seuls.
const CATEGORIES = [
  { id: 'nourriture', nom: 'Nourriture', icone: '🍽️', couleur: '#f59e0b' },
  { id: 'transport',  nom: 'Transport',  icone: '🚌', couleur: '#3b82f6' },
  { id: 'logement',   nom: 'Logement',   icone: '🏠', couleur: '#8b5cf6' },
  { id: 'etudes',     nom: 'Études',     icone: '📚', couleur: '#10b981' },
  { id: 'sante',      nom: 'Santé',      icone: '💊', couleur: '#ef4444' },
  { id: 'loisirs',    nom: 'Loisirs',    icone: '🎉', couleur: '#ec4899' },
  { id: 'autre',      nom: 'Autre',      icone: '📦', couleur: '#64748b' },
];

// Noms des « tiroirs » où l'on range les données dans le navigateur.
const CLE_DEPENSES = 'mes-depenses:liste';
const CLE_BUDGET = 'mes-depenses:budget';


// ---------------------------------------------------------------------
// 2. ÉTAT DE L'APPLICATION
// ---------------------------------------------------------------------

// Une dépense ressemble à :
// { id: 'k3f9…', description: 'Car rapide', montant: 250,
//   categorie: 'transport', date: '2026-10-05' }
let depenses = [];
let budget = 0;                 // 0 = pas de budget défini
let categorieChoisie = 'nourriture';
let derniereSupprimee = null;   // pour le bouton « Annuler »


// ---------------------------------------------------------------------
// 3. SAUVEGARDE DANS LE NAVIGATEUR
// ---------------------------------------------------------------------
// localStorage ne stocke que du texte : on transforme le tableau en
// texte avec JSON.stringify, et on le relit avec JSON.parse.
// Les try/catch évitent que l'app plante en navigation privée.

function charger() {
  try {
    depenses = JSON.parse(localStorage.getItem(CLE_DEPENSES)) || [];
    budget = Number(localStorage.getItem(CLE_BUDGET)) || 0;
  } catch (e) {
    depenses = [];
    budget = 0;
  }
}

function sauvegarder() {
  try {
    localStorage.setItem(CLE_DEPENSES, JSON.stringify(depenses));
    localStorage.setItem(CLE_BUDGET, String(budget));
  } catch (e) {
    afficherToast("Impossible d'enregistrer sur cet appareil.");
  }
}


// ---------------------------------------------------------------------
// 4. PETITES FONCTIONS UTILES
// ---------------------------------------------------------------------

// 150000 → « 150 000 FCFA »
const formatNombre = new Intl.NumberFormat('fr-FR');
function fcfa(montant) {
  // Le format français sépare les milliers par une espace « fine »
  // ( ) que certaines polices n'affichent pas : on la remplace
  // par une espace insécable classique ( ).
  return formatNombre.format(Math.round(montant)).replace(/ /g, ' ') + ' FCFA';
}

// Date du jour au format « AAAA-MM-JJ » (celui des champs <input type="date">)
function aujourdhui() {
  const d = new Date();
  const mois = String(d.getMonth() + 1).padStart(2, '0');
  const jour = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mois}-${jour}`;
}

// '2026-10-05' → « dimanche 5 octobre »
function dateLisible(texte) {
  const [a, m, j] = texte.split('-').map(Number);
  return new Date(a, m - 1, j).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

// '2026-10' → « octobre 2026 »
function moisLisible(texte) {
  const [a, m] = texte.split('-').map(Number);
  return new Date(a, m - 1, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

// Nombre de jours dans un mois (ex. 31 pour octobre)
function joursDansLeMois(texte) {
  const [a, m] = texte.split('-').map(Number);
  return new Date(a, m, 0).getDate();
}

// Identifiant unique pour chaque dépense
function nouvelId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function trouverCategorie(id) {
  return CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
}

// Raccourci pour document.getElementById
const $ = id => document.getElementById(id);


// ---------------------------------------------------------------------
// 5. ACTIONS
// ---------------------------------------------------------------------

function ajouterDepense(evenement) {
  evenement.preventDefault();   // empêche le rechargement de la page

  const description = $('description').value.trim();
  const montant = Number($('montant').value);
  const date = $('date').value;

  // Vérifications : on explique précisément ce qui ne va pas
  if (!description) return montrerErreur('Indique une description.', 'description');
  if (!montant || montant <= 0) return montrerErreur('Le montant doit être supérieur à 0.', 'montant');
  if (!date) return montrerErreur('Choisis une date.', 'date');

  depenses.push({ id: nouvelId(), description, montant, categorie: categorieChoisie, date });
  sauvegarder();

  // On affiche le mois de la dépense ajoutée, pour la voir tout de suite
  $('choix-mois').value = date.slice(0, 7);

  // On vide le formulaire mais on garde la date et la catégorie :
  // pratique pour saisir plusieurs dépenses du même jour.
  $('description').value = '';
  $('montant').value = '';
  $('erreur').textContent = '';
  $('description').focus();

  afficher();
  afficherToast(`Ajouté : ${description} (${fcfa(montant)})`);
}

function montrerErreur(message, champ) {
  $('erreur').textContent = message;
  $(champ).focus();
}

function supprimerDepense(id) {
  const index = depenses.findIndex(d => d.id === id);
  if (index === -1) return;

  // On garde la dépense de côté pour pouvoir l'annuler
  derniereSupprimee = depenses[index];
  depenses.splice(index, 1);
  sauvegarder();
  afficher();
  afficherToast('Dépense supprimée', annulerSuppression);
}

function annulerSuppression() {
  if (!derniereSupprimee) return;
  depenses.push(derniereSupprimee);
  derniereSupprimee = null;
  sauvegarder();
  afficher();
  afficherToast('Dépense restaurée');
}

function definirBudget(evenement) {
  evenement.preventDefault();
  budget = Math.max(0, Number($('budget').value) || 0);
  sauvegarder();
  afficher();
  afficherToast(budget ? `Budget mensuel : ${fcfa(budget)}` : 'Budget retiré');
}

// Crée un fichier CSV (lisible par Excel) avec les dépenses du mois affiché
function exporterCSV() {
  const mois = $('choix-mois').value;
  const lignes = depensesDuMois(mois).sort((a, b) => a.date.localeCompare(b.date));
  if (!lignes.length) return afficherToast('Rien à exporter pour ce mois.');

  // Excel français utilise le point-virgule comme séparateur
  const entete = ['Date', 'Description', 'Catégorie', 'Montant (FCFA)'];
  const contenu = [entete, ...lignes.map(d => [
    d.date,
    `"${d.description.replace(/"/g, '""')}"`,   // les guillemets doivent être doublés
    trouverCategorie(d.categorie).nom,
    d.montant,
  ])].map(l => l.join(';')).join('\n');

  // Le caractère ﻿ aide Excel à lire correctement les accents
  const fichier = new Blob(['﻿' + contenu], { type: 'text/csv;charset=utf-8' });
  const lien = document.createElement('a');
  lien.href = URL.createObjectURL(fichier);
  lien.download = `depenses-${mois}.csv`;
  lien.click();
  URL.revokeObjectURL(lien.href);
}


// ---------------------------------------------------------------------
// 6. AFFICHAGE
// ---------------------------------------------------------------------

function depensesDuMois(mois) {
  return depenses.filter(d => d.date.startsWith(mois));
}

// Fonction principale : reconstruit tout l'écran à partir des données
function afficher() {
  // Si le champ du mois a été vidé, on revient au mois en cours
  if (!$('choix-mois').value) $('choix-mois').value = aujourdhui().slice(0, 7);
  const mois = $('choix-mois').value;
  const duMois = depensesDuMois(mois);

  afficherResume(mois, duMois);
  afficherRepartition(duMois);
  afficherListe(duMois);
}

function afficherResume(mois, duMois) {
  // reduce additionne tous les montants : 0 + 1500 + 250 + …
  const total = duMois.reduce((somme, d) => somme + d.montant, 0);

  $('total-mois').textContent = fcfa(total);
  $('nb-depenses').textContent = duMois.length
    ? `${duMois.length} dépense${duMois.length > 1 ? 's' : ''} en ${moisLisible(mois)}`
    : `Aucune dépense en ${moisLisible(mois)}`;

  // Moyenne par jour : pour le mois en cours, on divise par le nombre
  // de jours déjà passés ; pour un mois terminé, par tous ses jours.
  const moisActuel = aujourdhui().slice(0, 7);
  const jours = mois === moisActuel ? new Date().getDate() : joursDansLeMois(mois);
  $('moyenne-jour').textContent = fcfa(total / jours);

  const plusGrosse = duMois.reduce((max, d) => (!max || d.montant > max.montant ? d : max), null);
  $('plus-grosse').textContent = plusGrosse
    ? `Plus grosse : ${plusGrosse.description} (${fcfa(plusGrosse.montant)})`
    : '—';

  // Budget : reste, couleur et pourcentage de la jauge
  const jauge = $('jauge');
  if (budget > 0) {
    const reste = budget - total;
    const pourcentage = Math.min(100, Math.round((total / budget) * 100));
    $('reste-budget').textContent = reste >= 0 ? fcfa(reste) : `− ${fcfa(-reste)}`;
    $('jauge-remplissage').style.width = pourcentage + '%';
    jauge.setAttribute('aria-valuenow', pourcentage);
    // 3 états : ok (vert), attention à 80 % (orange), dépassé (rouge)
    jauge.dataset.etat = total > budget ? 'depasse' : pourcentage >= 80 ? 'attention' : 'ok';
    $('reste-budget').dataset.etat = jauge.dataset.etat;
  } else {
    $('reste-budget').textContent = 'Pas de budget';
    $('jauge-remplissage').style.width = '0%';
    jauge.removeAttribute('aria-valuenow');
    jauge.dataset.etat = 'ok';
    $('reste-budget').dataset.etat = 'aucun';
  }
}

function afficherRepartition(duMois) {
  const total = duMois.reduce((s, d) => s + d.montant, 0);
  const liste = $('repartition');
  liste.innerHTML = '';

  // Total par catégorie, triées de la plus grosse à la plus petite
  const totaux = CATEGORIES
    .map(c => ({ ...c, montant: duMois.filter(d => d.categorie === c.id).reduce((s, d) => s + d.montant, 0) }))
    .filter(c => c.montant > 0)
    .sort((a, b) => b.montant - a.montant);

  if (!totaux.length) {
    liste.innerHTML = '<li class="repartition__vide">Les totaux par catégorie apparaîtront ici.</li>';
    return;
  }

  totaux.forEach(c => {
    const pourcentage = Math.round((c.montant / total) * 100);
    const li = document.createElement('li');
    li.className = 'repartition__ligne';
    li.innerHTML = `
      <div class="repartition__infos">
        <span>${c.icone} ${c.nom}</span>
        <span class="repartition__montant">${fcfa(c.montant)} <small>${pourcentage} %</small></span>
      </div>
      <div class="repartition__barre"><span style="width:${pourcentage}%; background:${c.couleur}"></span></div>`;
    liste.appendChild(li);
  });
}

function afficherListe(duMois) {
  const recherche = $('recherche').value.trim().toLowerCase();
  const filtre = $('filtre-categorie').value;
  const conteneur = $('liste-depenses');
  conteneur.innerHTML = '';

  // On applique les filtres, puis on trie : la plus récente en haut
  const visibles = duMois
    .filter(d => filtre === 'toutes' || d.categorie === filtre)
    .filter(d => d.description.toLowerCase().includes(recherche))
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));

  $('vide').hidden = visibles.length > 0;
  if (!visibles.length && duMois.length) {
    $('vide').querySelector('.vide__titre').textContent = 'Aucun résultat';
    $('vide').querySelector('.vide__texte').textContent = 'Essaie une autre recherche ou une autre catégorie.';
  } else {
    $('vide').querySelector('.vide__titre').textContent = 'Aucune dépense';
    $('vide').querySelector('.vide__texte').textContent = 'Ajoute ta première dépense avec le formulaire.';
  }

  // On regroupe les dépenses par jour : { '2026-10-05': [d1, d2], … }
  const parJour = {};
  visibles.forEach(d => (parJour[d.date] ||= []).push(d));

  Object.entries(parJour).forEach(([date, liste]) => {
    const totalJour = liste.reduce((s, d) => s + d.montant, 0);
    const groupe = document.createElement('div');
    groupe.className = 'jour';
    groupe.innerHTML = `
      <div class="jour__tete">
        <span>${dateLisible(date)}</span>
        <span>${fcfa(totalJour)}</span>
      </div>`;

    const ul = document.createElement('ul');
    ul.className = 'jour__liste';
    liste.forEach(d => ul.appendChild(creerLigne(d)));
    groupe.appendChild(ul);
    conteneur.appendChild(groupe);
  });
}

// Crée une ligne de dépense. On utilise textContent (et pas innerHTML)
// pour la description : si quelqu'un tape du code HTML, il s'affiche
// comme du texte au lieu d'être exécuté. C'est une protection de sécurité.
function creerLigne(depense) {
  const cat = trouverCategorie(depense.categorie);
  const li = document.createElement('li');
  li.className = 'depense';

  const icone = document.createElement('span');
  icone.className = 'depense__icone';
  icone.style.background = cat.couleur + '22';   // 22 = couleur très transparente
  icone.textContent = cat.icone;

  const infos = document.createElement('div');
  infos.className = 'depense__infos';
  const titre = document.createElement('p');
  titre.className = 'depense__titre';
  titre.textContent = depense.description;
  const sous = document.createElement('p');
  sous.className = 'depense__categorie';
  sous.textContent = cat.nom;
  infos.append(titre, sous);

  const montant = document.createElement('span');
  montant.className = 'depense__montant';
  montant.textContent = '− ' + fcfa(depense.montant);

  const bouton = document.createElement('button');
  bouton.type = 'button';
  bouton.className = 'depense__supprimer';
  bouton.setAttribute('aria-label', `Supprimer ${depense.description}`);
  bouton.textContent = '✕';
  bouton.addEventListener('click', () => supprimerDepense(depense.id));

  li.append(icone, infos, montant, bouton);
  return li;
}

// Petit message en bas de l'écran, avec un bouton d'action facultatif
let minuteurToast;
function afficherToast(message, action) {
  const toast = $('toast');
  const bouton = $('toast-action');
  $('toast-texte').textContent = message;
  bouton.hidden = !action;
  bouton.onclick = action ? () => { action(); } : null;
  toast.classList.add('visible');
  clearTimeout(minuteurToast);
  minuteurToast = setTimeout(() => toast.classList.remove('visible'), action ? 5000 : 2500);
}


// ---------------------------------------------------------------------
// 7. DÉMARRAGE
// ---------------------------------------------------------------------

function creerBoutonsCategories() {
  const zone = $('categories-choix');
  CATEGORIES.forEach(c => {
    const bouton = document.createElement('button');
    bouton.type = 'button';
    bouton.className = 'puce-categorie';
    bouton.dataset.id = c.id;
    bouton.style.setProperty('--couleur', c.couleur);
    bouton.setAttribute('aria-pressed', c.id === categorieChoisie);
    bouton.textContent = `${c.icone} ${c.nom}`;
    bouton.addEventListener('click', () => {
      categorieChoisie = c.id;
      zone.querySelectorAll('.puce-categorie').forEach(b => b.setAttribute('aria-pressed', b === bouton));
    });
    zone.appendChild(bouton);

    // Même liste dans le filtre de l'historique
    const option = document.createElement('option');
    option.value = c.id;
    option.textContent = `${c.icone} ${c.nom}`;
    $('filtre-categorie').appendChild(option);
  });
}

function demarrer() {
  charger();
  creerBoutonsCategories();

  $('choix-mois').value = aujourdhui().slice(0, 7);
  $('date').value = aujourdhui();
  if (budget) $('budget').value = budget;

  // On « écoute » les actions de l'utilisateur
  $('form-depense').addEventListener('submit', ajouterDepense);
  $('form-budget').addEventListener('submit', definirBudget);
  $('btn-export').addEventListener('click', exporterCSV);
  $('choix-mois').addEventListener('change', afficher);
  $('recherche').addEventListener('input', afficher);
  $('filtre-categorie').addEventListener('change', afficher);

  afficher();
}

demarrer();
