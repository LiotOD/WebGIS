maptilersdk.config.apiKey = 'fJIJM9u7ZdZQhJMMXzg7';

// créer la variable de la carte

const map = new maptilersdk.Map({
  container: 'map', // container's id or the HTML element to render the map
  style: maptilersdk.MapStyle.STREETS,
  center: [2.433333, 6.366667], // starting position [lng, lat]
  zoom: 12, // starting zoom
});

// ajouter le gestionnaire d'évènement qui contient tout ce qui a rapport avec le chargement de la carte, les events, les données, la symbologie etc.

map.on('load', async function() {

   // ajouter une couche de tuile vectorielle stockée sur le cloud mapTiler
    const image = await map.loadImage('img/city_hall.png');

    map.addImage('city_hall', image.data);

    map.addSource('arrondissements', {
      type: 'vector',
      url: "https://api.maptiler.com/tiles/8395fded-62fb-4703-866e-c8f7418d8188/tiles.json?key=fJIJM9u7ZdZQhJMMXzg7"
    });

    map.addLayer({
      'id': 'arrondissements_id',
      'type': 'symbol',
      'source': 'arrondissements',
      'source-layer': 'arrond',
      'layout': {
        'icon-image': 'city_hall',
        'icon-size': 0.03
      },
      'paint': {}
    });

  // ajouter une couche vectorielle ponctuelle geojson stockée en local avec une symbologie classique (ici circulaire)

  map.addSource('urgences', {
    type: 'geojson',
    data: 'data/poste_police.geojson'
  });

  map.addLayer({
    "id": "urgences_id",
    "source": "urgences",
    'type': 'circle',
    'paint': {
        'circle-radius': 3,
        'circle-color': '#ffffff',
        'circle-stroke-color': '#f53f02',
        'circle-stroke-width': 1.2
    }
  });

   // ajouter une couche vectorielle ponctuelle geojson stockée en local avec une symbologie en symbole

   const imageCentreSante = await map.loadImage('img/centre_sante_2.png');

    map.addImage('icone_cs', imageCentreSante.data);

    map.addSource('csante', {
      type: 'geojson',
      data: "data/centre_sante.geojson"
    });

    map.addLayer({
      'id': 'csante_id',
      'type': 'symbol',
      'source': 'csante',
      'layout': {
        'icon-image': 'icone_cs',
        'icon-size': 0.05
      },
      'paint': {}
    });

    // ajouter une couche vectorielle linéaire geojson stockée en local avec une symbologie basique

    map.addSource('contours', {
      type: 'geojson',
      data: 'data/contours_ligne.geojson'
    });

    map.addLayer({
      'id': 'contours_id',
      'type' : 'line',
      'source': 'contours',
      'paint': {
        'line-color': '#1e347d',
        'line-width' : 0.8,
        'line-opacity': 0.6
      }
    });

    // ajouter une couche vectorielle polygonale geojson stockée en local avec une symbologie unique

    map.addSource('parcs',{
      type: 'geojson',
      data: 'data/parcs.geojson'
    });

    map.addLayer({
      'id':'parcs_id',
      'type': 'fill',
      'source': 'parcs',
      'paint':{
          'fill-color': '#52a851',
          'fill-opacity': 0.8,
          'fill-outline-color': '#185717',
      }

    });


    /*Evènements et comportement du curseur sur plusieurs couches */

    /* 1- Couche urgences avec ID urgences_id */
    
    // 1-1- Evènement Click : afficher des popup quand on clic sur une entité de cette couche 

    map.on('click' /*le type d'évènement*/, 
          'urgences_id' /* ID de la couche concernée*/, 
           function (e) {// fonction de rappel (callback) qui permet de gérer des évènements
                        // le e est un écouteur d'évènements
                var coordinates = e.features[0].geometry.coordinates.slice();
                    /*
                      e. => l'écouteur d'évènement
                      features => la liste des entités si c'est un geojson, voir la structure d'un fichier geojson
                      features[0]. => récupérer la première entité sur laquelle il y a un clic
                      geometry.coordinates. => récupère les coordonnées de l'entité à partir de sa géométrie contenue dans le fichier geojson (voir structure d'un fichier geojson)
                              "geometry": { 
                                  "type": "Point", 
                                  "coordinates": [ 2.4501372, 6.3773535 ] => c'est cette info qui est récupérée
                              }  
                      slice() => fonction de Js qui permet de copier un tableau ou une liste sans modifier l'original
                    */
                var nom = e.features[0].properties.name; // ici je récupère l'info stockée dans le champ name (voir structure d'un ficher geojson)
                                                          /*     "properties": { 
                                                                        "osm_id": 3874525205,
                                                                        "name": "Direction de la Police Municipale", 
                                                                      }, 
                                                          */

                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                  coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }

                      /*
                          Ce bloc de code s'assure que le popup apparaît correctement, même si la carte est zoomée au point où 
                          plusieurs copies de l'entité sont visibles (par exemple, en cas de répétition de l'entité sur le globe).
                          Math.abs(e.lngLat.lng - coordinates[0]) > 180: Vérifie si la différence de longitude entre la position du clic (e.lngLat.lng) 
                          et les coordonnées de l'entité est supérieure à 180 degrés. Cela peut arriver avec des cartes mondiales qui se répètent horizontalement.
                          Si c'est le cas, il ajuste les coordonnées de longitude de l'entité en ajoutant ou soustrayant 360 degrés pour que le popup s'affiche 
                          sur la copie la plus proche de l'entité sous le curseur. 
                      */

              new maptilersdk.Popup() // création d'un popup
                  .setLngLat(coordinates) //définir la position du popup en récupérant la valeur de la variable coordinates crée
                  .setHTML(nom) // dans le contenu html du popup insérer l'info voulue ex: nom
                  .addTo(map); // ajouter le popup à la carte

            }
    );

    // 1-2- Evènement s'approcher d'une entité de la couche avec le curseur de la souris 

    map.on('mouseenter', 'urgences_id', function () {
        map.getCanvas().style.cursor = 'pointer'; // affecter un style de pointeur à la souris
    });

    // 1-3- Evènement s'éloigner d'une entité de la couche avec le curseur de la souris 
    map.on('mouseleave', 'urgences_id', function () {
        map.getCanvas().style.cursor = ''; // revenir au style par défaut
    });



    /*2- Couche arrondissements qui a l'identifiant 'arrondissements_id'*/

    // 2-1- Créer le popup
    var popupArrondissements = new maptilersdk.Popup({
      closeButton: false,
      closeOnClick: false
    });

    // 2-2- Evènement s'approcher ou survol d'une entité de la couche avec le curseur de la souris 

    map.on('mouseenter', 'arrondissements_id', function(e) {
          map.getCanvas().style.cursor = 'pointer';

          var coordinates = e.features[0].geometry.coordinates.slice(); // récupérer les coordonnées

          var nom = e.features[0].properties.nom_loc; // récupérer le nom de l'Arrondissement
          
          var population = e.features[0].properties.population; // récupérer l'effectif de la population de l'Arrondissement

          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }

          popupArrondissements
            .setLngLat(coordinates)
            .setHTML(
                    '<h3>'+ "Nom : " + nom + '</h3>' + // on mets la valeur du nom défini précédemment dans une balise de titre 3 avec un préfixe
                    '<h3>'+ "Pop : " + population + '<span style="font-size: smaller;"> ' + " Habitants"+ '</span>' + '</h3>' + 
                    // on mets la valeur de la population définie précédemment dans une balise de titre 3 et on ajoute le suffixe habitants    
                    '<p>'+ "Source : RGPH4, 2013, INSTAD" + '</p>' // on ajoute une source

            )
            .addTo(map);

    });

    // 2-3- Evènement s'éloigner d'une entité de la couche avec le curseur de la souris 

    map.on('mouseleave', 'arrondissements_id', function(e) {
      map.getCanvas().style.cursor = ''; // le curseur repasse au style par défaut
      popupArrondissements.remove() // enlever le popup 

    });

  /* 3- Couche parcs avec ID parcs_id */
 
  // 3-1- Créer le popup

  var PopupParcs = new maptilersdk.Popup({
    closeButton: false,
    closeOnClick: false
  })


  // 3-2 Ajouter l'évènement quand on s'approche d'une entité mais avec une condition qui affiche les photos quand l'url a une valeur 

  map.on('mouseenter', 'parcs_id', function(e){

    map.getCanvas().style.cursor = 'pointer'; // affecter un style de pointeur à la souris

    var name = e.features[0].properties.name; // Récupérer le nom

    var photoUrl = e.features[0].properties.photo; // récupérer l'url de la photo depuis l'attribut qui le stocke

    var contenu = '<h4 class="popup-titre">' + name + '</h4>'; // le contenu à afficher dans la popup

    // condition qui affiche les photos quand l'url a une valeur 

    if(photoUrl) { // si l'attribut photoUrl existe

      contenu += '<img src="' + photoUrl + '" alt="' + name + '" class="popup-photo">';

    }


    PopupParcs
      .setLngLat(e.lngLat)
      .setHTML(contenu) // Texte à afficher en récupérant la valeur de la variable contenu
      .addTo(map);
  });

  map.on('mouseleave', 'parcs_id', function(e){
    map.getCanvas().style.cursor= ''; // revenir au style par défaut
    PopupParcs.remove(); // enlever le popup 
  })



  // Ajouter une échelle

  const scale = new maptilersdk.ScaleControl({ // nouveau contrôle d'échelle
    maxWidth: 80, // Longueur maximale du contrôle d'échelle en pixels.
    unit: 'metric' // Unité de distance ( 'impérial' , 'métrique' ou 'nautique' ).
  });
  map.addControl(scale); // ajouter l'échelle définie


  // Ajouter un logo
  const logo = new maptilersdk.MaptilerLogoControl({ // ajouter le controle
    logoURL: "img/logo_rouge.svg", // chemin ou adresse
    linkURL: "https://www.ltodome.com" // l'adresse où aller quand on clic sur le lien
  });
  map.addControl(logo, 'bottom-right'); // position 

  // Ajouter un bouton pour passer en 3D
  const terrain3d = new maptilersdk.MaptilerTerrainControl(); // ajouter le controle
  map.addControl(terrain3d, 'top-left'); //position



});

