
var g_thisURL;

function bootload(thisURL){
  invokeIframes();
  
  var element = document.getElementById("urlId");
  element.innerHTML = thisURL;
  g_thisURL = thisURL;
  
}

function invokeIframes(){
  iFrameResize({ log: true }, '#summaryIframeInsights');
  iFrameResize({ log: true }, '#overviewIframeInsights');
  iFrameResize({ log: true }, '#detailsIframeInsights');
}

function loadDetailsPane(view){

  var detailsIframe = document.getElementById("detailsIframeInsights");
  
  if (!view)
  {
    view = detailsIframe.src;
  }
  
  detailsIframe.src = view;
}


