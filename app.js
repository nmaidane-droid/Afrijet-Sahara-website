var PAGE_URL={"accueil": "/", "compagnie": "/la-compagnie", "flotte": "/notre-flotte", "rayon": "/rayon-d-action", "services": "/nos-services", "empty-legs": "/vols-a-vide", "securite": "/securite", "actualites": "/actualites", "contact": "/contact"};
var PANEL_URL={"compagnie": "/la-compagnie", "president": "/mot-du-president", "prepaid": "/cartes-prepayees"};


/* ---- Navigation par sections ---- */
const navbar = document.getElementById('navbar');
const allSections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

// Cacher toutes les sections sauf accueil au démarrage
function showSection(id) {
  if (!document.getElementById(id)) { if (PAGE_URL[id]) location.href = PAGE_URL[id]; return; }
  // Hide all sections
  document.querySelectorAll('section[id]').forEach(s => {
    s.style.display = 'none';
    s.classList.remove('section-enter');
  });

  // Show target section with animation (skip for accueil)
  const target = document.getElementById(id);
  if (target) {
    target.style.display = 'block';
    if (id !== 'accueil') target.classList.add('section-enter');
  }

  // Charger la carte du rayon d'action à la première ouverture (section visible = taille correcte pour Leaflet)
  if (id === 'rayon') {
    var rf = document.getElementById('rayonFrame');
    if (rf && !rf.getAttribute('src')) {
      rf.addEventListener('load', fitRayonFrame);
      rf.setAttribute('src', rf.getAttribute('data-src'));
    } else {
      fitRayonFrame();
    }
    // Recadrer le cercle à chaque ouverture de la page (carte de nouveau visible)
    var callFit = function(){ try { if (rf && rf.contentWindow && rf.contentWindow.fitRing) rf.contentWindow.fitRing(); } catch(e) {} };
    setTimeout(callFit, 250);
    setTimeout(callFit, 900);
  }

  if (id === 'services') {
    setTimeout(function () { if (window.journeyRefresh) window.journeyRefresh(); }, 200);
  }

  // Cacher les panneaux compagnie par défaut
  if (id === 'compagnie') {
    var pc = document.getElementById('panel-compagnie');
    var pp = document.getElementById('panel-president');
    var pr = document.getElementById('panel-prepaid');
    if (pc) pc.style.display = 'none';
    if (pp) pp.style.display = 'none';
    if (pr) pr.style.display = 'none';
  }

  // Marquer lien actif
  navLinks.forEach(l => {
    l.classList.toggle('active', l.getAttribute('href') === PAGE_URL[id]);
  });

  // Reset all reveals in section (remove visible first so animation replays)
  const reveals = document.querySelectorAll('#' + id + ' .reveal, #' + id + ' .reveal-left, #' + id + ' .reveal-right, #' + id + ' .reveal-scale, #' + id + ' .divider');
  reveals.forEach(el => el.classList.remove('visible'));
  // Reset counters
  document.querySelectorAll('#' + id + ' [data-count]').forEach(c => { c.textContent = '0'; c.classList.remove('counted'); });

  // Stagger reveal animations with delays
  setTimeout(() => {
    reveals.forEach((el, i) => {
      const baseDelay = 80;
      const staggerClass = [...el.classList].find(c => c.startsWith('stagger-'));
      const extraDelay = staggerClass ? parseInt(staggerClass.split('-')[1]) * 100 : 0;
      setTimeout(() => {
        el.classList.add('visible');
      }, (i * baseDelay) + extraDelay);
    });
    // Animate counters with delay (skip animation on mobile)
    const isMobile = window.innerWidth <= 768;
    document.querySelectorAll('#' + id + ' [data-count]').forEach((c, i) => {
      const target = parseInt(c.getAttribute('data-count'), 10);
      const suffix = c.getAttribute('data-suffix') || '';
      if (isMobile) {
        c.textContent = target.toLocaleString() + suffix;
      } else {
        setTimeout(() => animateCounter(c), 400 + (i * 150));
      }
    });
  }, 50);

  // Afficher le cadenas uniquement sur vols à vide
  var adminBtn = document.getElementById('elAdminBtn');
  if (adminBtn) adminBtn.style.display = (id === 'empty-legs') ? 'flex' : 'none';

  // Remonter en haut
  window.scrollTo(0, 0);
}


// ── Flotte dropdown ──
(function() {
  function initFlotteDropdown() {
    var dd = document.getElementById('flotteDropdown');
    if (!dd) return;
    var btn = dd.querySelector('.flotte-dropdown-btn');
    var list = document.getElementById('flotteDropdownList');

    // Ouvrir/fermer au clic bouton
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var rect = btn.getBoundingClientRect();
      list.style.top = (rect.bottom + 6) + 'px';
      list.style.left = rect.left + 'px';
      list.style.width = rect.width + 'px';
      dd.classList.toggle('open');
    });

    // Clic sur un item
    list.querySelectorAll('.flotte-dropdown-item[data-ac]').forEach(function(item) {
      item.addEventListener('click', function(e) {
        e.stopPropagation();
        var id  = item.getAttribute('data-ac');
        var reg = item.getAttribute('data-reg');
        var type = item.getAttribute('data-type');

        // Changer panel
        document.querySelectorAll('.flotte-panel').forEach(function(p) { p.classList.remove('active'); });
        var panel = document.getElementById('ac-' + id);
        if (panel) panel.classList.add('active');

        // Mettre à jour bouton
        dd.querySelector('.flotte-dropdown-reg').textContent = reg;
        dd.querySelector('.flotte-dropdown-type').textContent = type;

        // Marquer actif
        list.querySelectorAll('.flotte-dropdown-item').forEach(function(i) { i.classList.remove('active'); });
        item.classList.add('active');

        // Fermer
        dd.classList.remove('open');
      });
    });

    // Fermer au clic extérieur
    document.addEventListener('click', function(e) {
      if (dd && !dd.contains(e.target)) dd.classList.remove('open');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFlotteDropdown);
  } else {
    initFlotteDropdown();
  }
})();

