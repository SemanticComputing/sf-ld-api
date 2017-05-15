var self = {
  // fix fucked up json-ld format property names
  fixGraph: function(graph) {
    var changeKey = function(graph, oldKey, newKey) {
      if (graph.hasOwnProperty(oldKey)) {
        graph[newKey] = graph[oldKey];
        delete graph[oldKey];
      }
      return graph;
    }
    graph = changeKey(graph, "http://data.europa.eu/eli/ontology#title", "title");
    graph = changeKey(graph, "eli:title", "title");
    graph = changeKey(graph, "http://data.finlex.fi/schema/sfl/html", "html");
    graph = changeKey(graph, "sfl:html", "html");
    graph = changeKey(graph, "http://data.finlex.fi/schema/sfl/text", "text");
    graph = changeKey(graph, "sfl:text", "text");
    graph = changeKey(graph, "http://data.finlex.fi/schema/sfl/xml", "xml");
    graph = changeKey(graph, "sfl:xml", "xml");
    graph = changeKey(graph, "http://data.finlex.fi/schema/sfcl/html", "html");
    graph = changeKey(graph, "sfcl:html", "html");
    graph = changeKey(graph, "http://data.finlex.fi/schema/sfcl/text", "text");
    graph = changeKey(graph, "sfcl:text", "text");
    graph = changeKey(graph, "http://data.finlex.fi/schema/sfcl/xml", "xml");
    graph = changeKey(graph, "sfcl:xml", "xml");
    return graph;
  },

  filterMetadata: function(graph) {
    delete graph['title'];
    delete graph['xml'];
    delete graph['html'];
    delete graph['text'];
    return graph;
  },

  organize: function(results) {
    var _ = require('lodash');
    var context = results["@context"];
    delete results["@context"];
    if (results['@graph']) {
      var graph = []
      _.each(results['@graph'], function(resource) {
        graph.push(self.fixGraph(resource))
      });
    }
    else
      var graph = [self.fixGraph(results)];
    return {
      '@graph': graph,
      '@context': context
    };
  }

};

module.exports = self;
