// function calculatePageOffset(element) {
//     var pageOffset = {
//       left: 0,
//       top: 0  
//     };
//     for (; element; element = element.offsetParent) {
//         pageOffset.left += element.offsetLeft;
//         pageOffset.top += element.offsetTop;
//     }
//     return pageOffset;
// }

// var inputElements = document.getElementsByTagName('input');
// for (var i = 0; i < inputElements.length; ++i) {
//     var inputElement = inputElements[i];
//     if (inputElement.type == 'password') {
//         inputElement.addEventListener('focus', function(event) {
//             var dimElement = document.createElement('div');
//             dimElement.style.position = 'absolute';
//             dimElement.style.left = 0;
//             dimElement.style.top = 0;
//             dimElement.style.width = document.body.offsetWidth + 'px';
//             dimElement.style.height = document.body.offsetHeight + 'px';
//             dimElement.style.background = '#000';
//             dimElement.style.opacity = 0.5;
//             document.body.appendChild(dimElement);
// 
//             var inputElement = event.target;
//             var inputElementOffset = calculatePageOffset(inputElement);
//             
//             var passwordElement = document.createElement('input');
//             passwordElement.type = 'password';
//             passwordElement.style.position = 'absolute';
//             passwordElement.style.left = inputElementOffset.left + 'px';
//             passwordElement.style.top = inputElementOffset.top + 'px';
//             passwordElement.style.width = inputElement.clientWidth;
//             passwordElement.style.height = inputElement.clientHeight;
//             document.body.appendChild(passwordElement);
//         });
//     }
// }

// console.log('Registering...');
// chrome.webRequest.onBeforeRequest.addListener(
//     function(details) {
//         console.log(details);
//         return {
//           cancel: false  
//         };
//     },
//     {
//         urls: ['http://*/*', 'https://*/*']
//     },
//     ['blocking']);
// console.log('...done.');

// var inputElements = document.getElementsByTagName('input');
// for (var i = 0; i < inputElements.length; ++i) {
//     var inputElement = inputElements[i];
//     if (inputElement.type == 'password') {
//         inputElement.addEventListener('change', function(event) {
//             event.target.value = 'hello ' + event.target.value;
//         });
//     }
// }

// Should be browser action, so page never sees master password.
// Copy design from Google account page.
//     Create unique password (large)
//     Master password
//     *****
//     Confirm master password
//     *****
//     URL
//     http://www.yandex.ru/
// [ ] Date
//     March 25, 2012
//     -
//     <Fill Form>  (blue button)
//     Copy to Clipboard (hyperlink)

// http://crypto.stanford.edu/sjcl/
