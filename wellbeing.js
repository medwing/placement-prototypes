function showModal(url) {
  modal.style.display = "block";
  modaliframe.src = url;
}

// Get the modal
var modal = document.getElementById("myModal");
var modaliframe = document.getElementById("modaliframe");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  closeModal();
}

function closeModal(){
  modal.style.display = "none";
  reload_iframes();
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    closeModal();
  }
}

function reload_iframes() {
    var f_list = document.getElementsByTagName('iframe');
 
    for (var i = 0, f; f = f_list[i]; i++) {
        f.src = f.src;
    }
}
