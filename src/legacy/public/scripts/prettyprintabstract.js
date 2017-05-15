$(document).ready(function() {

  // ABSTRACT
  if ($(".abstract").length !== 0)
    $(".abstract").html($(".abstract").html()
      .replace('Kort referat på svenska','')
      .replace(/^\s*\n/mg,'\n')
      .replace(/^\s*(?=[^\s])/gm,'\n')
      .replace(/\s*$/,''));
  // TOC
  if ($(".table-of-contents").length !== 0)
    $(".table-of-contents").html('\n\n'+$(".table-of-contents").html()
      .replace(/^\s*(?=[^\s])/gm,''));

});
