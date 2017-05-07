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
      'content_fi': {'@id': 'sfl:'+this.format, '@language': 'fi'},
      'content_sv': {'@id': 'sfl:'+this.format, '@language': 'sv'}
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
    }
    // Collect values
    _.each(results.results.bindings, (binding) => {
      console.log(binding)
      if (!judgments[binding.judgment.value]) judgments[binding.judgment.value] = {'@id':prefix.shorten(binding.judgment.value), '@type':prefix.shorten(binding.judgmentType.value)};
      const judgment = judgments[binding.judgment.value];
      addProp(judgment, 'ecliIdentifier', binding.ecli.value);
      const expression = {'@id':prefix.shorten(binding.expression.value), '@type':prefix.shorten(binding.expressionType.value)};
      addProp(judgment, 'isRealizedBy', expression);
      addProp(expression, 'title_'+this.lang, binding.title.value);
    })
    // Sort response by judgment year and id
    const response = {
      '@graph': judgments,
      '@context': Object.assign(_.invert(prefix.prefixes), context)
    };
    return (pretty) ? JSON.stringify(response, null, 2) : response;
  }


}
