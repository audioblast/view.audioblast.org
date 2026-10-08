const audiowaveformAB = {
  name: 'waveform',
  exec: {
    source: null,
    id: null,
    canRender: true,
    renderDiv: null,
    controlDiv: null,
    axisX: null,
    currentTime: 0,
    cname: null,
    status: null,
    peaksRequested: null,
    peaks: null,
    levels: null,
    drawn: null,
    annotations: false,
    annotation_data: null,
    annotationsRequested: null,
    getAnnotations: function() {
      if (this.annotation_data == null && this.annotationsRequested == null) {
        var req = this.annotationsRequested = fetch("https://api.audioblast.org/data/annomate/?source_id="+this.id+"&source="+this.source+"&output=nakedJSON")
        .then(res => res.json())
        .then(data => {
          viewAB.api_inc();
          if (this.annotationsRequested !== req) {return;}
          this.annotation_data = data;
          this.doRender();
        })
        .catch(error => {
          console.error(error);
          if (this.annotationsRequested === req) {this.annotationsRequested = null;}
        });
      }
    },
    setCName: function(cname) {
      this.cname = cname;
    },
    setFile: function(source, id) {
      this.source = source;
      this.id = id;
      this.status = null;
      this.peaksRequested = null;
      this.peaks = null;
      this.levels = {};
      this.drawn = null;
      this.annotation_data = null;
      this.annotationsRequested = null;
      if (this.renderDiv != null) {
        this.showMessage("Loading...");
      }
      if (this.annotations) {
        this.getAnnotations();
      }
      this.doRender();
    },
    setRenderDiv: function(div) {
      this.renderDiv = div;
      this.doRender();
    },
    setTab: function(tab) {
      this.activeTab = tab;
      if (tab=="annotations") {
        this.annotations=true;
        this.getAnnotations();
      }
      if (tab == "noannotations") {
        this.annotations=false;
      }
      this.doRender();
      this.doRenderControl();
    },
    setControlDiv: function(div) {
      this.controlDiv = div;
      this.doRenderControl();
    },
    doRenderControl: function() {
      var controller = document.getElementById(this.controlDiv);
      if (this.annotations) {
        controller.innerHTML = "<ul><li><a onclick=\"viewAB.setTab('"+this.cname+"','noannotations')\">Hide Annotations</a></li></ul>";
      } else {
        controller.innerHTML = "<ul><li><a onclick=\"viewAB.setTab('"+this.cname+"','annotations')\">Show Annotations</a></li></ul>";
      }
    },
    //The recording viewAB has fetched, unless this was added before it arrived
    getRecording: function() {
      var rec = viewAB.rec_data;
      if (rec != null && rec.source == this.source && rec.id == this.id) {
        return Promise.resolve(rec);
      }
      return fetch("https://api.audioblast.org/data/recordings/?id="+this.id+"&source="+this.source+"&output=nakedJSON")
        .then(res => res.json())
        .then(data => {
          viewAB.api_inc();
          return data[0];
        });
    },
    //The waveform is drawn from the finest peaks there are: the recording's own
    //(peaks_url), unless the manifest of its spectrogram tiles (spectrogram_url)
    //lists finer. At the same resolution the recording's own are kept, as they mix
    //every channel, where the manifest's are of the one channel the tiles show.
    loadPeaks: async function() {
      var request = this.peaksRequested = {};
      this.status = "loading";
      var failed = false;
      try {
        var rec = (this.source == null || this.id == null) ? null : await this.getRecording();
        if (this.peaksRequested !== request) {return;}
        var listed = (rec && rec.spectrogram_url) ? this.fetchManifestPeaks(rec.spectrogram_url) : Promise.resolve([]);
        listed = listed.catch(error => {
          failed = true;
          return [];
        });
        if (rec && rec.peaks_url) {
          try {
            var peaks = await this.fetchPeaks(rec.peaks_url);
            if (this.peaksRequested !== request) {return;}
            this.showPeaks(peaks);
          } catch (error) {
            failed = true;
          }
        }
        var finest = (await listed)[0];
        if (this.peaksRequested !== request) {return;}
        //Finer by more than the rounding of the manifest's pointsPerSecond
        if (finest && (this.peaks == null || finest.pointsPerSecond > this.peaks.pointsPerSecond * 1.01)) {
          try {
            var finer = await this.fetchPeaks(finest.url);
            if (this.peaksRequested !== request) {return;}
            this.showPeaks(finer);
          } catch (error) {
            failed = true;
          }
        }
      } catch (error) {
        failed = true;
      }
      if (this.peaksRequested !== request || this.peaks != null) {return;}
      this.status = failed ? "error" : "none";
      this.doRender();
    },
    //A BBC audiowaveform JSON file (version 2), which says itself how many samples
    //each point stands for, at how many bits and for how many channels. Each
    //point's lowest and highest value over every channel is kept, from -1 to 1.
    fetchPeaks: function(url) {
      return fetch(url)
        .then(res => {
          if (!res.ok) {throw new Error(res.status+" "+url);}
          return res.json();
        })
        .then(j => {
          var channels = j.channels || 1;
          var n = Math.min(j.length, Math.floor(j.data.length / (2 * channels)));
          if (!(n > 0 && j.sample_rate > 0 && j.samples_per_pixel > 0)) {throw new Error("No peaks in "+url);}
          var scale = Math.pow(2, (j.bits || 16) - 1);
          var min = new Float32Array(n);
          var max = new Float32Array(n);
          for (var i = 0; i < n; i++) {
            var lo = Infinity;
            var hi = -Infinity;
            for (var c = 0; c < channels; c++) {
              lo = Math.min(lo, j.data[(i*channels + c)*2]);
              hi = Math.max(hi, j.data[(i*channels + c)*2 + 1]);
            }
            min[i] = lo / scale;
            max[i] = hi / scale;
          }
          var pps = j.sample_rate / j.samples_per_pixel;
          return {min: min, max: max, pointsPerSecond: pps, duration: n / pps};
        });
    },
    //The peaks a tiles manifest lists (wavesurfer-tiled-spectrogram's SPEC.md),
    //finest first, at addresses resolved against the manifest's own
    fetchManifestPeaks: function(url) {
      return fetch(url)
        .then(res => {
          if (!res.ok) {throw new Error(res.status+" "+url);}
          return res.json();
        })
        .then(manifest => (Array.isArray(manifest.peaks) ? manifest.peaks : [])
          .filter(p => p && p.url && p.pointsPerSecond > 0)
          .map(p => ({url: new URL(p.url, url).href, pointsPerSecond: Number(p.pointsPerSecond)}))
          .sort((a, b) => b.pointsPerSecond - a.pointsPerSecond));
    },
    showPeaks: function(peaks) {
      this.peaks = peaks;
      this.levels = {1: peaks};
      this.drawn = null;
      this.status = "ready";
      this.doRender();
    },
    showMessage: function(text) {
      var element = document.getElementById(this.renderDiv);
      if (element == null) {return;}
      if (element.classList.contains("js-plotly-plot")) {
        Plotly.purge(element);
        element.classList.remove("js-plotly-plot");
      }
      element.innerHTML = "<p>"+text+"</p>";
      this.drawn = null;
    },
    shownRange: function() {
      var range = this.axisX;
      if (range == null || !(range[1] > range[0])) {return [0, this.peaks.duration];}
      return range;
    },
    //Plotly redraws every point plotted each time playback moves the view, so
    //about a point a pixel is plotted: zoomed out, an overview of the finest peaks
    //combined in twos, fours and so on; zoomed in, the finest themselves (the
    //detail). This gives how many of the finest each point plotted combines.
    factorFor: function(range, width) {
      var wanted = width / (range[1] - range[0]);
      var factor = 1;
      while (2 * factor * wanted <= this.peaks.pointsPerSecond) {factor *= 2;}
      return factor;
    },
    //The finest peaks combined factor at a time, keeping the lowest and highest
    level: function(factor) {
      if (!(factor in this.levels)) {
        var fine = this.peaks;
        var n = Math.ceil(fine.min.length / factor);
        var min = new Float32Array(n);
        var max = new Float32Array(n);
        for (var j = 0; j < n; j++) {
          var end = Math.min((j+1)*factor, fine.min.length);
          var lo = fine.min[j*factor];
          var hi = fine.max[j*factor];
          for (var i = j*factor + 1; i < end; i++) {
            if (fine.min[i] < lo) {lo = fine.min[i];}
            if (fine.max[i] > hi) {hi = fine.max[i];}
          }
          min[j] = lo;
          max[j] = hi;
        }
        this.levels[factor] = {min: min, max: max, pointsPerSecond: fine.pointsPerSecond / factor, duration: fine.duration};
      }
      return this.levels[factor];
    },
    //Whether the time now shown is at another resolution, or beyond what is plotted
    needsRedraw: function() {
      var range = this.shownRange();
      if (this.factorFor(range, this.drawn.width) != this.drawn.factor) {return true;}
      return (range[0] < this.drawn.from && this.drawn.from > 0) ||
             (range[1] > this.drawn.to && this.drawn.to < this.peaks.duration);
    },
    doRender: function() {
      var element = document.getElementById(this.renderDiv);
      if (element == null) {return;}
      if (this.status == null) {
        this.loadPeaks();
        return;
      }
      if (this.status == "none") {
        this.showMessage("No waveform available");
        return;
      }
      if (this.status == "error") {
        this.showMessage("The waveform could not be loaded");
        return;
      }
      if (this.status != "ready") {return;}

      var range = this.shownRange();
      var width = element.clientWidth || 1000;
      var factor = this.factorFor(range, width);
      var level = this.level(factor);
      //Only the time shown is plotted, and half as much again on either side, so
      //that playback can move the view a while before it is plotted again
      var span = range[1] - range[0];
      var from = Math.max(0, range[0] - span/2);
      var to = Math.min(this.peaks.duration, range[1] + span/2);
      var timeAxis = [];
      var ampAxis1 = [];
      var ampAxis2 = [];
      var last = Math.min(level.min.length - 1, Math.ceil(to * level.pointsPerSecond));
      for (var i = Math.floor(from * level.pointsPerSecond); i <= last; i++) {
        timeAxis.push(i / level.pointsPerSecond);
        ampAxis1.push(level.min[i]);
        ampAxis2.push(level.max[i]);
      }
      this.drawn = {factor: factor, from: from, to: to, width: width};

      var layout = {margin: {l: 0,r: 0,b: 0,t: 0,pad: 0}, showlegend: false, hovermode:false};
      layout['xaxis'] = {
        range: this.axisX
      };
      layout['yaxis'] = {
        range:[-1, 1]
      };
      layout['shapes'] =  [{
        //line for scroll
        xref: 'x',
        yref: 'paper',
        type: 'line',
        x0: this.currentTime,
        y0: 0,
        x1: this.currentTime,
        y1: 2,
        line: {
          color: 'rgb(128, 0, 128)',
          width: 3
        }
      }];

      layout['annotations'] = [];

      if (this.annotations && this.annotation_data != null) {
        for (let i = 0; i < this.annotation_data.length; i++) {
          var color = '#d3d3d3';
          switch(this.annotation_data[i]['type']){
            case 'Voice Introduction':
              color = 'lightblue';
              break;
            case 'Call':
              color = 'lightgreen';
              break;
          }
          var label = this.annotation_data[i]['type'];
          if (label == "Voice Introduction") {
            label = "  🗣️"+" Voice Introduction";
          }
          if (label == "Call") {
            if (this.annotation_data[i]['taxon'] != '') {
              label = "  🦗 "+label+" (<i>"+this.annotation_data[i]['taxon']+"</i>)";
            }
          }
          layout['shapes'].push({
            type: 'rect',
            xref: 'x',
            yref: 'paper',
            x0: this.annotation_data[i]['time_start'],
            y0: 0,
            x1: this.annotation_data[i]['time_end'],
            y1: 60,
            fillcolor: color,
            opacity: 0.4,
            line: {
                width: 0
            }
          });
          layout['annotations'].push({
            x: this.annotation_data[i]['time_start'],
            y: 0,
            xref: 'x',
            yref: 'paper',
            text: label,
            showarrow: false,
            ax: 0,
            ay: 0,
            xanchor: 'left',
            font: {
              size: 14
            }
          });
        }
      }
      var traces = [{x:timeAxis, y:ampAxis1, fill: 'tozeroy', mode: 'none', fillcolor: 'black', name: 'min'},{x:timeAxis, y:ampAxis2, fill: 'tozeroy', mode: 'none', fillcolor: 'black', name: 'max'}];
      if (element.classList.contains("js-plotly-plot")) {
        Plotly.react(this.renderDiv, traces, layout, {displayModeBar: false, doubleClick: false});
      } else {
        element.innerHTML = "";
        Plotly.newPlot(this.renderDiv, traces, layout, {displayModeBar: false, doubleClick: false});
      }
    },
    setCurrentTime: function(new_t, new_range, render) {
      this.currentTime = new_t;
      this.axisX = new_range;
      if (render == false || this.drawn == null) {return;}
      if (this.needsRedraw()) {
        this.doRender();
        return;
      }
      Plotly.relayout(this.renderDiv, {'shapes[0].x0':this.currentTime, 'shapes[0].x1':this.currentTime, 'xaxis.range': this.axisX});
    }
  }
};
