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
// Sur une page secondaire (étude de cas), le lien marqué aria-current reste actif
let lienActif = nav.querySelector('[aria-current="page"]');
if (lienActif) lienActif.classList.add('actif');

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
// Seuls les liens internes (#section) suivent le défilement
const sections = liens.map(l => {
  const cible = l.getAttribute('href');
  return cible.startsWith('#') ? document.querySelector(cible) : null;
});
const obsSections = new IntersectionObserver(entrees => {
  entrees.forEach(entree => {
    if (!entree.isIntersecting) return;
    lienActif = liens.find(l => l.getAttribute('href') === '#' + entree.target.id) || null;
    liens.forEach(l => l.classList.toggle('actif', l === lienActif));
    if (!nav.matches(':hover')) placerPilule(lienActif);
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach(s => s && obsSections.observe(s));

const mouvementReduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ----- Barre de lecture + bouton retour en haut -----
const progression = document.getElementById('progression');
const haut = document.getElementById('haut');
const hautProgres = document.getElementById('haut-progres');
const PERIMETRE = 2 * Math.PI * 22; // cercle de rayon 22

function majDefilement() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
  progression.style.transform = `scaleX(${ratio})`;
  hautProgres.style.strokeDashoffset = PERIMETRE * (1 - ratio);
  haut.classList.toggle('visible', window.scrollY > 600);
}
window.addEventListener('scroll', majDefilement, { passive: true });
window.addEventListener('resize', majDefilement);
majDefilement();

// ----- Effet machine à écrire dans l'accueil -----
const machine = document.getElementById('machine');
const mots = ['interfaces modernes', 'sites responsives', 'expériences fluides', 'solutions web utiles'];
if (machine && !mouvementReduit) {
  let indexMot = 0, lettres = mots[0].length, efface = false;
  (function taper() {
    const mot = mots[indexMot];
    lettres += efface ? -1 : 1;
    machine.textContent = mot.slice(0, lettres);
    let delai = efface ? 40 : 85;
    if (!efface && lettres === mot.length) { efface = true; delai = 1800; }
    else if (efface && lettres === 0) { efface = false; indexMot = (indexMot + 1) % mots.length; delai = 300; }
    setTimeout(taper, delai);
  })();
}

// ----- Compteurs animés (14, 35, 100 %) -----
const compteurs = document.querySelectorAll('[data-compteur]');
if ('IntersectionObserver' in window && !mouvementReduit) {
  const obsCompteurs = new IntersectionObserver(entrees => {
    entrees.forEach(entree => {
      if (!entree.isIntersecting) return;
      const el = entree.target;
      const fin = +el.dataset.compteur;
      const suffixe = el.dataset.suffixe || '';
      const debut = performance.now();
      (function etape(t) {
        const p = Math.min((t - debut) / 1400, 1);
        el.textContent = Math.round(fin * (1 - Math.pow(1 - p, 3))) + suffixe;
        if (p < 1) requestAnimationFrame(etape);
      })(debut);
      obsCompteurs.unobserve(el);
    });
  }, { threshold: 0.6 });
  compteurs.forEach(c => obsCompteurs.observe(c));
}

// ----- Halo lumineux qui suit la souris sur les cartes -----
document.querySelectorAll('.lumiere').forEach(carte => {
  carte.addEventListener('pointermove', e => {
    const r = carte.getBoundingClientRect();
    carte.style.setProperty('--mx', `${e.clientX - r.left}px`);
    carte.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
});

// ----- Copier l'e-mail ou le téléphone -----
const toast = document.getElementById('toast');
let minuteurToast;
function afficherToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(minuteurToast);
  minuteurToast = setTimeout(() => toast.classList.remove('visible'), 2000);
}
document.querySelectorAll('[data-copier]').forEach(bouton => {
  bouton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(bouton.dataset.copier);
      afficherToast('Copié ✓ ' + bouton.dataset.copier);
    } catch (e) {
      afficherToast(bouton.dataset.copier);
    }
  });
});

// ----- Année du pied de page -----
document.getElementById('annee').textContent = new Date().getFullYear();
