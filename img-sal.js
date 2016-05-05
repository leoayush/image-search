'use strict';
var Search = require('bing.search');
module.exports = function(app, History) {

  app.route('/latest')
    // Retrieve most recent searches
    .get(getHistory);

  app.get('/:query', handlePost);

  function handlePost(req, res) {
    var query = req.params.query;
    var size = req.query.offset || 10;
    var search = new Search(process.env.API_KEY);
    var history = {
      "term": query,
      "when": new Date().toLocaleString()
    };
    if (query !== 'favicon.ico') {
      save(history);
    }

    search.images(query, {
        top: size
      },
      function(err, results) {
        if (err) throw err;
        res.send(results.map(makeList));
      }
    );
  }

  function makeList(img) {
    return {
      "url": img.url,
      "snippet": img.title,
      "thumbnail": img.thumbnail.url,
      "context": img.sourceUrl
    };
  }

  function save(obj) {
    var history = new History(obj);
    history.save(function(err, history) {
      if (err) throw err;
      console.log('Saved ' + history);
    });
  }

  function getHistory(req, res) {
    History.find({}, null, {
      "limit": 10,
      "sort": {
        "when": -1
      }
    }, function(err, history) {
      if (err) return console.error(err);
      console.log(history);
      res.send(history.map(function(arg) {
        return {
          term: arg.term,
          when: arg.when
        };
      }));
    });
  }

};