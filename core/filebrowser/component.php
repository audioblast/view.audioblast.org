<div id = "filebrowser" class="ab-view-header">
  <div id="computed-title-div" class="filebrowser-selector">
    <span id="computed-title"></span><br>
    <span id="download-link"></span>
  </div>


<?php include("core/filebrowser/player.php"); ?>


<div id="zoom-control">
<ul class="ulhoriz">
<li class="big"><a onclick="window.open('https://audioblast.org/audioblast/?source=<?php print($_GET['source']); ?>&id=<?php print($_GET['id']); ?>', '_self');">audioBLAST!</a></li>
<li><a onclick="viewAB.zoomOut()">-</a></li>
<li><a onclick="viewAB.zoomIn()">+</a></li>
<li><a onclick="viewAB.zoomFit()">[-]</a></li>
</ul>
</div>

<div id = "spectro">
</div>


</div>
