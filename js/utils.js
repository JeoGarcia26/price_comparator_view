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



    /* --------------------------------------------- Camera --------------------------------------------- */
    async function getMedia(constraints) {
        let stream = null;

        try {
            stream = await navigator.mediaDevices.getUserMedia(constraints);
            video.srcObject = stream;
        } catch (err) {
            console.log("Ocorreu um erro ao obter a mídia: " + err);
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
        console.log('Pesquisar por:', query);
        let resultados1 = window.loja1.loja.produtos.filter(produto => produto.nome.toLowerCase().includes(query.toLowerCase()));
        console.log('Resultados da pesquisa loja 1: ', resultados1);

        let resultados2 = window.loja2.loja.produtos.filter(produto => produto.nome.toLowerCase().includes(query.toLowerCase()));
        console.log('Resultados da pesquisa loja 2: ', resultados2);

        let resultados3 = window.loja3.loja.produtos.filter(produto => produto.nome.toLowerCase().includes(query.toLowerCase()));
        console.log('Resultados da pesquisa loja 3: ', resultados3);


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
    }




    /* ------------------------------------------------------------------------------- */
    /* Event Listeners */
    /* ------------------------------------------------------------------------------- */

    enableCameraButton.addEventListener('click', startVideo);
    ocrButton.addEventListener('click', async () => {
        if (!video.srcObject) {
            startVideo();
            alert('A câmera foi ligada. Por favor, capture a imagem novamente.');
            return;
        }
        capturarImagem();
        stopVideo();
        resultadoDiv.textContent = "Processando OCR...";
        resultadoDiv.textContent = await extrairTexto();
    });

    computerVisionButton.addEventListener('click', async () => {
        if (!video.srcObject) {
            startVideo();
            alert('A câmera foi ligada. Por favor, capture a imagem novamente.');
            return;
        }

        capturarImagem();
        stopVideo();
        resultadoDiv.textContent = "Processando Computer Vision...";

        /* const mensagem = await processComputerVision(); */
        const mensagem = await classificarImagem(capturedImage);
        resultadoDiv.textContent = mensagem;
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
}





