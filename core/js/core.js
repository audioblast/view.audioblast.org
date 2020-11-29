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
  viewAB.addPlugin(bedoyaAB);
  viewAB.addPlugin(biAB);

});


const viewAB = {
  source: null,
  id: null,
  renderContainer: "ab-view",
  currentT: 0,
  viewX: 10,  //x seconds fill schart
  axisX: [0,10],
  pluginCount: 0,
  intervalID: null,
  setFile(source, id) {
    this.source = source;
    this.id = id;
    if (this.source == null || this.id == null) {return;}
    for (var i = 0; i < Object.keys(this.plugins).length; i++) {
      Object.values(this.plugins)[i].setFile(this.source, this.id);
    }
  },
  getCurrentTime() {
    viewAB.currentTime(document.getElementById("audio-1").currentTime);
  },
  playStart() {
    this.intervalID = setInterval(function(){
      viewAB.currentTime(document.getElementById("audio-1").currentTime);
    }, 20);
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
        Object.values(this.plugins)[i].setCurrentTime(this.currentT);
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
      cP.innerHTML = "<div class='ab-control-parent'><a onclick='viewAB.removePlugin(\""+cname+"\")'>[x]</a> "+name+"</div>";
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
    for (var i = 0; i < Object.keys(this.plugins).length; i++) {
      if ('setAxisX' in Object.values(this.plugins)[i]) {
        Object.values(this.plugins)[i].setAxisX(range);
      }
    }
  },

  currentTime(t) {
    this.currentT = t;
    var start = Math.max(0, this.currentT - (this.viewX / 2));
    var end = start + this.viewX;
    this.setAxisX([start, end]);

    for (var i = 0; i < Object.keys(this.plugins).length; i++) {
      if ('setCurrentTime' in Object.values(this.plugins)[i]) {
        Object.values(this.plugins)[i].setCurrentTime(t);
      }
    }
  },

  setViewX(n) {
    this.viewX = n;
    this.currentTime(this.currentT);
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
