var availableComponents = ["bedoyaAB", "tdscAB", "biAB", "audiowaveformAB", "aciAB"];
var availableComponentsNames = ["Rainfall (Bedoya method)", "TDSC", "Bioacoustic Index", "Waveform", "Acoustic Complexity"];
var componentList = document.getElementById("components");
for (i=0; i < availableComponents.length; i++) {
  var newComponent = document.createElement('li');
  newComponent.innerHTML = "<a onclick='viewAB.addPlugin("+availableComponents[i]+")'>"+availableComponentsNames[i]+"</a>";
  componentList.appendChild(newComponent);
}
