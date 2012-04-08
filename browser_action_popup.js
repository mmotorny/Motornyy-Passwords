function onLoad() {
  chrome.windows.getCurrent(function(currentWindow) {
    chrome.tabs.query(
      {
        windowId: currentWindow.id,
        active: true
      },
      function(tabs) {
        new Popup(tabs[0]);
      });
  });
}

function Popup(tab) {
  this.tab = tab;
  
  this.masterPasswordInput = document.getElementsByClassName(
      'master-password-input')[0];
  this.confirmMasterPasswordInput = document.getElementsByClassName(
      'confirm-master-password-input')[0];
  this.masterPasswordMessage = document.getElementsByClassName(
      'master-password-message')[0];
  this.tagInput = document.getElementsByClassName('tag-input')[0];
  this.bitElements = document.getElementsByClassName('bit');

  var urlParser = document.createElement('a');
  urlParser.href = tab.url;
  this.tagInput.value = urlParser.host;

  this.confirmMasterPassword();
  this.updatePassword();

  this.masterPasswordInput.addEventListener('input', function() {
    this.confirmMasterPassword();
    this.updatePassword();
  }.bind(this));

  this.confirmMasterPasswordInput.addEventListener('input', function() {
    this.confirmMasterPassword();
    this.updatePassword();
  }.bind(this));
  
  this.tagInput.addEventListener('input', this.updatePassword.bind(this));
}

Popup.prototype.confirmMasterPassword = function() {
  this.masterPasswordMessage.classList.remove('error-shown');
  this.masterPasswordMessage.classList.remove('error-hidden');
  
  if (this.masterPasswordInput.value == '') {
    this.masterPasswordMessage.innerText = 'Master password is empty.';
    this.masterPasswordMessage.classList.add('error-shown');
  } else if (this.masterPasswordInput.value != 
      this.confirmMasterPasswordInput.value) {
    this.masterPasswordMessage.innerText = 'Master passwords doesn\'t match.';
    this.masterPasswordMessage.classList.add('error-shown');
  } else {
    this.masterPasswordMessage.classList.add('error-hidden');
  }
};

const POWER_2_32 = Math.pow(2, 32);
const ZEROS_32 = new Array(32 + 1).join('0');

Popup.prototype.updatePassword = function() {
  var masterPassword = this.masterPasswordInput.value;
  var tag = this.tagInput.value;
  var passwordBits = 
      sjcl.misc.pbkdf2(masterPassword, sjcl.hash.sha256.hash(tag)).
          map(function(word) {
            var binaryWord = (word >= 0 ? word : POWER_2_32 + word).
                toString(2);
            return ZEROS_32.substr(0, 32 - binaryWord.length) + binaryWord;
          }).join('');

  for (var bitIndex = 0; bitIndex < 256; ++bitIndex) {
    var bitElement = this.bitElements[bitIndex];
    bitElement.classList.remove('bit-zero');
    bitElement.classList.remove('bit-one');
    bitElement.classList.add(
      passwordBits[bitIndex] == '0' ? 'bit-zero' : 'bit-one');
  }
  
  this.password = new PasswordBuilder(passwordBits).build();
};

function PasswordBuilder(bits) {
  this.bits = bits;
  this.password = '';
}

PasswordBuilder.prototype.build = function() {
  while (true) {
    if (!this.addCharacter_('ABCDEFGHIJKLMNOP', 4)) {
      break;
    }
    if (!this.addCharacter_('abcdefghijklmnop', 4)) {
      break;
    }
    if (!this.addCharacter_('01234567', 3)) {
      break;
    }
    if (!this.addCharacter_('!@#$%^&*', 3)) {
      break;
    }
  }
  
  return this.password;
};

PasswordBuilder.prototype.addCharacter_ = function(characters, entropy) {
  if (this.bits.length < entropy) {
    return false;
  }
  
  this.password += characters[parseInt(this.bits.substr(0, entropy), 2)];
  this.bits = this.bits.substr(entropy);
  return true;
};

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

