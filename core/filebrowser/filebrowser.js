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

      var req = fetch("https://api.audioblast.org/data/recordings/?id="+this.id+"&source="+this.source+"&output=nakedJSON")
          .then(res => res.json())
          .then(data => {
            setInspectorObject(data[0]);
            document.getElementById("computed-title").innerHTML = data[0]["name"];
            if (data[0]["filename"].substr(0,4) =="http") {
              document.getElementById("audio-1").src = data[0]["filename"];
              document.getElementById("download-link").innerHTML = "<a href='"+data[0]["filename"]+"'>Download</a>";
            } else {
              document.getElementById("audio-1").remove();
            }
            viewAB.setDuration(data[0]["duration"]);
            })
          .catch(function (error) {
//            document.getElementById(this.renderDiv).innerHTML = "Error: " + error;
          });


/**
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          const json = JSON.parse(this.responseText);
          document.getElementById("spectro").innerHTML = "<img src='"+json[0]["value"]+"' />";
        }
      };
      xhttp.open("GET", "https://api.audioblast.org/analysis/audiowaveform/?id="+this.id+"&source="+this.source+"&type=image300_40&output=nakedJSON", true);
      xhttp.send();
*/
    },
    action: function(action, params) {
    }
  }
};
viewAB.addPlugin(filebrowserAB);
