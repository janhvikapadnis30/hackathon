const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    if (username === "" || password === "" || role === "") {
        message.textContent = "Please fill in all fields.";
        return;
    }

    message.textContent = "Login information entered successfully.";

});