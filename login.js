// Firebase Configuration (use your own config)
const firebaseConfig = {
  apiKey: "AIzaSyAQOwPCb1EZB9n2CoLus1lS4S6mgyt442Y",
  authDomain: "myloginpag-33e57.firebaseapp.com",
  databaseURL: "https://myloginpag-33e57-default-rtdb.firebaseio.com",
  projectId: "myloginpag-33e57",
  storageBucket: "myloginpag-33e57.firebasestorage.app",
  messagingSenderId: "659512828383",
  appId: "1:659512828383:web:537568cfe60aed9da0646a",
  measurementId: "G-DE3NW61DV6"
};
// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = app.auth();
const database = app.database();

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// Show Register Form (Smooth Transition)
function showRegister() {
  loginForm.style.opacity = '0';
  loginForm.style.display = 'none';

  // Use a slight delay to ensure the opacity change happens before showing the new form
  setTimeout(() => {
    registerForm.style.display = 'flex';
    registerForm.style.opacity = '1';
  }, 200); 
}

// Show Login Form (Smooth Transition)
function showLogin() {
  registerForm.style.opacity = '0';
  registerForm.style.display = 'none';

  setTimeout(() => {
    loginForm.style.display = 'flex';
    loginForm.style.opacity = '1';
  }, 200);
}

// --- Email/Password Functions ---

// Register User
function registerUser() {
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  const confirmPassword = document.getElementById('regConfirmPassword').value;

  if (password !== confirmPassword) {
    alert("Error: Passwords do not match!");
    return;
  }
  if (password.length < 6) {
    alert("Error: Password must be at least 6 characters long.");
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const userId = userCredential.user.uid;
      database.ref('users/' + userId).set({
        name,
        email
      })
      .then(() => {
        alert("Success: Account Registered! Please Login.");
        showLogin();
      })
      .catch((dbError) => {
        console.error("Database Save Error:", dbError);
        alert("Registration success but data save failed: " + dbError.message);
      });
    })
    .catch((error) => {
      alert("Registration Error: " + error.message);
    });
}

// Login User
function loginUser() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      alert("Success: Terminal Access Granted!");
      window.location.href = "index.html?uid=" + userCredential.user.uid;
    })
    .catch((error) => {
      alert("Login Error: " + error.message);
    });
}

// --- Social Login Functions ---

function socialLogin(providerType) {
    let provider;

    switch (providerType) {
        case 'google':
            provider = new firebase.auth.GoogleAuthProvider();
            break;
        case 'facebook':
            provider = new firebase.auth.FacebookAuthProvider();
            break;
        case 'github':
            provider = new firebase.auth.GithubAuthProvider();
            break;
        default:
            return;
    }

    auth.signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            const isNewUser = result.additionalUserInfo.isNewUser;
            
            if (isNewUser) {
                // Save user details to Realtime Database
                database.ref('users/' + user.uid).set({
                    name: user.displayName || user.email.split('@')[0],
                    email: user.email,
                    provider: providerType
                })
                .catch((dbError) => {
                    console.error("Database Save Error:", dbError);
                });
            }
            
            alert(`Success: Logged in via ${providerType}!`);
            window.location.href = "index.html?uid=" + user.uid;
            
        })
        .catch((error) => {
            alert(`Social Login Error: ${error.code} - ${error.message}`);
            console.error("Social Login Error:", error);
        });
}
