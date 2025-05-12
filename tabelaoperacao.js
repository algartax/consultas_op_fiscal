const SUPABASE_URL = "https://dutdhdhggnpnmebegkya.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1dGRoZGhnZ25wbm1lYmVna3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk1Mzc0MjUsImV4cCI6MjA0NTExMzQyNX0.sz_ZM_xHkNZafDXCWNXju9gVdeVvJEFmWPDNzlZgB-w";
const TABLE_NAME = "writer";

async function carregarTabela() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE_NAME}`, {
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      montarTabela(data);
    } else {
      console.error("Erro ao carregar os dados:", response.statusText);
    }
  } catch (error) {
    console.error("Erro ao carregar a tabela:", error);
  }
}

function montarTabela(data) {
  const tableHead = document.getElementById("tableHead");
  const tableBody = document.getElementById("tableBody");

  if (data.length === 0) {
    tableBody.innerHTML = "<tr><td colspan='100%'>Nenhum dado encontrado.</td></tr>";
    return;
  }

  // Cabeçalhos dinâmicos
  const columns = Object.keys(data[0]).filter(col => col !== "id" && col !== "created_at");
  tableHead.innerHTML = columns
    .map(col => `<th data-column="${col}">${col === "operacao" ? "Tipo Operação" : col}</th>`)
    .join("");
  tableHead.innerHTML += "<th>Ações</th>"; // Adiciona a coluna de "Ações"

  // Dados da tabela
  tableBody.innerHTML = data.map(row => {
    const rowHtml = columns.map(col => `<td contenteditable="true" data-id="${row.id}" data-column="${col}">${row[col] || ""}</td>`).join("");
    return `
      <tr>
        ${rowHtml}
        <td>
          <button class="delete-button" onclick="excluirLinha(${row.id})">Excluir</button>
        </td>
      </tr>
    `;
  }).join("");

  // Adicionar evento para salvar ao perder o foco
  const editableCells = document.querySelectorAll('td[contenteditable="true"]');
  editableCells.forEach(cell => {
    cell.addEventListener('blur', atualizarCelula);
  });
}

async function atualizarCelula(event) {
  const cell = event.target;
  const id = cell.dataset.id;
  const column = cell.dataset.column;
  const value = cell.textContent.trim();

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE_NAME}?id=eq.${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`
      },
      body: JSON.stringify({ [column]: value })
    });

    if (!response.ok) {
      console.error("Erro ao salvar a célula:", response.statusText);
      alert("Erro ao salvar a alteração. Tente novamente.");
    } else {
      console.log(`Célula atualizada: ${column} = ${value}`);
    }
  } catch (error) {
    console.error("Erro ao atualizar a célula:", error);
  }
}

async function excluirLinha(id) {
  if (!confirm("Tem certeza que deseja excluir esta linha?")) return;

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE_NAME}?id=eq.${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`
      }
    });

    if (response.ok) {
      alert("Linha excluída com sucesso!");
      carregarTabela(); // Recarrega a tabela após exclusão
    } else {
      console.error("Erro ao excluir a linha:", response.statusText);
      alert("Erro ao excluir a linha. Tente novamente.");
    }
  } catch (error) {
    console.error("Erro ao excluir a linha:", error);
  }
}

// Carregar a tabela ao abrir a página
carregarTabela();
