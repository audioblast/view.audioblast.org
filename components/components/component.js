var availableComponents = ["bedoyaAB", "tdscAB", "biAB", "audiowaveformAB"];
var componentList = document.getElementById("components");
for (i=0; i < availableComponents.length; i++) {
  var newComponent = document.createElement('li');
  newComponent.innerHTML = "<a onclick='viewAB.addPlugin("+availableComponents[i]+")'>"+availableComponents[i]+"</a>";
  componentList.appendChild(newComponent);
}
