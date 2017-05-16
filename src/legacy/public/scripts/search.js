(function ($){
  $(document).ready(function() {

    var data = {};

    var delay = (function(){
      var timer = 0;
      return function(callback, ms){
        clearTimeout (timer);
        timer = setTimeout(callback, ms);
      };
    })();

    var performSearch = function() {
      var statutesUri = "/api/v1/statutes";
      var judgmentsUri = "/api/v1/judgments";
      var category = $('#corpus').val();

      switch (category) {
        case 'all':
          // $.get( "/api/v1/statutes", { query: $('#query').val(), limit: 20 } )
          //   .done(function( data ) {
          //     $.get( "/api/v1/judgments", { query: $('#query').val(), limit: 20 } )
          //       printResults(data);
          //   });
        case 'caselaw':
          var query = $('#query').val()
          $.get( judgmentsUri, { query: $('#query').val() } )
            .done(function( data , query ) {
              printResults(data, query, category);
            }).fail(function() {
              printNoResults();
            });
          break;
        case 'legislation':
          var query = $('#query').val()
          $.get( statutesUri, { query: $('#query').val() } )
            .done(function( data , query ) {
              printResults(data, query, category);
            }).fail(function() {
              printNoResults();
            });
          break;
        default:
          break;
      }
    }

    var getStatuteItemId = function(uri) {
      var matchesSDK = uri.match(/([0-9]{4})\/([0-9]+[A-Z]{0,1})/);
      var sdk = (matchesSDK.length > 2) ? "("+matchesSDK[2]+"/"+matchesSDK[1]+")" : ""
      var matchesITEM = uri.match(/(\/(osa|luku|pykala|momentti|kohta|alakohta|liite|voimaantulo|valiotsikko|johdanto|loppukappale|johtolause)\/*([0-9]+[a-z]{0,1})*)/g);
      var itemId = ''
      _.each(matchesITEM, function(item) {
        var tmp = item.replace(/\//g,' ').replace(/pykala/g,'§').trim()
        var tmp2 = tmp.match(/([^\s]+)\s([^\s]+)/)
        if (tmp2 != null && tmp2.length > 2)
          tmp=tmp2[2]+' '+tmp2[1]+' ';
        itemId += tmp
      })
      return sdk+' '+itemId;
    };

    var printPage = function(number,query,category) {
      console.log(data)
      if (data.searchresults.length > 0) {
        var dataLen = (data.searchresults.length > number*5) ? number*5 : data.searchresults.length;
        $('#search-results').html('<h3 class="search-results-heading">Hakutulokset ('+parseInt(((number-1)*5)+1)+(dataLen!=((number-1)*5)+1 ? '-'+dataLen : '')+' / '+data.searchresults.length+')</h3><div class="close-button"><img src="/legacy/images/close-button.png"/ width="30"></div>');
        if (data.searchresults.length > 5) {
          $('#search-results').append('<div id="search-results-nav"></div>');
          var last = Math.ceil(data.searchresults.length/5);
          for (var i=1; i<=last; i++) {
            $('#search-results-nav').append('<span class="search-result-page-selector '+(i==number?'selected':'unselected')+'" id="page-'+i+'">'+i+'</span>'+((i!=last) ? ' | ':''));

          }
        }
        $('.search-result-page-selector').on('click', function() {
          printPage($( this ).attr('id').match(/\d+/)[0],query,category)
        })
        for (var i=(number-1)*5; i<dataLen; i++) {
          var id = (category=='legislation') ? getStatuteItemId(data.searchresults[i].s):'';
          var title = (data.searchresults[i].title != "") ? data.searchresults[i].title : "";
          var l = (data.searchresults[i].l != "") ? data.searchresults[i].l : "";
          var len = 300;
          var match = data.searchresults[i].txt.match(new RegExp("([^\\s]+\\s+){0,4}"+query+"[^\\s]*(\\s+[^\\s]+){0,4}", 'i'));
          var txt = ''
          if (match == null) {
            if (category == 'legislation')
              var txt = (data.searchresults[i].txt.length > len) ?
                data.searchresults[i].txt.substring(0,len)+"...":data.searchresults[i].txt;
            else if (category == 'caselaw')
              var txt = (data.searchresults[i].abstract.length > len) ?
                data.searchresults[i].abstract.substring(0,len)+"...":data.searchresults[i].abstract;
          }
          else txt = "..."+match[0]+"..."
          $('#search-results').append(
            '<div class="search-result">'+
            (l.length > 0 ? '<div class="result-tag">Asiasana: <a href="'+data.searchresults[i].c+'">'+l+'</a></div>':'')+
              '<div class="id"><a href="'+data.searchresults[i].s+'">'+id+'</a></div>'+
              '<div class="title"><a href="'+data.searchresults[i].s+'">'+title+'</a></div>'+
              '<div class="text">'+txt+'</div>'+
            '</div>'
          );
        }
        $('.close-button').on('click', function() {$('#search-results').html('')});
      }
      // no results
      else {
        printNoResults()
      }
    };

    var availableTags = [];
    var printResults = function(data_,query,category) {
      availableTags = data_.autocomplete
      $( "#query" ).autocomplete({
        open: function (e, ui) {
          var acData = $(this).data('ui-autocomplete');
          acData
          .menu
          .element
          .find('li')
          .each(function () {
            var me = $(this);
            var keywords = acData.term.split(' ').join('|');
            me.html(me.text().replace(new RegExp("(" + keywords + ")", "gi"), '<b>$1</b>'));
            me.html(me.html().replace(new RegExp("Asiasana:", "g"), '<i>Asiasana:</i>'));
          });
        },
        source: $.map(data_.autocomplete, function (value, key) {
          return {
            label: ''+(value.type=='keyword' ? 'Asiasana: ' : '')+value.label,
            value: value.label
          }
        })
      });
      //console.log(data)
      if (data_.searchresults != undefined) {
        data = data_;
        printPage(1,query,category)
      }
    };

    var printNoResults = function() {
       $('#search-results').html('<h3 class="search-results-heading">Hakutulokset</h3><div class="close-button"><img src="/images/close-button.png"/ width="30"></div><div class="search-result">Ei hakutuloksia</div>');
    }

    $('#query').on('keyup', function() {
      delay(function(){
        performSearch();
      }, 300);
    });

    $('.search-icon').on('click', function() {
      performSearch();
    })
  });
}(jQuery));
