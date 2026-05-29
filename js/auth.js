document.addEventListener("DOMContentLoaded", function() {
    
    const loginForm = document.getElementById('login-form');
    const loginBtn = document.getElementById('login-btn');
    const btnText = document.getElementById('btn-text');
    const errorMsg = document.getElementById('login-error');
    const togglePasswordBtn = document.getElementById('toggle-password-btn');
    const passwordInput = document.getElementById('password');

    // 1. Handle Password Visibility Toggle
    togglePasswordBtn.addEventListener('click', function() {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            togglePasswordBtn.classList.remove('fa-eye-slash');
            togglePasswordBtn.classList.add('fa-eye');
        } else {
            passwordInput.type = 'password';
            togglePasswordBtn.classList.remove('fa-eye');
            togglePasswordBtn.classList.add('fa-eye-slash');
        }
    });

    // 2. Handle Login Submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Stop page from refreshing

        // Reset UI state
        errorMsg.style.display = 'none';
        btnText.innerText = 'Logging in...';
        loginBtn.disabled = true;

        const username = document.getElementById('username').value;
        const password = passwordInput.value;

        // Prepare data for PHP
        const formData = new URLSearchParams();
        formData.append('action', 'login');
        formData.append('username', username);
        formData.append('password', password);

        // Send AJAX request to your auth.php backend
        fetch('api/auth.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString()
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Login successful! Redirect to dashboard
                window.location.replace('dashboard.html');
            } else {
                // Login failed, show error message from PHP
                errorMsg.innerText = data.error || 'Invalid username or password.';
                errorMsg.style.display = 'block';
                
                // Reset button
                btnText.innerText = 'Log in';
                loginBtn.disabled = false;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            errorMsg.innerText = 'Server error. Please try again later.';
            errorMsg.style.display = 'block';
            btnText.innerText = 'Log in';
            loginBtn.disabled = false;
        });
    });

    // 3. Handle Sign Up button click (Placeholder for now)
    document.getElementById('signup-btn').addEventListener('click', function() {
        alert('Sign up page integration coming next!');
        // You can redirect to a register.html here:
        // window.location.href = 'register.html';
    });
});