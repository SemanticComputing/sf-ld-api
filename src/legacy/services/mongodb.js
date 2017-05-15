var self = {
  db: null,

  init: function() {
    var self = this;
    var MongoClient = require('mongodb').MongoClient;

    var uri = "mongodb://localhost:27017/sf"

    MongoClient.connect(uri, function(err, db) {
      if (err) {
        throw err;
      }
      else {
        console.log("Connected to MongoDB at " + uri)
        self.db = db;
      }
      /*db.collection('mammals').find().toArray(function(err, result) {
        if (err) {
          throw err;
        }
        console.log(result);
      });*/
    });
  }
};

module.exports = self;
