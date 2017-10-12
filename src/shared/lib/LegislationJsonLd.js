import _ from 'lodash';
import prefix from './prefix';

const PART_PROPERTIES = {
  type: 'rdf:type',
  statuteType: 'sfl:statuteType',
  idLocal: 'eli:id_local',
  inForce: 'eli:in_force',
  temporalVersions: 'eli:has_member',
  amendedBy: 'eli:amended_by',
  amends: 'eli:amends',
  basedOn: 'eli:based_on',
  cites: 'eli:cites',
  typeDocument: 'eli:type_document',
  dateDocument: 'eli:date_document',
  datePublication: 'eli:date_publication',
  firstDateEntryInForce: 'eli:first_date_entry_in_force',
  hasPart: 'eli:has_part',
  isAbout: 'eli:is_about',
  isMemberOf: 'eli:is_member_of',
  isPartOf: 'eli:is_part_of',
  isRealizedBy: 'eli:is_realized_by',
  passedBy: 'eli:passed_by',
  relatedTo: 'eli:related_to',
  repealedBy: 'eli:repealed_by',
  repeals: 'eli:repeals',
  responsibilityOf: 'eli:responsibility_of',
  version: 'eli:version',
  versionDate: 'eli:version_date',
  followedBy: 'sfl:followedBy',
};

export default class LegislationJsonLd {

  constructor(params = {}) {
    this.lang = (params.lang) ? params.lang : 'fi';
    this.format = (params.format == 'text' || !params.format) ? 'text' : params.format;
    this.context = {
      'languageVersion': {'@id': 'eli:is_realized_by', '@type': '@id'},
      'hasFormat': {'@id': 'eli:is_embodied_by', '@type': '@id'},
      'temporalVersion': {'@id': 'eli:has_member', '@type': '@id'},
      'temporalVersions': {'@id': 'eli:has_member', '@type': '@id'},
      'idLocal': 'eli:id_local',
      'title_fi': {'@id': 'eli:title', '@language': 'fi'},
      'title_sv': {'@id': 'eli:title', '@language': 'sv'},
      'content_fi': {'@id': 'sfl:' + this.format, '@language': 'fi'},
      'content_sv': {'@id': 'sfl:' + this.format, '@language': 'sv'}
    };
  }

  convertStatuteListBindings(results, pretty = true) {
    const self = this;
    let context = Object.assign({}, this.context);
    let statutes = {};
    // Add property utility function
    let addProp = (subj, prop, value) => {
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
      if (!statutes[binding.statute.value]) {
        statutes[binding.statute.value] = {'@id':prefix.shorten(binding.statute.value), '@type':prefix.shorten(binding.statuteType.value)};
      }
      const statute = statutes[binding.statute.value];
      addProp(statute, 'idLocal', binding.idLocal.value);
      const statuteVersion = {
        '@id': prefix.shorten(binding.statuteVersion.value),
        '@type': prefix.shorten(binding.statuteVersionType.value)
      };
      addProp(statute, 'temporalVersions', statuteVersion);
      const expression = {'@id':prefix.shorten(binding.expression.value), '@type':prefix.shorten(binding.expressionType.value)};
      addProp(statuteVersion, 'languageVersion', expression);
      addProp(expression, 'title_' + this.lang, binding.title.value);
    });

