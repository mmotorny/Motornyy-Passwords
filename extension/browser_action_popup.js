window.addEventListener('load', function() {
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
});

function Popup(tab) {
  this.tab = tab;

  this.motornyyLogo = document.getElementsByClassName('motornyy-logo')[0];
  this.masterPasswordInput = document.getElementsByClassName(
      'master-password-input')[0];
  this.confirmMasterPasswordInput = document.getElementsByClassName(
      'confirm-master-password-input')[0];
  this.masterPasswordMessage = document.getElementsByClassName(
      'master-password-message')[0];
  this.confirmMasterPasswordMessage = document.getElementsByClassName(
      'confirm-master-password-message')[0];
  this.tagInput = document.getElementsByClassName('tag-input')[0];
  this.lettersOnlyCheckbox = document.getElementsByClassName(
      'letters-only-checkbox')[0];
  this.bitInput = document.getElementsByClassName('bit-input')[0];
  this.bitElements = document.getElementsByClassName('bit');
  this.shutterSound = document.getElementById('shutter-sound');
  this.bitMessage = document.getElementsByClassName('bit-message')[0];
  this.fillFormButton = document.getElementsByClassName('fill-form-button')[0];
  this.fillFormMessage = document.getElementsByClassName(
      'fill-form-message')[0];

  this.parseUrl_(tab.url);

  this.confirmMasterPassword_();
  this.updatePassword_();

  this.motornyyLogo.addEventListener('click', function() {
    chrome.tabs.create({
      url: 'http://motornyy.com/'
    });
    window.close();
  });

  this.masterPasswordInput.addEventListener('input', function() {
    this.confirmMasterPassword_();
    this.updatePassword_();
  }.bind(this));

  this.confirmMasterPasswordInput.addEventListener('input', function() {
    this.confirmMasterPassword_();
    this.updatePassword_();
  }.bind(this));

  this.tagInput.addEventListener('input', this.updatePassword_.bind(this));

  this.lettersOnlyCheckbox.addEventListener(
      'change', this.updatePassword_.bind(this));

  this.bitInput.addEventListener(
      'click', this.copyPasswordToClipboard_.bind(this));

  this.fillFormButton.addEventListener('click', this.fillForm_.bind(this));

  document.body.addEventListener('keypress', function(event) {
    if (event.charCode == 13 &&
        !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey &&
        event.target != this.fillFormButton) {
      this.fillForm_();
    }
  }.bind(this));
}

Popup.prototype.parseUrl_ = function(url) {
  var urlParser = document.createElement('a');
  urlParser.href = url;
  var domain = urlParser.host;

  this.scriptInjectionAllowed = urlParser.protocol != 'chrome:';

  var lastDotIndex = domain.lastIndexOf('.');
  this.tagInput.value = lastDotIndex == -1 ?
      domain : domain.substr(domain.lastIndexOf('.', lastDotIndex - 1) + 1);
};

Popup.prototype.confirmMasterPassword_ = function() {
  this.masterPasswordMessage.innerText = 'Time to guess: ' +
      zxcvbn(this.masterPasswordInput.value).crack_time_display + '.';

  if (this.masterPasswordInput.value !=
      this.confirmMasterPasswordInput.value) {
    this.confirmMasterPasswordMessage.classList.remove('error-hidden');
    this.confirmMasterPasswordMessage.classList.add('error-shown');
  } else {
    this.confirmMasterPasswordMessage.classList.remove('error-shown');
    this.confirmMasterPasswordMessage.classList.add('error-hidden');
  }
};

Popup.prototype.updatePassword_ = function() {
  var masterPassword = this.masterPasswordInput.value;
  var tag = this.tagInput.value;
  var passwordBits = convertWordArrayToBinaryString(
      sjcl.misc.pbkdf2(masterPassword, sjcl.hash.sha256.hash(tag)));

  passwordBits = halvePasswordBits(passwordBits);
  this.password = new PasswordBuilder(
      passwordBits, 16, this.lettersOnlyCheckbox.checked).build();

  var hashedPasswordBits = convertWordArrayToBinaryString(
      sjcl.hash.sha256.hash(this.password));
  for (var bitIndex = 0; bitIndex < 256; ++bitIndex) {
    var bitElement = this.bitElements[bitIndex];
    bitElement.classList.remove('bit-zero');
    bitElement.classList.remove('bit-one');
    bitElement.classList.add(
      hashedPasswordBits[bitIndex] == '0' ? 'bit-zero' : 'bit-one');
  }
};

const POWER_2_32 = Math.pow(2, 32);
const ZEROS_32 = new Array(32 + 1).join('0');

function convertWordArrayToBinaryString(words) {
  return words.map(function(word) {
    var binaryWord = (word >= 0 ? word : POWER_2_32 + word).toString(2);
    return ZEROS_32.substr(0, 32 - binaryWord.length) + binaryWord;
  }).join('');
}

function halvePasswordBits(passwordBits) {
  var halfOfPasswordBits = '';
  for (var bitIndex = 0; bitIndex < passwordBits.length / 2; ++bitIndex) {
    halfOfPasswordBits +=
        passwordBits[bitIndex * 2] == passwordBits[bitIndex * 2 + 1] ?
            '0' : '1';
  }
  return halfOfPasswordBits;
}

