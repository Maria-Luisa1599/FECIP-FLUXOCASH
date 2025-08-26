async function adicionarCliente() {
  const nomeCliente = document.getElementById('nomeCliente').value;
  const senhaCliente = document.getElementById('senhaCliente').value;

  const { data, error } = await supabase
    .from('usuario')
    .insert([{ nome: nomeCliente, senha: senhaCliente }]);

  if (error) {
    console.error("Erro ao adicionar:", error);
  } else {
    console.log("Cliente cadastrado:", data);
    document.getElementById('nomeCliente').value = "";
    document.getElementById('senhaCliente').value = "";
    listarClientes()
  }
}

async function listarClientes() {
  const { data, error } = await supabase
    .from('usuario')
    .select('*');

  if (error) {
    console.error("Erro ao mostrar:", error);
  } else {
    console.log(data);
  }

}

async function verificarCliente() {
  const nomeCliente = document.getElementById('nomeClienteLogin').value;
  const senhaCliente = document.getElementById('senhaClienteLogin').value;


  if (!nomeCliente || !senhaCliente) {
    console.log('Todos os campos precisam ser preenchidos')
  } else {
    const { data, error } = await supabase
      .from('usuario')
      .select('*')
      .eq('nome', nomeCliente);

    if (error) {
      console.error("Erro ao mostrar:", error);
    } else {
      if (data.length <= 0) {
        console.log("Cliente não cadastrado!");
      } else if (data[0].senha == senhaCliente) {
        console.log("Login efetuado com sucesso!");
        localStorage.setItem("usuarioLogado", data[0].nome);
        window.location.replace('../fluxocash.html');
      } else {
        console.log("Senha errada!");
      }
    }
  }
}
