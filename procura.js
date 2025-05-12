const SUPABASE_URL = "https://dutdhdhggnpnmebegkya.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1dGRoZGhnZ25wbm1lYmVna3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk1Mzc0MjUsImV4cCI6MjA0NTExMzQyNX0.sz_ZM_xHkNZafDXCWNXju9gVdeVvJEFmWPDNzlZgB-w";
const TABLE_WRITER = "writer";
const TABLE_DIREITO = "direito";

let ultimaOperacaoSelecionada = ""; // Armazena a última operação selecionada

// Função auxiliar para normalizar strings, removendo espaços extras, acentos e convertendo para minúsculas
function normalizarString(valor) {
  return valor ? valor.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";
}

// Função para buscar operações pelo campo searchInput
async function buscarOperacao() {
  const searchTerm = document.getElementById("searchInput").value.trim();

  if (searchTerm === "") {
    document.getElementById("results").innerHTML = ""; // Limpa os resultados quando o campo de busca está vazio
    return;
  }

  try {
    const query = `${SUPABASE_URL}/rest/v1/${TABLE_WRITER}?operacao=ilike.*${searchTerm}*`;
    console.log("URL da consulta para operação:", query);

    const response = await fetch(query, {
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Dados recebidos para operação:", data);
      exibirResultados(data);
    } else {
      console.error("Erro na busca de operações:", response.statusText);
    }
  } catch (error) {
    console.error("Erro ao processar a busca:", error);
  }
}

// Função para exibir os resultados da operação (exibição de cartões)
function exibirResultados(data) {
  const resultsContainer = document.getElementById("results"); // Contêiner para cartões de operações
  resultsContainer.style.display = "flex"; // Garante que os cartões fiquem visíveis
  resultsContainer.innerHTML = ""; // Limpa os resultados anteriores

  if (data.length === 0) {
    resultsContainer.innerHTML = "<p>Nenhuma operação encontrada.</p>";
    return;
  }

  data.forEach(item => {
    const card = document.createElement("div");
    card.className = "result-card";

    card.innerHTML = `
      <h3>${item.operacao}</h3>
      <p class="tipo-icms">${item["Tipo de ICMS"] || ""}</p>
    `;
    card.style.cursor = "pointer";

    card.onclick = () => {
      console.log("Operação selecionada:", item.operacao);
      ultimaOperacaoSelecionada = item.operacao; // Atualiza a última operação selecionada
      exibirDetalhes(item); // Mostra os detalhes da operação clicada
    };

    resultsContainer.appendChild(card);
  });
}

// Função para exibir os detalhes da operação selecionada
function exibirDetalhes(operacao) {
  const resultsContainer = document.getElementById("results"); // Contêiner para os cartões
  const detailsContainer = document.getElementById("operation-details"); // Contêiner para detalhes da operação
  const fiscalDetailsContainer = document.getElementById("fiscal-details"); // Contêiner para detalhes fiscais

  resultsContainer.style.display = "none"; // Esconde os cartões da lista principal
  detailsContainer.innerHTML = ""; // Limpa os resultados anteriores
  fiscalDetailsContainer.innerHTML = ""; // Limpa os detalhes fiscais

  const detailCard = document.createElement("div");
  detailCard.className = "detail-card";

  detailCard.innerHTML = `
    <h3>${operacao.operacao}</h3>
    <ul>
      ${Object.keys(operacao).map(key => {
        if (key !== "operacao" && key !== "id" && key !== "created_at") {
          return `<li><strong>${key}:</strong> ${operacao[key]}</li>`;
        }
      }).join("")}
    </ul>
    <button onclick="voltarLista()">Voltar</button> <!-- Botão para retornar aos cartões -->
  `;

  detailsContainer.appendChild(detailCard);
}

// Função para voltar à lista principal de cartões
function voltarLista() {
  const resultsContainer = document.getElementById("results"); // Contêiner para os cartões
  const detailsContainer = document.getElementById("operation-details"); // Contêiner para detalhes da operação
  const fiscalDetailsContainer = document.getElementById("fiscal-details"); // Contêiner para detalhes fiscais

  resultsContainer.style.display = "flex"; // Mostra os cartões novamente
  detailsContainer.innerHTML = ""; // Limpa os detalhes exibidos
  fiscalDetailsContainer.innerHTML = ""; // Limpa os detalhes fiscais
  ultimaOperacaoSelecionada = ""; // Limpa a seleção da última operação
}

// Função de busca por UF com retorno de apenas uma linha
async function buscarDireitoFiscal() {
  const ufValue = document.getElementById("ufSearchInput").value.trim().toUpperCase();
  const fiscalDetailsContainer = document.getElementById("fiscal-details"); // Contêiner para detalhes fiscais

  // Limpa o contêiner de detalhes fiscais se não houver UF ou operação selecionada
  if (!ufValue || !ultimaOperacaoSelecionada) {
    fiscalDetailsContainer.innerHTML = "";
    console.log("Campo UF vazio ou nenhuma operação selecionada. Nenhuma busca adicional será realizada.");
    return;
  }

  try {
    const operacaoNormalizada = normalizarString(ultimaOperacaoSelecionada);
    const ufNormalizada = normalizarString(ufValue);

    // URL com limit=1 para garantir que só uma linha seja retornada
    const query = `${SUPABASE_URL}/rest/v1/${TABLE_DIREITO}?operacao=ilike.*${encodeURIComponent(operacaoNormalizada)}*&UF=ilike.*${encodeURIComponent(ufNormalizada)}*&limit=1`;
    console.log("URL da consulta para direito fiscal (única linha):", query);

    const response = await fetch(query, {
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`
      }
    });

    if (response.ok) {
      const fiscalData = await response.json();
      console.log("Dados recebidos da tabela direito:", fiscalData);

      if (fiscalData.length > 0) {
        const resultado = fiscalData[0]; // Como só uma linha é retornada, pegamos o primeiro item
        exibirResultadosUF(resultado);
      } else {
        console.log(`Nenhuma correspondência encontrada para UF: ${ufValue}`);
        alert("Nenhuma informação encontrada para os filtros selecionados.");
      }
    } else {
      console.error("Erro ao buscar informações fiscais:", response.statusText);
      alert("Erro ao buscar informações fiscais. Tente novamente.");
    }
  } catch (error) {
    console.error("Erro ao buscar informações fiscais:", error);
    alert("Erro ao processar a busca. Verifique os dados e tente novamente.");
  }
}

// Função para exibir os resultados da busca por UF
function exibirResultadosUF(resultado) {
  const fiscalDetailsContainer = document.getElementById("fiscal-details"); // Contêiner para resultados de UF
  fiscalDetailsContainer.innerHTML = ""; // Limpa os resultados anteriores

  const detailCard = document.createElement("div");
  detailCard.className = "detail-card";

  detailCard.innerHTML = `
    <h3>Direitos Fiscais</h3>
    <ul>
      <li><strong>MSG Legal:</strong> ${resultado["MSG Legal"] || "N/A"}</li>
      <li><strong>Dir.Fiscal:</strong> ${resultado["Dir.Fiscal"] || "N/A"}</li>
      <li><strong>CST ICMS:</strong> ${resultado["CST ICMS"] || "N/A"}</li>
      <li><strong>Tipo:</strong> ${resultado["Tipo"] || "N/A"}</li>
    </ul>
  `;

  fiscalDetailsContainer.appendChild(detailCard);
}

// Adiciona o evento de busca no campo de UF
document.getElementById("ufSearchInput").oninput = buscarDireitoFiscal;
