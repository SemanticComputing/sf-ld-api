import _ from 'lodash';
import prefix from './prefix';

export default class LegislationJsonLd {

  constructor(params = {}) {
    this.lang = (params.lang) ? params.lang : 'fi';
    this.format = (params.format=='text'||!params.format) ? 'text' : params.format;
    this.context = {
      'isRealizedBy': { '@id': 'eli:is_realized_by', '@type':'@id'},
      'isEmbodiedBy': { '@id': 'eli:is_embodied_by', '@type':'@id'},
      'hasMember': { '@id': 'eli:has_member', '@type':'@id'},
      'idLocal': 'eli:id_local',
      'title_fi': {'@id': 'eli:title', '@language': 'fi'},
      'title_sv': {'@id': 'eli:title', '@language': 'sv'},
      'content_fi': {'@id': 'sfl:'+this.format, '@language': 'fi'},
      'content_sv': {'@id': 'sfl:'+this.format, '@language': 'sv'}
    };
  }

  convertStatuteListBindings(results, pretty=true) {
    let context = Object.assign({}, this.context);
    let statutes = {};
    // Add property utility function
    let addProp = (subj, prop, value) => {
      if (!subj[prop]) subj[prop]= [];
      // Object value
      if (value['@id'] && !_.some(subj[prop], {'@id': value['@id']})) subj[prop].push(value);
      // String value
      if (!value['@id'] && !_.includes(subj[prop], value)) subj[prop].push(value);
    };
    // Collect values
    _.each(results.results.bindings, (binding) => {
      if (!statutes[binding.statute.value]) statutes[binding.statute.value] = {'@id':prefix.shorten(binding.statute.value), '@type':prefix.shorten(binding.statuteType.value)};
      const statute = statutes[binding.statute.value];
      addProp(statute, 'idLocal', binding.idLocal.value);
      const statuteVersion = {'@id':prefix.shorten(binding.statuteVersion.value), '@type':prefix.shorten(binding.statuteVersionType.value)};
      addProp(statute, 'hasMember', statuteVersion);
      if (binding.hasMember && binding.hasMember.value != binding.statuteVersion.value) addProp(statute, 'hasMember', binding.hasMember.value);
      const expression = {'@id':prefix.shorten(binding.expression.value), '@type':prefix.shorten(binding.expressionType.value)};
      addProp(statuteVersion, 'isRealizedBy', expression);
      addProp(expression, 'title_'+this.lang, binding.title.value);
    });
    // Sort response by statute year and id
    const response = {
      '@graph': _.sortBy(_.map(_.filter(statutes, (statute) => {return statute.idLocal[0].match(/^(\d+)/) != null;})), (statute) => {
        return parseInt(statute.idLocal[0].match(/\d{4}$/)+((statuteId) => {while(statuteId.length < 4) statuteId = '0'+statuteId; return statuteId;})(statute.idLocal[0].match(/^(\d+)/)[0]));
      }),
      '@context': Object.assign(_.invert(prefix.prefixes), context)
    };
    return (pretty) ? JSON.stringify(response, null, 2) : response;
  }

