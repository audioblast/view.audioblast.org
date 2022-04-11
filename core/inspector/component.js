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
}

function augmentInspectorSource(source) {
  source = source.replace(new RegExp('[.]', 'g'), '');
  var req = fetch("https://api.audioblast.org/standalone/modules/module_info/?module="+source+"&output=nakedJSON")
      .then(res => res.json())
      .then(data => {
        document.getElementById('inspector-source').innerHTML = "<a href='"+data['url']+"'>"+data['mname']+"</a>";
      })
      .catch(function (error) {
//        document.getElementById(this.renderDiv).innerHTML = "Error: " + error;
      });
}