// ajouter tout ce qui est en dehors par exemple le comportement de la barre de recherche

// Fonction utilitaire pour normaliser les chaînes et supprimer les accents
function normalizeString(str) { // créer la fonction qui prendra en argument str
  return str // renvoie la valeur str
    .normalize("NFD") // Normalise la chaîne en utilisant la forme de décomposition canonique
                      // La méthode .normalize("NFD") décompose les caractères accentués en leurs composants de base. Par exemple, "é" devient "e" + "́" (lettre et accent séparés).
    .replace(/[\u0300-\u036f]/g, "") // Suppression des accents : L'expression régulière /[\u0300-\u036f]/g recherche tous les caractères de diacritiques dans la chaîne (accents) 
                                    // et les remplace par une chaîne vide (""). Cela supprime les accents.
    .toLowerCase(); // Convertit la chaîne en minuscules
}

// Fonction pour calculer le centroïde d'un polygone
function centroidPolygon(coordinates) {
  let sumX = 0, sumY = 0, numPoints = 0;

  // Les coordonnées[0] contient le contour extérieur du polygone
  coordinates[0].forEach(coord => {
    sumX += coord[0];
    sumY += coord[1];
    numPoints++;
  });

  const centerX = sumX / numPoints;
  const centerY = sumY / numPoints;

  return [centerX, centerY];
}



