/* =====================================================
   Estágio Fácil - script.js
   Responsável por: validar o formulário, criar vagas,
   inserir na tabela, atualizar o contador e mostrar mensagens.
   ===================================================== */

// Chave usada para guardar as vagas no localStorage do navegador
const CHAVE_STORAGE = "estagioFacilVagas";

// Vagas fictícias iniciais (exibidas na primeira visita)
const vagasIniciais = [
  { empresa: "Tech Solutions", cargo: "Estágio em Desenvolvimento Web", modalidade: "Híbrido", cidade: "Fortaleza - CE", bolsa: "R$ 1.000,00", carga: "6 horas", descricao: "", link: "#" },
  { empresa: "Grupo Nordeste", cargo: "Estágio em Administração", modalidade: "Presencial", cidade: "Fortaleza - CE", bolsa: "R$ 800,00", carga: "5 horas", descricao: "", link: "#" },
  { empresa: "Agência Criativa", cargo: "Estágio em Marketing", modalidade: "Remoto", cidade: "Brasil", bolsa: "R$ 900,00", carga: "4 horas", descricao: "", link: "#" }
];

// Referências aos elementos da página
const form = document.getElementById("form-vaga");
const tabela = document.getElementById("tabela-vagas");
const contador = document.getElementById("contador");
const areaMensagem = document.getElementById("mensagem");

// Lista de vagas em memória
let vagas = carregarVagas();
let temporizadorMensagem;

/* ---------- Armazenamento (localStorage) ---------- */

function carregarVagas() {
  try {
    const salvas = localStorage.getItem(CHAVE_STORAGE);
    if (salvas) return JSON.parse(salvas);
  } catch (e) { /* se o navegador bloquear o storage, usa as vagas iniciais */ }
  return vagasIniciais.slice();
}

function salvarVagas() {
  try {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(vagas));
  } catch (e) { /* ignora erro de armazenamento */ }
}

/* ---------- Tabela ---------- */

// Cria uma célula <td> com texto seguro (textContent não interpreta HTML)
function criarCelula(texto) {
  const td = document.createElement("td");
  td.textContent = texto;
  return td;
}

// Cria a linha <tr> de uma vaga e a insere na tabela
function adicionarVaga(vaga, destacar) {
  const tr = document.createElement("tr");
  if (destacar) tr.classList.add("nova");

  tr.appendChild(criarCelula(vaga.empresa));
  tr.appendChild(criarCelula(vaga.cargo));

  // Modalidade com etiqueta colorida
  const tdModalidade = document.createElement("td");
  const tag = document.createElement("span");
  tag.className = "tag";
  if (vaga.modalidade === "Remoto") tag.classList.add("tag-remoto");
  if (vaga.modalidade === "Presencial") tag.classList.add("tag-presencial");
  tag.textContent = vaga.modalidade;
  tdModalidade.appendChild(tag);
  tr.appendChild(tdModalidade);

  tr.appendChild(criarCelula(vaga.cidade));
  tr.appendChild(criarCelula(vaga.bolsa));
  tr.appendChild(criarCelula(vaga.carga));

  // Botão "Candidatar-se": um link para o endereço cadastrado
  const tdAcao = document.createElement("td");
  const link = document.createElement("a");
  link.className = "btn btn-candidatar";
  link.href = vaga.link;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "Candidatar-se";
  tdAcao.appendChild(link);
  tr.appendChild(tdAcao);

  tabela.appendChild(tr);
}

function atualizarContador() {
  const total = vagas.length;
  contador.textContent = total + (total === 1 ? " vaga encontrada" : " vagas encontradas");
}

/* ---------- Mensagens ---------- */

// Mostra uma mensagem (tipo: "sucesso" ou "falha") e a esconde após 4 segundos
function mostrarMensagem(texto, tipo) {
  areaMensagem.textContent = texto;
  areaMensagem.className = "mensagem " + tipo;
  areaMensagem.hidden = false;
  clearTimeout(temporizadorMensagem);
  temporizadorMensagem = setTimeout(function () {
    areaMensagem.hidden = true;
  }, 4000);
}

/* ---------- Validação ---------- */

// Marca ou limpa o erro de um campo
function marcarErro(campo, mensagem) {
  const caixa = campo.closest(".campo");
  caixa.classList.toggle("invalido", mensagem !== "");
  caixa.querySelector(".erro").textContent = mensagem;
}

// Verifica todos os campos. Retorna true se estiver tudo certo.
function validarFormulario() {
  let valido = true;
  const campos = form.querySelectorAll("input, select, textarea");

  campos.forEach(function (campo) {
    const valor = campo.value.trim();
    let erro = "";

    if (valor === "") {
      erro = "Este campo é obrigatório.";
    } else if (campo.id === "link" && !/^https?:\/\//i.test(valor)) {
      // A URL precisa começar com http:// ou https://
      erro = "O link deve começar com http:// ou https://";
    }

    marcarErro(campo, erro);
    if (erro !== "") valido = false;
  });

  return valido;
}

function limparFormulario() {
  form.reset();
  form.querySelectorAll(".campo").forEach(function (caixa) {
    caixa.classList.remove("invalido");
    caixa.querySelector(".erro").textContent = "";
  });
}

/* ---------- Evento principal: envio do formulário ---------- */

form.addEventListener("submit", function (evento) {
  evento.preventDefault(); // impede o recarregamento da página

  if (!validarFormulario()) {
    mostrarMensagem("Preencha todos os campos obrigatórios.", "falha");
    return;
  }

  // Cria o objeto da nova vaga com os dados do formulário
  const novaVaga = {
    empresa: form.empresa.value.trim(),
    cargo: form.cargo.value.trim(),
    modalidade: form.modalidade.value,
    cidade: form.cidade.value.trim(),
    bolsa: form.bolsa.value.trim(),
    carga: form.carga.value,
    descricao: form.descricao.value.trim(),
    link: form.link.value.trim()
  };

  vagas.push(novaVaga);
  salvarVagas();
  adicionarVaga(novaVaga, true);
  atualizarContador();
  limparFormulario();
  mostrarMensagem("Vaga publicada com sucesso!", "sucesso");
});

/* ---------- Inicialização ---------- */

vagas.forEach(function (vaga) { adicionarVaga(vaga, false); });
atualizarContador();
