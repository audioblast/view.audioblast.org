function setInspectorObject(obj) {
  var keys = Object.keys(obj);
  var ret = "<table>";
  for (let i=0; i < keys.length; i++) {
    ret = ret + "<tr><td>" + keys[i] + "</td><td>" + obj[keys[i]] + "</td></tr>";
  }
  ret = ret + "</table";
  document.getElementById("inspector-content").innerHTML = ret;
}
