

var g_modal;
var g_modaliframe;

//This hack essentially allows us to catch the child details iframe has had an edit occur
//and that we should refresh the parent so that the summary calculates again.
//We use the global variable because we are allowed to know when an iframe has reloaded via the onload event
//but not to which URL it loaded (security cross-domain blah blah)
var g_triggerExpected = true; //first page load
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




