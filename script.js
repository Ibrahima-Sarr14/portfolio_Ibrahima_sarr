// =========================================================
// Portfolio — Ibrahima SARR
// =========================================================

// ----- Menu mobile -----
const btnMenu = document.getElementById('btn-menu');
const nav = document.getElementById('nav');

function fermerMenu() {
  nav.classList.remove('ouvert');
  btnMenu.setAttribute('aria-expanded', 'false');
  btnMenu.setAttribute('aria-label', 'Ouvrir le menu');
}

btnMenu.addEventListener('click', () => {
  const ouvert = nav.classList.toggle('ouvert');
  btnMenu.setAttribute('aria-expanded', String(ouvert));
  btnMenu.setAttribute('aria-label', ouvert ? 'Fermer le menu' : 'Ouvrir le menu');
});
nav.querySelectorAll('a').forEach(lien => lien.addEventListener('click', fermerMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape') fermerMenu(); });

// ----- Lien du menu souligné selon la section visible -----
// Seuls les liens internes (#section) suivent le défilement.
const liens = [...nav.querySelectorAll('a')];
const sections = liens
  .map(lien => {
    const cible = lien.getAttribute('href');
    return cible.startsWith('#') ? document.querySelector(cible) : null;
  })
  .filter(Boolean);

if ('IntersectionObserver' in window && sections.length) {
  const suivi = new IntersectionObserver(entrees => {
    entrees.forEach(entree => {
      if (!entree.isIntersecting) return;
      liens.forEach(lien => {
        lien.classList.toggle('actif', lien.getAttribute('href') === '#' + entree.target.id);
      });
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(section => suivi.observe(section));
}

// ----- Copier l'e-mail ou le téléphone -----
const toast = document.getElementById('toast');
let minuteurToast;

function afficherToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(minuteurToast);
  minuteurToast = setTimeout(() => toast.classList.remove('visible'), 2200);
}

document.querySelectorAll('[data-copier]').forEach(bouton => {
  bouton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(bouton.dataset.copier);
      afficherToast('Copié : ' + bouton.dataset.copier);
    } catch (e) {
      afficherToast(bouton.dataset.copier);
    }
  });
});

// ----- Année du pied de page -----
document.getElementById('annee').textContent = new Date().getFullYear();