// ── Système i18n ──
const translations = {
  fr: {
    'nav.accueil': 'Accueil',
    'nav.apropos': 'À propos',
    'nav.prepaid': 'Cartes prépayées',
    'prepaid.benefits': 'Avantages clés',
    'prepaid.title': 'La Carte Prépayée Afrijet Sahara',
    'prepaid.tagline': 'Volez à votre rythme, à tarif fixe.',
    "prepaid.desc": "La Carte Prépayée Afrijet Sahara vous garantit un accès prioritaire à notre flotte EMB 140 LR et EMB 145, à un tarif horaire fixe et compétitif. Idéale pour les voyageurs institutionnels et d'affaires qui volent régulièrement.",
    'prepaid.l1': 'Disponibilité garantie sous 48 heures',
    'prepaid.l2': 'Tarif horaire fixe sans surprises',
    'prepaid.l3': 'Gestionnaire de compte personnel dédié',
    'prepaid.l4': "Conditions d'annulation préférentielles",
    'prepaid.l5': 'Taxes aéroportuaires incluses',
    'prepaid.l6': 'Dégivrage (si nécessaire), restauration à bord et Internet Starlink à haut débit inclus',
    'prepaid.l7': "Pas de date d'expiration de vos crédits",
    'prepaid.l8': 'Accès à toutes nos destinations — Afrique, Moyen-Orient, Europe',
    'prepaid.cta': 'Demander une proposition →',
    'card.type': 'Carte Prépayée',
    'card.fleet': 'Flotte',
    'card.validity': 'Validité',
    'nav.president': 'Mot du Président',
    'nav.compagnie': 'La Compagnie',
    'pres.label': 'Mot du Président',
    'pres.title': 'Président — Sahara Aviation Holding',
    'el.admin_title': 'Gérer les vols à vide',
    'form.submit': 'Demander un devis →',
    'nav.flotte': 'Notre Flotte',
    'nav.rayon': "Rayon d'action",
    'nav.services': 'Nos Services',
    'nav.empty': 'Vols à Vide',
    'el.label': 'Opportunités',
    'el.title': 'Vols à <em>vide disponibles</em>',
    'el.sub': 'Ces vols sont mis à jour quotidiennement.',
    'el.intro': 'Un vol à vide est un vol charter actuellement planifié sans passagers à bord, afin de repositionner l\'appareil vers un autre aéroport.',
    'el.loading': 'Chargement des vols…',
    'el.empty_title': 'Aucun vol à vide programmé',
    'el.empty_text': 'Contactez-nous pour vos besoins spécifiques, nous trouverons la meilleure solution.',
    'el.contact': 'Réserver →',
    'nav.securite': 'Sécurité',
    'nav.actualites': 'Actualités',
    'nav.contact': 'Contact / Devis',
    'nav.devis': 'Demander un devis',
    'acc.label': "Aviation Charter d'Exception",
    'acc.title': 'Volez à votre <em>rythme,</em><br>vers vos destinations.',
    'acc.sub': "Afrijet Sahara met à votre disposition sa flotte EMB 140 LR et EMB 145 pour vos vols à la demande vers toute destination. Basée à Dakhla, au sud du Maroc, notre compagnie vous offre une liberté de vol totale : décollage à l'heure qui vous convient, depuis l'aéroport de votre choix, sans escales inutiles. Discrétion absolue, service personnalisé et excellence opérationnelle à chaque vol.",
    'acc.cta': 'Demander un devis →',
    'acc.stat1': 'Sièges Full Business',
    'acc.stat2': 'Vitesse',
    'acc.stat3': 'Disponibilité',
    'acc.s4': 'Discrétion',
    'comp.label': 'La Compagnie',
    'comp.title': 'Une compagnie au service de <em>votre ambition</em>',
    'comp.sub': "Afrijet Sahara est une compagnie charter marocaine fondée pour répondre aux exigences des voyageurs d'affaires et des institutionnels qui refusent les compromis. Basée à Dakhla, nous opérons à travers l'Afrique, le Moyen-Orient et l'Europe avec une rigueur opérationnelle sans faille.",
    'flotte.label': 'Notre Flotte',
    'flotte.title': 'Chaque appareil, une <em>expérience unique</em>',
    'srv.label': 'Nos Services',
    'srv.title': 'Chaque vol, <em>sur mesure</em>',
    'srv.sub': 'Nous adaptons chaque mission à vos exigences : horaires, départ, destination, configuration à bord.',
    'srv.t1': "Vols d'Affaires",
    'srv.d1': "Maximisez votre productivité. Décollage à votre heure, de l'aéroport de votre choix. Nos appareils vous permettent d'accéder à des aéroports secondaires inaccessibles aux grandes compagnies, réduisant vos temps de transfert. Confidentialité absolue, service personnalisé et flexibilité totale pour vos équipes dirigeantes.",
    'srv.t2': 'Vols Institutionnels',
    'srv.d2': "Afrijet Sahara accompagne les institutions, administrations et organisations internationales dans leurs déplacements officiels. Rigueur protocolaire, discrétion et fiabilité opérationnelle pour vos délégations, missions de terrain et visites officielles à travers l'Afrique et l'Europe.",
    'sec.label': 'Sécurité & Qualité',
    'sec.title': 'La sécurité, notre <em>engagement premier</em>',
    'cta.label': 'Contact & Devis',
    'cta.title': 'Planifions votre <em>prochain vol</em>',
    'cta.sub': 'Notre équipe opérationnelle est disponible 24h/24 et 7j/7 pour répondre à vos demandes et confirmer votre vol dans les meilleurs délais.',
    'cta.btn': 'Envoyer la demande →',
    'footer.copy': '© 2026 Afrijet Sahara. Tous droits réservés.',
    'footer.legal': 'Mentions légales',
        
    'comp.v1': 'Excellence', 'comp.v1t': 'Des standards opérationnels de niveau international, à chaque vol.',
    'comp.v2': 'Confiance', 'comp.v2t': 'Transparence totale et engagement contractuel clair.',
    'comp.v3': 'Réactivité', 'comp.v3t': 'Disponibles 24h/24 pour confirmer votre vol en quelques heures.',
    'comp.v4': 'Sécurité', 'comp.v4t': 'La sécurité est notre priorité absolue et non négociable.',
    'comp.cert': 'Certifications & Agréments',
    'comp.c1': "Certificat de Transporteur Aérien (CTA) délivré par la Direction Générale de l'Aviation Civile du Maroc.",
    'comp.c2': 'Opérations conformes aux réglementations aériennes marocaines et normes OACI.',
    'comp.c3': "Programme de maintenance approuvé, garantissant l'airworthiness permanente de notre appareil.",
    'comp.c4': 'Système de Gestion de la Sécurité (SGS) pleinement implémenté et audité.',
    'srv.aboard': 'Services <em>à bord</em>',
    'srv.t3': 'Connectivité', 'srv.d3': "Accès WiFi satellite Starlink à bord pour rester connecté tout au long de votre vol. Travaillez, communiquez ou suivez vos dossiers sans interruption.",
    'srv.t4': 'Restauration', 'srv.d4': "Service de restauration personnalisé selon vos préférences : plats chauds et froids, boissons sélectionnées. Chaque repas est préparé avec soin pour répondre à vos exigences.",
    'srv.t5': 'Confort & Espace', 'srv.d5': "Sièges business inclinables avec espace généreux entre les rangées. Cabine calme et intimiste, conçue pour votre repos et votre productivité.",
    'srv.t6': 'Bagages', 'srv.d6': "Soute généreuse adaptée à vos besoins, sans les contraintes des compagnies régulières. Embarquez vos équipements professionnels en toute liberté.",
    'srv.journey.label': 'Le Voyage',
    'srv.journey.title': 'Chaque instant, <em>pensé pour vous</em>',
    'srv.journey.t1': 'T - 30 MIN', 'srv.journey.h1': 'Arrivée au Terminal Privé', 'srv.journey.d1': "Rejoignez le terminal privé de l'aéroport. Aucune file d'attente, aucune foule. Votre appareil vous attend sur le tarmac, à quelques pas.",
    'srv.journey.t2': 'T - 15 MIN', 'srv.journey.h2': 'Accueil Personnalisé', 'srv.journey.d2': "Votre hôtesse vous accueille par votre nom. Votre boisson de prédilection est servie. Vos bagages sont déjà à bord.",
    'srv.journey.t3': 'T - 5 MIN', 'srv.journey.h3': 'Embarquement Fluide', 'srv.journey.d3': "Rejoignez votre appareil directement. Aucun contrôle de sécurité, aucune carte d'embarquement. Montez simplement à bord de votre espace privé.",
    'srv.journey.t4': 'EN VOL', 'srv.journey.h4': 'Expérience en Vol', 'srv.journey.d4': "Installez-vous dans votre siège business. Savourez une restauration gastronomique, des vins fins et un divertissement personnalisé à 11 000 mètres d'altitude.",
    'srv.journey.t5': 'ARRIVÉE', 'srv.journey.h5': 'Arrivée Discrète', 'srv.journey.d5': "Atterrissez au terminal privé de votre destination. Votre transport au sol vous attend. De porte à porte, le voyage est sans couture.",
    
    
    'news.label': 'Actualités', 'news.photo': 'Challenge.ma', 'news.d1': '25 mai 2025', 'news.t1': "Anas Bennani parie sur l'aérien à Dakhla avec Sahara Aviation Holding", 'news.e1': "Fort d'une carrière internationale dans le financement aéronautique, Anas Bennani crée Sahara Aviation Holding, basée à Dakhla, pour structurer un écosystème d'investissement aérien dans le sud du Maroc. Source : Challenge.ma", 'news.read': 'Lire l\'article →', 'news.title': 'Les dernières <em>nouvelles</em>',
    'news.d2': '7 – 10 octobre 2026', 'news.t2': 'Afrijet Sahara au Marrakech Airshow', 'news.e2': "Du 7 au 10 octobre 2026, Afrijet Sahara était présente au Marrakech Airshow, rendez-vous de l'aviation au Maroc. Ce salon a été l'occasion de présenter notre compagnie charter basée à Dakhla et son Embraer 140 LR full business de 18 places, et d'échanger avec les acteurs du secteur. Retrouvez en vidéo les moments forts de notre passage. Pour toute demande de vol privé au départ du Maroc, notre équipe est disponible 24h/24 et 7j/7.", 'news.video': 'Voir la vidéo sur Facebook →',
    'fleet.config': 'Configuration', 'fleet.speed': 'Vitesse',
    'fleet.alt': 'Altitude', 'fleet.range': "Rayon d'action",
    'fleet.endur': 'Autonomie', 'fleet.cabin': 'Cabine', 'fleet.cargo': 'Soute', 'fleet.engine': 'Motorisation',
    'fleet.kta.config': '18 sièges Full Business', 'fleet.kta.endur': '~3h 50 sans escale',
    'fleet.ktb.config': '8 sièges Full Business', 'fleet.ktb.endur': '~3h 20 sans escale',
    'fleet.f1': 'Sièges business inclinables', 'fleet.f2': 'Service à bord de qualité',
    'fleet.f3': 'Connectivité satellite Starlink', 'fleet.f4': 'Soute généreuse', 'fleet.f5': 'Accès pistes courtes',
    'fleet.soon.title': 'De nouveaux appareils rejoignent la flotte',
    'fleet.soon.sub': "Afrijet Sahara poursuit son développement. De nouveaux aéronefs viendront renforcer notre capacité opérationnelle pour mieux vous servir.",
    'sec.t1': 'SMS Certifié', 'sec.d1': "Notre Système de Gestion de la Sécurité est pleinement opérationnel et audité régulièrement. Il couvre l'identification proactive des dangers, l'évaluation des risques, le suivi des actions correctives et la culture sécurité au sein de toute l'organisation.",
    'sec.t2': 'Certification DGAC', 'sec.d2': "Afrijet Sahara opère sous Certificat Technique d'Exploitation (CTE) délivré par la DGAC du Maroc. Nos opérations sont conduites en conformité stricte avec la réglementation marocaine et les standards OACI, garantissant un niveau de sécurité homologué à l'échelle internationale.",
    'sec.t3': 'Équipage Qualifié', 'sec.d3': "Nos pilotes, très expérimentés, sont certifiés selon les standards les plus exigeants, avec des programmes de formation récurrente sur simulateur. Chaque membre d'équipage maintient ses qualifications à jour et suit un programme de contrôle en ligne rigoureux.",
    'sec.t4': 'Maintenance Rigoureuse', 'sec.d4': "Nos appareils sont maintenus selon les programmes de maintenance constructeur approuvés par la DGAC. Chaque vol est précédé d'une inspection complète garantissant la navigabilité de l'aéronef.",
    'form.iata': 'IATA ou ville',
    'contact.phone': 'Téléphone',
    'contact.whatsapp': 'WhatsApp',
    'contact.email': 'Email',
    'contact.address': 'Adresse',
    'form.title': 'Demande de vol',
    'form.name': 'Nom complet',
    'form.org': 'Société / Organisation',
    'form.email': 'Email',
    'form.phone': 'Téléphone / WhatsApp',
    'form.dep': 'Aéroport de départ',
    'form.arr': "Aéroport d'arrivée",
    'form.date': 'Date souhaitée',
    'form.pax': 'Nombre de passagers (max. 18)',
    'form.info': 'Informations complémentaires',
    'form.sent': 'Demande envoyée',
    'form.sub': 'Notre équipe vous contactera sous 2 heures.',
    'footer.privacy': 'Politique de confidentialité',
        'legal.section1': 'Informations légales', 'legal.section2': 'Propriété intellectuelle', 'legal.section3': 'Données personnelles',
    'legal.company': 'Raison sociale', 'legal.form': 'Forme juridique', 'legal.form.val': 'Société par Actions Simplifiée',
    'legal.capital': 'Capital social', 'legal.address': 'Siège social', 'legal.phone': 'Téléphone',
    'legal.director': 'Directeur de publication', 'legal.host': 'Hébergeur', 'legal.host.site': 'Site hébergeur',
    'legal.ip.text': "L\'ensemble du contenu de ce site (textes, images, logos, graphismes) est la propriété exclusive de Sahara Aviation SAS et est protégé par les lois marocaines et internationales relatives à la propriété intellectuelle. Toute reproduction, même partielle, est strictement interdite sans autorisation préalable.",
    'legal.data.text': "Les informations collectées via le formulaire de contact sont utilisées uniquement pour répondre à vos demandes et ne sont en aucun cas cédées à des tiers. Conformément à la loi 09-08 relative à la protection des personnes physiques à l\'égard du traitement des données à caractère personnel, vous disposez d\'un droit d\'accès, de rectification et de suppression de vos données en contactant : <a href=\"mailto:info@afrijet.ma\" style=\"color:#E8001C;\">info@afrijet.ma</a>.",
  },
  en: {
    'nav.accueil': 'Home',
    'nav.apropos': 'About',
    'nav.prepaid': 'Prepaid Cards',
    'prepaid.benefits': 'Key Benefits',
    'prepaid.title': 'The Afrijet Sahara Prepaid Card',
    'prepaid.tagline': 'Fly at your own pace, at a fixed rate.',
    'prepaid.desc': 'The Afrijet Sahara Prepaid Card guarantees you priority access to our EMB 140 LR and EMB 145 fleet at a fixed and competitive hourly rate. Ideal for institutional and business travellers who fly regularly.',
    'prepaid.l1': 'Guaranteed availability within 48 hours',
    'prepaid.l2': 'Fixed hourly rate with no surprises',
    'prepaid.l3': 'Dedicated personal account manager',
    'prepaid.l4': 'Preferred cancellation terms',
    'prepaid.l5': 'Airport fees included',
    'prepaid.l6': 'De-icing (if required), in-flight catering and high-speed Starlink Internet included',
    'prepaid.l7': 'No expiry date on your credits',
    'prepaid.l8': 'Access to all our destinations — Africa, Middle East, Europe',
    'prepaid.cta': 'Request a proposal →',
    'card.type': 'Prepaid Card',
    'card.fleet': 'Fleet',
    'card.validity': 'Validity',
    'nav.president': 'Message from the President',
    'nav.compagnie': 'About Us',
    'pres.label': 'Message from the President',
    'pres.title': 'President — Sahara Aviation Holding',
    'el.admin_title': 'Manage empty leg flights',
    'form.submit': 'Request a quote →',
    'nav.flotte': 'Our Fleet',
    'nav.rayon': 'Range Map',
    'nav.services': 'Services',
    'nav.empty': 'Empty Legs',
    'el.label': 'Opportunities',
    'el.title': 'Available <em>Empty Legs</em>',
    'el.sub': 'These flights are updated daily.',
    'el.intro': 'An empty leg is a private charter flight currently planned without passengers on board, in order to reposition the aircraft to another airport.',
    'el.intro2': 'The advantageous conditions make them a unique opportunity to book your next flight on a business jet in our fleet.',
    'el.intro3': 'Changes to the itinerary may be possible upon request.',
    'el.loading': 'Loading flights…',
    'el.empty_title': 'No empty legs scheduled',
    'el.empty_text': 'Contact us for your specific needs, we will find the best solution.',
    'el.contact': 'Book →',
    'nav.securite': 'Safety',
    'nav.actualites': 'News',
    'nav.contact': 'Contact / Quote',
    'nav.devis': 'Request a Quote',
    'acc.label': 'Charter Aviation Excellence',
    'acc.title': 'Fly at your own <em>pace,</em><br>to your destinations.',
    'acc.sub': 'Afrijet Sahara puts its EMB 140 LR and EMB 145 fleet at your disposal for on-demand flights to any destination. Based in Dakhla, in southern Morocco, our company offers you total freedom of flight: take off at the time that suits you, from the airport of your choice, with no unnecessary stopovers. Absolute discretion, personalised service and operational excellence on every flight.',
    'acc.cta': 'Request a Quote →',
    'acc.stat1': 'Full Business Seats',
    'acc.stat2': 'Cruising Speed',
    'acc.stat3': 'Availability',
    'acc.s4': 'Discretion',
    'comp.label': 'About Us',
    'comp.title': 'A company at the service of your <em>ambition</em>',
    'comp.sub': 'Afrijet Sahara is a Moroccan charter airline founded to meet the demands of business travellers and institutions that refuse to compromise. Based in Dakhla, we operate across Africa, the Middle East and Europe with unwavering operational rigour.',
    'flotte.label': 'Our Fleet',
    'flotte.title': 'Each aircraft, a <em>unique experience</em>',
    'srv.label': 'Our Services',
    'srv.title': 'Every flight, <em>tailored</em>',
    'srv.sub': 'We adapt every mission to your requirements: schedules, departure, destination, cabin configuration.',
    'srv.t1': 'Business Flights',
    'srv.d1': 'Maximise your productivity. Take off at your own time, from the airport of your choice. Our aircraft give you access to secondary airports unreachable by major airlines, reducing your transfer times. Absolute confidentiality, personalised service and total flexibility for your executive teams.',
    'srv.t2': 'Institutional Flights',
    'srv.d2': 'Afrijet Sahara supports institutions, administrations and international organisations in their official travel. Protocol rigour, discretion and operational reliability for your delegations, field missions and official visits across Africa and Europe.',
    'sec.label': 'Safety & Quality',
    'sec.title': 'Safety, our <em>first commitment</em>',
    'cta.label': 'Contact & Quote',
    'cta.title': 'Let\'s plan your next flight',
    'cta.sub': 'Our operational team is available 24/7 to respond to your requests and confirm your flight as quickly as possible.',
    'cta.btn': 'Send Request →',
    'footer.copy': '© 2026 Afrijet Sahara. All rights reserved.',
    'footer.legal': 'Legal Notice',
        
    'comp.v1': 'Excellence', 'comp.v1t': 'International-level operational standards, on every flight.',
    'comp.v2': 'Trust', 'comp.v2t': 'Full transparency and clear contractual commitment.',
    'comp.v3': 'Responsiveness', 'comp.v3t': 'Available 24/7 to confirm your flight within a few hours.',
    'comp.v4': 'Safety', 'comp.v4t': 'Safety is our absolute and non-negotiable priority.',
    'comp.cert': 'Certifications & Approvals',
    'comp.c1': 'Air Operator Certificate (AOC) issued by the Moroccan Civil Aviation Authority (DGAC).',
    'comp.c2': 'Operations compliant with Moroccan aviation regulations and ICAO standards.',
    'comp.c3': 'Approved maintenance programme ensuring the permanent airworthiness of our aircraft.',
    'comp.c4': 'Safety Management System (SMS) fully implemented and audited.',
    'srv.aboard': 'In-flight <em>Services</em>',
    'srv.t3': 'Connectivity', 'srv.d3': 'Starlink satellite WiFi access on board to stay connected throughout your flight. Work, communicate or follow your files without interruption.',
    'srv.t4': 'Catering', 'srv.d4': 'Personalised catering service according to your preferences: hot and cold dishes, selected beverages. Each meal is carefully prepared to meet your requirements.',
    'srv.t5': 'Comfort & Space', 'srv.d5': 'Reclining business seats with generous legroom. A quiet and intimate cabin designed for your rest and productivity.',
    'srv.t6': 'Baggage', 'srv.d6': 'Generous hold space tailored to your needs, without the constraints of regular airlines. Board your professional equipment with complete freedom.',
    'srv.journey.label': 'The Journey',
    'srv.journey.title': 'Every moment, <em>considered</em>',
    'srv.journey.t1': 'T - 30 MIN', 'srv.journey.h1': 'Private Terminal Arrival', 'srv.journey.d1': 'Arrive at the airport\'s private terminal. No queues. No crowds. Your aircraft awaits on the tarmac, steps away.',
    'srv.journey.t2': 'T - 15 MIN', 'srv.journey.h2': 'Personalised Welcome', 'srv.journey.d2': 'Your flight attendant greets you by name. Your preferred refreshment is served. Your luggage is already aboard.',
    'srv.journey.t3': 'T - 5 MIN', 'srv.journey.h3': 'Seamless Boarding', 'srv.journey.d3': 'Walk directly to your aircraft. No security lines. No boarding passes. Simply step aboard your private sanctuary.',
    'srv.journey.t4': 'IN FLIGHT', 'srv.journey.h4': 'In-Flight Experience', 'srv.journey.d4': 'Settle into your business seat. Enjoy gourmet catering, fine wines, and personalised entertainment at 37,000 feet.',
    'srv.journey.t5': 'ARRIVAL', 'srv.journey.h5': 'Discreet Arrival', 'srv.journey.d5': 'Land at your destination\'s private terminal. Your ground transportation awaits. From door to door, the journey is seamless.',
    
    
    'news.label': 'Actualités', 'news.photo': 'Challenge.ma', 'news.d1': '25 mai 2025', 'news.t1': "Anas Bennani parie sur l'aérien à Dakhla avec Sahara Aviation Holding", 'news.e1': "Fort d'une carrière internationale dans le financement aéronautique, Anas Bennani crée Sahara Aviation Holding, basée à Dakhla, pour structurer un écosystème d'investissement aérien dans le sud du Maroc. Source : Challenge.ma", 'news.read': 'Lire l\'article →', 'news.title': 'Les dernières <em>nouvelles</em>',
    'news.label': 'News', 'news.photo': 'Challenge.ma', 'news.d1': '25 May 2025', 'news.t1': 'Anas Bennani bets on aviation in Dakhla with Sahara Aviation Holding', 'news.e1': 'Drawing on an international career in aeronautical financing, Anas Bennani creates Sahara Aviation Holding, based in Dakhla, to structure an aviation investment ecosystem in southern Morocco. Source: Challenge.ma', 'news.read': 'Read the article →', 'news.title': 'Latest <em>News</em>',
    'news.d2': '7 – 10 October 2026', 'news.t2': 'Afrijet Sahara at the Marrakech Airshow', 'news.e2': "From 7 to 10 October 2026, Afrijet Sahara took part in the Marrakech Airshow, a leading aviation event in Morocco. The show was an opportunity to present our charter airline based in Dakhla and its 18-seat full business Embraer 140 LR, and to meet industry players. Watch the highlights of our visit in the video. For any private flight request from Morocco, our team is available 24/7.", 'news.video': 'Watch the video on Facebook →',
    'fleet.config': 'Configuration', 'fleet.speed': 'Speed',
    'fleet.alt': 'Altitude', 'fleet.range': 'Range',
    'fleet.endur': 'Endurance', 'fleet.cabin': 'Cabin', 'fleet.cargo': 'Cargo hold', 'fleet.engine': 'Engines',
    'fleet.kta.config': '18 Full Business Seats', 'fleet.kta.endur': '~3h 50 non-stop',
    'fleet.ktb.config': '8 Full Business Seats', 'fleet.ktb.endur': '~3h 20 non-stop',
    'fleet.f1': 'Reclining business seats', 'fleet.f2': 'Quality in-flight service',
    'fleet.f3': 'Starlink satellite connectivity', 'fleet.f4': 'Generous hold', 'fleet.f5': 'Short runway access',
    'fleet.soon.title': 'New aircraft joining the fleet',
    'fleet.soon.sub': 'Afrijet Sahara continues to grow. New aircraft will strengthen our operational capacity to serve you better.',
    'sec.t1': 'Certified SMS', 'sec.d1': 'Our Safety Management System is fully operational and regularly audited. It covers proactive hazard identification, risk assessment, corrective action tracking and safety culture across the entire organisation.',
    'sec.t2': 'DGAC Certification', 'sec.d2': 'Afrijet Sahara operates under an Air Operator Certificate (CTE) issued by the Moroccan DGAC. Our operations comply strictly with Moroccan aviation regulations and ICAO standards, guaranteeing an internationally recognised level of safety.',
    'sec.t3': 'Qualified Crew', 'sec.d3': 'Our highly experienced pilots are certified to the most demanding standards, with recurrent simulator training programmes. Each crew member keeps their qualifications current and follows a rigorous line check programme.',
    'sec.t4': 'Rigorous Maintenance', 'sec.d4': 'Our aircraft are maintained according to manufacturer-approved maintenance programmes approved by the DGAC. Every flight is preceded by a complete inspection ensuring the airworthiness of the aircraft.',
    'form.iata': 'IATA or city',
    'contact.phone': 'Phone',
    'contact.whatsapp': 'WhatsApp',
    'contact.email': 'Email',
    'contact.address': 'Address',
    'form.title': 'Flight Request',
    'form.name': 'Full Name',
    'form.org': 'Company / Organisation',
    'form.email': 'Email',
    'form.phone': 'Phone / WhatsApp',
    'form.dep': 'Departure Airport',
    'form.arr': 'Arrival Airport',
    'form.date': 'Preferred Date',
    'form.pax': 'Number of Passengers (max. 18)',
    'form.info': 'Additional Information',
    'form.sent': 'Request Sent',
    'form.sub': 'Our team will contact you within 2 hours.',
    'footer.privacy': 'Privacy Policy',
        'legal.section1': 'Legal Information', 'legal.section2': 'Intellectual Property', 'legal.section3': 'Personal Data',
    'legal.company': 'Company Name', 'legal.form': 'Legal Form', 'legal.form.val': 'Simplified Joint Stock Company',
    'legal.capital': 'Share Capital', 'legal.address': 'Registered Office', 'legal.phone': 'Phone',
    'legal.director': 'Publication Director', 'legal.host': 'Web Host', 'legal.host.site': 'Host Website',
    'legal.ip.text': "All content on this website (texts, images, logos, graphics) is the exclusive property of Sahara Aviation SAS and is protected by Moroccan and international intellectual property laws. Any reproduction, even partial, is strictly prohibited without prior authorization.",
    'legal.data.text': "Information collected through the contact form is used solely to respond to your requests and is never shared with third parties. In accordance with Law 09-08 on the protection of individuals with regard to the processing of personal data, you have the right to access, rectify and delete your data by contacting: <a href=\"mailto:info@afrijet.ma\" style=\"color:#E8001C;\">info@afrijet.ma</a>.",
  },
  es: {
    'nav.accueil': 'Inicio',
    'nav.apropos': 'Acerca de',
    'nav.prepaid': 'Tarjetas Prepago',
    'prepaid.benefits': 'Ventajas clave',
    'prepaid.title': 'La Tarjeta Prepago Afrijet Sahara',
    'prepaid.tagline': 'Vuele a su ritmo, a tarifa fija.',
    'prepaid.desc': 'La Tarjeta Prepago Afrijet Sahara le garantiza acceso prioritario a nuestra flota EMB 140 LR y EMB 145 a una tarifa horaria fija y competitiva. Ideal para viajeros institucionales y de negocios que vuelan regularmente.',
    'prepaid.l1': 'Disponibilidad garantizada en 48 horas',
    'prepaid.l2': 'Tarifa horaria fija sin sorpresas',
    'prepaid.l3': 'Gestor de cuenta personal dedicado',
    'prepaid.l4': 'Condiciones de cancelación preferentes',
    'prepaid.l5': 'Tasas aeroportuarias incluidas',
    'prepaid.l6': 'Descongelación (si es necesario), restauración a bordo e Internet Starlink de alta velocidad incluidos',
    'prepaid.l7': 'Sin fecha de caducidad de sus créditos',
    'prepaid.l8': 'Acceso a todos nuestros destinos — África, Oriente Medio, Europa',
    'prepaid.cta': 'Solicitar una propuesta →',
    'card.type': 'Tarjeta Prepago',
    'card.fleet': 'Flota',
    'card.validity': 'Validez',
    'nav.president': 'Mensaje del Presidente',
    'nav.compagnie': 'La Empresa',
    'pres.label': 'Mensaje del Presidente',
    'pres.title': 'Presidente — Sahara Aviation Holding',
    'el.admin_title': 'Gestionar vuelos vacíos',
    'form.submit': 'Solicitar presupuesto →',
    'nav.flotte': 'Nuestra Flota',
    'nav.rayon': 'Radio de acción',
    'nav.services': 'Servicios',
    'nav.empty': 'Vuelos Vacíos',
    'el.label': 'Oportunidades',
    'el.title': 'Vuelos <em>vacíos disponibles</em>',
    'el.sub': 'Estos vuelos se actualizan diariamente.',
    'el.intro': 'Un vuelo vacío es un vuelo charter privado actualmente planificado sin pasajeros a bordo, con el fin de reposicionar la aeronave en otro aeropuerto.',
    'el.intro2': 'Las condiciones ventajosas lo convierten en una oportunidad única para reservar su próximo vuelo en un jet de negocios de nuestra flota.',
    'el.intro3': 'La modificación del itinerario puede ser posible bajo petición.',
    'el.loading': 'Cargando vuelos…',
    'el.empty_title': 'No hay vuelos vacíos programados',
    'el.empty_text': 'Contáctenos para sus necesidades específicas, encontraremos la mejor solución.',
    'el.contact': 'Reservar →',
    'nav.securite': 'Seguridad',
    'nav.actualites': 'Noticias',
    'nav.contact': 'Contacto / Presupuesto',
    'nav.devis': 'Solicitar Presupuesto',
    'acc.label': 'Aviación Chárter de Excepción',
    'acc.title': 'Vuele a su <em>ritmo,</em><br>hacia sus destinos.',
    'acc.sub': 'Afrijet Sahara pone a su disposición su flota EMB 140 LR y EMB 145 para vuelos bajo demanda hacia cualquier destino. Con sede en Dakhla, en el sur de Marruecos, nuestra compañía le ofrece una libertad de vuelo total: despegue a la hora que le convenga, desde el aeropuerto de su elección, sin escalas innecesarias. Discreción absoluta, servicio personalizado y excelencia operacional en cada vuelo.',
    'acc.cta': 'Solicitar Presupuesto →',
    'acc.stat1': 'Asientos Full Business',
    'acc.stat2': 'Velocidad de Crucero',
    'acc.stat3': 'Disponibilidad',
    'acc.s4': 'Discreción',
    'comp.label': 'La Empresa',
    'comp.title': 'Una empresa al servicio de su <em>ambición</em>',
    'comp.sub': 'Afrijet Sahara es una compañía chárter marroquí fundada para satisfacer las exigencias de los viajeros de negocios e instituciones que se niegan a los compromisos. Con base en Dakhla, operamos en África, Oriente Medio y Europa con un rigor operacional sin fisuras.',
    'flotte.label': 'Nuestra Flota',
    'flotte.title': 'Cada aeronave, una <em>experiencia única</em>',
    'srv.label': 'Nuestros Servicios',
    'srv.title': 'Cada vuelo, <em>a medida</em>',
    'srv.sub': 'Adaptamos cada misión a sus exigencias: horarios, salida, destino, configuración a bordo.',
    'srv.t1': 'Vuelos de Negocios',
    'srv.d1': 'Maximice su productividad. Despegue a su hora, desde el aeropuerto de su elección. Nuestras aeronaves le permiten acceder a aeropuertos secundarios inaccesibles para las grandes compañías, reduciendo sus tiempos de conexión. Confidencialidad absoluta, servicio personalizado y total flexibilidad para sus equipos directivos.',
    'srv.t2': 'Vuelos Institucionales',
    'srv.d2': 'Afrijet Sahara acompaña a instituciones, administraciones y organizaciones internacionales en sus desplazamientos oficiales. Rigor protocolar, discreción y fiabilidad operacional para sus delegaciones, misiones de campo y visitas oficiales en África y Europa.',
    'sec.label': 'Seguridad & Calidad',
    'sec.title': 'La seguridad, nuestro <em>primer compromiso</em>',
    'cta.label': 'Contacto & Presupuesto',
    'cta.title': 'Planifiquemos su próximo vuelo',
    'cta.sub': 'Nuestro equipo operacional está disponible 24h/24 y 7 días a la semana para responder a sus solicitudes y confirmar su vuelo en el menor tiempo posible.',
    'cta.btn': 'Enviar Solicitud →',
    'footer.copy': '© 2026 Afrijet Sahara. Todos los derechos reservados.',
    'footer.legal': 'Aviso Legal',
        
    'comp.v1': 'Excelencia', 'comp.v1t': 'Estándares operacionales de nivel internacional, en cada vuelo.',
    'comp.v2': 'Confianza', 'comp.v2t': 'Transparencia total y compromiso contractual claro.',
    'comp.v3': 'Reactividad', 'comp.v3t': 'Disponibles 24h/24 para confirmar su vuelo en pocas horas.',
    'comp.v4': 'Seguridad', 'comp.v4t': 'La seguridad es nuestra prioridad absoluta e innegociable.',
    'comp.cert': 'Certificaciones & Homologaciones',
    'comp.c1': 'Certificado de Operador Aéreo (AOC) emitido por la Dirección General de Aviación Civil de Marruecos (DGAC).',
    'comp.c2': 'Operaciones conformes con la normativa aeronáutica marroquí y las normas OACI.',
    'comp.c3': 'Programa de mantenimiento aprobado que garantiza la aeronavegabilidad permanente de nuestros aparatos.',
    'comp.c4': 'Sistema de Gestión de la Seguridad (SGS) plenamente implementado y auditado.',
    'srv.aboard': 'Servicios <em>a bordo</em>',
    'srv.t3': 'Conectividad', 'srv.d3': 'Acceso WiFi satelital Starlink a bordo para mantenerse conectado durante todo el vuelo. Trabaje, comuníquese o siga sus expedientes sin interrupciones.',
    'srv.t4': 'Restauración', 'srv.d4': 'Servicio de restauración personalizado según sus preferencias: platos calientes y fríos, bebidas seleccionadas. Cada comida se prepara con esmero para satisfacer sus exigencias.',
    'srv.t5': 'Confort & Espacio', 'srv.d5': 'Asientos business reclinables con espacio generoso entre filas. Cabina tranquila e intimista, diseñada para su descanso y productividad.',
    'srv.t6': 'Equipaje', 'srv.d6': 'Bodega generosa adaptada a sus necesidades, sin las restricciones de las compañías regulares. Embarque su equipamiento profesional con total libertad.',
    'srv.journey.label': 'El Viaje',
    'srv.journey.title': 'Cada instante, <em>pensado para usted</em>',
    'srv.journey.t1': 'T - 30 MIN', 'srv.journey.h1': 'Llegada a la Terminal Privada', 'srv.journey.d1': 'Llegue a la terminal privada del aeropuerto. Sin colas. Sin aglomeraciones. Su aeronave le espera en la pista, a pocos pasos.',
    'srv.journey.t2': 'T - 15 MIN', 'srv.journey.h2': 'Bienvenida Personalizada', 'srv.journey.d2': 'Su azafata le recibe por su nombre. Su bebida preferida está servida. Su equipaje ya está a bordo.',
    'srv.journey.t3': 'T - 5 MIN', 'srv.journey.h3': 'Embarque sin Esperas', 'srv.journey.d3': 'Diríjase directamente a su aeronave. Sin controles de seguridad. Sin tarjetas de embarque. Suba simplemente a su espacio privado.',
    'srv.journey.t4': 'EN VUELO', 'srv.journey.h4': 'Experiencia a Bordo', 'srv.journey.d4': 'Acomódese en su asiento business. Disfrute de una restauración gourmet, vinos selectos y entretenimiento personalizado a 11 000 metros de altitud.',
    'srv.journey.t5': 'LLEGADA', 'srv.journey.h5': 'Llegada Discreta', 'srv.journey.d5': 'Aterrice en la terminal privada de su destino. Su transporte terrestre le espera. De puerta a puerta, el viaje es impecable.',
    
    
    'news.label': 'Noticias', 'news.photo': 'Challenge.ma', 'news.d1': '25 de mayo de 2025', 'news.t1': 'Anas Bennani apuesta por la aviación en Dakhla con Sahara Aviation Holding', 'news.e1': 'Con una carrera internacional en financiación aeronáutica, Anas Bennani crea Sahara Aviation Holding, con sede en Dakhla, para estructurar un ecosistema de inversión aérea en el sur de Marruecos. Fuente: Challenge.ma', 'news.read': 'Leer el artículo →', 'news.title': 'Últimas <em>noticias</em>',
    'news.d2': '7 – 10 de octubre de 2026', 'news.t2': 'Afrijet Sahara en el Marrakech Airshow', 'news.e2': "Del 7 al 10 de octubre de 2026, Afrijet Sahara estuvo presente en el Marrakech Airshow, un encuentro de la aviación en Marruecos. El salón fue una oportunidad para presentar nuestra compañía chárter con base en Dakhla y su Embraer 140 LR full business de 18 plazas, y para conversar con los actores del sector. Vea en vídeo los mejores momentos de nuestra visita. Para cualquier solicitud de vuelo privado desde Marruecos, nuestro equipo está disponible 24 horas al día, 7 días a la semana.", 'news.video': 'Ver el vídeo en Facebook →',
    'fleet.config': 'Configuración', 'fleet.speed': 'Velocidad',
    'fleet.alt': 'Altitud', 'fleet.range': 'Radio de Acción',
    'fleet.endur': 'Autonomía', 'fleet.cabin': 'Cabina', 'fleet.cargo': 'Bodega', 'fleet.engine': 'Motorización',
    'fleet.kta.config': '18 asientos Full Business', 'fleet.kta.endur': '~3h 50 sin escala',
    'fleet.ktb.config': '8 asientos Full Business', 'fleet.ktb.endur': '~3h 20 sin escala',
    'fleet.f1': 'Asientos business reclinables', 'fleet.f2': 'Servicio a bordo de calidad',
    'fleet.f3': 'Conectividad satelital Starlink', 'fleet.f4': 'Bodega generosa', 'fleet.f5': 'Acceso a pistas cortas',
    'fleet.soon.title': 'Nuevas aeronaves se incorporan a la flota',
    'fleet.soon.sub': 'Afrijet Sahara continúa su desarrollo. Nuevas aeronaves reforzarán nuestra capacidad operacional para servirle mejor.',
    'sec.t1': 'SMS Certificado', 'sec.d1': 'Nuestro Sistema de Gestión de la Seguridad está plenamente operativo y auditado regularmente. Cubre la identificación proactiva de peligros, la evaluación de riesgos, el seguimiento de acciones correctivas y la cultura de seguridad en toda la organización.',
    'sec.t2': 'Certificación DGAC', 'sec.d2': 'Afrijet Sahara opera bajo Certificado Técnico de Explotación (CTE) emitido por la DGAC de Marruecos. Nuestras operaciones cumplen estrictamente con la normativa aeronáutica marroquí y las normas OACI, garantizando un nivel de seguridad homologado internacionalmente.',
    'sec.t3': 'Tripulación Cualificada', 'sec.d3': 'Nuestros pilotos, muy experimentados, están certificados según los estándares más exigentes, con programas de formación recurrente en simulador. Cada miembro de la tripulación mantiene sus cualificaciones al día y sigue un riguroso programa de control en línea.',
    'sec.t4': 'Mantenimiento Riguroso', 'sec.d4': 'Nuestras aeronaves se mantienen según los programas de mantenimiento aprobados por el fabricante y validados por la DGAC. Cada vuelo va precedido de una inspección completa que garantiza la aeronavegabilidad de la aeronave.',
    'form.iata': 'IATA o ciudad',
    'contact.phone': 'Teléfono',
    'contact.whatsapp': 'WhatsApp',
    'contact.email': 'Email',
    'contact.address': 'Dirección',
    'form.title': 'Solicitud de Vuelo',
    'form.name': 'Nombre Completo',
    'form.org': 'Empresa / Organización',
    'form.email': 'Email',
    'form.phone': 'Teléfono / WhatsApp',
    'form.dep': 'Aeropuerto de Salida',
    'form.arr': 'Aeropuerto de Llegada',
    'form.date': 'Fecha Deseada',
    'form.pax': 'Número de Pasajeros (máx. 18)',
    'form.info': 'Información Adicional',
    'form.sent': 'Solicitud Enviada',
    'form.sub': 'Nuestro equipo le contactará en 2 horas.',
    'footer.privacy': 'Política de Privacidad',
        'legal.section1': 'Información legal', 'legal.section2': 'Propiedad intelectual', 'legal.section3': 'Datos personales',
    'legal.company': 'Razón social', 'legal.form': 'Forma jurídica', 'legal.form.val': 'Sociedad por Acciones Simplificada',
    'legal.capital': 'Capital social', 'legal.address': 'Domicilio social', 'legal.phone': 'Teléfono',
    'legal.director': 'Director de publicación', 'legal.host': 'Alojamiento web', 'legal.host.site': 'Sitio del alojamiento',
    'legal.ip.text': "Todo el contenido de este sitio web (textos, imágenes, logotipos, gráficos) es propiedad exclusiva de Sahara Aviation SAS y está protegido por las leyes marroquíes e internacionales de propiedad intelectual. Cualquier reproducción, incluso parcial, está estrictamente prohibida sin autorización previa.",
    'legal.data.text': "La información recopilada a través del formulario de contacto se utiliza únicamente para responder a sus solicitudes y no se cede en ningún caso a terceros. De conformidad con la Ley 09-08 relativa a la protección de las personas físicas en el tratamiento de datos personales, usted tiene derecho a acceder, rectificar y suprimir sus datos contactando con: <a href=\"mailto:info@afrijet.ma\" style=\"color:#E8001C;\">info@afrijet.ma</a>.",
  }
};

