angular.module("journalism", ['ngRoute'])
.config(["$routeProvider", function($routeProvider) {
    $routeProvider.when('/event/:id/', {
        controller: 'eventController',
        templateUrl: 'event.html'
    }).otherwise({ 
        redirectTo: '/' 
    });
}])
.controller("eventController", ["$scope", "$routeParams",
function($scope, $routeParams) {
    $scope.eventId = $routeParams.id;
}]);
