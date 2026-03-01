// creation d'une objet ajax et verifie qui il supporte ajax ou non
console.log('script.js loaded');

function creerXHR() {
    var xhr = null;
    
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else if (window.ActiveXObject) { //IE ancien ne supportait pas XMLHttpRequest Il utilisait ActiveXObject
        xhr = new ActiveXObject("Microsoft.XMLHTTP");
    } else {
        alert("Votre navigateur n'est pas compatible avec AJAX...");
        return null;
    }
    return xhr;
}

// cration d'un constante pour mutplier fois DT et avoir €
var EXCHANGE_RATES = {
    TND_TO_EUR: 3.3 // approximatif
};
// transforez le montant de dinar en euro
function convertToEur(amount, currency) {
    if (!amount || isNaN(amount)) return null;
    if (!currency) currency = 'TND';
    currency = currency.toUpperCase();
    if (currency === 'EUR' || currency === '€') return amount;
    if (currency === 'TND' || currency === 'DNT') {
        return amount / EXCHANGE_RATES.TND_TO_EUR;
    }
    // Si inconnue, renvoyer tel quel
    return amount;
}

function parsePriceString(str) {
    if (!str) return { value: null, currency: null };
    var s = String(str).trim();// enlève les espaces au début et à la fin
    // Certains prix contiennent des espaces insécables (copiés depuis le web)
    s = s.replace(/\u00A0/g, ' ').trim();
    var currency = null;
    if (/\u20AC|€|eur/i.test(s)) currency = 'EUR';
    if (/tnd|dnt/i.test(s)) currency = 'TND';

    var cleaned = s.replace(/[^0-9,\.\s-]/g, '');//Nettoyer le texte
    
    cleaned = cleaned.trim();
    // seperation des milliere 
    if (cleaned.indexOf('.') !== -1 && cleaned.indexOf(',') !== -1) {
        cleaned = cleaned.replace(/\./g, '');
        cleaned = cleaned.replace(/,/g, '.');
    } else if (cleaned.indexOf(',') !== -1) {
        
        cleaned = cleaned.replace(/,/g, '.');
    } else if (cleaned.indexOf('.') !== -1) {
        //Le code vérifie si le point est un séparateur de milliers
        if (/\.\d{3}$/.test(cleaned) || /\d+\.\d{3}(\.\d{3})*$/.test(cleaned)) {
            cleaned = cleaned.replace(/\./g, '');
        }
        
    }
    
    cleaned = cleaned.replace(/\s+/g, '');// Supprimer les espaces entre chiffres

    var val = parseFloat(cleaned);
    if (isNaN(val)) return { value: null, currency: currency };// Vérifier si le nombre est valide
    return { value: val, currency: currency };
}

// cette fonction permett de trouvez les bouton achetez 
function annotateBuyButtons() {
    try {
        // chercher 3ala haja fil htlm
        var buttons = document.querySelectorAll('button[onclick*="ajouterProduitPanier("]');
        buttons.forEach(function(btn) {// parcourir liste ili inti 3mitha fi star ili 9ablou
            try {
                // If button already has data-price, skip
                if (btn.getAttribute('data-price')) return;// recupere un valeur de attribit
                // chercher le prix dans la ligne du tableau
                // .closest til9a ancetre
                var row = btn.closest('tr');
                var priceStr = null;
                var currency = '€';
                if (row) {
                    var cur = row.querySelector('.current-price') || row.querySelector('.product-price');
                    if (cur) priceStr = cur.textContent || cur.innerText;
                }
                if (!priceStr) {
                    var item = btn.closest('.product-item');
                    if (item) {
                        var priceEl = item.querySelector('.price');
                        if (priceEl) priceStr = priceEl.textContent || priceEl.innerText;
                    }
                }
                if (!priceStr) {
                    var section = btn.closest('section');
                    if (section) {
                        var tag = section.querySelector('.price-tag');
                        if (tag) priceStr = tag.textContent || tag.innerText;
                    }
                }
                if (priceStr) {
                    var parsed = parsePriceString(priceStr);
                    // t5abih prix
                    if (parsed && parsed.value !== null) {
                        btn.setAttribute('data-price', parsed.value);
                        btn.setAttribute('data-currency', parsed.currency || '€');
                        
                        btn.setAttribute('data-price-str', (priceStr || '').trim());
                    }
                }
            } catch (e) { /* ignore */ }
        });
    } catch (e) { console.warn('Erreur annotateBuyButtons', e); }
}



