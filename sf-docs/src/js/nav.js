
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
