function onLoad() {
  var urlInput = document.getElementsByClassName('url-input')[0];
  var masterPasswordInput = 
      document.getElementsByClassName('master-password-input')[0];
  var fillFormButton = document.getElementsByClassName('fill-form-button')[0];

  urlInput.addEventListener('focus', function() {
    masterPasswordInput.focus();
  });

  fillFormButton.addEventListener('click', function() {
    var url = urlInput.value;
    console.log(url);

    var masterPassword = masterPasswordInput.value;
    console.log(masterPassword);

    console.log(sjcl.misc.pbkdf2(masterPassword, sjcl.hash.sha256.hash(url)));
  });
  
  chrome.windows.getCurrent(function(currentWindow) {
    chrome.tabs.query(
      {
        windowId: currentWindow.id,
        active: true
      },
      function(tabs) {
        urlInput.value = tabs[0].url;
      });
  });
}
