# Mes Dépenses — gestionnaire de budget en FCFA

Application web pour suivre ses dépenses au quotidien, pensée pour les étudiants au Sénégal.
Réalisée en **HTML, CSS et JavaScript**, sans framework ni librairie.

## Fonctionnalités

- Ajouter une dépense : description, montant en FCFA, date et catégorie
- **Budget mensuel** avec jauge de progression (verte, orange à 80 %, rouge en cas de dépassement)
- Total du mois, dépense moyenne par jour, plus grosse dépense
- **Répartition par catégorie** avec barres de pourcentage
- Historique groupé par jour, avec **recherche** et **filtre par catégorie**
- Choix du mois affiché
- Suppression avec bouton **« Annuler »**
- **Export CSV** (ouvrable dans Excel)
- Sauvegarde automatique dans le navigateur (`localStorage`) : aucune donnée n'est envoyée sur Internet
- Thème clair / sombre automatique, adapté au téléphone

## Ce que le projet montre (notions JavaScript)

| Notion | Où la voir dans `app.js` |
|---|---|
| Manipulation du DOM (`createElement`, `append`, `textContent`) | `creerLigne()`, `afficherListe()` |
| Événements (`submit`, `click`, `input`, `change`) | `demarrer()` |
| Tableaux : `filter`, `map`, `reduce`, `sort`, `find` | `afficherResume()`, `afficherRepartition()` |
| Stockage local avec `JSON.stringify` / `JSON.parse` | `charger()`, `sauvegarder()` |
| Formatage des nombres et des dates (`Intl`, `toLocaleDateString`) | `fcfa()`, `dateLisible()` |
| Création de fichier à télécharger (`Blob`) | `exporterCSV()` |
| Sécurité : `textContent` au lieu d'`innerHTML` pour le texte saisi | `creerLigne()` |

Principe de l'application : on ne modifie jamais l'écran directement. On modifie les données,
on les sauvegarde, puis `afficher()` reconstruit l'écran à partir d'elles.

## Lancer le projet

Ouvrir `index.html` dans un navigateur. Aucune installation n'est nécessaire.

## Auteur

**Ibrahima SARR** — étudiant en informatique à Dakar
[Portfolio](https://portfolioibrahimasarr.vercel.app) · [GitHub](https://github.com/Ibrahima-Sarr14)
