import _ from 'lodash'

class JsonLd {

  convertStatuteBindings(results, pretty = true) {
    var prefixes = {
      'http://www.w3.org/2001/XMLSchema#' : 'xsd',
    };
    prefixes['http://data.finlex.fi/schema/sfl/']='sfl';
    prefixes['http://data.europa.eu/eli/ontology#']='eli';
    var shorten = function(uri) {
      for (var ns in prefixes) {
        if (uri.indexOf(ns)==0)
          return prefixes[ns]+':'+uri.substr(ns.length)
      }
      return uri
    };
    var context = {
      "isRealizedBy": { "@id": "eli:is_realized_by", "@type":"@id"},
      "isEmbodiedBy": { "@id": "eli:is_embodied_by", "@type":"@id"},
      "idLocal": "eli:id_local"
    };
    var itemMap = {};
    var workLevel = {};
    results.results.bindings.forEach(function(binding){
      var currentSubject;
      if (!binding.s.value.match(/\/ajantasa|\/alkup/)) {
        if (!workLevel['@id']) workLevel['@id'] = shorten(binding.s.value);
        var currentSubject = workLevel;
      }
      else {
        if (!itemMap[binding.s.value]) itemMap[binding.s.value]={'@id':shorten(binding.s.value)};
        var currentSubject = itemMap[binding.s.value];
      }
      if (binding.p) {
        var prop = binding.p.value.replace(/.*[\/#]/,'').replace(/_([a-z])/g, function (g) { return g[1].toUpperCase(); }) + (binding.o['xml:lang'] ? '_'+binding.o['xml:lang'] : '');
        var pprop = shorten(binding.p.value);
        if (prop=='type') prop='@type';
        if (!currentSubject[prop]) currentSubject[prop] = [];
        currentSubject[prop].push(binding.o.value);
        if (!context[prop]) {
          if (binding.o.type=='uri')
            context[prop]= { "@id": pprop, "@type": "@id" };
          else if (binding.o['xml:lang'])
            context[prop+'_'+binding.o['xml:lang']]= { "@id": pprop, "@language": binding.o['xml:lang'] };
          else if (binding.o['datatype'])
            context[prop]= { "@id": pprop, "@type": shorten(binding.o['datatype']) };
        }
      }
      if (binding.title) {
        currentSubject['isRealizedBy'] = [binding.expression.value];
        context['title_'+binding.title['xml:lang']]= { "@id": 'eli:title', "@language": binding.title['xml:lang'] };
        if (!itemMap[binding.expression.value]) itemMap[binding.expression.value]={'@id':shorten(binding.expression.value)};
        itemMap[binding.expression.value]['title_'+binding.title['xml:lang']]=[binding.title.value];
      }
      if (binding.content) {
        currentSubject['isRealizedBy'] = [binding.expression.value];
        context['content_'+binding.content['xml:lang']]= { "@id": 'eli:title', "@language": binding.content['xml:lang'] };
        if (!itemMap[binding.expression.value]) itemMap[binding.expression.value]={'@id':shorten(binding.expression.value)};
        itemMap[binding.expression.value]['isEmbodiedBy']=[binding.format.value];
        itemMap[binding.format.value]={'@id':shorten(binding.format.value)};
        itemMap[binding.format.value]['content_'+binding.content['xml:lang']]=[binding.content.value];
      }
    })
    for (var objectKey in itemMap) {
      var object = itemMap[objectKey];
      for (var property in object) if (property!='@id') {
        object[property].sort(function(a,b) {
          var an;
          if (a.indexOf("/johdanto/") > -1) an = 0;
          else if (a.indexOf("/loppukappale/") > -1) an = Number.MAX_VALUE;
          else an = parseInt(a.replace(/\/ajantasa\/.*$|\/alkup$/,"").replace(/.*\//,""),10);
          var bn;
          if (b.indexOf("/johdanto/") > -1) bn = 0;
          else if (b.indexOf("/loppukappale/") > -1) bn = Number.MAX_VALUE;
          else bn = parseInt(b.replace(/\/ajantasa\/.*$|\/alkup$/,"").replace(/.*\//,""),10);
          return an-bn;
        })
        var subheadings = object[property].filter(function(value) {
          return itemMap[value] && itemMap[value].nextItem;
        })
        subheadings.forEach(function(sh) {
          object[property].splice(object[property].indexOf(sh),1);
          object[property].splice(object[property].indexOf(itemMap[sh].nextItem[0]),0,sh);
        })
        object[property] = object[property].map(function(value) {
          if (context[property]["@type"]!="@id") return value;
          if (property!='nextItem' && itemMap[value]) return itemMap[value];
          return shorten(value);
        })
        if (object[property].length==1) object[property]=object[property][0];
      }
    }
    delete context['@type'];
    for (var ns in prefixes)
      context[prefixes[ns]]=ns;
    console.log(workLevel)
    workLevel.hasVersion = itemMap[results.results.bindings[0].s.value];
    var response = workLevel;
    response['@context']=context;
    response = (pretty) ? JSON.stringify(response, null, 2) : response;
    return response;
  }

}

const jsonLd = new JsonLd();

export default jsonLd;
