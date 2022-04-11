function setInspectorActiveRecording() {
  viewAB.inspector_history.push({"setInspectorActiveRecording": null});
  const rec = viewAB.rec_data;
  var keys = Object.keys(rec);
  var ret = "";
  for (let i=0; i < keys.length; i++) {
    ret += "<b><span id='inspector-"+keys[i]+"-label'>" + keys[i] + "</span></b><br>";
    ret += "<span id='inspector-"+keys[i]+"'>" + rec[keys[i]] + "</span><br><br>";
  }
  document.getElementById("inspector-content").innerHTML = ret;
  augmentInspectorSource(rec['source']);
  augmentInspectorTaxon(rec['taxon']);
}

function augmentInspectorSource(source) {
  source = source.replace(new RegExp('[.]', 'g'), '');
  var req = fetch("https://api.audioblast.org/standalone/modules/module_info/?module="+source+"&output=nakedJSON")
    .then(res => res.json())
    .then(data => {
      viewAB.api_inc();
      document.getElementById('inspector-source').innerHTML = "<a target='_blank' href='"+data['url']+"'>"+data['mname']+"</a>";
    })
    .catch(function (error) {
      //document.getElementById(this.renderDiv).innerHTML = "Error: " + error;
  });
}

function augmentInspectorTaxon(taxon) {
  var req = fetch("https://api.audioblast.org/data/taxa/?taxon="+taxon+"&output=nakedJSON")
    .then(res => res.json())
    .then(data => {
      viewAB.api_inc();
      var e = document.getElementById('inspector-taxon');
      const italics = ["Species", "Subspecies", "Genus", "Subgenus"];
      if (italics.includes(data[0]['rank'])) {
        e.innerHTML = "<i>"+data[0]['taxon']+"</i>";
      }
      var rec_link = "<a href='http://audioblast.org/?page=recordings&taxon="+taxon+"'>Recordings</a>";
      var trait_link = "<a href='http://audioblast.org/?page=traits&taxon="+taxon+"'>Traits</a>";
      e.innerHTML += "<br><small>"+rec_link+" | "+trait_link+"</small>";
    })
    .catch(function (error) {
      //document.getElementById(this.renderDiv).innerHTML = "Error: " + error;
  });
}
