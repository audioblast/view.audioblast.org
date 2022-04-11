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
    data: null,
    res: null,
    duration: null,
    multiplier: 1,
    annotations: false,
    annotation_data: null,
    getAnnotations: function() {
      if (this.annotation_data == null) {
        this.dataRequested = fetch("https://api.audioblast.org/data/annomate/?source_id="+this.id+"&source="+this.source+"&output=nakedJSON")
        .then(res => res.json())
        .then(data => {
          viewAB.api_inc();
          this.annotation_data = data;
          this.doRender();
        })
        .catch(function (error) {
          document.getElementById(this.renderDiv).innerHTML = "Error: " + error;
        });
      }
    },
    setCName: function(cname) {
      this.cname = cname;
    },
    setDuration: function(d) {
      this.duration = d;
    },
    setFile: function(source, id) {
      this.source = source;
      this.id = id;
      this.data = null;
      this.dataRequested = null;
      if (this.renderDiv != null) {
        document.getElementById(this.renderDiv).innerHTML = "Loading...";
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
    doRender: function() {
      if (this.data  === null) {
        if (this.dataRequested == null) {
          this.dataRequested = fetch("https://api.audioblast.org/analysis/audiowaveform/?type=json10pps8bit&id="+this.id+"&source="+this.source+"&output=nakedJSON")
          .then(res => res.json())
          .then(data => {
            viewAB.api_inc();
            this.res = "10pps8bit";
            var timeAxis = [];
            var ampAxis1 = [];
            var ampAxis2 = [];
            var d = JSON.parse(data[0].value).data;
            for (i=0; i<d.length; i+=2) {
              ampAxis1.push(d[i]);
              ampAxis2.push(d[i+1]);
              timeAxis.push(i/2*0.05);
            }
            this.data = {'lowest': {t: timeAxis, a1: ampAxis1, a2: ampAxis2}};
            this.multiplier = 20;
            this.doRender();
          })
          .catch(function (error) {
//            document.getElementById(this.renderDiv).innerHTML = "Error: " + error;
          });
        }
        return 0;
      }

      var layout = {margin: {l: 0,r: 0,b: 0,t: 0,pad: 0}, showlegend: false, hovermode:false};
      layout['xaxis'] = {
        range: this.axisX
      };
      var ymax = 32768;
      layout['yaxis'] = {
        range:[-ymax, ymax]
      };
      layout['shapes'] =  [{
        //line for scroll
        xref: 'x',
        yref: 'paper',
        type: 'line',
        x0: 0,
        y0: 0,
        x1: 0,
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
       //Check that div still exists - it might have already been closed
       if (document.getElementById(this.renderDiv) !== undefined) {
          document.getElementById(this.renderDiv).innerHTML = "";
          if (this.res == '10pps8bit') {
            Plotly.newPlot(this.renderDiv, [{x:this.data.lowest.t, y:this.data.lowest.a1, fill: 'tozeroy', mode: 'none', fillcolor: 'black', name: 'min'},{x:this.data.lowest.t, y:this.data.lowest.a2, fill: 'tozeroy', mode: 'none', fillcolor: 'black', name: 'max'}], layout, {displayModeBar: false});
          }
          if (this.res == '200pps16bit') {
            Plotly.newPlot(this.renderDiv, [{x:this.data.middle.t, y:this.data.middle.a1, fill: 'tozeroy', mode: 'none', fillcolor: 'black', name: 'min'},{x:this.data.middle.t, y:this.data.middle.a2, fill: 'tozeroy', mode: 'none', fillcolor: 'black', name: 'max'}], layout, {displayModeBar: false});
          }
       }
       if (this.res == '10pps8bit') {
        this.dataRequested = fetch("https://api.audioblast.org/analysis/audiowaveform/?type=json200pps16bit&id="+this.id+"&source="+this.source+"&output=nakedJSON") 
          .then(res => res.json())
          .then(data => {
            viewAB.api_inc();
            this.res = "200pps16bit";
            var timeAxis = [];
            var ampAxis1 = [];
            var ampAxis2 = [];
            var d = JSON.parse(data[0].value).data;
            for (i=0; i<d.length; i+=2) {
              ampAxis1.push(d[i]);
              ampAxis2.push(d[i+1]);
              timeAxis.push(i/2*0.005);
            }
            this.data = {'middle': {t: timeAxis, a1: ampAxis1, a2: ampAxis2}};
            this.multiplier = this.data.middle.t.length / this.duration;
            this.doRender();
          })
          .catch(function (error) {
//            document.getElementById(this.renderDiv).innerHTML = "Error: " + error;
          });
       }
    },
    setCurrentTime: function(new_t, new_range, render) {
      this.currentTime = new_t;
      this.axisX = new_range;
      if (render == false) {return;}
      Plotly.relayout(this.renderDiv, {'shapes[0].x0':this.currentTime, 'shapes[0].x1':this.currentTime, 'xaxis.range': this.axisX});
    }
  }
};
