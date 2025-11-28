// ===============================
//  AUTH.JS — Login e fluxo seguro
// ===============================

import { supabase } from "/js/supabase.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      alert("Preencha e-mail e senha.");
      return;
    }

    // Autenticar no Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Erro no login:", error.message);

      if (error.message.includes("Email not confirmed")) {
        alert("Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.");
        return;
      }

      alert("E-mail ou senha incorretos.");
      return;
    }

    // Login OK → Redirecionar
    window.location.href = "/dashboard.html";
  });
});
