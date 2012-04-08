function onLoad() {
  chrome.windows.getCurrent(function(currentWindow) {
    chrome.tabs.query(
      {
        windowId: currentWindow.id,
        active: true
      },
      function(tabs) {
        onLoadInTab(tabs[0]);
      });
  });
}

const POWER_2_32 = Math.pow(2, 32);
const ZEROS_32 = new Array(32 + 1).join('0');

function onLoadInTab(tab) {
  var masterPasswordInput = document.getElementsByClassName(
      'master-password-input')[0];
  var confirmMasterPasswordInput = document.getElementsByClassName(
      'confirm-master-password-input')[0];
  var tagInput = document.getElementsByClassName('tag-input')[0];
  var bitElements = document.getElementsByClassName('bit');
  
  masterPasswordInput.addEventListener('input', function() {
    var passwordBits = 
        sjcl.misc.pbkdf2(
            masterPasswordInput.value, sjcl.hash.sha256.hash(tagInput.value)).
                map(function(word) {
                  var binaryWord = (word >= 0 ? word : POWER_2_32 + word).
                      toString(2);
                  return ZEROS_32.substr(0, 32 - binaryWord.length) + binaryWord;
                }).join('');
    
    for (var bitIndex = 0; bitIndex < 256; ++bitIndex) {
      var bitElement = bitElements[bitIndex];
      bitElement.classList.remove('bit-zero');
      bitElement.classList.remove('bit-one');
      bitElement.classList.add(
        passwordBits[bitIndex] == '0' ? 'bit-zero' : 'bit-one');
    }
  });
}

/*
tabId = tab.id;
var urlParser = document.createElement('a');
urlParser.href = tab.url;
tagInput.value = urlParser.host;
*/

function PasswordBuilder(bits) {
  var password = '';

  this.build = function() {
    while (true) {
      if (!addCharacter('ABCDEFGHIJKLMNOP', 4)) {
        break;
      }
      if (!addCharacter('abcdefghijklmnop', 4)) {
        break;
      }
      if (!addCharacter('01234567', 3)) {
        break;
      }
      if (!addCharacter('!@#$%^&*', 3)) {
        break;
      }
    }
    
    return password;
  }
  
  function addCharacter(characters, entropy) {
    if (bits.length < entropy) {
      return false;
    }
    
    password += characters[parseInt(bits.substr(0, entropy), 2)];
    bits = bits.substr(entropy);
    return true;
  }
}

/*
var tagInput = document.getElementsByClassName('tag-input')[0];
var masterPasswordInput = 
    document.getElementsByClassName('master-password-input')[0];
var fillFormButton = document.getElementsByClassName('fill-form-button')[0];
var tabId;

fillFormButton.addEventListener('click', function() {
  var tag = tagInput.value;
  var masterPassword = masterPasswordInput.value;
  var uniquePasswordBits = 
      sjcl.misc.pbkdf2(masterPassword, sjcl.hash.sha256.hash(tag)).
          map(function(word) {
            var binaryWord = (word >= 0 ? word : POWER_2_32 + word).
                toString(2);
            return ZEROS_32.substr(0, 32 - binaryWord.length) + binaryWord;
          }).join('');
  
  if (tabId === undefined) {
    // TODO(maksym): Report error.
  } else {
    chrome.tabs.executeScript(tabId, {file: 'content_script.js'}, function() {
      chrome.tabs.sendRequest(tabId, {
        uniquePassword: new PasswordBuilder(uniquePasswordBits).build()
      });
      window.close();
    });
  }
});
*/

