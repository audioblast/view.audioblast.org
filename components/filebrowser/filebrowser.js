const filebrowserAB = {
  name: 'filebrowser',
  exec: {
    source: null,
    id: null,
    cname: null,
    setCName: function(cname) {
      this.cname = cname;
    },
    setFile: function(source, id) {
      if (source == null && id == null) {return;}
      this.source = source;
      this.id = id;
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          const json = JSON.parse(this.responseText);
          document.getElementById("computed-title").innerHTML = json[0]["name"];
          if (json[0]["filename"].substr(0,4) =="http") {
            document.getElementById("audio-1").src = json[0]["filename"];
          } else {
            document.getElementById("audio-1").remove();
          }
        }
      };
      xhttp.open("GET", "https://api.audioblast.org/data/recordings/?id="+this.id+"&source="+this.source+"&output=nakedJSON", true);
      xhttp.send();

      var imgpath = "https://cdn.audioblast.org/files/" + this.source + "/audiowaveform/300_40/" + this.id + ".png";
      document.getElementById("spectro").innerHTML = "<img id='spec-image' src='"+imgpath+"'/>";
    },
    action: function(action, params) {
    }
  }
};
viewAB.addPlugin(filebrowserAB);