function chargerMeteo() {
    var xhr = creerXHR();
    // Définir ce qu’on fait quand la réponse arrive
    if (xhr) {
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var meteo = JSON.parse(xhr.responseText);
                afficherMeteo(meteo);
            }
        };
        
       // Définir l’URL de l’API
        var ville = "Tunis";
        var cleAPI = "b6907d289e10d714a6e88b30761fae22"; 
        var url = "https://api.openweathermap.org/data/2.5/weather?q=" + ville + "&appid=" + cleAPI + "&units=metric&lang=fr";
        
        xhr.open("GET", url, true);
        xhr.send(null);
    }
}

// partie no client
function chargerUtilisateurs() {
    var xhr = creerXHR();
    
    if (xhr) {
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var utilisateurs = JSON.parse(xhr.responseText);
                afficherUtilisateurs(utilisateurs);
            }
        };
        
        // API Random User (gratuite)
        xhr.open("GET", "https://randomuser.me/api/?results=4", true);
        xhr.send(null);
    }
}
// ba3d m54ina donnee mich na3mlou img 3lihoum
function afficherUtilisateurs(donnees) {
    var conteneur = document.getElementById("utilisateurs-container");
    
    if (conteneur && donnees.results) {
        conteneur.innerHTML = "<h3><i class='fas fa-users'></i> Nos clients satisfaits</h3>";
        
        for (var i = 0; i < donnees.results.length; i++) {
            var user = donnees.results[i];
            var nom = user.name.first + " " + user.name.last;
            var ville = user.location.city;
            var photo = user.picture.medium;
            
            var div = document.createElement("div");
            div.className = "client-card";
            div.innerHTML = `
                <img src="${photo}" alt="${nom}" width="60" height="60" style="border-radius:50%;">
                <p><strong>${nom}</strong></p>
                <p>${ville}</p>
            `;
            
            conteneur.appendChild(div);
        }
    }
}
// ili 54inehoum min bar de recherche 
function chargerProduitsAPI() {
    var xhr = creerXHR();
    
    if (xhr) {
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var produits = JSON.parse(xhr.responseText);
                afficherProduitsAPI(produits);
            }
        };
        
        // JSONPlaceholder pour produits fictifs
        xhr.open("GET", "https://jsonplaceholder.typicode.com/photos?_limit=8", true);
        xhr.send(null);
    }
}


function afficherHeureAPI() {
    var xhr = creerXHR();
    
    if (xhr) {
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                try {
                    if (xhr.status == 200) {
                        var timeData = JSON.parse(xhr.responseText);
                        // worldtimeapi.org returns a 'datetime' string we can parse
                        var date = new Date(timeData.datetime || timeData.date);

                        var options = { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                        };

                        document.getElementById("heure-api").innerHTML = 
                            "<p><i class='fas fa-clock'></i> " + date.toLocaleDateString('fr-FR', options) + "</p>";
                    } else {
                        // si l'API distante ne répond pas, on utilisera l'heure locale
                        afficherHeureLocale();
                    }
                } catch (e) {
                    afficherHeureLocale();
                }
            }
        };

        // Utiliser une API HTTPS (worldtimeapi) pour éviter les problèmes de mixed-content
        xhr.open("GET", "https://worldtimeapi.org/api/timezone/Africa/Tunis", true);
        xhr.send(null);
    }
}

// Afficher l'heure locale en format français — utilisée comme fallback et mise à jour locale
function afficherHeureLocale() {
    var now = new Date();
    var options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    var elem = document.getElementById("heure-api");
    if (elem) {
        elem.innerHTML = "<p><i class='fas fa-clock'></i> " + now.toLocaleDateString('fr-FR', options) + "</p>";
    }
}

