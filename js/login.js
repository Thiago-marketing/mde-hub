import { supabase } from "./supabase.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      alert("Preencha e-mail e senha.");
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        alert("Erro ao entrar: " + error.message);
        return;
      }

      // Sucesso: redirecionar
      window.location.href = "dashboard.html"; 
      // depois você coloca a página real do Hub aqui

    } catch (err) {
      console.error(err);
      alert("Erro inesperado ao fazer login.");
    }
  });
});
