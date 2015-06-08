/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /things              ->  index
 * POST    /things              ->  create
 * GET     /things/:id          ->  show
 * PUT     /things/:id          ->  update
 * DELETE  /things/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Thing = require('./thing.model');

// Save from chrome extension snapIt
exports.create = function(req, res) {
  var media, url, title, description;

  var message = new Thing();
  message.mediaType = req.query.mediaType;
  message.media = req.query.media;
  message.url = req.query.url;
  message.title = req.query.title;
  message.description = req.query.description;
  message.email = req.query.emailAddress;
  message.createTime = Date.now();
  message.createDate = new Date();
  message.upVotes = 0;

  message.save(function () {
    res.send(req.body);
    // res.sendFile(__dirname + '/client/assets/images/snapSuccess.png');
  });
};

// This is for the blog list urls, the request passes in an array of 
// articles from a particular blog
exports.createRss = function(req, res) {

  var array = req.body.feedArray;
  var email = req.body.email;
  var sendResponseBack = false;
  var messagesArray = [];

  for (var i = 0; i < array.length; i++) {
    var feedObject = array[i];
    var media, url, title, description;
    var message = {};
    message.mediaType = "rssFeed";
    message.media = "";
    message.url = feedObject.link;
    message.title = feedObject.title;
    message.description = feedObject.contentSnippet;
    message.email = email;
    message.createTime = Date.now();
    message.createDate = new Date();
    messagesArray.push(message);
  
  }
    var onBulkInsert = function(err, myDocuments) {
      if (err) {
        return handleError(res, err); 
      }
      else {
        res.send(200);
        console.log('%userCount users were inserted!', myDocuments.length)
      }
  }
    // does a bulk save on all the array items
    Thing.collection.insert(messagesArray, onBulkInsert);
    
};


// Get list of things
exports.index = function(req, res) {
  Thing.find({email:req.query.email},function (err, things) {
    if(err) { return handleError(res, err); }
    return res.json(200, things);
  });
};

// Get a single thing
exports.show = function(req, res) {
  Thing.findById(req.params.id, function (err, thing) {
    if(err) { return handleError(res, err); }
    if(!thing) { return res.send(404); }
    return res.json(thing);
  });
};


// Updates an existing thing in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Thing.findById(req.params.id, function (err, thing) {
    if (err) { return handleError(res, err); }
    if(!thing) { return res.send(404); }
    var updated = _.merge(thing, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, thing);
    });
  });
};

// Deletes a thing from the DB.
exports.destroy = function(req, res) {
  Thing.findById(req.params.id, function (err, thing) {
    if(err) { return handleError(res, err); }
    if(!thing) { return res.send(404); }
    thing.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}