// Afficher la météo reçue depuis OpenWeather et l'afficher dans #meteo-info
function afficherMeteo(meteo) {
    try {
        var elem = document.getElementById('meteo-info');
        if (!elem) return;
        var temp = (meteo && meteo.main && typeof meteo.main.temp !== 'undefined') ? Math.round(meteo.main.temp) + '°C' : '--';
        var desc = (meteo && meteo.weather && meteo.weather[0] && meteo.weather[0].description) ? meteo.weather[0].description : '';
        var name = meteo && meteo.name ? meteo.name : '';
        elem.innerHTML = "<div><strong>" + (name ? name + ': ' : '') + temp + "</strong><div style='font-size:0.9rem;color:#666'>" + desc + "</div></div>";
    } catch (e) { console.warn('afficherMeteo error', e); }
}

// Récupérer et afficher l'IP publique dans #ip-info
function afficherIP() {
    var xhr = creerXHR();
    if (!xhr) return;
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            try {
                if (xhr.status == 200 || xhr.status == 0) {
                    var data = JSON.parse(xhr.responseText);
                    var ip = data.ip || data.address || data.ipv4 || '';
                    var elem = document.getElementById('ip-info');
                    if (elem) elem.textContent = ip ? 'IP: ' + ip : '';
                }
            } catch (e) { /* ignore */ }
        }
    };
    xhr.open('GET', 'https://api.ipify.org?format=json', true);
    xhr.send(null);
}


// he4i tihsib les prix
// Tableau qui va contenir tous les produits ajoutés au panier
var panier = [];

