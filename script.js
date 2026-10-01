// =========================================================
// Portfolio — Ibrahima SARR
// =========================================================

// ----- Thème clair / sombre (mémorisé dans le navigateur) -----
const racine = document.documentElement;
const btnTheme = document.getElementById('btn-theme');

function themeActuel() {
  const choisi = racine.getAttribute('data-theme');
  if (choisi) return choisi;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

btnTheme.addEventListener('click', () => {
  const nouveau = themeActuel() === 'dark' ? 'light' : 'dark';
  racine.setAttribute('data-theme', nouveau);
  try { localStorage.setItem('theme', nouveau); } catch (e) {}
});

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
  btnMenu.setAttribute('aria-expanded', ouvert);
  btnMenu.setAttribute('aria-label', ouvert ? 'Fermer le menu' : 'Ouvrir le menu');
});
nav.querySelectorAll('a').forEach(lien => lien.addEventListener('click', fermerMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape') fermerMenu(); });

// ----- En-tête opaque après un peu de défilement -----
const entete = document.getElementById('entete');
const majEntete = () => entete.classList.toggle('defile', window.scrollY > 20);
window.addEventListener('scroll', majEntete, { passive: true });
majEntete();

// ----- Apparition des blocs au défilement -----
const blocs = document.querySelectorAll('.revele');
if ('IntersectionObserver' in window) {
  const obsBlocs = new IntersectionObserver(entrees => {
    entrees.forEach(entree => {
      if (entree.isIntersecting) {
        entree.target.classList.add('visible');
        obsBlocs.unobserve(entree.target);
      }
    });
  }, { threshold: 0.12 });
  blocs.forEach(bloc => obsBlocs.observe(bloc));
} else {
  blocs.forEach(bloc => bloc.classList.add('visible'));
}

// ----- Lien du menu actif selon la section visible -----
const liens = nav.querySelectorAll('a');
const sections = [...liens].map(l => document.querySelector(l.getAttribute('href')));
const obsSections = new IntersectionObserver(entrees => {
  entrees.forEach(entree => {
    if (entree.isIntersecting) {
      liens.forEach(l => l.classList.toggle('actif', l.getAttribute('href') === '#' + entree.target.id));
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach(s => s && obsSections.observe(s));

// ----- Année du pied de page -----
document.getElementById('annee').textContent = new Date().getFullYear();
