

const firebaseConfig = {
  apiKey: "AIzaSyAYiRnS9eNTXI-SSZrAy3jgAFTSR0UGhCk",
  authDomain: "gcm-web1.firebaseapp.com",
  projectId: "gcm-web1",
  storageBucket: "gcm-web1.firebasestorage.app",
  messagingSenderId: "240640122521",
  appId: "1:240640122521:web:b62bebed82cb6f9518a208",
  measurementId: "G-LSSKB9XLRW"
};


firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');
const loginBtn = document.getElementById('login-btn');


auth.onAuthStateChanged((user) => {
    if (user) {
        window.location.href = 'admin.html';
    }
});


loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    

    loginBtn.innerText = "VERIFICANDO...";
    loginBtn.disabled = true;
    errorMessage.classList.add('hidden');

    try {
        await auth.signInWithEmailAndPassword(email, password);

    } catch (error) {

        errorMessage.classList.remove('hidden');
        
        switch (error.code) {
            case 'auth/invalid-credential':
                errorMessage.innerText = "Correo o contraseña incorrectos.";
                break;
            case 'auth/user-not-found':
                errorMessage.innerText = "Este usuario no existe.";
                break;
            case 'auth/wrong-password':
                errorMessage.innerText = "Contraseña incorrecta.";
                break;
            case 'auth/too-many-requests':
                errorMessage.innerText = "Demasiados intentos. Intenta más tarde.";
                break;
            default:
                errorMessage.innerText = "Error al intentar entrar. Revisa tu conexión.";
        }
        
        loginBtn.innerText = "ENTRAR AL PANEL";
        loginBtn.disabled = false;
    }
});
