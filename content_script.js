var injected;
if (!injected) {
  injected = true;

  chrome.extension.onRequest.addListener(function(request) {
    var inputElements = document.getElementsByTagName('input');
    for (var i = 0; i < inputElements.length; ++i) {
      var inputElement = inputElements[i];
      if (inputElement.type == 'password') {
        inputElement.focus();
        inputElement.value = request.password;
      }
    }
  });
}
