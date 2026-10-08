function setInspectorActiveRecording() {
  viewAB.inspector_history.push({"setInspectorActiveRecording": null});
  const rec = viewAB.rec_data;
  var keys = Object.keys(rec);
  var ret = "";
  for (let i=0; i < keys.length; i++) {
    ret += "<b><span id='inspector-"+keys[i]+"-label'>" + keys[i] + "</span></b><br>";
    ret += "<span id='inspector-"+keys[i]+"'></span><br><br>";
  }
  document.getElementById("inspector-content").innerHTML = ret;
  //Values as text, not markup, as they come from the recording's source
  for (let i=0; i < keys.length; i++) {
    document.getElementById("inspector-"+keys[i]).textContent = String(rec[keys[i]]);
  }
  augmentInspectorSource(rec['source']);
  augmentInspectorTaxon(rec['taxon']);
}

function augmentInspectorSource(source) {
  source = source.replace(new RegExp('[.]', 'g'), '');
  var req = fetch("https://api.audioblast.org/standalone/modules/module_info/?module="+source+"&output=nakedJSON")
    .then(res => res.json())
    .then(data => {
      viewAB.api_inc();
      var s = document.getElementById('inspector-source');
      s.innerHTML = '';
      if (Object.keys(data).includes("logo_url")) {
        s.innerHTML += "<span style='text-align:center;'><img src='"+data['logo_url']+"' width='150px' /></span><br/>";
      }
      s.innerHTML += "<a target='_blank' href='"+data['url']+"'>"+data['mname']+"</a>";
    })
    .catch(function (error) {
      //document.getElementById(this.renderDiv).innerHTML = "Error: " + error;
  });
}

function augmentInspectorTaxon(taxon) {
  if (taxon == '') {return;}
  var req = fetch("https://api.audioblast.org/data/taxa/?taxon="+taxon+"&output=nakedJSON")
    .then(res => res.json())
    .then(data => {
      viewAB.api_inc();
      var e = document.getElementById('inspector-taxon');
      const italics = ["Species", "Subspecies", "Genus", "Subgenus"];
      if (italics.includes(data[0]['rank'])) {
        var italic = document.createElement('i');
        italic.textContent = data[0]['taxon'];
        e.replaceChildren(italic);
      }
      var rec_link = document.createElement('a');
      rec_link.setAttribute("href", "http://audioblast.org/?page=recordings&taxon="+encodeURIComponent(taxon));
      rec_link.textContent = "Recordings";
      var trait_link = document.createElement('a');
      trait_link.setAttribute("href", "http://audioblast.org/?page=traits&taxon="+encodeURIComponent(taxon));
      trait_link.textContent = "Traits";
      var links = document.createElement('small');
      links.append(rec_link, " | ", trait_link);
      e.append(document.createElement('br'), links);
    })
    .catch(function (error) {
      //document.getElementById(this.renderDiv).innerHTML = "Error: " + error;
  });
}