let currentLang = 'fr';

function setLang(lang, e) {
  if (e) e.stopPropagation();
  currentLang = lang;
  document.documentElement.lang = lang;
  if (e) { try { localStorage.setItem('afrijet_lang', lang); } catch (err) {} }
  const t = translations[lang];
  // Mettre à jour tous les éléments data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key] !== undefined) {
      el.innerHTML = t[key];
    }
  });
  // Placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (t[key] !== undefined) el.placeholder = t[key];
  });
  // Mettre à jour boutons lang actifs
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('onclick').includes("'" + lang + "'"));
  });
  // Mettre à jour l'attribut lang du document
  document.documentElement.lang = lang;
}



function selectApropos(panel) {
  var cur = document.body.getAttribute('data-panel');
  if (cur !== panel) { if (PANEL_URL[panel]) location.href = PANEL_URL[panel]; return; }
  showSection('compagnie');
  ['compagnie','president','prepaid'].forEach(function (p) {
    var el = document.getElementById('panel-' + p);
    if (el) el.style.display = (p === panel) ? 'block' : 'none';
  });
  var m = document.getElementById('navDropdownMenu');
  if (m) m.classList.remove('open');
  var mob = document.getElementById('mobileAproposMenu');
  if (mob) mob.style.display = 'none';
}

