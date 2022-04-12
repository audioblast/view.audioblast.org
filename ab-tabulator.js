var generateAnalysisTabulator = function(element, table, source, id, data, scrollTo) {
  if (element=="#null") {return;}
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "https://api.audioblast.org/analysis/"+table+"/columns/?output=nakedJSON", true);
  xhr.extraInfo = [element, table, source, id, data, scrollTo];
  xhr.onload = function (e) {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        viewAB.api_inc();
        var table = this.extraInfo[1];
        var element = this.extraInfo[0];
        var source = this.extraInfo[2];
        var id = this.extraInfo[3];
        var data = this.extraInfo[4];
        var scrollTo = this.extraInfo[5];
        var cols = JSON.parse(this.responseText);
        var ajaxURL = 'https://api.audioblast.org/analysis/'+table+'/?source='+source+'&id='+id;
        var settings = {
          index:"startTime",
          height:"100%",
          ajaxURL:ajaxURL,
          progressiveLoad:"load",
          paginationSize:50,
          dataSendParams:{
            "size":"page_size",
          },
          columns:parseColumns(cols),
          ajaxRequesting:function(url, params){
            viewAB.api_inc();
          },
        };
        if (this.data == null ) {
          settings.progressiveLoad = "load";
          settings.ajaxURL = ajaxURL;
        } else {
          settings.data = this.data;
        }

        var table = new Tabulator(element, settings);
        table.on("dataLoaded", function(){
          if (scrollTo != null) {
              this.scrollToRow(scrollTo);
            }
        });
      } else {
        console.error(xhr.statusText);
      }
    }
  };
  xhr.onerror = function (e) {
    console.error(xhr.statusText);
  };
  xhr.send(null);
}

var parseColumns = function(cols) {
  for (var i = 0; i < cols.length; i++) {
    if (cols[i]["headerFilter"] == "range") {
      cols[i]["headerFilter"] = minMaxFilterEditor;
      cols[i]["headerFilterFunc"] = minMaxFilterFunction;
    }
  }
  return(cols);
}
