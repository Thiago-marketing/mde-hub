document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("register-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const full_name = document.getElementById("full_name").value.trim();
    const email = document.getElementById("email").value.trim();
    const whatsapp = document.getElementById("whatsapp").value.trim();
    const password = document.getElementById("password").value.trim();
    const consent = document.getElementById("consent").checked;

    // Validações simples
    if (!full_name || !email || !whatsapp || !password) {
      alert("Preencha todos os campos.");
      return;
    }

    if (!consent) {
      alert("Você precisa autorizar o envio de comunicações para continuar.");
      return;
    }

    try {
      // Signup no Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: full_name,
            whatsapp: whatsapp,
            consent: consent
          }
        }
      });

      if (error) {
        console.error(error);
        alert("Erro ao criar conta: " + error.message);
        return;
      }

      // Sucesso
      alert("Conta criada com sucesso! Verifique seu e-mail para confirmar.");
      window.location.href = "login.html";

    } catch (err) {
      console.error(err);
      alert("Erro inesperado ao criar conta.");
    }
  });
});
