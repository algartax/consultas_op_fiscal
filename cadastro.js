const SUPABASE_URL = "https://dutdhdhggnpnmebegkya.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1dGRoZGhnZ25wbm1lYmVna3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk1Mzc0MjUsImV4cCI6MjA0NTExMzQyNX0.sz_ZM_xHkNZafDXCWNXju9gVdeVvJEFmWPDNzlZgB-w";
const TABLE_NAME = "writer";

async function enviarDados() {
  const form = document.getElementById("fiscalForm");
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE_NAME}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Prefer": "return=representation"
      },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      const result = await response.json();
      alert("Operação cadastrada com sucesso!");
      console.log("Resposta do servidor:", result);
      form.reset();
    } else {
      const error = await response.json();
      console.error("Erro:", error);
      alert(`Erro ao cadastrar a operação: ${error.message || 'Verifique os dados.'}`);
    }
  } catch (error) {
    alert(`Erro ao processar: ${error.message}`);
    console.error("Erro ao enviar dados:", error);
  }
}
