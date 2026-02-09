


async function lerLoja1() {
    try {
        const response = await fetch('./shopping/loja1.json');

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('Conteúdo do loja1.json:', data);

        return data;
    } catch (error) {
        console.error('Erro ao ler loja1.json:', error);
        return null;
    }
}


export { lerLoja1 };