function toggleNavFlotte(e) {
  e.preventDefault();
  e.stopPropagation();
  var menu = document.getElementById('navFlotteMenu');
  var rect = e.currentTarget.getBoundingClientRect();
  menu.style.left = rect.left + 'px';
  menu.classList.toggle('open');
  var other = document.getElementById('navDropdownMenu');
  if (other) other.classList.remove('open');
}

function toggleMobileFlotte(e) {
  e.preventDefault();
  var mob = document.getElementById('mobileFlotteMenu');
  var trigger = e.currentTarget;
  var isOpen = mob.style.display === 'block';
  mob.style.display = isOpen ? 'none' : 'block';
  if (!isOpen) { trigger.classList.add('open'); } else { trigger.classList.remove('open'); }
  if (!isOpen && window.innerWidth <= 768) {
    var links = mob.querySelectorAll('.nav-sub-link');
    links.forEach(function(link, i) {
      link.classList.remove('slide-in');
      void link.offsetWidth; // reflow
      link.style.animationDelay = (i * 0.4) + 's';
      link.classList.add('slide-in');
    });
  }
}

function selectFlotte(target) {
  showSection(target === 'rayon' ? 'rayon' : 'flotte');
  var m = document.getElementById('navFlotteMenu');
  if (m) m.classList.remove('open');
  var mob = document.getElementById('mobileFlotteMenu');
  if (mob) mob.style.display = 'none';
}

function toggleNavDropdown(e) {
  e.preventDefault();
  e.stopPropagation();
  var menu = document.getElementById('navDropdownMenu');
  var rect = e.currentTarget.getBoundingClientRect();
  menu.style.left = rect.left + 'px';
  menu.classList.toggle('open');
  var other = document.getElementById('navFlotteMenu');
  if (other) other.classList.remove('open');
}

function toggleMobileApropos(e) {
  e.preventDefault();
  var mob = document.getElementById('mobileAproposMenu');
  var trigger = e.currentTarget;
  var isOpen = mob.style.display === 'block';
  mob.style.display = isOpen ? 'none' : 'block';
  trigger.classList.toggle('open', !isOpen);
  // Rotate triangle
  var triangle = trigger.querySelector('.nav-triangle');
  if (triangle) {
    triangle.style.transform = isOpen ? '' : 'rotate(180deg)';
    triangle.style.transition = 'transform 0.3s ease';
  }
  if (!isOpen && window.innerWidth <= 768) {
    var links = mob.querySelectorAll('.nav-sub-link');
    links.forEach(function(link, i) {
      link.classList.remove('slide-in');
      void link.offsetWidth; // reflow
      link.style.animationDelay = (i * 0.4) + 's';
      link.classList.add('slide-in');
    });
  }
}

document.addEventListener('click', function(e) {
  var menu = document.getElementById('navDropdownMenu');
  var isLang = e.target.closest ? e.target.closest('.lang-switcher') : false;
  if (menu && !menu.contains(e.target) && !e.target.classList.contains('nav-dropdown-trigger') && !isLang) {
    menu.classList.remove('open');
  }
  var fm = document.getElementById('navFlotteMenu');
  if (fm && !fm.contains(e.target) && !e.target.classList.contains('nav-dropdown-trigger') && !isLang) {
    fm.classList.remove('open');
  }
});

// Init : montrer accueil uniquement

// Sur mobile, l'iframe du rayon prend la hauteur de son contenu (carte + panneau) pour scroller jusqu'au bas
function fitRayonFrame() {
  var rf = document.getElementById('rayonFrame');
  if (!rf || !rf.getAttribute('src')) return;
  if (window.innerWidth <= 860) {
    try {
      var d = rf.contentDocument;
      var app = d.getElementById('app');
      var h = app ? app.offsetHeight : d.documentElement.scrollHeight;
      if (h > 200) rf.style.height = h + 'px';
    } catch (err) { rf.style.height = '160vh'; }
  } else {
    rf.style.height = '100%';
  }
  // Recalcul après rendu complet (polices, carte)
  if (!fitRayonFrame._retried) {
    fitRayonFrame._retried = true;
    setTimeout(function(){ fitRayonFrame._retried = true; refit(); }, 400);
    setTimeout(refit, 1200);
  }
  function refit() {
    try {
      var d2 = rf.contentDocument;
      var app2 = d2.getElementById('app');
      var h2 = app2 ? app2.offsetHeight : d2.documentElement.scrollHeight;
      if (window.innerWidth <= 860 && h2 > 200) rf.style.height = h2 + 'px';
    } catch (e) {}
  }
}
window.addEventListener('resize', function(){ fitRayonFrame._retried = false; fitRayonFrame(); });

showSection(document.body.getAttribute('data-section') || 'accueil');
(function () {
  var pn = document.body.getAttribute('data-panel');
  if (pn) selectApropos(pn);
  // anciens liens du type afrijet.ma/#contact -> nouvelle page
  var h = (location.hash || '').replace('#', '');
  if (document.body.getAttribute('data-section') === 'accueil' && h && h !== 'accueil' && PAGE_URL[h]) location.replace(PAGE_URL[h]);
})();
setLang('fr');

// Hamburger toggle
hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('open');
});

function closeMobile() { mobileMenu.classList.remove('open'); hamburger.classList.remove('open'); }

// Fermer le menu mobile au changement d'orientation
window.addEventListener('orientationchange', function() {
  setTimeout(function() { closeMobile(); }, 300);
});
window.addEventListener('resize', function() {
  if (window.innerWidth > 900) { closeMobile(); }
});

// Intercepter tous les liens de navigation
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = link.getAttribute('href').replace('#', '');
    if (document.getElementById(target)) {
      showSection(target);
      closeMobile();
    }
  });
});

/* ---- Progress Bar ---- */
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  const bar = document.getElementById('progressBar');
  if (bar) bar.style.width = progress + '%';
});

/* ---- Intersection Observer for reveals ---- */
const observerOptions = { threshold: 0.15, rootMargin: '0px 0px -40px 0px' };
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
  observer.observe(el);
});

/* ---- Counter Animation ---- */
function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-count'), 10);
  const suffix = el.getAttribute('data-suffix') || '';
  const duration = 1800;
  const start = performance.now();
  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target).toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(update);
    else el.classList.add('counted');
  }
  requestAnimationFrame(update);
}

/* ---- Form submit ---- */
document.getElementById('btnSubmit')?.addEventListener('click', () => {
  document.getElementById('contactFormWrap').style.display = 'none';
  document.getElementById('formSuccess').classList.add('visible');
});



function openLightbox(src, alt) {
  document.getElementById('lightbox-img').src = src;
  document.getElementById('lightbox-img').alt = alt || '';
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeLightbox();
});

// ============================================================
// VOLS A VIDE (EMPTY LEGS) — Supabase
// ============================================================
const SUPA_URL = 'https://zulwubuzuylmwkittnbg.supabase.co';

