<?php
if (isset($_GET['page']) && $_GET['page'] == "ping") {
  echo "pong";
  exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="audioBLAST! Viewer - View and analyze bioacoustic recordings">
<title>audioBLAST! Viewer</title>
<link rel="stylesheet" href="ab-view.css">
<link rel="stylesheet" href="progress.css">
<link rel="stylesheet" href="https://cdn.audioblast.org/tabulator/dist/css/tabulator.min.css">
<script type="text/javascript" src="core/js/core.js"></script>
<script type="text/javascript" src="https://cdn.audioblast.org/plotly.js/dist/plotly.min.js" defer></script>
<script type="text/javascript" src="https://cdn.audioblast.org/tabulator/dist/js/tabulator.min.js" defer></script>
<script type="text/javascript" src="ab-tabulator.js" defer></script>
<?php include("core/includes/head.php"); ?>
</head>

<body>
<div id="title" role="banner">
  <a href="https://audioblast.org">
    <img src="https://cdn.audioblast.org/audioblast_flash.png" 
         alt="audioBLAST flash logo"
         class="audioblast-flash" /></a>
  <h1>audioBLAST! Viewer</h1>
  <?php include("core/includes/add_analysis.php"); ?>
  <?php include("core/filebrowser/component.php"); ?>
</div>
<div id="ab-view" role="main">
</div>
<div id="inspector" role="complementary">
  <h2>Inspector</h2>
  <div id="inspector-content">
  </div>
</div>

<?php
if (isset($_GET["source"]) && isset($_GET["id"])) {
  print("<div id='progress' class='dot-carousel'></div>");
} else {
  print("<p style='padding: 16px; color: var(--text-secondary);'>No recording selected.</p>");
}
?>

<div id="api-calls">API calls: <span id="api-call-count">0</span></div>

</body>
</html>

