<div id = "filebrowser" class="ab-view-header">
  <div id="select-source-div" class="filebrowser-selector">
    <label for="select-source">Source: </label>
    <select name="select-source" id="select-source" class="select-filebrowser">
      </select>
  </div>

  <div id="autocomplete-id-div" class="filebrowser-selector">
    <label for="autocomplete-id">ID: </label>
    <input id="autocomplete-id" tabindex="1" class="autocomplete-filebrowser"></input>
  </div>

  <div id="computed-title-div" class="filebrowser-selector">
    <span id="computed-title"></span>
  </div>

<?php include("components/filebrowser/player.php"); ?>

<div id="zoom-control">
<ul class="ulhoriz">
<li><a onclick="viewAB.zoomOut()">-</a></li>
<li><a onclick="viewAB.zoomIn()">+</a></li>
</ul>
</div>

<div id = "spectro">
<img id="spec-image" src="https://cdn.audioblast.org/spec.png"/>
</div>


</div>
<script type="text/javascript" src="https://view.audioblast.org/components/filebrowser/filebrowser.js"></script>
