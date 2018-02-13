(function() {
  var statePageNames = {
    'main': {
      'fi': 'main',
      'en': 'main',
    },
    'dotf': {
      'fi': 'rekisteriseloste',
      'en': 'descriptionofthefile',
    },
    'tou': {
      'fi': 'kayttoehdot',
      'en': 'termsofuse',
    },
    'project': {
      'fi': 'projekti',
      'en': 'project',
    },
    'fb': {
      'fi': 'palaute',
    },
    'modeling': {
      'fi': 'tietomallinnus',
      'en': 'datamodeling'
    },
    'uri': {
      'fi': 'urit',
      'en': 'uris'
    },
    'legislation': {
      'fi': 'lainsaadanto',
      'en': 'legislation'
    },
    'caselaw': {
      'fi': 'oikeuskaytanto',
      'en': 'caselaw'
    },
    'rdf': {
      'fi': 'rdf',
      'en': 'rdf'
    },
    'rest': {
      'fi': 'rest-api',
      'en': 'rest-api'
    },
    'sparql': {
      'fi': 'sparql',
      'en': 'sparql'
    },
    'subject': {
      'fi': 'asiasanoitus',
      'en': 'subjectindexing'
    },
    'future': {
      'fi': 'kehitystarpeita',
      'en': 'futurework'
    },
    'download': {
      'fi': 'aineistojenlataus',
      'en': 'download'
    },
  };

  var formatPageUrlParameter = function(state) {
    return Object.keys(statePageNames[state]).map(function(key) {
      return statePageNames[state][key];
    }).join('|')
    //not working in ie
    //return Object.values(statePageNames[state]).join('|');
  };

  var selectLangTemplate = function(stateParams) {
    var labels = {
      "en": "In English",
      "fi": "Suomeksi"
    };
    return '<div class="lang-selector">'+
      _.reduce(
        _.find(statePageNames, function(value, key) {
          if (!stateParams.page) stateParams.page;
          return (stateParams.page) ?
            (value[stateParams.lang] == stateParams.page) : 'main';
        }),
        function(result, value, key, index) {
          return (key == stateParams.lang) ? result+labels[key]+' | ' :
            result+'<a href="/#/'+key+'/'+value+'">'+labels[key]+'</a> | ';
        }, '').slice(0, -3);+
      '</div>';
  };

  var app = angular.module('SemanticFinlex', [
      'ngRoute',
      'ui.router',
      'ui.bootstrap',
      'ui.bootstrap.tpls'
    ])
    .config(function($stateProvider, $locationProvider) {

      // use the HTML5 History API
      $locationProvider.html5Mode(true);

      $stateProvider
        .state('sfdocs', {
          url: '/',
          onEnter: function($location) {return $location.url('fi');}
        })
        .state('lang', {
          url: '/{lang}',
          views: {
            'nav':  {
              templateUrl: function() {return '/sf-docs/partials/nav.html'; },
            },
            'wrapper':  {
              templateUrl: function() {return '/sf-docs/partials/wrapper.html'; },
            }
          },
          redirectTo: 'lang.main'
        })
        .state('lang.main', {
          url: '/main',
          views: {
            'selectlang': {
              template: selectLangTemplate,
            },
            'page': {
              templateUrl: function(stateParams) {return '/sf-docs/partials/'+stateParams.lang+'/main.html'; },
            }
          },
        })
        .state('lang.dotf', {
          url: '/{page:'+formatPageUrlParameter('dotf')+'}',
          views: {
            'selectlang': {
              template: selectLangTemplate,
            },
            'page': {
              templateUrl: function(stateParams) {return '/sf-docs/partials/'+stateParams.lang+'/'+stateParams.page+'.html'; },
            }
          },
        })
        .state('lang.tou', {
          url: '/{page:'+formatPageUrlParameter('tou')+'}',
          views: {
            'selectlang': {
              template: selectLangTemplate,
            },
            'page': {
              templateUrl: function(stateParams) {return '/sf-docs/partials/'+stateParams.lang+'/'+stateParams.page+'.html'; },
            }
          }
        })
        .state('lang.project', {
          url: '/{page:'+formatPageUrlParameter('project')+'}',
          views: {
            'selectlang': {
              template: selectLangTemplate,
            },
            'page': {
              templateUrl: function(stateParams) {return '/sf-docs/partials/'+stateParams.lang+'/'+stateParams.page+'.html'; },
            }
          }
        })
        .state('lang.fb', {
          url: '/{page:'+formatPageUrlParameter('fb')+'}',
          views: {
            'selectlang': {
              template: selectLangTemplate,
            },
            'page': {
              templateUrl: function(stateParams) {return '/sf-docs/partials/'+stateParams.lang+'/'+stateParams.page+'.html'; },
            }
          }
        })
        .state('lang.modeling', {
          url: '/{page:'+formatPageUrlParameter('modeling')+'}',
          views: {
            'selectlang': {
              template: selectLangTemplate,
            },
            'page': {
              templateUrl: function(stateParams) {return '/sf-docs/partials/'+stateParams.lang+'/doc/'+stateParams.page+'.html'; },
            }
          }
        })
        .state('lang.uri', {
          url: '/{page:'+formatPageUrlParameter('uri')+'}',
          views: {
            'selectlang': {
              template: selectLangTemplate,
            },
            'page': {
              templateUrl: function(stateParams) {return '/sf-docs/partials/'+stateParams.lang+'/doc/'+stateParams.page+'.html'; },
            }
          }
        })
        .state('lang.rdf', {
          url: '/{page:'+formatPageUrlParameter('rdf')+'}',
          views: {
            'selectlang': {
              template: selectLangTemplate,
            },
            'page': {
              templateUrl: function(stateParams) {return '/sf-docs/partials/'+stateParams.lang+'/doc/'+stateParams.page+'.html'; },
            }
          }
        })
        .state('lang.statutes', {
          url: '/{page:'+formatPageUrlParameter('legislation')+'}',
          views: {
            'selectlang': {
              template: selectLangTemplate,
            },
            'page': {
              templateUrl: function(stateParams) {return '/sf-docs/partials/'+stateParams.lang+'/doc/'+stateParams.page+'.html'; },
            }
          }
        })
        .state('lang.judgments', {
          url: '/{page:'+formatPageUrlParameter('caselaw')+'}',
          views: {
            'selectlang': {
              template: selectLangTemplate,
            },
            'page': {
              templateUrl: function(stateParams) {return '/sf-docs/partials/'+stateParams.lang+'/doc/'+stateParams.page+'.html'; },
            }
          }
        })
        .state('lang.download', {
          url: '/{page:'+formatPageUrlParameter('download')+'}',
          views: {
            'selectlang': {
              template: selectLangTemplate,
            },
            'page': {
              templateUrl: function(stateParams) {return '/sf-docs/partials/'+stateParams.lang+'/doc/'+stateParams.page+'.html'; },
            }
          }
        })
        .state('lang.subject', {
          url: '/{page:'+formatPageUrlParameter('subject')+'}',
          views: {
            'selectlang': {
              template: selectLangTemplate,
            },
            'page': {
              templateUrl: function(stateParams) {return '/sf-docs/partials/'+stateParams.lang+'/doc/'+stateParams.page+'.html'; },
            }
          }
        })
        .state('lang.future', {
          url: '/{page:'+formatPageUrlParameter('future')+'}',
          views: {
            'selectlang': {
              template: selectLangTemplate,
            },
            'page': {
              templateUrl: function(stateParams) {return '/sf-docs/partials/'+stateParams.lang+'/doc/'+stateParams.page+'.html'; },
            }
          }
        })
        .state('lang.sparql', {
          url: '/{page:'+formatPageUrlParameter('sparql')+'}',
          views: {
            'selectlang': {
              template: selectLangTemplate,
            },
            'page': {
              templateUrl: function(stateParams) {return '/sf-docs/partials/'+stateParams.lang+'/doc/'+stateParams.page+'.html'; },
            }
          }
        })
        .state('lang.rest', {
          url: '/{page:'+formatPageUrlParameter('rest')+'}',
          views: {
            'selectlang': {
              template: selectLangTemplate,
            },
            'page': {
              templateUrl: function(stateParams) {return '/sf-docs/partials/'+stateParams.lang+'/doc/'+stateParams.page+'.html'; },
            }
          }
        })
    });

  app.run(['$rootScope', '$state', function($rootScope, $state) {
      $rootScope.$on('$stateChangeStart', function(evt, to, params) {
        if (to.redirectTo) {
          evt.preventDefault();
          $state.go(to.redirectTo, params, {location: 'replace'})
        }
      });
  }]);

})();
