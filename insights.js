
var g_thisURL;

function bootload(thisURL){
  invokeIframes();
  
  var element = document.getElementById("urlId");
  element.innerHTML = thisURL;
  g_thisURL = thisURL;
  
}

function invokeIframes(){
  iFrameResize({ log: true }, '#summaryIframe');
  iFrameResize({ log: true }, '#overviewIframe');
  iFrameResize({ log: true }, '#detailsIframe');
}

function loadDetailsPane(view){

  var detailsIframe = document.getElementById("detailsIframe");
  
  if (!view)
  {
    view = detailsIframe.src;
  }
  
  detailsIframe.src = view;
}


