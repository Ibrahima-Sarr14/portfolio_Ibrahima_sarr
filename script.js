// =========================================================
// Portfolio — Ibrahima SARR
// =========================================================

// ----- Thème clair / sombre (mémorisé dans le navigateur) -----
const racine = document.documentElement;
const btnTheme = document.getElementById('btn-theme');

function themeActuel() {
  return racine.getAttribute('data-theme') || 'light';
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

// ----- Pastille du menu (comme sur Sunu Info) -----
// Sur ordinateur, une pastille foncée se place sous le lien de la section
// visible et glisse vers le lien survolé.
const liens = [...nav.querySelectorAll('a')];
const pilule = nav.querySelector('.nav__pilule');
const bureau = window.matchMedia('(min-width: 901px)');
let lienActif = null;

function placerPilule(cible) {
  liens.forEach(l => l.classList.toggle('sous-pilule', l === cible));
  if (!bureau.matches || !cible) { pilule.style.opacity = 0; return; }
  pilule.style.width = cible.offsetWidth + 'px';
  pilule.style.transform = `translateX(${cible.offsetLeft}px)`;
  pilule.style.opacity = 1;
}

liens.forEach(lien => {
  lien.addEventListener('mouseenter', () => placerPilule(lien));
  lien.addEventListener('focus', () => placerPilule(lien));
});
nav.addEventListener('mouseleave', () => placerPilule(lienActif));
window.addEventListener('resize', () => placerPilule(lienActif));
if (document.fonts) document.fonts.ready.then(() => placerPilule(lienActif));

// ----- Lien du menu actif selon la section visible -----
const sections = liens.map(l => document.querySelector(l.getAttribute('href')));
const obsSections = new IntersectionObserver(entrees => {
  entrees.forEach(entree => {
    if (!entree.isIntersecting) return;
    lienActif = liens.find(l => l.getAttribute('href') === '#' + entree.target.id) || null;
    liens.forEach(l => l.classList.toggle('actif', l === lienActif));
    if (!nav.matches(':hover')) placerPilule(lienActif);
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach(s => s && obsSections.observe(s));

// ----- Année du pied de page -----
document.getElementById('annee').textContent = new Date().getFullYear();