// ── Base aéroports ──
/* [icao, iata, aeroport, ville, pays, lat, lon, motscles?] */
const EL_AIRPORTS = [["OAKB","KBL","Hamid Karzai","Kaboul","Afghanistan",34.5659,69.2123],["FALE","DUR","King Shaka","Durban","Afrique du Sud",-29.6144,31.1197],["FAOR","JNB","Johannesburg O.R. Tambo","Johannesburg","Afrique du Sud",-26.1392,28.246,"Pretoria"],["FACT","CPT","Cape Town","Le Cap","Afrique du Sud",-33.9715,18.6021],["LATI","TIA","Nënë Tereza","Tirana","Albanie",41.4147,19.7206],["DAUA","AZR","Touat","Adrar","Algérie",27.8376,-0.1864],["DAAG","ALG","Houari Boumediene","Alger","Algérie",36.691,3.2154],["DABB","AAE","Rabah Bitat","Annaba","Algérie",36.8222,7.8092],["DAAE","BJA","Soummam","Béjaïa","Algérie",36.712,5.0699],["DABC","CZL","Mohamed Boudiaf","Constantine","Algérie",36.276,6.6204],["DAUG","GHA","Noumérat","Ghardaïa","Algérie",32.3841,3.7942],["DAOO","ORN","Es Senia","Oran","Algérie",35.6239,-0.6212],["DAAT","TMR","Tamanrasset","Tamanrasset","Algérie",22.8115,5.4511],["DAOF","TIN","Tindouf","Tindouf","Algérie",27.7003,-8.1671],["EDDB","BER","Brandenburg","Berlin","Allemagne",52.3667,13.5033],["EDDK","CGN","Köln-Bonn","Cologne","Allemagne",50.8659,7.1427],["EDDL","DUS","Düsseldorf","Düsseldorf","Allemagne",51.2895,6.7668],["EDDF","FRA","Frankfurt","Francfort","Allemagne",50.0333,8.5706],["EDDH","HAM","Hamburg","Hambourg","Allemagne",53.6304,9.9882],["EDDV","HAJ","Hanovre-Langenhagen","Hanovre","Allemagne",52.4611,9.6851],["EDDM","MUC","Franz Josef Strauss","Munich","Allemagne",48.3538,11.7861],["EDDN","NUE","Nuremberg","Nuremberg","Allemagne",49.4987,11.078],["EDDS","STR","Stuttgart","Stuttgart","Allemagne",48.6899,9.222],["FNLU","LAD","4 de Fevereiro","Luanda","Angola",-8.8584,13.2312],["TAPA","ANU","V. C. Bird","Saint John's","Antigua-et-Barbuda",17.1367,-61.7927],["OEDF","DMM","King Fahd","Dammam","Arabie saoudite",26.4712,49.7979],["OEJN","JED","King Abdulaziz","Djeddah","Arabie saoudite",21.6796,39.1565],["OEMA","MED","Prince Mohammad","Médine","Arabie saoudite",24.5534,39.7051],["OERK","RUH","King Khalid","Riyad","Arabie saoudite",24.9576,46.6988],["SABE","AEP","Aeroparque","Buenos Aires","Argentine",-34.5592,-58.4156],["SAEZ","EZE","Ezeiza","Buenos Aires","Argentine",-34.8222,-58.5358],["SAME","MDZ","El Plumerillo","Mendoza","Argentine",-32.8317,-68.7929],["UDYZ","EVN","Zvartnots","Erevan","Arménie",40.1473,44.3959],["TNCA","AUA","Reina Beatrix","Oranjestad","Aruba",12.5014,-70.0152],["YPAD","ADL","Adelaide","Adélaïde","Australie",-34.945,138.5306],["YBBN","BNE","Brisbane","Brisbane","Australie",-27.3842,153.1175],["YBCS","CNS","Cairns","Cairns","Australie",-16.8858,145.7553],["YSCB","CBR","Canberra","Canberra","Australie",-35.3069,149.195],["YMML","MEL","Tullamarine","Melbourne","Australie",-37.669,144.841],["YPPH","PER","Perth","Perth","Australie",-31.9403,115.9669],["YSSY","SYD","Kingsford Smith","Sydney","Australie",-33.9399,151.1753],["LOWI","INN","Innsbruck","Innsbruck","Autriche",47.2602,11.3439],["LOWS","SZG","W. A. Mozart","Salzbourg","Autriche",47.7933,13.0043],["LOWW","VIE","Schwechat","Vienne","Autriche",48.1103,16.5697],["UBBB","GYD","Heydar Aliyev","Bakou","Azerbaïdjan",40.4675,50.0467],["LPHR","HOR","Horta","Faial","Açores",38.5199,-28.7159],["LPFL","FLW","Flores","Flores","Açores",39.4553,-31.1314],["LPPD","PDL","João Paulo II","Ponta Delgada","Açores",37.7412,-25.6979],["LPLA","TER","Lajes","Terceira","Açores",38.7618,-27.0908],["MYNN","NAS","Lynden Pindling","Nassau","Bahamas",25.039,-77.4661],["OBBI","BAH","Bahrain","Manama","Bahreïn",26.2708,50.6336],["VGHS","DAC","Hazrat Shahjalal","Dacca","Bangladesh",23.8433,90.3978],["TBPB","BGI","Grantley Adams","Bridgetown","Barbade",13.0746,-59.4925],["EBBR","BRU","Brussels National","Bruxelles","Belgique",50.9014,4.4844],["EBCI","CRL","Brussels South","Charleroi","Belgique",50.4592,4.4538],["EBLG","LGG","Liège","Liège","Belgique",50.6374,5.4432],["EBOS","OST","Ostende-Bruges","Ostende","Belgique",51.1989,2.8622],["MZBZ","BZE","Philip Goldson","Belize City","Belize",17.5391,-88.3082,"Belmopan"],["VQPR","PBH","Paro","Paro","Bhoutan",27.4032,89.4246,"Thimphou"],["UMMS","MSQ","Minsk National","Minsk","Biélorussie",53.8825,28.0307],["SLLP","LPB","La Paz El Alto","La Paz","Bolivie",-16.5133,-68.1923,"Sucre"],["SLVR","VVI","Viru Viru","Santa Cruz","Bolivie",-17.6448,-63.1354],["LQSA","SJJ","Sarajevo","Sarajevo","Bosnie-Herzégovine",43.8246,18.3315],["FBSK","GBE","Sir Seretse Khama","Gaborone","Botswana",-24.5553,25.9182],["WBSB","BWN","Brunei","Bandar Seri Begawan","Brunei",4.9442,114.9283],["SBCF","CNF","Confins","Belo Horizonte","Brésil",-19.6244,-43.9719],["SBBR","BSB","Brasília","Brasilia","Brésil",-15.8711,-47.9186],["SBCT","CWB","Afonso Pena","Curitiba","Brésil",-25.5285,-49.1758],["SBFZ","FOR","Pinto Martins","Fortaleza","Brésil",-3.7763,-38.5326],["SBEG","MAO","Eduardo Gomes","Manaus","Brésil",-3.0386,-60.0497],["SBRF","REC","Guararapes","Recife","Brésil",-8.1265,-34.9236],["SBGL","GIG","Galeão","Rio de Janeiro","Brésil",-22.81,-43.2506],["SBRJ","SDU","Santos Dumont","Rio de Janeiro","Brésil",-22.9105,-43.1631],["SBSV","SSA","Deputado L. Magalhães","Salvador","Brésil",-12.9086,-38.3225],["SBGR","GRU","Guarulhos","São Paulo","Brésil",-23.4356,-46.4731],["SBSP","CGH","Congonhas","São Paulo","Brésil",-23.6261,-46.6564],["LBSF","SOF","Sofia","Sofia","Bulgarie",42.6967,23.4114],["DFOO","BOY","Bobo-Dioulasso","Bobo-Dioulasso","Burkina Faso",11.1601,-4.3309],["DFFD","OUA","Ouagadougou","Ouagadougou","Burkina Faso",12.3532,-1.5124],["HBBA","BJM","Bujumbura Melchior Ndadaye","Bujumbura","Burundi",-3.324,29.3185,"Gitega"],["DBBB","COO","Cotonou Cadjehoun","Cotonou","Bénin",6.3573,2.3844,"Porto-Novo"],["VDPP","PNH","Phnom Penh","Phnom Penh","Cambodge",11.5466,104.8441],["VDSA","SAI","Siem Reap-Angkor","Siem Reap","Cambodge",13.3697,104.2238],["FKKD","DLA","Douala","Douala","Cameroun",4.0061,9.7195],["FKYS","NSI","Nsimalen","Yaoundé","Cameroun",3.7226,11.5533],["CYYC","YYC","Calgary","Calgary","Canada",51.1315,-114.0106],["CYEG","YEG","Edmonton","Edmonton","Canada",53.3097,-113.58],["CYHZ","YHZ","Stanfield","Halifax","Canada",44.8808,-63.5086],["CYUL","YUL","Trudeau","Montréal","Canada",45.4706,-73.7408],["CYOW","YOW","Macdonald-Cartier","Ottawa","Canada",45.3225,-75.6692],["CYYZ","YYZ","Pearson","Toronto","Canada",43.6777,-79.6248],["CYVR","YVR","Vancouver","Vancouver","Canada",49.1967,-123.1815],["GCRR","ACE","Lanzarote","Arrecife","Canaries",28.9455,-13.6052],["GCLP","LPA","Gran Canaria","Las Palmas","Canaries",27.9319,-15.3866],["GCFV","FUE","Fuerteventura","Puerto del Rosario","Canaries",28.4527,-13.8638],["GCLA","SPC","La Palma","Santa Cruz de La Palma","Canaries",28.6265,-17.7556],["GCTS","TFS","Tenerife Sur","Tenerife","Canaries",28.0445,-16.5725],["GCXO","TFN","Tenerife Norte","Tenerife","Canaries",28.4827,-16.3415],["GVBA","BVC","Aristides Pereira","Boa Vista","Cap-Vert",16.1365,-22.8889],["GVNP","RAI","Nelson Mandela","Praia","Cap-Vert",14.9245,-23.4935],["GVAC","SID","Amílcar Cabral","Sal","Cap-Vert",16.7414,-22.9494],["FEFF","BGF","M'Poko","Bangui","Centrafrique",4.3985,18.5188],["SCEL","SCL","Arturo Merino Benítez","Santiago","Chili",-33.393,-70.7858],["ZGGG","CAN","Baiyun","Canton","Chine",23.3924,113.2988],["ZUUU","CTU","Shuangliu","Chengdu","Chine",30.5785,103.9471],["ZUCK","CKG","Jiangbei","Chongqing","Chine",29.7192,106.6417],["ZSHC","HGH","Xiaoshan","Hangzhou","Chine",30.2295,120.4344],["ZPPP","KMG","Changshui","Kunming","Chine",25.1019,102.9292],["ZSNJ","NKG","Lukou","Nankin","Chine",31.742,118.862],["ZBAA","PEK","Capital","Pékin","Chine",40.0801,116.5846],["ZBAD","PKX","Daxing","Pékin","Chine",39.5098,116.4105],["ZSPD","PVG","Pudong","Shanghai","Chine",31.1443,121.8083],["ZSSS","SHA","Hongqiao","Shanghai","Chine",31.1979,121.3363],["ZGSZ","SZX","Bao'an","Shenzhen","Chine",22.6393,113.8108],["ZLXY","XIY","Xianyang","Xi'an","Chine",34.4471,108.7516],["LCLK","LCA","Larnaca","Larnaca","Chypre",34.8751,33.6249,"Nicosie"],["SKBO","BOG","El Dorado","Bogota","Colombie",4.7016,-74.1469],["SKCG","CTG","Rafael Núñez","Carthagène","Colombie",10.4424,-75.513],["SKRG","MDE","José María Córdova","Medellín","Colombie",6.1645,-75.4231],["FMCH","HAH","Prince Said Ibrahim","Moroni","Comores",-11.5337,43.2719],["FCBB","BZV","Maya-Maya","Brazzaville","Congo",-4.2517,15.253],["ZKPY","FNJ","Sunan","Pyongyang","Corée du Nord",39.2241,125.67],["RKPK","PUS","Gimhae","Busan","Corée du Sud",35.1795,128.9382],["RKSI","ICN","Incheon","Séoul","Corée du Sud",37.4602,126.4407],["RKSS","GMP","Gimpo","Séoul","Corée du Sud",37.5583,126.7906],["MROC","SJO","Juan Santamaría","San José","Costa Rica",9.9938,-84.2088],["LDDU","DBV","Dubrovnik","Dubrovnik","Croatie",42.5614,18.2682],["LDSP","SPU","Split","Split","Croatie",43.5389,16.298],["LDZA","ZAG","Franjo Tuđman","Zagreb","Croatie",45.7429,16.0688],["MUHA","HAV","José Martí","La Havane","Cuba",22.9892,-82.4091],["TNCC","CUR","Hato","Willemstad","Curaçao",12.1889,-68.9598],["DIAP","ABJ","Abidjan Félix-Houphouët-Boigny","Abidjan","Côte d'Ivoire",5.2614,-3.9263,"Yamoussoukro"],["EKBI","BLL","Billund","Billund","Danemark",55.7403,9.1518],["EKCH","CPH","Kastrup","Copenhague","Danemark",55.618,12.656],["HDAM","JIB","Ambouli","Djibouti","Djibouti",11.5473,43.1595],["TDPD","DOM","Douglas-Charles","Roseau","Dominique",15.547,-61.3],["LEAL","ALC","Alicante-Elche","Alicante","Espagne",38.2822,-0.5582],["LEBL","BCN","El Prat","Barcelone","Espagne",41.2971,2.0785],["LEBB","BIO","Bilbao","Bilbao","Espagne",43.3011,-2.9106],["LEGE","GRO","Girona-Costa Brava","Gérone","Espagne",41.901,2.7605],["LEIB","IBZ","Ibiza","Ibiza","Espagne",38.8729,1.3731],["LESU","LEU","La Seu d'Urgell","La Seu d'Urgell","Espagne",42.3386,1.4092,"Andorre-la-Vieille Andorre · Andorre-la-Vieille · Andorre"],["LEMD","MAD","Barajas","Madrid","Espagne",40.4719,-3.5626],["LEMH","MAH","Menorca","Mahón","Espagne",39.8626,4.2186],["GEML","MLN","Melilla","Melilla","Espagne",35.2798,-2.9563],["LEMG","AGP","Costa del Sol","Málaga","Espagne",36.6749,-4.4991],["LEPA","PMI","Palma de Mallorca","Palma","Espagne",39.5517,2.7388],["LEST","SCQ","Santiago","Saint-Jacques","Espagne",42.8963,-8.4152],["LEZG","ZAZ","Zaragoza","Saragosse","Espagne",41.6662,-1.0416],["LEZL","SVQ","Sevilla","Séville","Espagne",37.418,-5.8931],["LEVC","VLC","Valencia","Valence","Espagne",39.4893,-0.4816],["EETN","TLL","Lennart Meri","Tallinn","Estonie",59.4133,24.8328],["FDSK","SHO","King Mswati III","Manzini","Eswatini",-26.3585,31.7169,"Mbabane"],["NFFN","NAN","Nadi","Nadi","Fidji",-17.7554,177.4434],["NFNA","SUV","Nausori","Suva","Fidji",-18.0433,178.5592],["EFHK","HEL","Helsinki-Vantaa","Helsinki","Finlande",60.3172,24.9633],["LFKJ","AJA","Napoléon Bonaparte","Ajaccio","France",41.9236,8.8029],["LFBZ","BIQ","Pays Basque","Biarritz","France",43.4684,-1.5233],["LFBD","BOD","Mérignac","Bordeaux","France",44.8283,-0.7156],["LFRB","BES","Bretagne","Brest","France",48.4479,-4.4185],["LFLL","LYS","Saint-Exupéry","Lyon","France",45.7256,5.0811],["LFML","MRS","Provence","Marseille","France",43.4393,5.2214],["LFMT","MPL","Méditerranée","Montpellier","France",43.5762,3.963],["LFSB","MLH","Bâle-Mulhouse","Mulhouse","France",47.5896,7.5299],["LFRS","NTE","Atlantique","Nantes","France",47.1532,-1.6107],["LFMN","NCE","Nice Côte d'Azur","Nice","France",43.6584,7.2159,"Monaco"],["LFPB","LBG","Le Bourget","Paris","France",48.9694,2.4414],["LFPG","CDG","Charles de Gaulle","Paris","France",49.0097,2.5479],["LFPO","ORY","Orly","Paris","France",48.7233,2.3794],["LFST","SXB","Entzheim","Strasbourg","France",48.5383,7.6282],["LFBO","TLS","Blagnac","Toulouse","France",43.6293,1.3638],["FOOL","LBV","Léon-Mba","Libreville","Gabon",0.4586,9.4123],["FOOG","POG","Port-Gentil","Port-Gentil","Gabon",-0.7117,8.7544],["GBYD","BJL","Yundum","Banjul","Gambie",13.338,-16.6522],["DGAA","ACC","Kotoka","Accra","Ghana",5.6052,-0.1668],["LXGB","GIB","Gibraltar","Gibraltar","Gibraltar",36.1512,-5.3466],["TGPY","GND","Maurice Bishop","Saint-Georges","Grenade",12.0042,-61.7862],["BGSF","SFJ","Kangerlussuaq","Kangerlussuaq","Groenland",67.0122,-50.7116],["LGAV","ATH","Elefthérios-Venizélos","Athènes","Grèce",37.9364,23.9445],["LGKR","CFU","I. Kapodistrias","Corfou","Grèce",39.6019,19.9117],["LGIR","HER","N. Kazantzakis","Héraklion","Grèce",35.3397,25.1803],["LGRP","RHO","Diagoras","Rhodes","Grèce",36.4054,28.0862],["LGTS","SKG","Makedonia","Thessalonique","Grèce",40.5197,22.9709],["TFFR","PTP","Pôle Caraïbes","Pointe-à-Pitre","Guadeloupe",16.2653,-61.5318],["PGUM","GUM","A.B. Won Pat","Guam","Guam",13.4834,144.796],["MGGT","GUA","La Aurora","Guatemala","Guatemala",14.5833,-90.5275],["GUCY","CKY","Gbessia","Conakry","Guinée",9.5769,-13.612],["FGSL","SSG","Malabo","Malabo","Guinée équatoriale",3.7553,8.7089],["GGOV","OXB","Osvaldo Vieira","Bissau","Guinée-Bissau",11.8948,-15.6537],["SYCJ","GEO","Cheddi Jagan","Georgetown","Guyana",6.4986,-58.2541],["SOCA","CAY","Félix Éboué","Cayenne","Guyane",4.8198,-52.3604],["UGTB","TBS","Tbilissi","Tbilissi","Géorgie",41.6692,44.9547],["MTPP","PAP","Toussaint Louverture","Port-au-Prince","Haïti",18.58,-72.2925],["MHTE","TGU","Toncontín","Tegucigalpa","Honduras",14.0609,-87.2172],["VHHH","HKG","Hong Kong","Hong Kong","Hong Kong",22.308,113.9185],["LHBP","BUD","Ferenc Liszt","Budapest","Hongrie",47.4369,19.2556],["VOBL","BLR","Kempegowda","Bengaluru","Inde",13.1979,77.7063],["VECC","CCU","N. S. Chandra Bose","Calcutta","Inde",22.6547,88.4467],["VOMM","MAA","Chennai","Chennai","Inde",12.9941,80.1709],["VOGO","GOI","Dabolim","Goa","Inde",15.3808,73.8314],["VOHS","HYD","Rajiv Gandhi","Hyderabad","Inde",17.2313,78.4298],["VABB","BOM","Chhatrapati Shivaji","Mumbai","Inde",19.0887,72.8679],["VIDP","DEL","Indira Gandhi","New Delhi","Inde",28.5665,77.1031],["VAPO","PNQ","Pune","Pune","Inde",18.5821,73.9197],["WADD","DPS","Ngurah Rai","Denpasar","Indonésie",-8.7482,115.1672],["WIII","CGK","Soekarno-Hatta","Jakarta","Indonésie",-6.1256,106.6559],["WARR","SUB","Juanda","Surabaya","Indonésie",-7.3798,112.7869],["ORBI","BGW","Baghdad","Bagdad","Irak",33.2625,44.2346],["ORMM","BSR","Basra","Bassorah","Irak",30.5491,47.6621],["ORER","EBL","Erbil","Erbil","Irak",36.2376,43.9632],["OISS","SYZ","Shiraz","Chiraz","Iran",29.5392,52.5898],["OIMM","MHD","Mashhad","Machhad","Iran",36.2352,59.641],["OIIE","IKA","Imam Khomeini","Téhéran","Iran",35.4161,51.1522],["OIII","THR","Mehrabad","Téhéran","Iran",35.6892,51.3134],["EICK","ORK","Cork","Cork","Irlande",51.8413,-8.4911],["EIDW","DUB","Dublin","Dublin","Irlande",53.4213,-6.2701],["EINN","SNN","Shannon","Shannon","Irlande",52.702,-8.9248],["BIKF","KEF","Keflavík","Keflavík","Islande",63.985,-22.6056,"Reykjavik"],["LLBG","TLV","Tel-Aviv Ben Gourion","Tel-Aviv","Israël",32.0114,34.8867,"Jérusalem"],["LIBD","BRI","Karol Wojtyła","Bari","Italie",41.1389,16.7606],["LIME","BGY","Orio al Serio","Bergame","Italie",45.6739,9.7042],["LIPE","BLQ","Marconi","Bologne","Italie",44.5354,11.2887],["LIEE","CAG","Elmas","Cagliari","Italie",39.2515,9.0543],["LICC","CTA","Fontanarossa","Catane","Italie",37.4668,15.0664],["LIMC","MXP","Malpensa","Milan","Italie",45.6306,8.7281],["LIML","LIN","Linate","Milan","Italie",45.4451,9.2767],["LIRN","NAP","Capodichino","Naples","Italie",40.886,14.2908],["LICJ","PMO","Falcone-Borsellino","Palerme","Italie",38.176,13.091],["LIRP","PSA","Galilei","Pise","Italie",43.6839,10.3927],["LIPR","RMI","Rimini","Rimini","Italie",44.0203,12.6117,"Saint-Marin"],["LIRF","FCO","Fiumicino","Rome","Italie",41.8003,12.2389],["LIPZ","VCE","Marco Polo","Venise","Italie",45.5053,12.3519],["MKJP","KIN","Norman Manley","Kingston","Jamaïque",17.9357,-76.7875],["MKJS","MBJ","Sangster","Montego Bay","Jamaïque",18.5037,-77.9134],["RJFF","FUK","Fukuoka","Fukuoka","Japon",33.5859,130.451],["RJGG","NGO","Chubu Centrair","Nagoya","Japon",34.8584,136.8054],["RJBB","KIX","Kansai","Osaka","Japon",34.4347,135.244],["RJOO","ITM","Itami","Osaka","Japon",34.7855,135.4382],["RJCC","CTS","New Chitose","Sapporo","Japon",42.7752,141.6923],["RJAA","NRT","Narita","Tokyo","Japon",35.7647,140.3864],["RJTT","HND","Haneda","Tokyo","Japon",35.5523,139.7798],["OJAI","AMM","Queen Alia","Amman","Jordanie",31.7226,35.9932],["UAAA","ALA","Almaty","Almaty","Kazakhstan",43.3521,77.0405],["UACC","NQZ","Noursoultan Nazarbaïev","Astana","Kazakhstan",51.0222,71.4669],["HKKI","KIS","Kisumu","Kisumu","Kenya",-0.0861,34.7289],["HKMO","MBA","Moi","Mombasa","Kenya",-4.0348,39.5942],["HKJK","NBO","Jomo Kenyatta","Nairobi","Kenya",-1.3192,36.9278],["UAFM","FRU","Manas","Bichkek","Kirghizistan",43.0613,74.4776],["NGTA","TRW","Bonriki","Tarawa","Kiribati",1.3816,173.1471],["BKPR","PRN","Adem Jashari","Pristina","Kosovo",42.5728,21.0358],["OKKK","KWI","Kuwait","Koweït","Koweït",29.2266,47.9689],["FMEE","RUN","Roland Garros","Saint-Denis","La Réunion",-20.8871,55.5103],["VLVT","VTE","Wattay","Vientiane","Laos",17.9883,102.5633],["FXMM","MSU","Moshoeshoe I","Maseru","Lesotho",-29.4623,27.5525],["EVRA","RIX","Riga","Riga","Lettonie",56.9236,23.9711],["OLBA","BEY","Rafic Hariri","Beyrouth","Liban",33.8209,35.4884],["GLMR","MLW","Spriggs Payne","Monrovia","Liberia",6.289,-10.7587],["GLRB","ROB","Roberts","Monrovia","Liberia",6.2339,-10.3623],["HLLB","BEN","Benina","Benghazi","Libye",32.0968,20.2695],["HLMS","MRA","Misrata","Misrata","Libye",32.325,15.061],["HLLS","SEB","Sabha","Sebha","Libye",26.987,14.4725],["HLLM","MJI","Tripoli International","Tripoli","Libye",32.6635,13.159],["HLLT","TIP","Mitiga","Tripoli","Libye",32.8941,13.276],["EYVI","VNO","Vilnius","Vilnius","Lituanie",54.6341,25.2858],["ELLX","LUX","Findel","Luxembourg","Luxembourg",49.6266,6.2115],["LWSK","SKP","Skopje","Skopje","Macédoine du Nord",41.9616,21.6214],["FMMI","TNR","Ivato","Antananarivo","Madagascar",-18.7969,47.4788],["WMKK","KUL","Kuala Lumpur","Kuala Lumpur","Malaisie",2.7456,101.7099],["FWKI","LLW","Kamuzu","Lilongwe","Malawi",-13.7894,33.781],["VRMM","MLE","Velana","Malé","Maldives",4.1918,73.5291],["GABS","BKO","Sénou","Bamako","Mali",12.5335,-7.9499],["GAGO","GAQ","Korogoussou","Gao","Mali",16.2484,-0.0053],["GATB","TOM","Tombouctou","Tombouctou","Mali",16.7305,-3.0074],["LMML","MLA","Malta","La Valette","Malte",35.8575,14.4775],["GMAD","AGA","Al Massira","Agadir","Maroc",30.325,-9.4131],["GMTA","AHU","Cherif Al Idrissi","Al Hoceïma","Maroc",35.1771,-3.8395],["GMFB","UAR","Bouarfa","Bouarfa","Maroc",32.5144,-1.9783],["GMMD","BEM","Béni Mellal","Béni Mellal","Maroc",32.4,-6.3167],["GMMN","CMN","Mohammed V","Casablanca","Maroc",33.3703,-7.5829],["GMMH","VIL","Dakhla","Dakhla","Maroc",23.7183,-15.932],["GMFK","ERH","Moulay Ali Chérif","Errachidia","Maroc",31.9475,-4.3983],["GMMI","ESU","Mogador","Essaouira","Maroc",31.3975,-9.6817],["GMFF","FEZ","Saïss","Fès","Maroc",33.9273,-4.9779],["GMAG","GLN","Guelmim","Guelmim","Maroc",28.986,-10.0512],["GMML","EUN","Hassan I","Laâyoune","Maroc",27.1517,-13.2192],["GMMX","RAK","Menara","Marrakech","Maroc",31.6069,-8.0363],["GMMW","NDR","Al Aroui","Nador","Maroc",34.9888,-3.0282],["GMMZ","OZZ","Ouarzazate","Ouarzazate","Maroc",30.9391,-6.9094],["GMFO","OUD","Angads","Oujda","Maroc",34.7872,-1.924],["GMME","RBA","Rabat-Salé","Rabat","Maroc",34.0515,-6.7515],["GMMF","SII","Sidi Ifni","Sidi Ifni","Maroc",29.3667,-10.1878],["GMMA","SMW","Smara","Smara","Maroc",26.7317,-11.6844,"Semara Es-Semara"],["GMAT","TTA","Plage Blanche","Tan-Tan","Maroc",28.4482,-11.1613],["GMTT","TNG","Ibn Battouta","Tanger","Maroc",35.7269,-5.9169],["GMTN","TTU","Sania R'mel","Tétouan","Maroc",35.5944,-5.32,"Tetouan"],["GMAZ","OZG","Zagora","Zagora","Maroc",30.2667,-5.8572],["TFFF","FDF","Aimé Césaire","Fort-de-France","Martinique",14.591,-61.0032],["FIMP","MRU","Sir Seewoosagur Ramgoolam","Port-Louis","Maurice",-20.4302,57.6836],["GQPA","ATR","Atar","Atar","Mauritanie",20.5068,-13.0432],["GQPP","NDB","Nouadhibou","Nouadhibou","Mauritanie",20.933,-17.03],["GQNO","NKC","Oumtounsy","Nouakchott","Mauritanie",18.31,-15.9697],["GQPZ","OUZ","Tazadit","Zouérate","Mauritanie",22.7564,-12.4836],["MMUN","CUN","Cancún","Cancún","Mexique",21.0365,-86.8771],["MMGL","GDL","Guadalajara","Guadalajara","Mexique",20.5218,-103.3111],["MMMX","MEX","Benito Juárez","Mexico","Mexique",19.4363,-99.0721],["MMMY","MTY","Monterrey","Monterrey","Mexique",25.7785,-100.1067],["MMSD","SJD","Los Cabos","San José del Cabo","Mexique",23.1518,-109.7211],["PTPN","PNI","Pohnpei","Pohnpei","Micronésie",6.9851,158.209,"Palikir"],["LUKK","KIV","Chisinau","Chisinau","Moldavie",46.9277,28.931],["ZMCK","UBN","Chinggis Khaan","Oulan-Bator","Mongolie",47.6531,106.8197],["LYPG","TGD","Podgorica","Podgorica","Monténégro",42.3594,19.2519],["FQMA","MPM","Maputo","Maputo","Mozambique",-25.9208,32.5726],["VYNT","NYT","Naypyidaw","Naypyidaw","Myanmar",19.6234,96.201],["VYYY","RGN","Yangon","Rangoun","Myanmar",16.9073,96.1332],["FYWH","WDH","Hosea Kutako","Windhoek","Namibie",-22.4799,17.4709],["ANYN","INU","Nauru","Yaren","Nauru",-0.5471,166.9191],["MNMG","MGA","Augusto C. Sandino","Managua","Nicaragua",12.1415,-86.1682],["DRRN","NIM","Diori Hamani","Niamey","Niger",13.4815,2.1836],["DNAA","ABV","Nnamdi Azikiwe","Abuja","Nigeria",9.0068,7.2632],["DNKN","KAN","Mallam Aminu Kano","Kano","Nigeria",12.0476,8.5246],["DNMM","LOS","Murtala Muhammed","Lagos","Nigeria",6.5774,3.3212],["DNPO","PHC","Port Harcourt","Port Harcourt","Nigeria",5.0155,6.9496],["ENBR","BGO","Flesland","Bergen","Norvège",60.2934,5.2181],["ENGM","OSL","Gardermoen","Oslo","Norvège",60.1939,11.1004],["NWWW","NOU","La Tontouta","Nouméa","Nouvelle-Calédonie",-22.0146,166.2129],["NZAA","AKL","Auckland","Auckland","Nouvelle-Zélande",-37.0082,174.785],["NZCH","CHC","Christchurch","Christchurch","Nouvelle-Zélande",-43.4894,172.5322],["NZWN","WLG","Wellington","Wellington","Nouvelle-Zélande",-41.3272,174.8053],["VNKT","KTM","Tribhuvan","Katmandou","Népal",27.6966,85.3591],["OOMS","MCT","Muscat","Mascate","Oman",23.5933,58.2844],["HUEN","EBB","Entebbe","Entebbe","Ouganda",0.0424,32.4435,"Kampala"],["UTTT","TAS","Islam Karimov","Tachkent","Ouzbékistan",41.2579,69.2812],["OPIS","ISB","Islamabad","Islamabad","Pakistan",33.5607,72.8516],["OPKC","KHI","Jinnah","Karachi","Pakistan",24.9065,67.1608],["OPLA","LHE","Allama Iqbal","Lahore","Pakistan",31.5216,74.4036],["PTRO","ROR","Roman Tmetuchl","Koror","Palaos",7.3673,134.5442,"Ngerulmud"],["MPTO","PTY","Tocumen","Panama","Panama",9.0714,-79.3835],["AYPY","POM","Jacksons","Port Moresby","Papouasie-Nouvelle-Guinée",-9.4433,147.22],["SGAS","ASU","Silvio Pettirossi","Asuncion","Paraguay",-25.24,-57.52],["EHAM","AMS","Schiphol","Amsterdam","Pays-Bas",52.3086,4.7639],["EHEH","EIN","Eindhoven","Eindhoven","Pays-Bas",51.4501,5.3745],["RPVM","CEB","Mactan-Cebu","Cebu","Philippines",10.3075,123.9794],["RPLL","MNL","Ninoy Aquino","Manille","Philippines",14.5086,121.0198],["EPKK","KRK","Jean-Paul II Balice","Cracovie","Pologne",50.0777,19.7848],["EPWA","WAW","Chopin","Varsovie","Pologne",52.1657,20.9671],["NTAA","PPT","Faa'a","Papeete","Polynésie française",-17.5537,-149.607],["TJSJ","SJU","Luis Muñoz Marín","San Juan","Porto Rico",18.4394,-66.0018],["LPFR","FAO","Faro","Faro","Portugal",37.0144,-7.9659],["LPMA","FNC","Cristiano Ronaldo","Funchal","Portugal",32.6979,-16.7745],["LPPT","LIS","Humberto Delgado","Lisbonne","Portugal",38.7813,-9.1359],["LPPR","OPO","Francisco Sá Carneiro","Porto","Portugal",41.2481,-8.6814],["LPPS","PXO","Porto Santo","Porto Santo","Portugal",33.0734,-16.35],["SPJC","LIM","Jorge Chávez","Lima","Pérou",-12.0219,-77.1143],["OTHH","DOH","Hamad","Doha","Qatar",25.2731,51.6081],["FZAA","FIH","N'djili","Kinshasa","RD Congo",-4.3858,15.4446],["LROP","OTP","Henri Coandă","Bucarest","Roumanie",44.5722,26.1022],["EGBB","BHX","Birmingham","Birmingham","Royaume-Uni",52.4539,-1.748],["EGGD","BRS","Bristol","Bristol","Royaume-Uni",51.3827,-2.7191],["EGPF","GLA","Glasgow","Glasgow","Royaume-Uni",55.8719,-4.4331],["EGGW","LTN","Luton","Londres","Royaume-Uni",51.8747,-0.3683],["EGKK","LGW","Gatwick","Londres","Royaume-Uni",51.1481,-0.1903],["EGLL","LHR","Heathrow","Londres","Royaume-Uni",51.4706,-0.4619],["EGSS","STN","Stansted","Londres","Royaume-Uni",51.885,0.235],["EGCC","MAN","Manchester","Manchester","Royaume-Uni",53.3537,-2.275],["EGPH","EDI","Edinburgh","Édimbourg","Royaume-Uni",55.95,-3.3725],["UUDD","DME","Domodedovo","Moscou","Russie",55.4088,37.9063],["UUEE","SVO","Cheremetievo","Moscou","Russie",55.9726,37.4146],["ULLI","LED","Poulkovo","Saint-Pétersbourg","Russie",59.8003,30.2625],["HRYR","KGL","Kigali","Kigali","Rwanda",-1.9683,30.1395],["MDPC","PUJ","Punta Cana","Punta Cana","République dominicaine",18.5674,-68.3634],["MDSD","SDQ","Las Américas","Saint-Domingue","République dominicaine",18.4297,-69.6689],["TKPK","SKB","Robert L. Bradshaw","Basseterre","Saint-Kitts-et-Nevis",17.3111,-62.7187],["TVSA","SVD","Argyle","Kingstown","Saint-Vincent-et-les-Grenadines",13.1564,-61.1497],["TLPC","SLU","George F. L. Charles","Castries","Sainte-Lucie",14.0202,-60.993],["MSLP","SAL","El Salvador","San Salvador","Salvador",13.4409,-89.0557],["NSFA","APW","Faleolo","Apia","Samoa",-13.83,-172.0083],["LYBE","BEG","Nikola Tesla","Belgrade","Serbie",44.8184,20.3091],["FSIA","SEZ","Seychelles International","Victoria","Seychelles",-4.6743,55.5218],["GFLL","FNA","Lungi","Freetown","Sierra Leone",8.6164,-13.1955],["WSSS","SIN","Changi","Singapour","Singapour",1.3502,103.9944],["TNCM","SXM","Princess Juliana","Sint Maarten","Sint Maarten",18.041,-63.1089],["LZIB","BTS","M. R. Štefánik","Bratislava","Slovaquie",48.1702,17.2127],["LJLJ","LJU","Jože Pučnik","Ljubljana","Slovénie",46.2237,14.4576],["HCMM","MGQ","Aden Adde","Mogadiscio","Somalie",2.0144,45.3047],["HSSS","KRT","Khartoum","Khartoum","Soudan",15.5895,32.5532],["HSSJ","JUB","Juba","Djouba","Soudan du Sud",4.872,31.6011],["VCBI","CMB","Bandaranaike","Colombo","Sri Lanka",7.1808,79.8841],["LSZR","ACH","St. Gallen-Altenrhein","Altenrhein","Suisse",47.485,9.5608,"Vaduz Liechtenstein · Vaduz · Liechtenstein"],["LSZB","BRN","Bern-Belp","Berne","Suisse",46.9141,7.4971],["LSGG","GVA","Cointrin","Genève","Suisse",46.2381,6.109],["LSZH","ZRH","Kloten","Zurich","Suisse",47.4647,8.5492],["SMJP","PBM","Johan Adolf Pengel","Paramaribo","Suriname",5.4528,-55.1878],["ESGG","GOT","Landvetter","Göteborg","Suède",57.6628,12.2798],["ESMS","MMX","Malmö","Malmö","Suède",55.5363,13.3762],["ESSA","ARN","Arlanda","Stockholm","Suède",59.6519,17.9186],["OSDI","DAM","Damascus","Damas","Syrie",33.4114,36.5156],["FPST","TMS","São Tomé","São Tomé","São Tomé-et-Príncipe",0.3781,6.7122],["GOBD","DSS","Blaise Diagne","Dakar","Sénégal",14.67,-17.0733],["UTDD","DYU","Dushanbe","Douchanbé","Tadjikistan",38.5433,68.825],["HTDA","DAR","Dar es Salaam Julius Nyerere","Dar es Salaam","Tanzanie",-6.8781,39.2026,"Dodoma"],["HTKJ","JRO","Kilimandjaro","Kilimandjaro","Tanzanie",-3.4294,37.0745,"Arusha"],["HTZA","ZNZ","A. A. Karume","Zanzibar","Tanzanie",-6.222,39.2249],["RCKH","KHH","Kaohsiung","Kaohsiung","Taïwan",22.5771,120.35],["RCTP","TPE","Taoyuan","Taipei","Taïwan",25.0777,121.2328],["FTTJ","NDJ","Hassan Djamous","N'Djaména","Tchad",12.1337,15.034],["LKPR","PRG","Václav Havel","Prague","Tchéquie",50.1008,14.26],["VTBD","DMK","Don Mueang","Bangkok","Thaïlande",13.9126,100.6068],["VTBS","BKK","Suvarnabhumi","Bangkok","Thaïlande",13.69,100.7501],["VTCC","CNX","Chiang Mai","Chiang Mai","Thaïlande",18.7668,98.9626],["VTSP","HKT","Phuket","Phuket","Thaïlande",8.1132,98.3169],["WPDL","DIL","Presidente Nicolau Lobato","Dili","Timor oriental",-8.5464,125.526],["DXXX","LFW","Gnassingbé Eyadéma","Lomé","Togo",6.1656,1.2544],["NFTF","TBU","Fua'amotu","Nuku'alofa","Tonga",-21.2412,-175.1496],["TTPP","POS","Piarco","Port-d'Espagne","Trinité-et-Tobago",10.5954,-61.3372],["DTTJ","DJE","Zarzis","Djerba","Tunisie",33.875,10.7755],["DTNH","NBE","Enfidha-Hammamet","Enfidha","Tunisie",36.0758,10.4386],["DTMB","MIR","Habib Bourguiba","Monastir","Tunisie",35.7581,10.7547],["DTTX","SFA","Thyna","Sfax","Tunisie",34.718,10.691],["DTTA","TUN","Carthage","Tunis","Tunisie",36.851,10.2272],["UTAA","ASB","Ashgabat","Achgabat","Turkménistan",37.9868,58.361],["LTAC","ESB","Esenboğa","Ankara","Turquie",40.1281,32.9951],["LTAI","AYT","Antalya","Antalya","Turquie",36.8987,30.8005],["LTFE","BJV","Milas-Bodrum","Bodrum","Turquie",37.2506,27.6643],["LTBS","DLM","Dalaman","Dalaman","Turquie",36.7131,28.7925],["LTFJ","SAW","Sabiha Gökçen","Istanbul","Turquie",40.8986,29.3092],["LTFM","IST","Istanbul","Istanbul","Turquie",41.2753,28.7519],["LTBJ","ADB","Adnan Menderes","Izmir","Turquie",38.2924,27.157],["NGFU","FUN","Funafuti","Funafuti","Tuvalu",-8.525,179.1961],["UKBB","KBP","Boryspil","Kyiv","Ukraine",50.345,30.8947],["SUMU","MVD","Carrasco","Montevideo","Uruguay",-34.8384,-56.0308],["NVVV","VLI","Bauerfield","Port-Vila","Vanuatu",-17.6993,168.3197],["SVMI","CCS","Simón Bolívar","Caracas","Venezuela",10.6013,-66.9911],["VVDN","DAD","Da Nang","Da Nang","Viêt Nam",16.0439,108.1994],["VVNB","HAN","Nội Bài","Hanoï","Viêt Nam",21.2212,105.8072],["VVTS","SGN","Tan Son Nhat","Hô Chi Minh-Ville","Viêt Nam",10.8188,106.652],["OYSN","SAH","Sanaa","Sanaa","Yémen",15.4763,44.2197],["FLKK","LUN","Kenneth Kaunda","Lusaka","Zambie",-15.3308,28.4526],["FVFA","VFA","Victoria Falls","Chutes Victoria","Zimbabwe",-18.0959,25.839],["FVHA","HRE","Robert Gabriel Mugabe","Harare","Zimbabwe",-17.9319,31.0928],["HEAX","HBE","Borg El Arab","Alexandrie","Égypte",30.9177,29.6964],["HESH","SSH","Sharm el-Sheikh","Charm el-Cheikh","Égypte",27.9773,34.395],["HEGN","HRG","Hurghada","Hurghada","Égypte",27.1783,33.7994],["HECA","CAI","Cairo International","Le Caire","Égypte",30.1219,31.4056],["HELX","LXR","Luxor","Louxor","Égypte",25.671,32.7066],["OMAA","AUH","Zayed","Abou Dabi","Émirats arabes unis",24.433,54.6511],["OMSJ","SHJ","Sharjah","Charjah","Émirats arabes unis",25.3286,55.5172],["OMDB","DXB","Dubai","Dubaï","Émirats arabes unis",25.2532,55.3657],["SEGU","GYE","José Joaquín de Olmedo","Guayaquil","Équateur",-2.1574,-79.8836],["SEQM","UIO","Mariscal Sucre","Quito","Équateur",-0.1292,-78.3575],["HHAS","ASM","Asmara","Asmara","Érythrée",15.2919,38.9107],["PANC","ANC","Ted Stevens","Anchorage","États-Unis",61.1743,-149.9962],["KATL","ATL","Hartsfield-Jackson","Atlanta","États-Unis",33.6407,-84.4277],["KBWI","BWI","Baltimore-Washington","Baltimore","États-Unis",39.1754,-76.6683],["KBOS","BOS","Logan","Boston","États-Unis",42.3656,-71.0096],["KCLT","CLT","Charlotte Douglas","Charlotte","États-Unis",35.214,-80.9431],["KMDW","MDW","Midway","Chicago","États-Unis",41.7868,-87.7522],["KORD","ORD","O'Hare","Chicago","États-Unis",41.9742,-87.9073],["KDFW","DFW","Dallas/Fort Worth","Dallas","États-Unis",32.8998,-97.0403],["KDEN","DEN","Denver","Denver","États-Unis",39.8561,-104.6737],["KDTW","DTW","Detroit Metropolitan","Détroit","États-Unis",42.2124,-83.3534],["KFLL","FLL","Fort Lauderdale-Hollywood","Fort Lauderdale","États-Unis",26.0726,-80.1527],["PHNL","HNL","Daniel K. Inouye","Honolulu","États-Unis",21.3187,-157.9224],["KHOU","HOU","Hobby","Houston","États-Unis",29.6454,-95.2789],["KIAH","IAH","Bush Intercontinental","Houston","États-Unis",29.9902,-95.3368],["KLAS","LAS","Harry Reid","Las Vegas","États-Unis",36.084,-115.1537],["KLAX","LAX","Los Angeles","Los Angeles","États-Unis",33.9416,-118.4085],["KMIA","MIA","Miami","Miami","États-Unis",25.7959,-80.287],["KMSP","MSP","Minneapolis-Saint Paul","Minneapolis","États-Unis",44.882,-93.2218],["KJFK","JFK","John F. Kennedy","New York","États-Unis",40.6413,-73.7781],["KLGA","LGA","LaGuardia","New York","États-Unis",40.7769,-73.874],["KEWR","EWR","Newark Liberty","Newark","États-Unis",40.6895,-74.1745],["KOAK","OAK","Oakland","Oakland","États-Unis",37.7213,-122.2208],["KMCO","MCO","Orlando","Orlando","États-Unis",28.4312,-81.3081],["KPHL","PHL","Philadelphie","Philadelphie","États-Unis",39.8719,-75.2411],["KPHX","PHX","Sky Harbor","Phoenix","États-Unis",33.4343,-112.0116],["KPDX","PDX","Portland","Portland","États-Unis",45.5887,-122.5975],["KSTL","STL","Lambert","Saint-Louis","États-Unis",38.7487,-90.37],["KSLC","SLC","Salt Lake City","Salt Lake City","États-Unis",40.7884,-111.9778],["KSAN","SAN","San Diego","San Diego","États-Unis",32.7336,-117.1897],["KSFO","SFO","San Francisco","San Francisco","États-Unis",37.6213,-122.379],["KSJC","SJC","Mineta","San José","États-Unis",37.3626,-121.929],["KSEA","SEA","Seattle-Tacoma","Seattle","États-Unis",47.4502,-122.3088],["KTPA","TPA","Tampa","Tampa","États-Unis",27.9755,-82.5332],["KDCA","DCA","Ronald Reagan","Washington","États-Unis",38.8521,-77.0377],["KIAD","IAD","Washington Dulles","Washington","États-Unis",38.9445,-77.4558],["HAAB","ADD","Bole","Addis-Abeba","Éthiopie",8.9779,38.7993],["PKMJ","MAJ","Marshall Islands","Majuro","Îles Marshall",7.0648,171.272],["AGGH","HIR","Henderson","Honiara","Îles Salomon",-9.428,160.0546],["GMMB","","Benslimane","Benslimane","Maroc",33.6545,-7.2258]];

