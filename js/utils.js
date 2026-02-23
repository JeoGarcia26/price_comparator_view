
// js/utils.js
onload = async () => {
    /* ------------------------------------------------------------------------------- */
    /* Global Variable Declarations */
    /* ------------------------------------------------------------------------------- */
    var capturedImage = null;
    var tesseractWorker = null;
    var cvModel = null;
    /* ------------------------------------------------------------------------------- */
    /* Element References */
    /* ------------------------------------------------------------------------------- */
    classificacao = {
        className: "",
        probability: 0
    };
    var resultadosClassificacao = [];
    var video = document.getElementById("videoElement");
    var enableCameraButton = document.getElementById("enableCameraButton");
    var ocrButton = document.getElementById("ocrButton");
    var computerVisionButton = document.getElementById("computerVisionButton");
    var searchButton = document.getElementById("searchButton");
    var resultadoDiv = document.getElementById("resultado");
    var cameraContainer = document.getElementById('cameraContainer');
    var closeBtn = document.getElementById('closeCameraButton');
    var toggleMirrorBtn = document.getElementById('toggleMirrorButton');

    /* ------------------------------------------------------------------------------- */
    /* Functions */
    /* ------------------------------------------------------------------------------- */

    /* --------------------------------------------- Close Modal --------------------------------------------- */
    function closeModal() {
        cameraContainer.style.display = 'none';
    }
    /* --------------------------------------------- Open Modal --------------------------------------------- */
    function openModal() {
        cameraContainer.style.display = 'flex';
    }

    /* --------------------------------------------- Mirror --------------------------------------------- */
    function updateMirror() {
        const isMobile = window.innerWidth < 768;
        (isMobile) ?
            video.classList.add('not-mirrored') :
            video.classList.remove('not-mirrored');


    }
    /* --------------------------------------------- Scrapper Gateway --------------------------------------------- */
    async function getLoja1Data() {
        return window.loja1;
    }
    async function getLoja2Data() {
        return window.loja2;
    }
    async function getLoja3Data() {
        return window.loja3;
    }

    async function fetchAllLojasData() {
        const loja1Data = await getLoja1Data();
        const loja2Data = await getLoja2Data();
        const loja3Data = await getLoja3Data();

        return {
            loja1: loja1Data,
            loja2: loja2Data,
            loja3: loja3Data
        };
    }

    /* --------------------------------------------- Render Products --------------------------------------------- */

    function renderProducts(products) {
        const grid = document.getElementById("productsGrid");
        grid.innerHTML = "";

        if (!products.length) {
            grid.innerHTML = "<p>Nenhum produto encontrado.</p>";
            return;
        }

        products.forEach((produto, index) => {
            const card = document.createElement("div");
            card.className = "product-card";

            // Destacar o mais barato
            if (index === 0) {
                card.style.border = "2px solid #16a34a2a";
                card.style.background = "#f8d97497";
            }

            card.innerHTML = `
            <img src="${produto.imagem}" 
                 alt="${produto.nome}" 
                 class="product-image"
                 onerror="this.src='https://via.placeholder.com/300x200?text=Imagem'">

            <div class="product-content">
                <div class="product-category">${produto.categoria}</div>

                <div class="product-name">
                    ${produto.nome}
                    ${index === 0 ? '<span style="color:#16a34a;font-size:0.8rem;"> 🏆 Melhor preço</span>' : ''}
                </div>

                <div class="product-description">${produto.descricao}</div>

                <div style="font-size:0.8rem;color:#64748b;">
                    Vendido por: ${produto.lojaNome}
                </div>

                <div class="product-price">
                    ${produto.preco.toLocaleString()} Kz
                </div>

                <a href="${produto.url}" target="_blank" class="product-link">
                    Ver Produto
                </a>
            </div>
        `;

            grid.appendChild(card);
        });
    }

    /* --------------------------------------------- Render History --------------------------------------------- */
    function renderHistory() {
        const historyList = document.getElementById("searchHistory");
        historyList.innerHTML = "";

        const history = HistoryService.getHistory();

        history.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item;

            li.addEventListener("click", () => {
                document.getElementById("searchInput").value = item;
                let produtos = pesquisarProduto(item);
                renderHistory();
                renderProducts(produtos);
            });

            historyList.appendChild(li);
        });
    }




    /* --------------------------------------------- Camera --------------------------------------------- */
    async function getMedia(constraints) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints);

            video.srcObject = stream;

            await video.play();

            const track = stream.getVideoTracks()[0];
            const settings = track.getSettings();

            console.log("📷 Resolução real obtida:");
            console.log("Largura:", settings.width);
            console.log("Altura:", settings.height);

        } catch (err) {
            console.log("Erro ao obter mídia:", err);
        }
    }

    function startVideo() {
        try {
            const constraints = {
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: "environment" // Use a câmera traseira, se disponível
                }
            };
            getMedia(constraints);
            openModal();
        } catch (error) {
            console.log("Erro ao iniciar o vídeo: " + error);
        }
    }

    function stopVideo() {
        try {
            let stream = video.srcObject;
            let tracks = stream.getTracks();

            tracks.forEach(function (track) {
                track.stop();
            });

            video.srcObject = null;
            closeModal();
        } catch (error) {
            console.log("Erro ao parar o vídeo: " + error);
        }
    }


    function capturarImagem() {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);

        capturedImage = canvas;
    }


    /* --------------------------------------------- OCR --------------------------------------------- */
    async function initWorker() {
        if (!tesseractWorker) {
            tesseractWorker = await Tesseract.createWorker();
        }
    }

    async function extrairTexto() {
        if (!capturedImage) {
            alert('Nenhuma imagem capturada!');
            return;
        }

        try {
            await initWorker();
            // Recognize direto — idiomas podem ser passados aqui
            const { data: { text } } = await tesseractWorker.recognize(capturedImage, 'eng+por');
            console.log('Texto extraído:', text);
            return text;

        } catch (error) {
            console.error('OCR Error:', error);
            throw error;
        }
    }

    // Quando terminar
    async function finalizarWorker() {
        if (tesseractWorker) {
            await tesseractWorker.terminate();
            tesseractWorker = null;
        }
    }
    function pesquisarPorOCR(texto) {
        if (!texto) return [];

        const palavras = texto
            .replace(/[^\w\sÀ-ÿ]/g, " ") // remove símbolos estranhos
            .split(/\s+/)               // divide por espaços
            .filter(p => p.length > 2); // ignora palavras muito pequenas

        console.log("Palavras extraídas do OCR:", palavras);

        for (let palavra of palavras) {
            const resultados = pesquisarProduto(palavra);

            if (resultados && resultados.length > 0) {
                console.log("Encontrado resultado com:", palavra);
                return resultados;
            }
        }

        return [];
    }

    /* --------------------------------------------- Computer Vision --------------------------------------------- */


    async function initComputerVision() {
        if (!cvModel) {
            console.log('Carregando modelo COCO-SSD...');
            cvModel = await cocoSsd.load();
            console.log('Modelo carregado.');
        }
        return cvModel;
    }

    function detectObject(model) {
        model.detect(capturedImage).then(predictions => {
            console.log('Predictions: ', predictions);
        });
    }

    async function processComputerVision() {
        if (!capturedImage) {
            alert('Nenhuma imagem capturada!');
            return;
        }
        console.log("Processing Computer Vision...");
        const model = await initComputerVision();
        detectObject(model);
        return "Detecção concluída.";
    }
    /* --------------------------------------------- Search by Button --------------------------------------------- */
    searchButton.addEventListener('click', async () => {
        const query = document.getElementById('searchInput').value.trim();
        if (query.trim() === '') {
            alert('Por favor, insira um termo de pesquisa.');
            return;
        }
        // Aqui você pode adicionar a lógica para buscar produtos com base no termo inserido
        let produtos = pesquisarProduto(query);
        renderHistory();
        renderProducts(produtos);

    });


    /* ------------------------------------------------------------------------------- */
    /* Machine Teachable */
    /* ------------------------------------------------------------------------------- */

    // the link to your model provided by Teachable Machine export panel
    const URL = "https://teachablemachine.withgoogle.com/models/baL8uuCq8/";

    let model;

    // Load the image model and setup the webcam
    async function setup() {
        model = await tmImage.load(URL + "model.json", URL + "metadata.json");
        console.log("✅ Modelo carregado e pronto.");
    }

    async function classificarImagem(elementoImagem) {
        if (!model) {
            console.error("Erro: O modelo ainda não foi carregado.");
            return;
        }
        resultadosClassificacao = []; // Limpa resultados anteriores
        // O Teachable Machine aceita o elemento <img> diretamente
        const predictions = await model.predict(elementoImagem);

        console.log("=== Resultados da Predição ===");
        predictions.forEach(p => {
            classificacao = {
                className: p.className,
                probability: p.probability
            };
            resultadosClassificacao.push(classificacao);
        });
        resultadosClassificacao.sort((a, b) => b.probability - a.probability);

        resultadosClassificacao.forEach((result, index) => {
            console.log(`${index + 1}. ${result.className} - Probabilidade: ${(result.probability * 100).toFixed(2)}%`);
        });
        return { "classe": resultadosClassificacao[0].className, "probabilidade": (resultadosClassificacao[0].probability * 100).toFixed(2) };
    }




    /* ------------------------------------------------------------------------------- */
    /* Event Listeners */
    /* ------------------------------------------------------------------------------- */

    document.getElementById('searchInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            searchButton.click();
        }
    });
    enableCameraButton.addEventListener('click', startVideo);
    
    ocrButton.addEventListener('click', async () => {
        if (!video.srcObject) {
            startVideo();
            alert('A câmera foi ligada. Por favor, capture a imagem novamente.');
            return;
        }
        capturarImagem();
        stopVideo();
        let textoExtraido = await extrairTexto();
        let produtos = pesquisarPorOCR(textoExtraido);
        renderHistory();
        renderProducts(produtos);
    });

    computerVisionButton.addEventListener('click', async () => {
        if (!video.srcObject) {
            startVideo();
            alert('A câmera foi ligada. Por favor, capture a imagem novamente.');
            return;
        }

        capturarImagem();
        stopVideo();

        /* const mensagem = await processComputerVision(); */
        const mensagem = await classificarImagem(capturedImage);

        let produtos = pesquisarProduto(mensagem.classe);
        renderHistory();
        renderProducts(produtos);
    });

    closeBtn.addEventListener('click', () => {
        stopVideo();
    });

    // Toggle manual
    toggleMirrorBtn.addEventListener('click', () => {
        video.classList.toggle('not-mirrored');
    });

    // Atualiza ao redimensionar
    window.addEventListener('resize', updateMirror);
    /* ------------------------------------------------------------------------------- */
    /* Main Code Execution */
    /* ------------------------------------------------------------------------------- */
    setup();
    updateMirror();
    renderHistory();
}





