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
        
        var keyDownEvent = document.createEvent('KeyboardEvent');
        keyDownEvent.initKeyboardEvent(
            'keydown', true, true, window, '', '', 0, '', false, '');
        inputElement.dispatchEvent(keyDownEvent);

        var keyPressEvent = document.createEvent('KeyboardEvent');
        keyPressEvent.initKeyboardEvent(
            'keypress', true, true, window, '', '', 0, '', false, '');
        inputElement.dispatchEvent(keyPressEvent);

        var textEvent = document.createEvent('TextEvent');
        textEvent.initTextEvent(
            'textInput', true, true, window, request.password);
        inputElement.dispatchEvent(textEvent);

        var keyUpEvent = document.createEvent('KeyboardEvent');
        keyUpEvent.initKeyboardEvent(
            'keyup', true, true, window, '', '', 0, '', false, '');
        inputElement.dispatchEvent(keyUpEvent);
      }
    }
    
    sendResponse(passwordSet);
  });
}
