<div id = "filebrowser" class="ab-view-header">
  <div id="computed-title-div" class="filebrowser-selector">
    <span id="computed-title"></span><br>
    <span id="download-link"></span>
  </div>

  <?php include("core/filebrowser/player.php"); ?>

  <div id="zoom-control">
    <ul class="ulhoriz">
      <li>
        <a onclick="window.open('https://audioblast.org/audioblast.php?source=<?php print($_GET['source']); ?>&id=<?php print($_GET['id']); ?>', '_self');">
          <img class="audioblast-button" src="https://cdn.audioblast.org/audioblast_flash_white.png"
               alt="alphaBLAST! Search"/>
        </a>
      </li>
      <li>
        <a onclick="viewAB.zoomOut()">
          <img src="https://cdn.audioblast.org/audioblast_zoom_out.png"
               alt="Zoom Out"/>
        </a>
      </li>
      <li>
        <a onclick="viewAB.zoomIn()">
          <img src="https://cdn.audioblast.org/audioblast_zoom_in.png"
               alt="Zoom In"/>
        </a>
      </li>
      <li>
        <a onclick="viewAB.zoomFit()">
          <img src="https://cdn.audioblast.org/audioblast_zoom_fit.png"
               alt="Zoom to Fit"/>
        </a>
      </li>
    </ul>
  </div>

  <div id = "spectro">
  </div>
</div>
