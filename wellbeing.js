

var g_modal;
var g_modaliframe;

//This hack essentially allows us to catch the child details iframe has had an edit occur
//and that we should refresh the parent so that the summary calculates again.
//We use the global variable because we are allowed to know when an iframe has reloaded via the onload event
//but not to which URL it loaded (security cross-domain blah blah)
var g_triggerExpected = true; //first page load
var g_thisURL;

function bootload(facilityHasRecords, thisURL){
  invokeIframes();
  hideContentIfNoResults(facilityHasRecords);
  
  var element = document.getElementById("urlId");
  element.innerHTML = thisURL;
  g_thisURL = thisURL;

  // Get the modal
  g_modal = document.getElementById("myModal");
  g_modaliframe = document.getElementById("modaliframe");

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target == g_modal) {
      closeModal();
    }
  };

  // Get the <span> element that closes the modal
  var span = document.getElementsByClassName("close")[0];

  // When the user clicks on <span> (x), close the modal
  span.onclick = function() {
    closeModal();
  };
}


function showingNoContentScreen(){
  var element = document.getElementById("noReviews");
  if (element.style.display == "block")
  {
    return true;
  }

  return false;
}

function hideContentIfNoResults(showContent){
  if (!showContent){
    var element = document.getElementById("noReviews");
    element.style.display = "block";
  }
  else 
  {
    var element = document.getElementById("content");
    element.style.display = "block";
  }
}

function invokeIframes(){
  iFrameResize({ log: true }, '#summaryIframe');
  iFrameResize({ log: true }, '#detailsIframe');
}


function loadDetailsPane(view){

  var detailsIframe = document.getElementById("detailsIframe");
  g_triggerExpected = true;
  
  if (view === "")
  {
    view = detailsIframe.src;
  }
  
  detailsIframe.src = view;
}

function onLoadHandler_ReloadIfEditingWasDoneInsideTheIFrame(){
  if (g_triggerExpected)
  {
    g_triggerExpected = false;
    return;
  }

  //we want to update both the summary and rehit the details
  reload_iframes();
}

function showModal(url) {
  g_modal.style.display = "block";
  modaliframe.src = url;
}

function closeModal(){
  g_modal.style.display = "none";
  reload_iframes();
}


function reload_page(){
   window.location.replace("` + thisURL + `");
}

function reload_iframes() {
    
    if (showingNoContentScreen()){
      reload_page();
      return;
      //unfortunately, I can't get a reload page working so this is a workaround for now. Just to show all of the page.
    }
    
    g_triggerExpected=true;
    loadDetailsPane();

    var summaryIframe = document.getElementById("summaryIframe");
    summaryIframe.src = summaryIframe.src;
}
