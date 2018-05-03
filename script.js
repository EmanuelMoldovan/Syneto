let clculatorInput = document.getElementById('calculator-input');
let specialCharacters = ['+','-','*','/','.'];
let forbidenStartCharacters = ['*','/']

// Replace at specific index
String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0, index) + replacement+ this.substr(index + replacement.length);
}

function buttonPush(obj){
    let pushed = obj.innerHTML;
    let input = clculatorInput.innerHTML;
    let prevInput = clculatorInput.innerHTML.slice(clculatorInput.innerHTML.length - 1);

    switch (pushed) {
        case '=':
            // Calculate
            clculatorInput.innerHTML = eval(clculatorInput.innerHTML);
            break;
        case 'C':
            // Clear
            clculatorInput.innerHTML = '0';
            break;
        default:
            if(clculatorInput.innerHTML == '0'){
                if(!forbidenStartCharacters.includes(pushed)){
                    clculatorInput.innerHTML = pushed;
                }                    
            } else if(!(specialCharacters.includes(prevInput) && specialCharacters.includes(pushed))){
                clculatorInput.innerHTML += pushed;
            }  else if((specialCharacters.includes(prevInput) && specialCharacters.includes(pushed))){
                // Replace the special character if it's pushed twice
                clculatorInput.innerHTML = clculatorInput.innerHTML.replaceAt(clculatorInput.innerHTML.length-1,pushed);
            }          
            break;
    }
}