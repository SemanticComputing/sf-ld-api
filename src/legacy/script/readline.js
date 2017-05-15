var lineReader = require('readline').createInterface({
          input: require('fs').createReadStream('abbr.txt')
});

var statuteAbbr={}

lineReader.on('line', function (line) {
//  console.log(line.match(/^[^\s,]+/));
 if (statuteAbbr[line.match(/^[^\s,]+/)] == undefined) statuteAbbr[line.match(/^[^\s,]+/)] = [];
 statuteAbbr[line.match(/^[^\s,]+/)].push(line.match(/,([^\s]+)/)[1])
});
lineReader.on('close', function() {
  require('fs').writeFile("abbr.json", JSON.stringify(statuteAbbr), function(err) {
    if(err) {
      return console.log(err);
    }
    console.log("The file was saved!");
  }); 
});
