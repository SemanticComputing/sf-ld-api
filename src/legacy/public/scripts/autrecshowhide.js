$(document).ready(function() {
  $("#aut-rec-subjects").hide();
  $("#aut-rec-show").show();
  $("#aut-rec-hide").hide();

  $("#aut-rec-hide").click(function(){
    $("#aut-rec-subjects").hide();
    $("#aut-rec-show").show();
    $("#aut-rec-hide").hide();
  });

  $("#aut-rec-show").click(function(){
    $("#aut-rec-subjects").show();
    $("#aut-rec-show").hide();
    $("#aut-rec-hide").show();
  });
});