Popup.prototype.copyPasswordToClipboard_ = function() {
  var passwordInput = document.createElement('input');
  passwordInput.type = 'text';
  passwordInput.value = this.password;
  document.body.appendChild(passwordInput);
  passwordInput.select();
  document.execCommand('copy');
  document.body.removeChild(passwordInput);
  this.bitInput.focus();

  this.bitMessage.innerText = 'Copied to clipboard.';
  this.shutterSound.play();
};

Popup.prototype.fillForm_ = function() {
  if (!this.scriptInjectionAllowed) {
    this.showFillFormMessage_('Can\'t access this page.');
    return;
  }

  chrome.tabs.executeScript(
    this.tab.id, {file: 'content_script.js'}, function() {
      chrome.tabs.sendRequest(this.tab.id, {
        password: this.password
      },
      function(passwordSet) {
        if (passwordSet) {
          window.close();
        } else {
          this.showFillFormMessage_('No empty password fields found.');
        }
      }.bind(this));
    }.bind(this));
};

Popup.prototype.showFillFormMessage_ = function(message) {
  this.fillFormMessage.innerText = message;
  this.fillFormMessage.classList.remove('error-hidden');
  this.fillFormMessage.classList.add('error-shown');
};

function PasswordBuilder(bits, maxPasswordLength, lettersOnly) {
  this.bits = bits;
  this.maxPasswordLength = maxPasswordLength;
  this.lettersOnly = lettersOnly;

  this.password = '';
}

const MASK_TO_CHARACTER_SET = [''];
const MASK_TO_ENTROPY = [0];
const CHARACTER_TO_BIT_CLEAR_MASK = {};

var LETTERS_ONLY_CHARACTER_SET = '';
const LETTERS_ONLY_ENTROPY = 5;

(function() {
  const BASE_CHARACTER_SETS = [
      '23456789', '!#$%^&*+', 'abcdefgh', 'ABCDEFGH'];
  const ADDITIONAL_CHARACTER_SETS = [
      '', '()_-', 'jkmnpqrstuwxyz', 'JKMNPQRSTUWXYZ'];

  for (var characterSetMask = 1; characterSetMask < 16; ++characterSetMask) {
    var entropy = 2;
    var characterSet = '';

    var baseCharacterSetMask = characterSetMask;
    BASE_CHARACTER_SETS.forEach(function(baseCharacterSet) {
      if (baseCharacterSetMask & 1) {
        ++entropy;
        characterSet += baseCharacterSet;
      }
      baseCharacterSetMask >>= 1;
    });

    var additionalCharacterSetMask = characterSetMask;
    ADDITIONAL_CHARACTER_SETS.forEach(function(additionalCharacterSet) {
      if (additionalCharacterSetMask & 1) {
        characterSet += additionalCharacterSet;
      }
      additionalCharacterSetMask >>= 1;
    });

    MASK_TO_CHARACTER_SET.push(characterSet.substr(0, Math.pow(2, entropy)));
    MASK_TO_ENTROPY.push(entropy);
  }

  function initCharacterToBitClearMask(characterSet, characterSetIndex) {
    var bitClearMask = ~Math.pow(2, characterSetIndex);

    for (var characterIndex = 0; characterIndex < characterSet.length;
        ++characterIndex) {
      CHARACTER_TO_BIT_CLEAR_MASK[characterSet[characterIndex]] = bitClearMask;
    }
  }

  BASE_CHARACTER_SETS.forEach(initCharacterToBitClearMask);
  ADDITIONAL_CHARACTER_SETS.forEach(initCharacterToBitClearMask);

  LETTERS_ONLY_CHARACTER_SET = (
      BASE_CHARACTER_SETS[2] + BASE_CHARACTER_SETS[3] +
      ADDITIONAL_CHARACTER_SETS[2] + ADDITIONAL_CHARACTER_SETS[3]).
          substr(0, Math.pow(2, LETTERS_ONLY_ENTROPY));

})();

PasswordBuilder.prototype.build = function() {
  if (this.lettersOnly) {
    while (true) {
      if (this.password.length == this.maxPasswordLength ||
          !this.addCharacter_(
              LETTERS_ONLY_CHARACTER_SET, LETTERS_ONLY_ENTROPY)) {
        return this.password;
      }
    }
  } else {
    while (true) {
      var mask = 0xF;

      for (var characterIndex = 0; characterIndex < 8; ++characterIndex) {
        if (this.password.length == this.maxPasswordLength ||
            !this.addCharacter_(
                MASK_TO_CHARACTER_SET[mask], MASK_TO_ENTROPY[mask])) {
          return this.password;
        }

        if (characterIndex < 3) {
          mask &= CHARACTER_TO_BIT_CLEAR_MASK[
              this.password[this.password.length - 1]];
        } else {
          mask = 0xF;
        }
      }
    }
  }
};

PasswordBuilder.prototype.addCharacter_ = function(characters, entropy) {
  if (this.bits.length < entropy) {
    return false;
  }

  this.password += characters[parseInt(this.bits.substr(0, entropy), 2)];
  this.bits = this.bits.substr(entropy);
  return true;
};
