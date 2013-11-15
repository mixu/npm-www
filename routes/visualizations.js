var request = require('request');

function day (s) {
  if (!(s instanceof Date)) {
    if (!Date.parse(s))
      return null
    s = new Date(s)
  }
  return s.toISOString().substr(0, 10)
}

exports.fetchTotalDownloads = function(req, res) {
  var month = Date.now() - (1000 * 60 * 60 * 24 * 31),
      end = new Date(),
      start = new Date(month);

  end.setDate(end.getDate() - 1);

  var params = {
    group_level: 1,
    startkey: JSON.stringify([ day(start) ]),
    endkey: JSON.stringify([ day(end), {} ])
  };

  request({
    url: 'http://isaacs.iriscouch.com/downloads/_design/app/_view/day',
    qs: params,
    json: true
  }, function(err, resp, body) {
    var values = [];

    body.rows.forEach(function(row) {
      values.push({
        date: new Date(row.key[0]).getTime(),
        downloads: row.value
      });
    });

    res.setHeader('Content-type', 'application/json');
    res.end(JSON.stringify(values));
  });
};


