import { supabase } from "./supabase.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("register-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const full_name = document.getElementById("full_name").value.trim();
    const email = document.getElementById("email").value.trim();
    const whatsapp = document.getElementById("whatsapp").value.trim();
    const password = document.getElementById("password").value.trim();
    const consent = document.getElementById("consent").checked;

    if (!full_name || !email || !whatsapp || !password) {
      alert("Preencha todos os campos.");
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // 👉 depois de confirmar o e-mail, vai cair nesta página
          emailRedirectTo: "https://mde-hub.vercel.app/confirm.html",
          data: {
            full_name,
            whatsapp,
            consent
          }
        }
      });

      if (error) {
        console.error(error);
        alert("Erro ao criar conta: " + error.message);
        return;
      }

      alert(
        "Conta criada! Enviamos um link de confirmação para o seu e-mail. " +
        "Confirme o endereço para acessar o MDE Hub."
      );

      // opcional: manda pro login depois do cadastro
      window.location.href = "login.html";

    } catch (err) {
      console.error(err);
      alert("Erro inesperado ao criar conta.");
    }
  });
});
