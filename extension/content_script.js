var injected;
if (!injected) {
  injected = true;

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    var passwordSet = false;

    var inputElements = document.getElementsByTagName('input');
    for (var i = 0; i < inputElements.length; ++i) {
      var inputElement = inputElements[i];
      if (inputElement.type == 'password' && inputElement.value == '') {
        inputElement.focus();
        if (document.activeElement != inputElement) {
          continue;
        }
        
        passwordSet = true;
        
        inputElement.value = request.password;
        
        inputElement.dispatchEvent(new InputEvent('input', {
          bubbles: true,
          cancelable: true,
          inputType: 'insertText',
          data: request.password
        }));
        
        inputElement.dispatchEvent(new Event('change', {
          bubbles: true,
          cancelable: true
        }));
      }
    }
    
    sendResponse(passwordSet);
  });
}