// Fonction appelée quand on clique sur "Ajouter au panier"
function ajouterProduitPanier(idProduit, btnElem) {

    // Variable pour stocker le prix du produit
    var prix = null;

    // Devise par défaut : dinar tunisien
    var currency = 'TND';

    // Priorité 1 : récupérer le prix depuis l'attribut data-price du bouton
    try {
        // Vérifier que le bouton existe et supporte getAttribute
        if (btnElem && btnElem.getAttribute) {

            // Lire l'attribut data-price
            var dataPrix = btnElem.getAttribute('data-price');

            // Si l'attribut existe
            if (dataPrix) {
                // Convertir le prix en nombre (float)
                prix = parseFloat(dataPrix);
            }
        }

        // Si le prix n'a pas encore été trouvé ou est invalide
        // On cherche le prix dans le DOM (HTML)
        if ((prix === null || isNaN(prix)) && btnElem && btnElem.closest) {

            // 🔹 Cas 1 : le bouton est dans une ligne de tableau (<tr>)
            var row = btnElem.closest('tr');
            if (row) {

                // Chercher un élément avec la classe current-price
                var cur = row.querySelector('.current-price');

                // Sinon chercher product-price
                if (!cur) cur = row.querySelector('.product-price');

                // Si un prix est trouvé
                if (cur) {
                    // Analyser le texte du prix (ex: "120 TND")
                    var parsed = parsePriceString(cur.textContent || cur.innerText);

                    if (parsed && parsed.value !== null) {
                        prix = parsed.value;

                        // Si la devise est trouvée (TND, EUR...)
                        if (parsed.currency) currency = parsed.currency;
                    }
                }
            }

            // 🔹 Cas 2 : produit affiché sous forme de carte (grid)
            var item = btnElem.closest('.product-item');
            if ((prix === null || isNaN(prix)) && item) {

                // Chercher l'élément contenant le prix
                var priceEl = item.querySelector('.price');

                if (priceEl) {
                    var parsed2 = parsePriceString(priceEl.textContent || priceEl.innerText);

                    if (parsed2 && parsed2.value !== null) {
                        prix = parsed2.value;
                        if (parsed2.currency) currency = parsed2.currency;
                    }
                }
            }

            // 🔹 Cas 3 : autre section (décoration, promo, etc.)
            if ((prix === null || isNaN(prix)) && btnElem) {

                // Chercher la section parente
                var tag = btnElem.closest('section');
                if (tag) {

                    // Chercher un prix avec la classe price-tag
                    var priceEl2 = tag.querySelector('.price-tag');

                    if (priceEl2) {
                        var parsed3 = parsePriceString(priceEl2.textContent || priceEl2.innerText);

                        if (parsed3 && parsed3.value !== null) {
                            prix = parsed3.value;
                            if (parsed3.currency) currency = parsed3.currency;
                        }
                    }
                }
            }
        }

    } catch (e) {
        // En cas d'erreur lors de la récupération du prix
        console.warn('Erreur récupération prix:', e);
    }

    // Si aucun prix n'a été trouvé → prix aléatoire (fallback)
    if (prix === null || isNaN(prix)) {
        prix = Math.floor(Math.random() * 500) + 50;
    }

    // Nom du produit par défaut
    var nomProduit = "Produit " + idProduit;

    try {
        if (btnElem && btnElem.closest) {

            // 🔹 Cas tableau
            var row = btnElem.closest('tr');
            if (row) {
                var nameEl = row.querySelector('.product-name');
                if (nameEl && nameEl.textContent)
                    nomProduit = nameEl.textContent.trim();

            } else {

                // 🔹 Cas carte produit
                var item = btnElem.closest('.product-item');
                if (item) {
                    var nameEl2 = item.querySelector('h3');
                    if (nameEl2 && nameEl2.textContent)
                        nomProduit = nameEl2.textContent.trim();

                } else {

                    // 🔹 Cas API ou autre affichage
                    var parentDiv = btnElem.closest('.produit-api');
                    if (parentDiv) {
                        var pTitle = parentDiv.querySelector('p');
                        if (pTitle && pTitle.textContent)
                            nomProduit = pTitle.textContent.trim();
                    }
                }
            }
        }
    } catch (e) {
        console.warn('Erreur récupération nom:', e);
    }

    // Récupération de la devise depuis data-currency (si existe)
    try {
        if (btnElem && btnElem.getAttribute) {
            var dataCurrency = btnElem.getAttribute('data-currency');
            if (dataCurrency) currency = dataCurrency;
        }
    } catch (e) {}

    // Conversion du prix en euro
    var prixEur = null;
    try {
        prixEur = convertToEur(parseFloat(prix), currency);
    } catch (e) {
        prixEur = null;
    }

    // Création de l'objet produit à stocker dans le panier
    var produit = {
        id: idProduit,      // identifiant du produit
        nom: nomProduit,    // nom du produit
        prix: prix,         // prix original
        devise: currency,   // devise (TND, EUR...)
        prixEur: prixEur,   // prix converti en euro
        originalPriceStr: null
    };

    // Ajouter le produit dans le tableau panier
    panier.push(produit);

    // Mettre à jour l'affichage du panier (total, compteur, etc.)
    mettreAJourPanier();

    // Nom à afficher : soit le nom réel, soit un nom par défaut
    var displayName = produit.nom || ('Produit ' + produit.id);

    // Récupération du prix original formaté (ex: "120 TND")
    var originalStr = null;
    try {
        originalStr = (btnElem && btnElem.getAttribute && btnElem.getAttribute('data-price-str'))
            ? btnElem.getAttribute('data-price-str')
            : null;
    } catch (e) {
        originalStr = null;
    }

    if (!originalStr && produit.prix && produit.devise) {
        try {
            originalStr = formatCurrency(produit.prix, produit.devise);
        } catch (e) {
            originalStr = produit.prix + ' ' + produit.devise;
        }
    }

    produit.originalPriceStr = originalStr;

    // Si le prix en euro est valide, on le formate
    var eurDisplay = (produit.prixEur !== null && !isNaN(produit.prixEur))
        ? formatCurrency(produit.prixEur, 'EUR')
        : null;

    // Construction du message d'alerte
    var alertText = "Produit ajouté au panier : " + displayName + " — " + (originalStr || (produit.prix + ' ' + produit.devise));
    if (eurDisplay) alertText += "  (≈ " + eurDisplay + ")";

    // Afficher l'alerte à l'utilisateur
    alert(alertText);
}



