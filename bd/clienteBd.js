// BANCO DE DAODS DE CLIENTE

// Função para adicionar um novo cliente ao banco de dados
function mostrarAlerta(mensagem) {
  const overlay = document.createElement("div");
  overlay.className = "alert-overlay";

  overlay.innerHTML = `
    <div class="alert-card">
      <p>${mensagem}</p>
      <button>OK</button>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.querySelector("button").addEventListener("click", () => overlay.remove());
}

async function adicionarCliente() {
  const nomeCliente = document.getElementById('nomeCliente').value.trim();
  const senhaCliente = document.getElementById('senhaCliente').value.trim();

  // Verifica se os campos foram preenchidos
  if (!nomeCliente || !senhaCliente) {
    mostrarAlerta("Preencha todos os campos!");
    return;
  }

  // Verifica se já existe um cliente com o mesmo nome e senha
  const { data: usuariosExistentes, error: erroBusca } = await supabase
    .from('usuario')
    .select('*')
    .eq('nome', nomeCliente)
    .eq('senha', senhaCliente);

  if (erroBusca) {
    console.error("Erro ao verificar usuário:", erroBusca);
    return;
  }

  if (usuariosExistentes.length > 0) {
    mostrarAlerta("Já existe um usuário com esse nome e senha! Faça outro cadastro.");
    return;
  }

  // Se não existe, faz o cadastro
  const { data, error } = await supabase
    .from('usuario')
    .insert([{ nome: nomeCliente, senha: senhaCliente }]);

  if (error) {
    console.error("Erro ao adicionar:", error);
  } else {
    mostrarAlerta("Cliente cadastrado", data);

    document.getElementById('nomeCliente').value = "";
    document.getElementById('senhaCliente').value = "";

    listarClientes();
  }
}


// Função para listar todos os clientes cadastrados
async function listarClientes() {
  // Chama o Supabase para selecionar todos os registros da tabela 'usuario'
  const { data, error } = await supabase
    .from('usuario') // tabela de onde os dados serão buscados
    .select('*'); // seleciona todas as colunas

  // Verifica se houve erro na consulta
  if (error) {
    console.error("Erro ao mostrar:", error); // imprime o erro no console
  } else {
    console.log(data); // imprime a lista de clientes no console
  }
}

// Função para verificar o login de um cliente
async function verificarCliente() {
  const nomeCliente = document.getElementById('nomeClienteLogin').value.trim();
  const senhaCliente = document.getElementById('senhaClienteLogin').value.trim();

  if (!nomeCliente || !senhaCliente) {
    mostrarAlerta('Preencha todos os campos!');
    return;
  }

  // 1) procura por registro com nome + senha (autenticação)
  const { data: matches, error: errMatch } = await supabase
    .from('usuario')
    .select('*')
    .match({ nome: nomeCliente, senha: senhaCliente });

  if (errMatch) {
    console.error('Erro ao buscar usuário:', errMatch);
    return;
  }

  if (matches && matches.length > 0) {
    // login bem-sucedido
    const usuario = matches[0];
    localStorage.setItem('usuario_id', usuario.id);
    localStorage.setItem('usuarioLogado', usuario.nome);
    // opcional: mostrarAlerta('Login efetuado com sucesso!');
    window.location.replace('../principais funcoes/fluxocash.html');
    return;
  }

  // 2) se não encontrou por nome+senha, verifica se o nome existe (para mostrar mensagem apropriada)
  const { data: nomeExiste, error: errNome } = await supabase
    .from('usuario')
    .select('id')
    .eq('nome', nomeCliente)
    .limit(1);

  if (errNome) {
    console.error('Erro ao verificar nome:', errNome);
    return;
  }

  if (nomeExiste && nomeExiste.length > 0) {
    mostrarAlerta('Senha errada!');
  } else {
    mostrarAlerta('Cliente não cadastrado!');
  }
}

