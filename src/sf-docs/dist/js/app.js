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
    .config(function($stateProvider) {
      $stateProvider
        .state('sfdocs', {
          url: '',
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
              templateUrl: function(stateParams) {console.log(stateParams); return '/sf-docs/partials/'+stateParams.lang+'/doc/'+stateParams.page+'.html'; },
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


angular.module('SemanticFinlex')
  .controller('NavController', ['$scope', '$stateParams', function ($scope, $stateParams) {
    $scope.lang = $stateParams.lang;
    $scope.subtabs = [];
    $scope.tabs = {};
    $scope.currentTab = null;
    $scope.tabs['fi'] = [
      {
        title: 'Etusivu',
        url: '#/fi',
        level: 0
      }, {
        title: 'Dokumentaatio',
        level: 0,
        tabs: [{
            title: 'Tietomallinnus',
            url: '#/fi/tietomallinnus',
            level: 1
          }, {
            title: 'URI-tunnisteet',
            url: '#/fi/urit',
            level: 1
          }, {
            title: 'REST API',
            url: '#/fi/rest-api',
            level: 1
          }, {
            title: 'SPARQL-palvelupiste',
            url: '#/fi/sparql',
            level: 1
          }, {
        		title: 'Aineistojen lataaminen',
        		url: '#/fi/aineistojenlataus',
        		level: 1
          },{
            title: 'RDF-tietomallit',
            url: '#/fi/rdf',
            level: 1,
            tabs: [{
              title: 'Lainsäädäntö',
              url: '#/fi/lainsaadanto',
              level: 2
            }, {
              title: 'Oikeuskäytäntö',
              url: '#/fi/oikeuskaytanto',
              level: 1
            }]
          }, {
            title: 'Asiasanoitus',
            url: '#/fi/asiasanoitus',
            level: 1
          }, {
          title: 'Kehitystarpeita',
          url: '#/fi/kehitystarpeita',
          level: 0
        }]
      }, {
        title: 'Hankkeen kuvaus',
        url: '#/fi/projekti',
        level: 0
      }, {
        title: 'Käyttöehdot',
        url: '#/fi/kayttoehdot',
        level: 0
      }, {
        title: 'Palaute ja tiedotuslista',
        url: '#/fi/palaute',
        level: 0
      }, {
        title: 'Rekisteriseloste',
        url: '#/fi/rekisteriseloste',
        level: 0
      }
    ];
    $scope.tabs['en'] = [
      {
        title: 'Home',
        url: '#/en',
        level: 0
      },
      {
        title: 'Documentation',
        level: 0,
        tabs: [{
            title: 'Data modeling',
            url: '#/en/datamodeling',
            level: 1
          }, {
            title: 'URIs',
            url: '#/en/uris',
            level: 1
          }, {
            title: 'REST API',
            url: '#/en/rest-api',
            level: 1
          }, {
            title: 'SPARQL endpoint',
            url: '#/en/sparql',
            level: 1
          }, {
        		title: 'Downloading of datasets',
        		url: '#/en/download',
        		level: 1
          },{
            title: 'RDF data models',
            url: '#/en/rdf',
            level: 1,
            tabs: [{
              title: 'Legislation',
              url: '#/en/legislation',
              level: 2
            }, {
              title: 'Case law',
              url: '#/en/caselaw',
              level: 1
            }]
          }, {
            title: 'Subject indexing',
            url: '#/en/subjectindexing',
            level: 1
          }, {
            title: 'Future work',
            url: '#/en/futurework',
            level: 0
        }]
      },
      {
        title: 'Semantic Finlex project',
        url: '#/en/project',
        level: 0
      }, {
        title: 'Terms of use',
        url: '#/en/termsofuse',
        level: 0
      }, {
        title: 'Description of the file',
        url: '#/en/descriptionofthefile',
        level: 0
      }
    ];

    this.isActiveTab = function(tab) {
        return tab == $scope.currentTab;
    };

    this.onClickTab = function (tab) {
        if (tab.tabs) {
          $scope.subtabs = tab.tabs;
        } else if (tab.level == 0) {
          $scope.subtabs = [];
        }
        $scope.currentTab = tab;
        $scope.currentTabUrl = (tab.url) ? tab.url : $scope.currentTabUrl;
    };

  }]);
