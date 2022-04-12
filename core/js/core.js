document.addEventListener("DOMContentLoaded", function(event) {
  const urlParams = new URLSearchParams(window.location.search);
  var source = null;
  var id = null;

  if (urlParams.has('source')) {
    source = urlParams.get('source');
  }
  if (urlParams.has('id')) {
    id = urlParams.get('id');
  }
  viewAB.setFile(source, id);
  window.onresize = function() {
    viewAB.doRender("resize");
  }
});


const viewAB = {
  source: null,
  id: null,
  duration: null,
  renderContainer: "ab-view",
  currentT: 0,
  viewX: 60,  //x seconds fill schart
  axisX: [0,60],
  pluginCount: 0,
  intervalID: null,
  rec_data: null,
  api_count:0,
  api_inc: function() {
    this.api_count++;
    document.getElementById('api-call-count').innerHTML = this.api_count;
  },
  inspector_history: [],
  loaded_defaults: false,
  load_defaults: function() {
    this.loaded_defauts = true;
    viewAB.addPlugin(audiowaveformAB);
    viewAB.setTab('waveform0','annotations');
    viewAB.addPlugin(tdscAB);
    viewAB.addPlugin(aciAB);
    viewAB.setTab('aci2','chart');
  },
  setFile: function(source, id){
    if (source == null || id == null) {return;}
    this.source = source;
    this.id = id;

    var req = fetch("https://api.audioblast.org/data/recordings/?id="+this.id+"&source="+this.source+"&output=nakedJSON")
      .then(res => res.json())
      .then(data => {
        document.getElementById("progress").style.display = "none";
        this.api_inc();
        this.rec_data = data[0];
        this.setDuration(data[0]["duration"]);
        setInspectorActiveRecording();
        document.getElementById("computed-title").innerHTML = viewAB.rec_data["name"];
        if (viewAB.rec_data["filename"].substr(0,4) =="http") {
          document.getElementById("audio-1").src = viewAB.rec_data["filename"];
          document.getElementById("download-link").innerHTML = "<a href='"+viewAB.rec_data["filename"]+"'>Download</a>";
        } else {
          document.getElementById("audio-1").remove();
        }
        for (var i = 0; i < Object.keys(this.plugins).length; i++) {
          Object.values(this.plugins)[i].setFile(this.source, this.id);
        }
        if (!this.loaded_defaults) {
          this.load_defaults();
        }
      })
      .catch(function (error) {
//        document.getElementById(this.renderDiv).innerHTML = "Error: " + error;
      });
  },
  setDuration(d) {
    this.duration = d;
    for (var i = 0; i < Object.keys(this.plugins).length; i++) {
      if ('setDuration' in Object.values(this.plugins)[i]) {
        Object.values(this.plugins)[i].setDuration(this.duration);
      }
    }
  },
  getCurrentTime() {
    viewAB.currentTime(document.getElementById("audio-1").currentTime);
  },
  playStart() {
    this.intervalID = setInterval(function(){
      viewAB.currentTime(document.getElementById("audio-1").currentTime);
    }, 0);
  },
  playStop() {
    clearInterval(this.intervalID);
  },

  zoomIn() {
    this.setViewX(this.viewX / 2);
  },
  zoomOut() {
    this.setViewX(this.viewX * 2);
  },
  zoomFit() {
    this.setAxisX([0, this.duration]);
  },
  plugins: {},

  addPlugin(plugin) {

    const {name, exec} = plugin;
    const cname = name+this.pluginCount;
    this.pluginCount++;

    this.plugins[cname] = Object.create(exec);

    this.plugins[cname].setCName(cname);

    this.plugins[cname].setFile(this.source, this.id);

    for (var i = 0; i < Object.keys(this.plugins).length; i++) {
      if ('setCurrentTime' in Object.values(this.plugins)[i]) {
        Object.values(this.plugins)[i].setCurrentTime(this.currentT, this.axisX, false);
      }
    }
    for (var i = 0; i < Object.keys(this.plugins).length; i++) {
      if ('setAxisX' in Object.values(this.plugins)[i]) {
        Object.values(this.plugins)[i].setAxisX(this.axisX);
      }
    }

    if (this.plugins[cname].canRender) {
      var rC = document.getElementById(this.renderContainer);

      //Parent div we control
      var pD = document.createElement('div');
      pD.setAttribute("id", "render-parent-"+cname);
      pD.setAttribute("class", "ab-render-parent");
      rC.appendChild(pD);

      //Control parent div
      var cP = document.createElement('div');
      cP.setAttribute("id", "control-parent-"+cname);
      cP.setAttribute("class", "control-parent-render");
      cP.innerHTML = "<div class='ab-control-parent'><small><a onclick='viewAB.removePlugin(\""+cname+"\")'>❌</a></small> "+name+"</div>";
      document.getElementById("render-parent-"+cname).appendChild(cP);

      //Control div
      var cD = document.createElement('div');
      cD.setAttribute("id", "control-"+cname);
      cD.setAttribute("class", "control-render");
      document.getElementById("control-parent-"+cname).appendChild(cD);

      //Render div
      var rD = document.createElement('div');
      rD.setAttribute("id", "render-"+cname);
      rD.setAttribute("class", "ab-render");
      rD.innerHTML = "<p>Loading...</p>";
      document.getElementById("render-parent-"+cname).appendChild(rD);
      this.plugins[cname].setRenderDiv('render-'+cname);
      this.plugins[cname].setControlDiv('control-'+cname);
    }
  },

  removePlugin(name) {
    if (this.plugins[name].canRender) {
      var rD = document.getElementById("render-parent-"+name);
      rD.remove();
    }
    delete this.plugins[name];
  },

  setTab(name, value) {
    this.plugins[name].setTab(value);
  },

  setAxisX(range) {
    this.axisX = range;
    this.viewX = range[1] - range[0];
    this.currentTime(this.duration/2);
  },

  doRender(reason) {
    for (var i = 0; i < Object.keys(this.plugins).length; i++) {
        Object.values(this.plugins)[i].doRender(reason);
    }
  },

  currentTime(t) {
    if (t !== null) { this.currentT = t;}

    for (var i = 0; i < Object.keys(this.plugins).length; i++) {
      if ('setCurrentTime' in Object.values(this.plugins)[i]) {
        Object.values(this.plugins)[i].setCurrentTime(this.currentT, [this.currentT - this.viewX/2, this.currentT + this.viewX/2]);
      }
    }
  },

  setViewX(n) {
    this.viewX = n;
    var start = Math.max(0, this.currentT - (this.viewX / 2));
    var end = start + this.viewX;
    this.axisX = ([start, end]);
    this.currentTime(null);
  }
};

selectSetOptions = function(elementID, options) {
  options.unshift("-None-");
  options = options.map(i => '<option value="' + i + '">' + i + '</option>');
  document.getElementById(elementID).innerHTML = options.join();
}

abAPItoArray = function(obj) {
  var vals = Object.keys(obj).map(function(key) {
    return Object.values(obj[key])[0];
  });
  return(vals)
}
