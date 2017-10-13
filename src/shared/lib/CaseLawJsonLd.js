import _ from 'lodash';
import prefix from './prefix';

export default class CaseLawJsonLd {

  constructor(params = {}) {
    this.lang = (params.lang) ? params.lang : 'fi';
    this.format = (params.format=='text'||!params.format) ? 'text' : params.format;
    this.context = {
      'languageVersion': { '@id': 'sfcl:isRealizedBy', '@type':'@id'},
      'hasFormat': { '@id': 'sfcl:isEmbodiedBy', '@type':'@id'},
      'ecli': 'dcterms:isVersionOf',
      'title_fi': {'@id': 'dcterms:title', '@language': 'fi'},
      'title_sv': {'@id': 'dcterms:title', '@language': 'sv'},
      'content_fi': {'@id': 'sfcl:'+this.format, '@language': 'fi'},
      'content_sv': {'@id': 'sfcl:'+this.format, '@language': 'sv'}
    };
  }

  convertJudgmentListBindings(results, pretty = true) {
    let context = Object.assign({}, this.context);
    let judgments = {};
    // Add property utility function
    const addProp = (subj, prop, value) => {
      subj[prop] = subj[prop] || [];
      if (value['@id'] && !_.some(subj[prop], {'@id': value['@id']})) {
        // Object value
        subj[prop].push(value);
      } else if (!value['@id'] && !_.includes(subj[prop], value)) {
        // String value
        subj[prop].push(value);
      }
    };
    // Collect values
    _.each(results.results.bindings, (binding) => {
      if (!judgments[binding.judgment.value]) {
        judgments[binding.judgment.value] = {
          '@id': prefix.shorten(binding.judgment.value),
          '@type': prefix.shorten(binding.judgmentType.value)
        };
      }
      let judgment = judgments[binding.judgment.value];
      addProp(judgment, 'ecliIdentifier', binding.ecli.value);
      let expression = {
        '@id': prefix.shorten(binding.expression.value),
        '@type': prefix.shorten(binding.expressionType.value)
      };
      addProp(expression, 'title_' + this.lang, binding.title.value);
      if (binding.format) {
        let format = {
          '@id': prefix.shorten(binding.format.value)
        };
        format['content_' + this.lang] = binding.content.value;
        addProp(expression, 'hasFormat', format);
      }
      addProp(judgment, 'languageVersion', expression);
    });
    // Sort response by judgment year and id
    const response = {
      '@graph': _.map(judgments),
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
        currentSubject['languageVersion'] = [binding.expression.value];
        context['title_'+binding.title['xml:lang']]= { '@id': 'dcterms:title', '@language': binding.title['xml:lang'] };
        if (!itemMap[binding.expression.value]) itemMap[binding.expression.value]={'@id':prefix.shorten(binding.expression.value)};
        itemMap[binding.expression.value]['title_'+binding.title['xml:lang']]=[binding.title.value];
      }
      if (binding.content) {
        currentSubject['languageVersion'] = [binding.expression.value];
        var formatProp = (binding.format.value.substring(binding.format.value.length-4, binding.format.value.length) == 'html') ? 'html' : 'text';
        context['content_'+binding.content['xml:lang']]= { '@id': 'sfcl:'+formatProp, '@language': binding.content['xml:lang'] };
        if (!itemMap[binding.expression.value]) itemMap[binding.expression.value]={'@id':prefix.shorten(binding.expression.value)};
        itemMap[binding.expression.value]['hasFormat']=[binding.format.value];
        itemMap[binding.format.value]={'@id':prefix.shorten(binding.format.value)};
        itemMap[binding.format.value]['content_'+binding.content['xml:lang']]=[binding.content.value];
      }
    });
    delete context['@type'];
    for (var ns in prefix.prefixes)
      context[prefix.prefixes[ns]] = ns;
    const idx = workLevel.languageVersion.indexOf(results.results.bindings[0].expression.value);
    workLevel.languageVersion[idx] = itemMap[results.results.bindings[0].expression.value];
    workLevel.languageVersion[idx]['hasFormat'] = itemMap[results.results.bindings[0].format.value];

    var response = workLevel;
    response['@context']=context;
    response = (pretty) ? JSON.stringify(response, null, 2) : response;
    return response;
  }

  getJudgmentTitle(judgment, lang = 'fi') {
    if (judgment) {
      return (lang == 'fi') ? judgment.languageVersion[0].title_fi[0] : judgment.languageVersion[0].title_sv[0];
    }
    return '';
  }

  getJudgmentEcliIdentifier(judgment, lang = 'fi') {
    if (judgment) {
      return judgment['ecliIdentifier'][0];
    }
    return '';
  }

  getJudgmentContent(judgment, lang = 'fi') {
    return _.get(judgment, `languageVersion[0].hasFormat.content_${lang}[0]`, '');
  }

}