    _.each(statutes, (statute) => {
      statute.temporalVersions = self.sortTemporalVersions(statute.temporalVersions);
      statute.temporalVersion = statute.temporalVersions[0];
    });
    // Sort response by statute year and id
    const response = {
      '@graph': _.sortBy(_.map(_.filter(statutes, (statute) => {return statute.idLocal[0].match(/^(\d+)/) != null;})), (statute) => {
        return parseInt(statute.idLocal[0].match(/\d{4}$/) + ((statuteId) => {while(statuteId.length < 4) statuteId = '0' + statuteId; return statuteId;})(statute.idLocal[0].match(/^(\d+)/)[0]));
      }),
      '@context': Object.assign(_.invert(prefix.prefixes), context)
    };
    return (pretty) ? JSON.stringify(response, null, 2) : response;
  }

  sortTemporalVersions(versions) {
    // Sort by @id (as it contains the date), except sort the original version
    // on top, then reverse to get newest first.
    return _.reverse(_.sortBy(versions, (v) => {
      return _.includes(v['@id'], '/alkup') ? '' : v['@id'];
    }));
  }

  convertStatuteBindings(results, pretty = true) {
    let context = {
      'languageVersion': {'@id': 'eli:is_realized_by', '@type':'@id'},
      'temporalVersions': {'@id': 'eli:has_member', '@type':'@id'},
      'temporalVersion': {'@id': 'eli:has_member', '@type':'@id'},
      'hasFormat': {'@id': 'eli:is_embodied_by', '@type':'@id'},
      'idLocal': 'eli:id_local'
    };
    let itemMap = {};
    let workLevel = {};
    results.results.bindings.forEach(function(binding) {
      let currentSubject;
      if (!binding.part.value.match(/\/ajantasa|\/alkup/)) {
        if (!workLevel['@id']) {
          workLevel['@id'] = prefix.shorten(binding.part.value);
        }
        currentSubject = workLevel;
      } else {
        if (!itemMap[binding.part.value]) {
          itemMap[binding.part.value] = {'@id':prefix.shorten(binding.part.value)};
        }
        currentSubject = itemMap[binding.part.value];
      }
      for (let prop in PART_PROPERTIES) {
        const value = binding[prop];
        if (value && value.value) {
          var pprop = PART_PROPERTIES[prop];

          if (prop === 'type')
            prop = '@type';

          if (!currentSubject[prop])
            currentSubject[prop] = [];
          if (!_.includes(currentSubject[prop], value.value))
            currentSubject[prop].push(value.value);
          if (!context[prop]) {
            if (value.type === 'uri')
              context[prop] = { '@id': pprop, '@type': '@id' };
            else if (value['xml:lang'])
              context[prop + '_' + value['xml:lang']] = { '@id': pprop, '@language': value['xml:lang'] };
            else if (value['datatype'])
              context[prop] = { '@id': pprop, '@type': prefix.shorten(value['datatype']) };
          }
        }
      }
      if (binding.title) {
        currentSubject['languageVersion'] = [binding.expression.value];
        context['title_' + binding.title['xml:lang']] = {'@id': 'eli:title', '@language': binding.title['xml:lang']};
        if (!itemMap[binding.expression.value])
          itemMap[binding.expression.value] = {'@id':prefix.shorten(binding.expression.value)};
        itemMap[binding.expression.value]['title_' + binding.title['xml:lang']] = [binding.title.value];
      }
      if (binding.content) {
        currentSubject['languageVersion'] = [binding.expression.value];
        let formatProp = (binding.format.value.substring(binding.format.value.length - 4, binding.format.value.length) == 'html') ? 'html' : 'text';
        context['content_' + binding.content['xml:lang']] = { '@id': 'sfl:' + formatProp, '@language': binding.content['xml:lang'] };
        if (!itemMap[binding.expression.value])
          itemMap[binding.expression.value] = {'@id':prefix.shorten(binding.expression.value)};
        itemMap[binding.expression.value]['hasFormat'] = [binding.format.value];
        itemMap[binding.format.value] = {'@id':prefix.shorten(binding.format.value)};
        itemMap[binding.format.value]['content_' + binding.content['xml:lang']] = [binding.content.value];
      }
    });
    for (var objectKey in itemMap) {
      var object = itemMap[objectKey];
      for (var property in object) if (property != '@id') {
        this.sortProperty(object[property]);
        var subheadings = object[property].filter(function(value) {
          return itemMap[value] && itemMap[value].followedBy;
        });
        subheadings.forEach(function(sh) {
          object[property].splice(object[property].indexOf(sh),1);
          object[property].splice(object[property].indexOf(itemMap[sh].followedBy[0]),0,sh);
        });
        object[property] = object[property].map(function(value) {
          if (context[property]['@type'] != '@id')
            return value;
          if (property != 'followedBy' && itemMap[value])
            return itemMap[value];
          return prefix.shorten(value);
        });
        if (object[property].length == 1)
          object[property] = object[property][0];
      }
    }
    delete context['@type'];
    for (var ns in prefix.prefixes) {
      context[prefix.prefixes[ns]] = ns;
    }
    workLevel.temporalVersion = itemMap[results.results.bindings[0].part.value];
    var response = workLevel;
    response['@context'] = context;
    response = (pretty) ? JSON.stringify(response, null, 2) : response;
    return response;
  }

  sortProperty(property) {
    const getComparisonValue = (val) => {
      if (val.indexOf('/johdanto/') > -1)
        return 0;
      else if (val.indexOf('/loppukappale/') > -1)
        return Number.MAX_VALUE;
      else
        return parseInt(val.replace(/\/ajantasa\/.*$|\/alkup$/, '').replace(/.*\//, ''), 10);
    };
    return property.sort((a, b) => (getComparisonValue(a) - getComparisonValue(b)));
  }

  getStatuteContent(statute, lang = 'fi') {
    return statute.temporalVersion.languageVersion ? statute.temporalVersion.languageVersion.hasFormat['content_' + lang] : '';
  }

  getStatuteTitle(statute, lang = 'fi') {
    if (statute.temporalVersion && statute.temporalVersion.languageVersion) {
      return (lang == 'fi') ? statute.temporalVersion.languageVersion[0].title_fi[0] : statute.temporalVersion.languageVersion[0].title_sv[0];
    }
    return '';
  }

}
