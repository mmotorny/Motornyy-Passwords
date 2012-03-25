function onLoad() {
  document.getElementsByClassName('fill-form-button')[0].addEventListener(
    'click', function() {
      var masterPasswordInput = 
          document.getElementsByClassName('master-password-input')[0];
      var masterPassword = masterPasswordInput.value;
      console.log(masterPassword);

      var urlInput = document.getElementsByClassName('url-input')[0];
      var url = urlInput.value;
      console.log(url);

      console.log(sjcl.misc.pbkdf2(masterPassword, sjcl.hash.sha256.hash(url)));
    });
}
