var injected;
if (!injected) {
  injected = true;

  chrome.extension.onRequest.addListener(function(request) {
    console.log(request.password);
  });
}
