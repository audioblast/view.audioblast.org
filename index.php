<?php
if (isset($_GET['page']) && $_GET['page'] == "ping") {
  echo "pong";
  exit;
}
?>
<html>
<head>
<title>audioBLAST! Viewer</title>
<link rel="stylesheet" href="ab-view.css">
<link rel="stylesheet" href="progress.css">
<link rel="stylesheet" href="https://cdn.audioblast.org/ab-api.css">
<link rel="stylesheet" href="https://cdn.audioblast.org/tabulator/dist/css/tabulator.min.css">
<script type="text/javascript" src="core/js/core.js"></script>
<script type="text/javascript" src="https://cdn.audioblast.org/plotly.js/dist/plotly.min.js" defer></script>
<script type="text/javascript" src="https://cdn.audioblast.org/tabulator/dist/js/tabulator.min.js" defer></script>
<script type="text/javascript" src="ab-tabulator.js" defer></script>
<?php include("core/includes/head.php"); ?>
</head>

<body>
<div id="title">
  <img src="https://cdn.audioblast.org/audioblast_flash.png" class="audioblast-flash" />
  <h1>audioBLAST! Viewer</h1>
  <?php include("core/includes/add_analysis.php"); ?>
  <?php include("core/filebrowser/component.php"); ?>
</div>
<div id="ab-view">
</div>
<div id="inspector">
  <h2>Inspector</h2>
  <div id="inspector-content">
  </div>
</div>

<div id="progress" class="dot-carousel"></div>

<div id="api-calls">API calls: <span id="api-call-count">0</span></div>

</body>
</head>

