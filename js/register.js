import { supabase } from "./supabase.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("register-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const full_name = document.getElementById("full_name").value.trim();
    const email = document.getElementById("email").value.trim();
    const whatsapp = document.getElementById("whatsapp").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name,
            whatsapp
          }
        }
      });

      if (error) {
        alert("Erro: " + error.message);
        return;
      }

      alert("Conta criada com sucesso! Verifique seu e-mail.");
      window.location.href = "login.html";

    } catch (err) {
      console.error(err);
      alert("Erro inesperado.");
    }
  });
});