// ta3mil mise a jour du panier
function mettreAJourPanier() {
    var compteur = document.getElementById("compteur-panier");
    var totalElem = document.getElementById("total-panier");
    
    if (compteur) {
        compteur.textContent = panier.length;
        compteur.style.display = panier.length > 0 ? "inline-block" : "none";
    }
    
    if (totalElem) {
        // Compute totals: both in TND (original) and EUR (converted)
        var totalEur = 0;
        var totalTnd = 0;
        var hasEur = false;
        var hasTnd = false;
        for (var i = 0; i < panier.length; i++) {
            var p = panier[i];
            // Original currency totals
            if (p.devise && p.devise.toUpperCase() === 'TND') {
                totalTnd += parseFloat(p.prix) || 0;
                hasTnd = true;
            }
            // EUR totals based on stored prixEur or conversion
            var e = null;
            if (typeof p.prixEur !== 'undefined' && p.prixEur !== null && !isNaN(p.prixEur)) {
                e = parseFloat(p.prixEur);
            } else if (p.prix) {
                e = convertToEur(parseFloat(p.prix), p.devise || 'TND');
            }
            if (e !== null && !isNaN(e)) {
                totalEur += e;
                hasEur = true;
            }
        }
        var parts = [];
        if (hasTnd) parts.push(formatCurrency(Math.round(totalTnd * 100) / 100, 'TND'));
        if (hasEur) parts.push(formatCurrency(Math.round(totalEur * 100) / 100, 'EUR'));
        totalElem.innerHTML = "<strong>Total: " + (parts.length ? parts.join(' / ') : '--') + "</strong>";
    }
}

function formatCurrency(amount, currency) {
    try {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: currency }).format(amount);
    } catch (e) {
        return amount + ' ' + currency;
    }
}



function initialiserFormulaire() {
    var formulaire = document.getElementById("form-contact");
    
    if (formulaire) {
        formulaire.onsubmit = function(e) {
            e.preventDefault();
            
            var nom = document.getElementById("nom").value;
            var email = document.getElementById("email").value;
            var message = document.getElementById("message").value;
            
            if (!nom || !email || !message) {
                alert("Veuillez remplir tous les champs !");
                return false;
            }
                var nomTrim = nom.trim();
                var emailTrim = email.trim();
                var messageTrim = message.trim();

                console.log('[form-contact] valeurs:', { nom: nom, email: email, message: message });

                if (!nomTrim || !emailTrim || !messageTrim) {
                    alert("Veuillez remplir tous les champs !");
                    return false;
                }

                // Validation basique de l'email
                var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(emailTrim)) {
                    alert("Veuillez saisir une adresse e-mail valide.");
                    return false;
                }
            
            // Simuler l'envoi à une API
                simulerEnvoiAPI(nomTrim, emailTrim, messageTrim);
            
            return false;
        };
    }
}

function simulerEnvoiAPI(nom, email, message) {
    var xhr = creerXHR();
    
    if (xhr) {
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                // Certains environnements locaux renvoient status 0 (file://), considérer comme succès pour simulation
                if (xhr.status == 200 || xhr.status == 0) {
                    alert("Merci " + nom + " ! Votre message a été envoyé.");
                    var formElem = document.getElementById("form-contact");
                    if (formElem) {
                        formElem.reset();
                    }
                    // Afficher confirmation
                    var conf = document.getElementById("confirmation");
                    if (conf) {
                        conf.innerHTML = 
                            "<div style='background:#d4edda; color:#155724; padding:10px; border-radius:4px; margin-top:10px;'>" +
                            "<i class='fas fa-check-circle'></i> Message envoyé avec succès !</div>";
                    }
                } else {
                    // En mode développement local, afficher un message d'erreur plus informatif
                    alert("Erreur technique. Veuillez réessayer. (statut XHR: " + xhr.status + ")");
                }
            }
        };
        
        // Simuler un délai de traitement
        setTimeout(function() {
            xhr.open("POST", "#", true);
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.send("nom=" + encodeURIComponent(nom) + "&email=" + encodeURIComponent(email) + "&message=" + encodeURIComponent(message));
        }, 1000);
    }
}


// 9. RECHERCHE AVEC API FAKE STORE