// ── Autocomplete admin empty legs ──
function elNorm(s) {
  return (s || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
function elFilterAirports(q) {
  if (!q || q.length < 2) return [];
  const term = elNorm(q);
  const starts = [], has = [];
  for (let i = 0; i < EL_AIRPORTS.length; i++) {
    const a = EL_AIRPORTS[i];
    const icao = elNorm(a[0]), iata = elNorm(a[1]), apt = elNorm(a[2]), city = elNorm(a[3]), country = elNorm(a[4]), kw = elNorm(a[7]);
    const hay = icao + ' ' + iata + ' ' + apt + ' ' + city + ' ' + country + ' ' + kw;
    if (hay.indexOf(term) < 0) continue;
    (icao.indexOf(term) === 0 || iata.indexOf(term) === 0 || city.indexOf(term) === 0 ? starts : has).push(a);
    if (starts.length + has.length > 100) break;
  }
  return starts.concat(has).slice(0, 12);
}

function elSetupAC(inputId, listId) {
  const inp = document.getElementById(inputId);
  const lst = document.getElementById(listId);
  if (!inp || !lst) return;
  inp.addEventListener('input', () => {
    const results = elFilterAirports(inp.value);
    if (!results.length) { lst.classList.remove('open'); lst.innerHTML = ''; return; }
    lst.innerHTML = results.map(a =>
      '<div class="autocomplete-item" data-code="' + a[1] + '" data-icao="' + a[0] + '" data-city="' + a[3] + '" data-lat="' + a[5] + '" data-lon="' + a[6] + '"><span class="ac-code">' + (a[1] || a[0]) + '</span> ' + a[3] + ', ' + a[4] + ' <i>(' + a[2] + ')</i></div>'
    ).join('');
    lst.querySelectorAll('.autocomplete-item').forEach(item => {
      item.addEventListener('mousedown', e => {
        e.preventDefault();
        inp.value = item.getAttribute('data-city');
        inp.setAttribute('data-iata', item.getAttribute('data-code'));
        inp.setAttribute('data-icao', item.getAttribute('data-icao'));
        inp.setAttribute('data-lat', item.getAttribute('data-lat'));
        inp.setAttribute('data-lon', item.getAttribute('data-lon'));
        lst.classList.remove('open');
      });
    });
    lst.classList.add('open');
  });
  inp.addEventListener('blur', () => setTimeout(() => lst.classList.remove('open'), 200));
  inp.addEventListener('focus', () => { if (inp.value.length >= 2) inp.dispatchEvent(new Event('input')); });
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const first = lst.querySelector('.autocomplete-item');
      if (first) first.dispatchEvent(new MouseEvent('mousedown'));
    }
  });
}
elSetupAC('elDepart', 'elDepList');
elSetupAC('elArrivee', 'elArrList');
elSetupAC('formInputDep', 'formListDep');
elSetupAC('formInputArr', 'formListArr');

