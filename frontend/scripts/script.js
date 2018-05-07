let clculatorInput = document.getElementById('calculator-input');
let specialCharacters = ['+', '-', '*', '/', '.'];
let forbidenStartCharacters = ['*', '/']

// Set pages
let calculatorPage = document.getElementById('calculator');
let loginPage = document.getElementById('login');
let registerPage = document.getElementById('register');
let usersPage = document.getElementById('users');

let pages = ['login', 'register', 'calculator', 'users'];

// Replace at specific index
String.prototype.replaceAt = function (index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

function buttonPush(obj) {
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
            if (clculatorInput.innerHTML == '0') {
                if (!forbidenStartCharacters.includes(pushed)) {
                    clculatorInput.innerHTML = pushed;
                }
            } else if (!(specialCharacters.includes(prevInput) && specialCharacters.includes(pushed))) {
                clculatorInput.innerHTML += pushed;
            } else if ((specialCharacters.includes(prevInput) && specialCharacters.includes(pushed))) {
                // Replace the special character if it's pushed twice
                clculatorInput.innerHTML = clculatorInput.innerHTML.replaceAt(clculatorInput.innerHTML.length - 1, pushed);
            }
            break;
    }
}

function goTo(obj) {
    let page = document.getElementById(obj.hash.slice(1));
    let tempPages = pages.slice();    

    let index = tempPages.indexOf(obj.hash.slice(1));
    if (index > -1) {
        tempPages.splice(index, 1);
    }

    tempPages.forEach(element => {
        if (document.getElementById(element)) {
            document.getElementById(element).style.display = 'none';
        }
    });

    if (page) {
        page.style.display = "block";
    }

}