// Initialiser la recherche en temps réel il fil aycone 
function initialiserRechercheAPI() {
    var inputRecherche = document.getElementById("recherche-api");
    
    if (inputRecherche) {
        inputRecherche.onkeyup = function() {
            var terme = this.value;
            
            if (terme.length >= 2) {
                rechercherProduitsAPI(terme);
            } else {
                document.getElementById("resultats-api").style.display = "none";
            }
        };
    }
}
// t3abihoum bil api
function rechercherProduitsAPI(terme) {
    var xhr = creerXHR();
    
    if (xhr) {
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var produits = JSON.parse(xhr.responseText);
                afficherResultatsAPI(produits, terme);
            }
        };
        
        // Fake Store API
        xhr.open("GET", "https://fakestoreapi.com/products", true);
        xhr.send(null);
    }
}

// Fonction qui affiche les résultats de recherche venant de l’API
function afficherResultatsAPI(produits, terme) {

    // Récupérer le conteneur HTML où afficher les résultats
    var conteneur = document.getElementById("resultats-api");
    
    // Vérifier que le conteneur existe
    if (conteneur) {

        // Vider les anciens résultats
        conteneur.innerHTML = "";

        // Cacher le conteneur par défaut
        conteneur.style.display = "none";
        
        // Tableau pour stocker les produits filtrés
        var resultats = [];
        
        // Parcourir tous les produits reçus de l’API
        for (var i = 0; i < produits.length; i++) {

            // Vérifier si le titre du produit contient le terme recherché
            if (produits[i].title.toLowerCase().includes(terme.toLowerCase())) {

                // Ajouter le produit aux résultats
                resultats.push(produits[i]);
            }
        }
        
        // Si au moins un produit correspond à la recherche
        if (resultats.length > 0) {

            // Ajouter un titre au conteneur
            conteneur.innerHTML = "<h4>Résultats de recherche:</h4>";
            
            // Limiter l’affichage à 5 résultats maximum
            for (var j = 0; j < Math.min(resultats.length, 5); j++) {

                // Produit courant
                var produit = resultats[j];

                // Créer une div pour un résultat
                var div = document.createElement("div");

                // Ajouter une classe CSS
                div.className = "resultat-api";

                // Action lors du clic sur un résultat
                div.onclick = function() {
                    alert(
                        "Produit sélectionné: " +
                        this.getAttribute("data-titre")
                    );
                };

                // Stocker le titre du produit dans un attribut HTML
                div.setAttribute("data-titre", produit.title);

                // Contenu HTML du résultat (image, titre, prix)
                div.innerHTML = `
                    <img src="${produit.image}" width="30" height="30">
                    <span>${produit.title.substring(0, 30)}...</span>
                    <span style="color:#890707; font-weight:bold;">
                        ${produit.price}€
                    </span>
                `;

                // Ajouter le résultat au conteneur
                conteneur.appendChild(div);
            }
            
            // Afficher le conteneur des résultats
            conteneur.style.display = "block";
        }
    }
}



// 10. CHARGEMENT DES DONNÉES AU DÉMARRAGE


function initialiserPage() {

    // Charger toutes les APIs
    chargerMeteo();
    chargerUtilisateurs();
    chargerProduitsAPI();
    afficherIP();
    afficherHeureAPI();
    
    // Initialiser les fonctionnalités
    initialiserFormulaire();
    initialiserRechercheAPI();
    // Annoter les boutons "Acheter" (cherche prix/devise et ajoute data-* utiles)
    annotateBuyButtons();
    
    // Actualiser la météo toutes les 5 minutes
    setInterval(chargerMeteo, 300000);
    
    // Afficher l'heure via l'API au chargement puis mettre à jour localement chaque seconde
    // Afficher l'heure locale tout de suite, puis mettre à jour chaque seconde
    afficherHeureLocale();
    afficherHeureAPI();
    setInterval(afficherHeureLocale, 1000);
    
    console.log("VELVET - Page initialisée avec AJAX et APIs");
}

// Démarrer quand la page est chargée
window.onload = initialiserPage;