// ── Custom aircraft dropdown (admin) ──
(function() {
  var dd = document.getElementById('elAcDropdown');
  var btn = document.getElementById('elAcBtn');
  var list = document.getElementById('elAcList');
  var hidden = document.getElementById('elAvion');
  if (!dd || !btn || !list) return;

  btn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    dd.classList.toggle('open');
  });

  list.querySelectorAll('.el-ac-dropdown-item').forEach(function(item) {
    item.addEventListener('click', function(e) {
      e.stopPropagation();
      var val = item.getAttribute('data-val');
      var reg = item.querySelector('.el-ac-item-reg').textContent;
      var type = item.querySelector('.el-ac-item-type').textContent;

      dd.querySelector('.el-ac-reg').textContent = reg;
      dd.querySelector('.el-ac-type').textContent = type;
      if (hidden) hidden.value = val;

      list.querySelectorAll('.el-ac-dropdown-item').forEach(function(i) { i.classList.remove('active'); });
      item.classList.add('active');
      dd.classList.remove('open');
    });
  });

  document.addEventListener('click', function(e) {
    if (!dd.contains(e.target)) dd.classList.remove('open');
  });
})();
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1bHd1YnV6dXlsbXdraXR0bmJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3Mjk5MjQsImV4cCI6MjA5ODMwNTkyNH0.Bt2MXASzrqWPaxTxo7ImZu-FtdjahLG9FLOMIgz9SWA';
const EL_TABLE = 'empty_legs';

