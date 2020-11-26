document.addEventListener('DOMContentLoaded', function(event) {
  selectFilebrowserInit();
  autocompleteFilebrowserInit();
})

var selectFilebrowserInit = function(){
  var e = document.getElementsByClassName("select-filebrowser");
  var i;
  for (i = 0; i < e.length; i++) {
    var id = e[i].getAttribute("id");
    var pts = id.split("-");
    selectFilebrowser(pts[1]);
  }
}

var selectFilebrowser = function(field) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      selectSetOptions("select-"+field, abAPItoArray(JSON.parse(this.responseText)));
    }
  };
  xhttp.open("GET", "https://api.audioblast.org/data/recordings/autocomplete/"+field+"/?output=nakedJSON", true);
  xhttp.send();
}

var autocompleteFilebrowserInit = function(){
  var e = document.getElementsByClassName("autocomplete-filebrowser");
  var i;
  for (i = 0; i < e.length; i++) {
    var id = e[i].getAttribute("id");
    var pts = id.split("-");
    autocompleteFilebrowser(pts[1]);
  }
}

var autocompleteFilebrowser = function(element){
  element = "autocomplete-" + element;
  elementID = "#" + element;
  new autoComplete({
    data: {                              // Data src [Array, Function, Async] | (REQUIRED)
      src: async () => {
        // User search query
        const query = document.querySelector(elementID).value;
        var absource = "";
        if (document.getElementById("select-source").value != "-None-") {
          absource = document.getElementById("select-source").value;
        }
        // Fetch External Data Source
        const source = await fetch(`https://api.audioblast.org/data/recordings/autocomplete/id/?output=nakedJSON&c=${query}&source=${absource}`);
        // Format data into JSON
        const data = await source.json();
        // Return Fetched data
        return data;
      },
      key: ["id"],
      cache: false
    },
    sort: (a, b) => {                    // Sort rendered results ascendingly | (Optional)
        if (a.match < b.match) return -1;
        if (a.match > b.match) return 1;
        return 0;
    },
    placeHolder: "...",     // Place Holder text                 | (Optional)
    selector: elementID,           // Input field selector              | (Optional)
    threshold: 3,                        // Min. Chars length to start Engine | (Optional)
    debounce: 300,                       // Post duration for engine to start | (Optional)
    searchEngine: "strict",              // Search Engine type/mode           | (Optional)
    resultsList: {                       // Rendered results list object      | (Optional)
        render: true,
        /* if set to false, add an eventListener to the selector for event type
           "autoComplete" to handle the result */
        container: source => {
            source.setAttribute("id", element+"_list");
        },
        destination: document.querySelector(element),
        position: "afterend",
        element: "ul"
    },
    maxResults: 10,                         // Max. number of rendered results | (Optional)
    highlight: true,                       // Highlight matching results      | (Optional)
    resultItem: {                          // Rendered result item            | (Optional)
        content: (data, source) => {
            source.innerHTML = data.match;
        },
        element: "li"
    },
    noResults: () => {                     // Action script on noResults      | (Optional)
        const result = document.createElement("li");
        result.setAttribute("class", "no_result");
        result.setAttribute("tabindex", "1");
        result.innerHTML = "No Results";
        document.querySelector(element).appendChild(result);
    },
    onSelection: feedback => {             // Action script onSelection event | (Optional)
        document.getElementById(element).value = feedback.selection.value.id;
        viewAB.setFile('', feedback.selection.value.id);
    }
  });
}

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
