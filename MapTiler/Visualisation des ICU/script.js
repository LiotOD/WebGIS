maptilersdk.config.apiKey = 'fJIJM9u7ZdZQhJMMXzg7';

const map = new maptilersdk.Map({
  container: 'map', // container's id or the HTML element to render the map
  style: maptilersdk.MapStyle.STREETS,
  center: [2.433333, 6.366667], // starting position [lng, lat]
  zoom: 12, // starting zoom
});

// ajouter le gestionnaire d'évènement

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




});
