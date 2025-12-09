import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CONFIG
const supabaseUrl = "https://suswuhtsbnfvelwunctg.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1c3d1aHRzYm5mdmVsd3VuY3RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNzMyNDcsImV4cCI6MjA3OTc0OTI0N30.0utLvAN88MVzNNRGkz748PUecDa8aIoIYKWkOyi_RkA";
const supabase = createClient(supabaseUrl, supabaseKey);

// LOGIN
document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        alert("Erro ao entrar: " + error.message);
        return;
    }

    window.location.href = "/dashboard.html";
});
