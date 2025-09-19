// Função para adicionar um novo cliente ao banco de dados
async function adicionarCliente() {
  // Captura o valor do input do nome do cliente
  const nomeCliente = document.getElementById('nomeCliente').value;

  // Captura o valor do input da senha do cliente
  const senhaCliente = document.getElementById('senhaCliente').value;

  // Chama o Supabase para inserir um novo registro na tabela 'usuario'
  // O método insert recebe um array de objetos, mesmo que seja apenas um
  const { data, error } = await supabase
    .from('usuario') // tabela onde será inserido o registro
    .insert([{ nome: nomeCliente, senha: senhaCliente }]); // objeto com os campos e valores

  // Verifica se houve erro na inserção
  if (error) {
    console.error("Erro ao adicionar:", error); // imprime o erro no console
  } 
  else {
    console.log("Cliente cadastrado:", data); // imprime os dados do cliente cadastrado

    // Limpa os campos de input após o cadastro
    document.getElementById('nomeCliente').value = "";
    document.getElementById('senhaCliente').value = "";

    // Chama a função listarClientes para atualizar a lista de clientes
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
  // Captura os valores dos inputs de login
  const nomeCliente = document.getElementById('nomeClienteLogin').value;
  const senhaCliente = document.getElementById('senhaClienteLogin').value;

  // Verifica se os campos estão preenchidos
  if (!nomeCliente || !senhaCliente) {
    console.log('Todos os campos precisam ser preenchidos'); // alerta caso algum campo esteja vazio
  } else {
    // Chama o Supabase para selecionar o cliente que tenha o nome informado
    const { data, error } = await supabase
      .from('usuario') // tabela onde a busca será realizada
      .select('*') // seleciona todas as colunas
      .eq('nome', nomeCliente); // filtra pelo nome do cliente

    // Verifica se houve erro na consulta
    if (error) {
      console.error("Erro ao mostrar:", error); // imprime o erro no console
    } else {
      // Se não encontrou nenhum cliente com o nome informado
      if (data.length <= 0) {
        console.log("Cliente não cadastrado!");
      } 
      // Se encontrou o cliente, verifica se a senha está correta
      else if (data[0].senha == senhaCliente) {
        const usuario_id = data[0].id; // pega o id do usuário
        localStorage.setItem("usuario_id", data[0].id); // salva o id no localStorage

        console.log("Login efetuado com sucesso!");
        localStorage.setItem("usuarioLogado", data[0].nome); // salva o nome do usuário logado

        // Redireciona para a página principal do sistema
        window.location.replace('../principais funcoes/fluxocash.html');
      } else {
        console.log("Senha errada!"); // alerta caso a senha esteja incorreta
      }
    }
  }
}
