document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registerForm');
    const photoInput = document.getElementById('photo');
    const previewImage = document.getElementById('previewImage');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');

    // Photo preview functionality
    photoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                previewImage.style.display = 'block';
            }
            reader.readAsDataURL(file);
        }
    });


    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(document.getElementById('email').value)) {
            alert('Please enter a valid email address!');
            return;
        }
        // Password validation
        if (password.value !== confirmPassword.value) {
            alert('Passwords do not match!');
            return;
        }

        alert('Form submitted successfully!');
        form.reset();
        previewImage.style.display = 'none';
    });
}); 