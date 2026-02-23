function pesquisarProduto(query) {
    console.log('Pesquisar por:', query);

    const termo = query.toLowerCase();

    const lojas = [window.loja1, window.loja2, window.loja3];

    let resultados = [];

    lojas.forEach(lojaObj => {
        const lojaInfo = lojaObj.loja;

        const encontrados = lojaInfo.produtos.filter(produto =>
            produto.nome.toLowerCase().includes(termo) ||
            produto.descricao.toLowerCase().includes(termo) ||
            produto.categoria.toLowerCase().includes(termo)
        );

        // Adiciona informação da loja ao produto
        encontrados.forEach(produto => {
            resultados.push({
                ...produto,
                lojaNome: lojaInfo.nome
            });
        });
    });

    // Ordenar por preço (menor primeiro)
    resultados.sort((a, b) => a.preco - b.preco);

    console.log("Resultados consolidados:", resultados);
    //Se o resultado não for vazio, adiciona ao histórico
    if (resultados.length > 0) {
        HistoryService.addItem(query);
    }

    return resultados;
}