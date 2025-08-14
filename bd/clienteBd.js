async function adicionarCliente() {
  const nomeCliente = document.getElementById('nomeCliente').value;
  const senhaCliente = document.getElementById('senhaCliente').value;

  const { data, error } = await supabase
    .from('cliente')
    .insert([{ nome: nomeCliente, senha: senhaCliente }]);

  if (error) {
    console.error("Erro ao adicionar:", error);
  } else {
    console.log("Cliente cadastrado:", data);
    document.getElementById('nomeCliente').value = "";
    document.getElementById('senhaCliente').value = "";
  }
}
