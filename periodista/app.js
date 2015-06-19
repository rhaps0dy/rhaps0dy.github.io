events = [{name: "caso 4F / Cintat Morta", img: "/img/bcntv.jpg", media: "Barcelona TV", text: "El llamado caso 4F es un caso de corrupción policial a raíz de los hechos sucedidos el 4 de febrero de 2006 en Barcelona, cuando la Guardia Urbana detuvo a varios jóvenes, que fueron condenados e ingresaron a prisión por su supuesta relación con la agresión de un agente de la Guardia Urbana durante el desalojo del edificio Palau Alòs, hasta entonces ocupado. Una de ellas, la psicóloga Patricia Heras, se suicidó durante un permiso penitenciario en 2011.1 2. Estamos buscando possibles testimonios que quiera colaborar en documentar el evento"}
         ,{name: "Caso Empresario Raval", img: "/img/elperiodico.jpg", media: "El Periódico", text: "Un hombre de mediana edad ha muerto este miércoles por la tarde en Barcelona después de haber sido reducido y esposado por los Mossos d'Esquadra en la plaza Molina del distrito de Sarrià-Sant Gervasi, según las primeras informaciones facilitadas por el cuerpo de seguridad autonómico.  Estamos buscando testimonios que nos pueden ayudar a saber que pasó. "}
         ,{name: "Ester Quintana", img: "/img/elperiodico.jpg", media: "El Periódico", text: "Ester Quintana és una barcelonina que va perdre un ull per un impacte en la manifestació de Barcelona de la vaga general de 14 de novembre de 2012 i sosté que la seva lesió va ser producte del llançament d'un projectil per part dels Mossos d'Esquadra.  Estem buscant testimonis d'aquest malaurat event."}];
angular.module("journalism", ['ngRoute'])
.config(["$routeProvider", function($routeProvider) {
    $routeProvider.when('/event/:id/', {
        controller: 'eventController',
        templateUrl: 'event.html'
    }).otherwise({ 
        controller: 'eventController',
        templateUrl: 'google-map.html'
    });
}])
.controller("eventController", ["$scope", "$routeParams",
function($scope, $routeParams) {
    var id = parseInt($routeParams.id);
    $scope.eventName = events[id].name;
    $scope.media = events[id].media;
    $scope.text = events[id].text;
    $scope.names = [{name: "Jorge Alemán González", phone: "(+34) 612 345 678", picture: "/img/jorge.jpg"}
                   ,{name: "Adrià Garriga Alonso", phone: "(+34) 612 345 678", picture: "/img/adria.jpg"}
                   ,{name: "Marcel Farrés Franch", phone: "(+34) 612 345 678", picture: "/img/marcel.jpg"}];
}]);
