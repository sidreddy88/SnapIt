'use strict';

angular.module('snapItApp')
  .controller('MainCtrl', ['$scope', 'Auth', '$http', 'socket', function ($scope, Auth, $http, socket) {
    // if (!Auth.isLoggedIn()){
    //   $location.path('/login');
    // }

    //$scope.awesomeThings = [];
    debugger;
    $scope.angularGridView = false;
    $scope.boardGridView = true;
    $scope.pics = [];
    $scope.searchTxt = '';
    $scope.searchDate = true;
    $scope.isRSSCollapsed = true;
    $scope.isUploadCollapsed = true;
    $scope.userEmail = Auth.getUserEmail();


    $http.get('/api/things/getItems/?email='+ $scope.userEmail).success(function(pics) {
      $scope.pics = pics;
      socket.syncUpdates('thing', $scope.pics);
      $scope.pics.forEach(function(item){
        item.mediaType = item.mediaType;
        item.media = item.media;
        item.url = item.url;
        item.title = item.title;
        item.description = item.description;
        item.email = item.email;
        item.createDate = item.createDate;

      });

      //sort in ascending order
      $scope.searchDate = false;
      $scope.sortByTime();
    });

    $scope.showImage = function(mediaType) {
      if (mediaType === 'image') {
        return true;
      }
      return false;
    };

    $scope.isSelection = function(mediaType) {
      if (mediaType === 'selection' || mediaType === 'rssFeed') {
        return true;
      }
      return false;
    };

    $scope.isPage = function(mediaType) {
      if (mediaType === 'page') {
        return true;
      }
      return false;
    };

    $scope.isLink = function(mediaType) {
      if (mediaType === 'links') {
        return true;
      }
      return false;
    };

    $scope.isRssFeed = function(mediaType) {
      if (mediaType === 'rssFeed') {
        return true;
      }
      return false;
    };

    $scope.$watch('searchTxt',function(val){
      if (val === '') {
        $http.get('/api/things/getItems?email='+ $scope.userEmail).success(function(pics) {
          $scope.pics = pics;
          socket.syncUpdates('thing', $scope.pics);
          $scope.pics.forEach(function(item){
            item.mediaType = item.mediaType;
            item.media = item.media;
            item.url = item.url;
            item.title = item.title;
            item.description = item.description;
            item.email = item.email;
            item.createDate = item.createDate;

          });

          //sort in ascending order
          $scope.searchDate = false;
          $scope.sortByTime();
        });
      } else {
        $scope.pics = $scope.pics.filter(function(obj){
          return obj.title.toLowerCase().indexOf(val) !== -1;
        });
      }
      
    });

    $scope.sortByLikes = function(){
      $scope.pics.sort(function(a,b){
         return b.likes - a.likes;
      });
    };
    
    $scope.sortByTime = function(){
      if ($scope.searchDate) { //sort in recent first
        $scope.pics.sort(function(a,b){
          return a.createTime - b.createTime; 
        });
      } else { // sort in ascending order
        $scope.pics.sort(function(a,b){
          return b.createTime - a.createTime; 
        });
      }

      $scope.searchDate = !$scope.searchDate;
    };

    $scope.deleteSnapit = function(thing) {
      $http.delete('/api/things/' + thing._id);
    };

    $scope.upVote = function(thing) {
      thing.upVotes++;
    };
    
  }]);
