import _ from 'lodash';
import prefix from './prefix';

export default class CaseLawJsonLd {

  constructor(params = {}) {
    this.lang = (params.lang) ? params.lang : 'fi';
    this.format = (params.format=='text'||!params.format) ? 'text' : params.format;
    this.context = {
      'isRealizedBy': { '@id': 'sfcl:isRealizedBy', '@type':'@id'},
      'isEmbodiedBy': { '@id': 'sfcl:isEmbodiedBy', '@type':'@id'},
      'ecli': 'dcterms:isVersionOf',
      'title_fi': {'@id': 'dcterms:title', '@language': 'fi'},
      'title_sv': {'@id': 'dcterms:title', '@language': 'sv'},
      'content_fi': {'@id': 'sfcl:'+this.format, '@language': 'fi'},
      'content_sv': {'@id': 'sfcl:'+this.format, '@language': 'sv'}
    };
  }

  convertJudgmentListBindings(results, pretty=true) {
    let context = Object.assign({}, this.context);
    let judgments = {};
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
      if (!judgments[binding.judgment.value]) judgments[binding.judgment.value] = {'@id':prefix.shorten(binding.judgment.value), '@type':prefix.shorten(binding.judgmentType.value)};
      const judgment = judgments[binding.judgment.value];
      addProp(judgment, 'ecliIdentifier', binding.ecli.value);
      const expression = {'@id':prefix.shorten(binding.expression.value), '@type':prefix.shorten(binding.expressionType.value)};
      addProp(judgment, 'isRealizedBy', expression);
      addProp(expression, 'title_'+this.lang, binding.title.value);
    });
    // Sort response by judgment year and id
    const response = {
      '@graph': judgments,
      '@context': Object.assign(_.invert(prefix.prefixes), context)
    };
    return (pretty) ? JSON.stringify(response, null, 2) : response;
  }


  convertJudgmentBindings(results, pretty = true) {
    //console.log(results.results.bindings)
    let context = Object.assign({}, this.context);
    let workLevel = {};
    let itemMap = {};
    results.results.bindings.forEach(function(binding) {
      if (!workLevel['@id']) workLevel['@id'] = prefix.shorten(binding.judgment.value);
      let currentSubject = workLevel;
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
            context[prop]= { '@id': pprop, '@language': binding.o['xml:lang'] };
          else if (binding.o['datatype'])
            context[prop]= { '@id': pprop, '@type': prefix.shorten(binding.o['datatype']) };
        }
      }
      if (binding.title) {
        currentSubject['isRealizedBy'] = [binding.expression.value];
        context['title_'+binding.title['xml:lang']]= { '@id': 'dcterms:title', '@language': binding.title['xml:lang'] };
        if (!itemMap[binding.expression.value]) itemMap[binding.expression.value]={'@id':prefix.shorten(binding.expression.value)};
        itemMap[binding.expression.value]['title_'+binding.title['xml:lang']]=[binding.title.value];
      }
      if (binding.content) {
        currentSubject['isRealizedBy'] = [binding.expression.value];
        var formatProp = (binding.format.value.substring(binding.format.value.length-4, binding.format.value.length) == 'html') ? 'html' : 'text';
        context['content_'+binding.content['xml:lang']]= { '@id': 'sfcl:'+formatProp, '@language': binding.content['xml:lang'] };
        if (!itemMap[binding.expression.value]) itemMap[binding.expression.value]={'@id':prefix.shorten(binding.expression.value)};
        itemMap[binding.expression.value]['isEmbodiedBy']=[binding.format.value];
        itemMap[binding.format.value]={'@id':prefix.shorten(binding.format.value)};
        itemMap[binding.format.value]['content_'+binding.content['xml:lang']]=[binding.content.value];
      }
    });
    delete context['@type'];
    for (var ns in prefix.prefixes)
      context[prefix.prefixes[ns]] = ns;
    const idx = workLevel.isRealizedBy.indexOf(results.results.bindings[0].expression.value);
    workLevel.isRealizedBy[idx] = itemMap[results.results.bindings[0].expression.value];
    workLevel.isRealizedBy[idx]['isEmbodiedBy'] = itemMap[results.results.bindings[0].format.value];

    var response = workLevel;
    response['@context']=context;
    response = (pretty) ? JSON.stringify(response, null, 2) : response;
    return response;
  }

}
