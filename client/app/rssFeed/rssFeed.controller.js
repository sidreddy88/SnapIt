'use strict';

angular.module('snapItApp')
  .controller('RssCtrl', ['$scope','FeedService', 'FeedList', '$http', '$cookieStore', 'User', 'Auth',
    function ($scope, FeedService, FeedList, $http, $cookieStore, User, Auth){
    $scope.ObjectUrls = {};
    $scope.userEmail = Auth.getUserEmail();

    $scope.addFeedToDatabase = function(feedArray) {
      $http.post('api/things/addFeeds', {feedArray: feedArray, email: $scope.userEmail}).
          success(function(data) {
            console.log(data);
          }).
          error(function(data) {
            console.log(data);
           });
    };
    /*
     when user clicks on the loadUrl button, the users urls are fetched, and the enw url is
     compared to the urls returned from the server. If there is a new url, then it is 
     passed to updateFeed so that a list of feed entries can be populated in the database
    */
    $scope.addUrls = function(url) {
      $scope.feedUrl = ''; 
      $('.feeds').empty();
      
      $http.get('/api/users/me').success(function(user) {
          $scope.returnedUrls = user.rssUrls;
          var found = false;
            for (var i = 0; i < $scope.returnedUrls.length; i++) {
              if (url === $scope.returnedUrls[i]){
                found = true;
               }
              }
         if (!found){
          $scope.updateFeed(url, $scope.userEmail);     
         }
         
       });
    };

    $scope.updateFeed =  function (url, email){

      FeedList.get(url, email)
        .then (function (data) {
          
          $scope.addFeedToDatabase(data.entries); 

        });
    };
   
  }])

    .service('FeedService',['$http',function($http){  
     return { 
        parseFeed: function (url) { 
           return $http.jsonp('https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=5&q=' + url +
           '&callback=JSON_CALLBACK');
         }
      };

  }])

    .service('FeedList', ['$rootScope', 'FeedService', '$q', '$http',
     function ($rootScope, FeedService, $q, $http) {
    var deferred = $q.defer();
    console.log('loading feeds...');



    this.get = function(url, email) {
  
      FeedService.parseFeed(url)
        .then(function(res){
          
        $http.post('api/users/addUrl', {url: url, email:email}).
           success(function(data) {
             console.log(data);
           }).
           error(function(data) {
             console.log(data);
           });
        var feed = res.data.responseData.feed;
        deferred.resolve(feed);

          // feedVar = res.data.responseData.feed;
          // feeds.push(feedVar);
          // console.log(feedVar);
          // deferred.resolve(feeds); 

        });
        // .error(function(response){
        //   console.log("Invalid Url");
        // })                   
        return deferred.promise;
    };
}]);