// Écouteur d'événements pour la barre de recherche

document.getElementById('search-input').addEventListener('input', function(e) {
  
    /*            
          * Structure de la syntaxe *
            document
                  .getElementById('search-input') // sélectionner l'élément html en faisant attention à l'ID qui doit correspondre
                  .addEventListener('input', function(e) { // ajouter un écouteur d'évènement qui prend 
                                    // l'évènement 'input' => chaque fois que quelque chose est tapé dans la barre de recherche
                                            //la fonction de rappel

    */

  var searchQuery = normalizeString(e.target.value); // Utilise la fonction normalizeString
             /*
              * Structure de la syntaxe *                  
                  searchQuery // variable pour stocker la valeur tapée par l'utilisateur
                    normalizeString // on fait appelle à la fonction de normalisation qui transforme l'argument e.target.value en une valeur normalisée selon les indications définies dans la fonction
                    e.target.value // Accède à la valeur actuelle du champ de recherche (ce que l'utilisateur a tapé).
                    
            */


  // Accède aux données de la source GeoJSON
  var features = map.querySourceFeatures('parcs', { // Récupère les entités (features) de la source nommée 'parcs' précédemment chargée et de la couche source 'parcs_id'.
    sourceLayer: 'parcs_id' // prendre l'ID de la couche à utiliser
  });
        /*
              * Structure de la syntaxe *                
                  map.querySourceFeatures //  C'est une méthode de Maptiler qui permet d'intérroger les entités
                                            sous la forme  map.querySourceFeatures(source, [options]) : voir => https://docs.maptiler.com/sdk-js/api/map/#map#querysourcefeatures
                      sourceLayer: 'ID de la couche concernée' //                     
            */

 
// Boucle sur les entités pour trouver celles qui correspondent à la recherche
    features.forEach(function(feature) { // .forEach est une méthode de Js qui est utilisée pour itérer sur chaque entité récupérée (feature) dans le tableau features.
        var name = normalizeString(feature.properties.name); // Utilise la fonction normalizeString sur l'attribut name récupérée avec feature.properties.name
                      // Cela va faciliter la comparaison entre ce que l'utilisateur écrit et la valeur de l'attribut name de l'entité (pas de soucis d'accents des deux côtés)   
                      
        var osmId = feature.properties.osm_id; // Récupèrer l'ID unique OSM


        if (name.includes(searchQuery) && osmId !== undefined) {// .include est une méthode JS qui  permet de vérifier si une chaîne de caractères contient une autre chaîne de caractères.
              // donc ici on va vérifier si dans la valeur de l'attribut name qu'on a stocké sous la variable name contient (seachQuery) c'est à dire ce que l'utilisateur a tapé et qu'on a normalisé et 
              // stocké plus haut sous la variable searchQuery
              // et on va vérifier qu'on a bien un identifiant unique osm_id qui existe et a une valeur

              // Pour centrer sur une entité c'est plus facile quand c'est un point on zoom juste sur la valeur de coordonnées mais si c'est une ligne ou un polygone c'est différent
              // donc on va créer une variable centerCoordinates qui va stocker la valeur du centroïde en faisant appel à la fonction écrite plus haut qui calcule le centroïde

              let centerCoordinates; // création de la variable

                // Vérifie le type de géométrie pour choisir la bonne méthode de centrage
                if (feature.geometry.type === 'Polygon') { // on regarde dans les infos de la couche le type de géométrie et si c'est un polygone
                  centerCoordinates = centroidPolygon(feature.geometry.coordinates); // à la variable centerCoordinates, j'affecte la valeur du centroïde en faisant appel à la fonction de calcul de centroïde défini sus créé 
                } else if (feature.geometry.type === 'Point') {
                  centerCoordinates = feature.geometry.coordinates; // dans le cas où c'est un point bah je prnds juste les coordonées du point comme centroïde, logique on ne va pas calculer le centröide d'un point
                } 

              if (centerCoordinates) {    // on vérifie si le centroïde existe et a une valeur valide avant de faire un centrage. Comme ça on évite des bugs qui surviendraient en cas de mauvaises valeurs pour la variable centroïdes

                        // Centrer la carte sur l'entité trouvée

                        map.flyTo({ center: centerCoordinates, zoom: 18 }); // c'est une méthode de maptiler qui permet de centrer sur une entité avec un effet de vol vers l'entité 
                        // et on centre sur la valeur du centroide, et on définit l'échelle de zoom voir https://docs.maptiler.com/sdk-js/api/map/#map#flyto
                        // on peut aussi utiliser la méthode .jumpTo https://docs.maptiler.com/sdk-js/api/map/#map#jumpto et affiner les options pour chacune des deux méthodes
              }
              // Optionnel : Ajouter un style pour mettre en évidence l'entité trouvée
              map.setFeatureState(
                // La méthode setFeatureState() est utilisée pour définir un état de survol (hover) à true pour l'entité trouvée, ce qui peut modifier son style (par exemple, changer la couleur ou l'apparence).
                // voir https://docs.maptiler.com/sdk-js/api/map/#map#setfeaturestate
                // on peut définir en amont le style qui est associé à cet etat hover ou selection comme ça on rappelle l'état ici et on le mets à true, ce qui va styler l'entité comme survolée ou sélectionnée
                { source: 'parcs', id: osmId}, // mettre dans la prartie id l'identifiant unique de chaque entité ou la clé primaire si on veut
                { hover: true }
              );
        }        
    });

});

// Réinitialiser l'état de toutes les entités lorsque la recherche est effacée
// Réinitialiser l'état de toutes les entités lorsque la recherche est effacée
document.getElementById('search-input').addEventListener('search', function(e) {
  resetFeatureStates(); // Réinitialiser les états de mise en évidence
});



















