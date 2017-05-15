(function ($){
  $(document).ready(function() {

    var abbr = [];

    var parseAbstract = function() {
      var splitted = $('.abstract').text().split("\n");
      var newAbstract = "";
      _.each(splitted, function(item) {
        // @TODO: fix letters
        var words = item.split(" ")
        if (abbr[words[0]]) {
          var statuteId = abbr[words[0]][0].split("/")[1]+"/"+abbr[words[0]][0].split("/")[0];
          words.splice(0, 1);
          var numbers = _.filter(words, function(item) {
            return parseInt(item);
          });
          var words = _.filter(words, function(item) {
            return !parseInt(item);
          });
          wordsM = _.map(words, function(item, index) {
            if (item == 'mom') return 'momentti';
            else if (item == '§') return 'pykala';
            else return item;
          })
          var resourceUrl = "/eli/sd/"+statuteId;
          _.each(wordsM, function(item, index) {
            resourceUrl += "/"+item+(numbers[index]?"/"+numbers[index]:"")
          })
          var query = "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n"+
                      "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n"+
                      "PREFIX eli: <http://data.europa.eu/eli/ontology#>\n"+
                      "PREFIX sfl: <http://data.finlex.fi/schema/sfl/>\n"+
                      "SELECT ?v ?t {\n"+
                      "<http://data.finlex.fi"+resourceUrl+"> sfl:hasVersion ?v .\n"+
                      "?v eli:is_realized_by ?e .\n"+
                      "?e eli:language <http://publications.europa.eu/resource/authority/language/FIN> .\n"+
                      "?e eli:is_embodied_by ?f .\n"+
                      "?f sfl:text ?t .\n"+
                    "}\n";
          var url = "http://data.finlex.fi/sparql?query=";
    			url += encodeURIComponent(query);
    			$.ajax({
    				dataType: 'json',
    				url: url,
    				success: function(data) {
              console.log(resourceUrl);
    					//console.log(data.results.bindings[0].t.value);
              newAbstract += "<a href=\""+resourceUrl+"\" title=\""+data.results.bindings[0].t.value+"\">"+item+"</a><br/>"
              $('.abstract').html(newAbstract);
    				}
    			});
          //console.log(url)
        } else {
          newAbstract += item+"\n"
          $('.abstract').html(newAbstract);
        }
      });
    };

    $.get( "/json/abbr.json")
      .done(function( data ) {
        abbr = data;
        console.log(abbr)
        parseAbstract();
      }).fail(function() {
      });

  });
}(jQuery));