async function elFetch() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const res = await fetch(
      SUPA_URL + '/rest/v1/' + EL_TABLE + '?actif=eq.true&date_vol=gte.' + today + '&order=date_vol.asc',
      { headers: { 'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + SUPA_KEY } }
    );
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } catch(e) { console.error('Empty legs fetch error:', e); return []; }
}

async function elFetchAll() {
  try {
    const res = await fetch(
      SUPA_URL + '/rest/v1/' + EL_TABLE + '?order=date_vol.desc&limit=50',
      { headers: { 'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + elAccessToken } }
    );
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } catch(e) { console.error('Empty legs fetch error:', e); return []; }
}

function elFormatDate(d) {
  const dt = new Date(d + 'T00:00:00');
  const opts = { day: 'numeric', month: 'long', year: 'numeric' };
  const lang = document.documentElement.lang || 'fr';
  return dt.toLocaleDateString(lang === 'es' ? 'es-ES' : lang === 'en' ? 'en-GB' : 'fr-FR', opts);
}

function elWhatsAppUrl(dep, arr, date) {
  const msg = encodeURIComponent('Bonjour, je suis intéressé(e) par le vol à vide ' + dep + ' → ' + arr + ' du ' + date + '. Merci de me communiquer les détails.');
  return 'https://wa.me/212689595910?text=' + msg;
}

function elMailUrl(dep, arr, date) {
  const subject = encodeURIComponent('Vol à vide ' + dep + ' → ' + arr + ' — ' + date);
  const body = encodeURIComponent('Bonjour,\n\nJe suis intéressé(e) par le vol à vide suivant :\n\n• Trajet : ' + dep + ' → ' + arr + '\n• Date : ' + date + '\n\nMerci de me communiquer les détails et conditions.\n\nCordialement');
  return 'mailto:info@afrijet.ma?subject=' + subject + '&body=' + body;
}

async function elRender() {
  const grid = document.getElementById('elGrid');
  if (!grid) return;
  const flights = await elFetch();
  const t = window._i18n || {};
  
  if (!flights.length) {
    grid.innerHTML = '<div class="el-empty"><div class="el-empty-icon">✈</div><p style="font-weight:600;color:var(--navy);font-size:18px;" data-i18n="el.empty_title">' + (t['el.empty_title'] || 'Aucun vol à vide programmé') + '</p><p data-i18n="el.empty_text">' + (t['el.empty_text'] || 'Contactez-nous pour vos besoins spécifiques, nous trouverons la meilleure solution.') + '</p><a href="#contact" class="el-cta" style="margin-top:20px;" data-i18n="form.submit">Demander un devis →</a></div>';
    return;
  }

  function typewriterSpan(text) {
    return text.split('').map((ch, i) =>
      '<span class="tw-letter" style="display:inline-block;opacity:0;" data-index="' + i + '">' +
      (ch === ' ' ? '&nbsp;' : ch) + '</span>'
    ).join('');
  }

  function startTypewriterLoops() {
    document.querySelectorAll('.el-card').forEach(card => {
      const cities = card.querySelectorAll('.el-city');
      const allLetters = [];
      cities.forEach(city => {
        const letters = city.querySelectorAll('.tw-letter');
        allLetters.push(letters);
      });
      const maxLen = Math.max(...Array.from(allLetters).map(l => l.length));

      function runCycle() {
        // Afficher lettre par lettre sur toutes les villes en parallèle
        let step = 0;
        function showStep() {
          if (step < maxLen) {
            allLetters.forEach(letters => {
              if (letters[step]) letters[step].style.opacity = '1';
            });
            step++;
            setTimeout(showStep, 150);
          } else {
            // Toutes les lettres affichées — attendre 500ms puis effacer tout
            setTimeout(() => {
              allLetters.forEach(letters => {
                letters.forEach(l => l.style.opacity = '0');
              });
              // Pause avant de relancer
              setTimeout(runCycle, 400);
            }, 500);
          }
        }
        showStep();
      }
      runCycle();
    });
  }

  grid.innerHTML = flights.map(f => {
    const dateStr = elFormatDate(f.date_vol);
    const heureStr = f.heure ? ' · ' + f.heure : '';
    return '<div class="el-card reveal">' +
      '<div class="el-route"><span class="el-city">' + typewriterSpan(f.depart) + '</span><span class="el-arrow">✈</span><span class="el-city">' + typewriterSpan(f.arrivee) + '</span></div>' +
      '<div class="el-prix">Prix : ' + (f.prix || 'Sur demande') + '</div>' +
      '<div class="el-meta"><span>📅 ' + dateStr + heureStr + '</span><span>🛩 ' + f.avion + '</span></div>' +
      '<div class="el-cta-row">' +
        '<a href="' + elWhatsAppUrl(f.depart, f.arrivee, dateStr) + '" target="_blank" class="el-cta el-cta-wa">WhatsApp</a>' +
        '<a href="' + elMailUrl(f.depart, f.arrivee, dateStr) + '" class="el-cta el-cta-mail">✉ Email</a>' +
      '</div>' +
    '</div>';
  }).join('');

  // Re-trigger reveal animation
  document.querySelectorAll('.el-card.reveal').forEach(el => { observer && observer.observe(el); });

  startTypewriterLoops();
}

// Admin
let elAccessToken = null;
function elAuthed() { return !!elAccessToken; }

async function elCheckPass() {
  const email = document.getElementById('elEmailInput').value.trim();
  const pass = document.getElementById('elPassInput').value;
  const btn = document.getElementById('elLoginBtn');
  const err = document.getElementById('elPassError');
  err.style.display = 'none';
  btn.disabled = true; btn.textContent = 'Connexion…';
  try {
    const res = await fetch(SUPA_URL + '/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: { 'apikey': SUPA_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: pass })
    });
    const data = await res.json();
    if (!res.ok || !data.access_token) throw new Error('auth');
    elAccessToken = data.access_token;
    document.getElementById('elPassScreen').style.display = 'none';
    document.getElementById('elAdminScreen').style.display = 'block';
    elLoadAdmin();
  } catch (e) {
    err.style.display = 'block';
  } finally {
    btn.disabled = false; btn.textContent = 'Accéder';
  }
}

document.getElementById('elPassInput')?.addEventListener('keydown', e => { if (e.key === 'Enter') elCheckPass(); });

async function elLoadAdmin() {
  const list = document.getElementById('elAdminList');
  if (!list) return;
  list.innerHTML = '<div class="el-loading">Chargement…</div>';
  const flights = await elFetchAll();
  if (!flights.length) { list.innerHTML = '<p style="color:var(--text-light);font-size:14px;">Aucun vol enregistré.</p>'; return; }
  list.innerHTML = flights.map(f => {
    const badge = f.actif ? '🟢' : '🔴';
    return '<div class="el-list-item">' +
      '<span>' + badge + ' ' + f.date_vol + ' · ' + f.depart + ' → ' + f.arrivee + ' · ' + f.avion + '</span>' +
      '<span><button class="el-list-del" onclick="elToggle(\'' + f.id + '\',' + !f.actif + ')" title="' + (f.actif ? 'Désactiver' : 'Activer') + '">' + (f.actif ? '⏸' : '▶') + '</button>' +
      '<button class="el-list-del" onclick="elDelete(\'' + f.id + '\')" title="Supprimer">🗑</button></span>' +
    '</div>';
  }).join('');
}

async function elAddFlight() {
  if (!elAuthed()) return;
  const date = document.getElementById('elDate').value;
  const depart = document.getElementById('elDepart').value.trim();
  const arrivee = document.getElementById('elArrivee').value.trim();
  const avion = document.getElementById('elAvion').value;
  const prix = document.getElementById('elPrix').value.trim() || 'Sur demande';
  const heure = document.getElementById('elHeure').value || null;
  if (!date || !depart || !arrivee) { alert('Date, départ et arrivée sont obligatoires.'); return; }
  try {
    const res = await fetch(SUPA_URL + '/rest/v1/' + EL_TABLE, {
      method: 'POST',
      headers: { 'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + elAccessToken, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify({ date_vol: date, depart, arrivee, avion, prix, heure, actif: true })
    });
    if (!res.ok) throw new Error(res.status);
    document.getElementById('elDate').value = '';
    document.getElementById('elDepart').value = '';
    document.getElementById('elArrivee').value = '';
    document.getElementById('elHeure').value = '';
    document.getElementById('elPrix').value = 'Sur demande';
    elLoadAdmin();
    elRender();
  } catch(e) { alert('Erreur: ' + e.message); }
}

async function elToggle(id, newState) {
  if (!elAuthed()) return;
  try {
    await fetch(SUPA_URL + '/rest/v1/' + EL_TABLE + '?id=eq.' + id, {
      method: 'PATCH',
      headers: { 'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + elAccessToken, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify({ actif: newState })
    });
    elLoadAdmin();
    elRender();
  } catch(e) { alert('Erreur: ' + e.message); }
}

async function elDelete(id) {
  if (!elAuthed() || !confirm('Supprimer ce vol ?')) return;
  try {
    await fetch(SUPA_URL + '/rest/v1/' + EL_TABLE + '?id=eq.' + id, {
      method: 'DELETE',
      headers: { 'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + elAccessToken }
    });
    elLoadAdmin();
    elRender();
  } catch(e) { alert('Erreur: ' + e.message); }
}

function openLegalModal() {
  var scrollY = window.scrollY;
  document.getElementById('modalLegal').style.display = 'block';
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.top = '-' + scrollY + 'px';
  document.body.style.width = '100%';
  document.body.dataset.scrollY = scrollY;
}
function closeLegalModal() {
  var scrollY = document.body.dataset.scrollY || 0;
  document.getElementById('modalLegal').style.display = 'none';
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  window.scrollTo(0, parseInt(scrollY));
}

// Lien mentions légales
(function() {
  var legalLink = document.getElementById('legalLink');
  if (legalLink) {
    legalLink.addEventListener('click', function(e) {
      e.preventDefault();
      openLegalModal();
    });
  }
})();

// Init
elRender();

// Journey timeline scroll progress
(function() {
  const fill = document.getElementById('journeyFill');
  const steps = document.querySelectorAll('.journey-step');
  const dots = document.querySelectorAll('.journey-dot');
  if (!fill || !steps.length) return;

  const line = fill.parentElement;
  const servicesEl = document.getElementById('services');

  // ---- Mode PC (>= 1025 px) : remplissage chronométré, étape par étape ----
  var jPlaying = false, jPlayed = false, jTimers = [];
  function jReset() {
    jTimers.forEach(function (t) { clearTimeout(t); });
    jTimers = [];
    jPlaying = false; jPlayed = false;
    fill.style.transition = 'none';
    fill.style.height = '0px';
    steps.forEach(function (s) { s.classList.remove('active'); });
  }
  function jPlay() {
    if (jPlaying || jPlayed) return;
    const lineRect = line.getBoundingClientRect();
    const d0 = dots[0].getBoundingClientRect();
    const startY = d0.top + d0.height / 2 - lineRect.top;
    const ys = [];
    dots.forEach(function (d) {
      const r = d.getBoundingClientRect();
      ys.push(r.top + r.height / 2 - lineRect.top - startY);
    });
    const total = ys[ys.length - 1];
    if (!(total > 0)) return;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dur = reduce ? 0 : 2800;
    jPlaying = true;
    fill.style.transition = 'none';
    fill.style.top = startY + 'px';
    fill.style.height = '0px';
    void fill.offsetHeight; // force le recalcul avant la transition
    steps[0].classList.add('active');
    fill.style.transition = dur ? ('height ' + dur + 'ms linear') : 'none';
    fill.style.height = total + 'px';
    steps.forEach(function (s, i) {
      if (i === 0) return;
      jTimers.push(setTimeout(function () { s.classList.add('active'); }, dur * (ys[i] / total)));
    });
    jTimers.push(setTimeout(function () { jPlaying = false; jPlayed = true; }, dur + 50));
  }
  function updateJourneyDesktop() {
    const winH = window.innerHeight;
    const hidden = !servicesEl || servicesEl.style.display === 'none' || line.offsetHeight === 0;
    if (hidden) { jReset(); return; }
    const top = dots[0].getBoundingClientRect().top;
    if (top > winH) { if (jPlayed || jPlaying) jReset(); return; } // sorti par le bas : rejouable
    if (top < winH * 0.85) jPlay();
  }

  function updateJourney() {
    const winH = window.innerHeight;
    const winW = window.innerWidth;
    if (winW >= 1025) { updateJourneyDesktop(); return; }
    if (jPlaying || jPlayed || fill.style.transition) { jReset(); fill.style.transition = ''; }
    const lineRect = line.getBoundingClientRect();
    const firstDot = dots[0];
    const lastDot = dots[dots.length - 1];
    const firstDotRect = firstDot.getBoundingClientRect();
    const lastDotRect = lastDot.getBoundingClientRect();

    const startY = firstDotRect.top + firstDotRect.height / 2 - lineRect.top;
    const endY = lastDotRect.top + lastDotRect.height / 2 - lineRect.top;
    const totalHeight = endY - startY;

    // Trigger adapté : plus bas sur grand écran car le dernier élément
    // peut être visible depuis plus haut dans le viewport
    let trigger;
    if (winW >= 1024) {
      trigger = winH * 0.90; // Mac/PC
    } else if (winW >= 768) {
      trigger = winH * 0.85; // iPad
    } else {
      trigger = winH * 0.75; // Mobile
    }

    const lastDotCenter = lastDotRect.top + lastDotRect.height / 2;
    const scrolled = trigger - firstDotRect.top - firstDotRect.height / 2;

    let pct;
    if (lastDotCenter <= trigger) {
      pct = 1;
    } else {
      pct = totalHeight > 0 ? Math.min(1, Math.max(0, scrolled / totalHeight)) : 0;
    }

    fill.style.top = startY + 'px';
    fill.style.height = (pct * totalHeight) + 'px';

    dots.forEach((dot, i) => {
      const dr = dot.getBoundingClientRect();
      if (dr.top + dr.height / 2 < trigger) {
        steps[i].classList.add('active');
      } else {
        steps[i].classList.remove('active');
      }
    });
  }

  const servicesSection = document.getElementById('services');
  window.journeyRefresh = function () { if (window.innerWidth >= 1025) updateJourney(); };
  const scrollTarget = servicesSection || window;
  scrollTarget.addEventListener('scroll', updateJourney, { passive: true });
  window.addEventListener('resize', updateJourney, { passive: true });
  updateJourney();
})();



/* Langue mémorisée d'une page à l'autre */
(function () {
  try {
    var l = localStorage.getItem('afrijet_lang');
    if (l && l !== 'fr' && typeof translations !== 'undefined' && translations[l]) setLang(l);
  } catch (e) {}
})();
