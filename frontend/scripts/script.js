let clculatorInput = document.getElementById('calculator-input');
let specialCharacters = ['+', '-', '*', '/', '.'];
let forbidenStartCharacters = ['*', '/']
let loader = document.getElementById('loader');
let errMsg = document.getElementById('errMsg');

// Set pages
let calculatorPage = document.getElementById('calculator');
let loginPage = document.getElementById('login');
let registerPage = document.getElementById('register');
let usersPage = document.getElementById('users');
let pages = ['login', 'register', 'calculator', 'users'];
let loggedUser = {
    token: null
};
let users = [];

// Set forms
let loginForm = document.getElementById('formLogin');

let url = "http://localhost:5000/api";

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

function showMessage(message, milliseconds = 5000){
    errMsg.innerHTML = message;
    setTimeout(() => {
        errMsg.innerHTML = '';
    }, milliseconds);
}

function getUsers(){
    let table = document.getElementById("usersTable");
    for(let i = table.rows.length - 1; i > 0; i--)
    {
        table.deleteRow(i);
    }
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url + "/users")
    xhr.setRequestHeader('Content-type', 'application/json')
    xhr.setRequestHeader('Authorization', localStorage.getItem('token'))
    // Sends request
    xhr.send() // Make sure to stringify

    xhr.onload = function(){
        if(this.status == 200){
            console.log(JSON.parse(this.responseText));
            users = JSON.parse(this.responseText);
            if(users.success == true){
                for(let user of users.user){
                    let row = table.insertRow(table.rows.length);
                    row.insertCell(0).innerHTML = user.username;
                    row.insertCell(1).innerHTML = user.email;
                    let cell = row.insertCell(2);                    
                    cell.id = user._id + ' ' + user.banned;
                    cell.innerHTML = user.banned?'<i class="fas fa-toggle-on fa-3x" style="color: red; cursor: pointer" onClick="toggleBan(this)"></i>':'<i class="fas fa-toggle-off fa-3x" style="color: green; cursor: pointer" onClick="toggleBan(this)"></i>';
                }
            } else{
                return null;
            }
            
        }
    }
}

function toggleBan(user){
    console.log(user.parentNode.id);
    let xhr = new XMLHttpRequest();
    xhr.open('PUT', url + "/ban")
    xhr.setRequestHeader('Content-type', 'application/json')
    xhr.setRequestHeader('Authorization', localStorage.getItem('token'))

    let params = {
        _id: user.parentNode.id.split(' ')[0],
        banned: user.parentNode.id.split(' ')[1]
    }
    // Sends request
    xhr.send(JSON.stringify(params)) // Make sure to stringify

    xhr.onload = function(){
        if(this.status == 200){
            console.log(JSON.parse(this.responseText));
            users = JSON.parse(this.responseText);
            if(users.success == true){
                getUsers();
            } else{
                return null;
            }
            
        }
    }
}

function goTo(obj, id) { 
    if ((typeof(Storage) !== "undefined" && localStorage.getItem("token")) || id == 'login' || obj.hash.slice(1) == 'register' ) {
        let page = id == null ? document.getElementById(obj.hash.slice(1)) : document.getElementById(id);
        let tempPages = pages.slice();

        if(obj != null && obj.hash.slice(1) == 'users'){
            getUsers();
        }

        let index = tempPages.indexOf(id == null ? obj.hash.slice(1): id);
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
    } else {
        console.log("Sorry, your browser does not support Web Storage...");
    }       

}

function clearLoginData(){
    document.getElementById('usernameLogin').value = '';
    document.getElementById('passwordLogin').value = '';
}

function login(){
    loader.style.display = 'block';
    let username = document.getElementById('usernameLogin');
    let password = document.getElementById('passwordLogin');
    if(username.value == '' || password.value == ''){
        loader.style.display = 'none';
        return;
    }
    // Create XHR Object
    let xhr = new XMLHttpRequest();

    let params = {
        username: username.value,
        password: password.value
    };
    // Open
    xhr.open('POST', url + "/login")
    xhr.setRequestHeader('Content-type', 'application/json')
    // Sends request
    xhr.send(JSON.stringify(params)) // Make sure to stringify

    xhr.onload = function(){
        if(this.status == 200){
            console.log(JSON.parse(this.responseText));
            loggedUser = JSON.parse(this.responseText);
            if(loggedUser.success == true){
                if (typeof(Storage) !== "undefined") {
                    // Store
                    localStorage.setItem("token", loggedUser.token);
                    loader.style.display = 'none';
                    clearLoginData();
                    if(localStorage.getItem('token')){
                        if(loggedUser.user.role == 0){
                            document.getElementById('usersNav').style.display = 'inline';
                        }
                        else{
                            document.getElementById('usersNav').style.display = 'none';
                        }
                        document.getElementById('calculatorNav').style.display = 'inline';
                    }else{
                        document.getElementById('calculatorNav').style.display = 'none'; 
                    }
                    document.getElementById('logout').style.display = 'inline';
                    goTo(null, 'calculator');
    
                } else {
                    console.log("Sorry, your browser does not support Web Storage...");
                    loader.style.display = 'none';
                }
            } else{
                loader.style.display = 'none';
                showMessage(loggedUser.msg);               
            }
            
        }
    }
} 

function register(){
    loader.style.display = 'block';
    let username = document.getElementById('username');
    let email = document.getElementById('email');
    let password = document.getElementById('password');
    let confirmPassword = document.getElementById('confirmPassword');

    if (username.value == '' || email.value == '' || password.value == '' || confirmPassword.value == ''
    ) {
        loader.style.display = 'none';
        return;
    }

    if(password.value === confirmPassword.value){
        // Create XHR Object
        let xhr = new XMLHttpRequest();

        let params = {
            username: username.value,
            password: password.value,
            email: email.value
        };
        // Open
        xhr.open('POST', url + "/register")
        xhr.setRequestHeader('Content-type', 'application/json')
        // Sends request
        xhr.send(JSON.stringify(params)) // Make sure to stringify

        xhr.onload = function(){
            if(this.status == 200){
                console.log(JSON.parse(this.responseText));
                loggedUser = JSON.parse(this.responseText);
                if(loggedUser.success == true){
                    loader.style.display = 'none';
                    showMessage('A confirmation email was sent to your address. Please confirm your email. It may take 5-10 minutes');
                    goTo(null, 'login');
                } else{
                    loader.style.display = 'none';
                    showMessage(loggedUser.msg);
                }
                
            }
        }
    }    
} 

function logout(obj){
    localStorage.removeItem("token");
    let loggedUser = {};
    goTo(null, 'login');
}

document.getElementById('loginSubmit').addEventListener('click', login);

document.getElementById('submit').addEventListener('click', register);