  convertStatuteBindings(results, pretty = true) {
    //console.log(results.results.bindings)
    let context = {
      'isRealizedBy': { '@id': 'eli:is_realized_by', '@type':'@id'},
      'isEmbodiedBy': { '@id': 'eli:is_embodied_by', '@type':'@id'},
      'idLocal': 'eli:id_local'
    };
    let itemMap = {};
    let workLevel = {};
    results.results.bindings.forEach(function(binding) {
      let currentSubject;
      if (!binding.s.value.match(/\/ajantasa|\/alkup/)) {
        if (!workLevel['@id']) workLevel['@id'] = prefix.shorten(binding.s.value);
        currentSubject = workLevel;
      }
      else {
        if (!itemMap[binding.s.value]) itemMap[binding.s.value] = {'@id':prefix.shorten(binding.s.value)};
        currentSubject = itemMap[binding.s.value];
      }
      if (binding.p) {
        var prop = binding.p.value.replace(/.*[\/#]/,'').replace(/_([a-z])/g, function (g) { return g[1].toUpperCase(); }) + (binding.o['xml:lang'] ? '_'+binding.o['xml:lang'] : '');
        var pprop = prefix.shorten(binding.p.value);
        if (prop=='type') prop='@type';
        if (!currentSubject[prop]) currentSubject[prop] = [];
        currentSubject[prop].push(binding.o.value);
        if (!context[prop]) {
          if (binding.o.type=='uri')
            context[prop]= { '@id': pprop, '@type': '@id' };
          else if (binding.o['xml:lang'])
            context[prop+'_'+binding.o['xml:lang']]= { '@id': pprop, '@language': binding.o['xml:lang'] };
          else if (binding.o['datatype'])
            context[prop]= { '@id': pprop, '@type': prefix.shorten(binding.o['datatype']) };
        }
      }
      if (binding.title) {
        currentSubject['isRealizedBy'] = [binding.expression.value];
        context['title_'+binding.title['xml:lang']]= { '@id': 'eli:title', '@language': binding.title['xml:lang'] };
        if (!itemMap[binding.expression.value]) itemMap[binding.expression.value]={'@id':prefix.shorten(binding.expression.value)};
        itemMap[binding.expression.value]['title_'+binding.title['xml:lang']]=[binding.title.value];
      }
      if (binding.content) {
        currentSubject['isRealizedBy'] = [binding.expression.value];
        var formatProp = (binding.format.value.substring(binding.format.value.length-4, binding.format.value.length) == 'html') ? 'html' : 'text';
        context['content_'+binding.content['xml:lang']]= { '@id': 'sfl:'+formatProp, '@language': binding.content['xml:lang'] };
        if (!itemMap[binding.expression.value]) itemMap[binding.expression.value]={'@id':prefix.shorten(binding.expression.value)};
        itemMap[binding.expression.value]['isEmbodiedBy']=[binding.format.value];
        itemMap[binding.format.value]={'@id':prefix.shorten(binding.format.value)};
        itemMap[binding.format.value]['content_'+binding.content['xml:lang']]=[binding.content.value];
      }
    });
    for (var objectKey in itemMap) {
      var object = itemMap[objectKey];
      for (var property in object) if (property!='@id') {
        object[property].sort(function(a,b) {
          var an;
          if (a.indexOf('/johdanto/') > -1) an = 0;
          else if (a.indexOf('/loppukappale/') > -1) an = Number.MAX_VALUE;
          else an = parseInt(a.replace(/\/ajantasa\/.*$|\/alkup$/,'').replace(/.*\//,''),10);
          var bn;
          if (b.indexOf('/johdanto/') > -1) bn = 0;
          else if (b.indexOf('/loppukappale/') > -1) bn = Number.MAX_VALUE;
          else bn = parseInt(b.replace(/\/ajantasa\/.*$|\/alkup$/,'').replace(/.*\//,''),10);
          return an-bn;
        });
        var subheadings = object[property].filter(function(value) {
          return itemMap[value] && itemMap[value].followedBy;
        });
        subheadings.forEach(function(sh) {
          object[property].splice(object[property].indexOf(sh),1);
          object[property].splice(object[property].indexOf(itemMap[sh].followedBy[0]),0,sh);
        });
        object[property] = object[property].map(function(value) {
          if (context[property]['@type']!='@id') return value;
          if (property!='followedBy' && itemMap[value]) return itemMap[value];
          return prefix.shorten(value);
        });
        if (object[property].length==1) object[property]=object[property][0];
      }
    }
    delete context['@type'];
    for (var ns in prefix.prefixes)
      context[prefix.prefixes[ns]]=ns;
    const idx = workLevel.hasMember.indexOf(results.results.bindings[0].s.value);
    workLevel.hasMember[idx] = itemMap[results.results.bindings[0].s.value];
    var response = workLevel;
    response['@context']=context;
    response = (pretty) ? JSON.stringify(response, null, 2) : response;
    return response;
  }

  getStatuteContent(statute, lang = 'fi') {
    const version = _.filter(statute.hasMember, (item) => {return item.isRealizedBy;});
    return (version[0]) ? version[0].isRealizedBy.isEmbodiedBy['content_'+lang] : '';
  }

  getStatuteTitle(statute, lang = 'fi') {
    if (statute.hasMember && statute.hasMember[0] && statute.hasMember[0].isRealizedBy && statute.hasMember[0].isRealizedBy[0]) {
      return (lang == 'fi') ? statute.hasMember[0].isRealizedBy[0].title_fi[0] : statute.hasMember[0].isRealizedBy[0].title_sv[0];
    }
    return '';
  }

}
