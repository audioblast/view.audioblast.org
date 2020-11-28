document.addEventListener('DOMContentLoaded', function(event) {
  selectFilebrowserInit();
  autocompleteFilebrowserInit();
})

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
      this.source = source;
      this.id = id;
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          const json = JSON.parse(this.responseText);
          document.getElementById("computed-title").innerHTML = json[0]["name"];
          document.getElementById("audio-1").src = json[0]["filename"];
        }
      };
      xhttp.open("GET", "https://api.audioblast.org/data/recordings/?id="+this.id+"&source="+this.source+"&output=nakedJSON", true);
      xhttp.send();
      }
   },
   action: function(action, params) {
   }
};
viewAB.addPlugin(filebrowserAB);
