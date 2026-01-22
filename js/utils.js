onload = async () => {


    /* Global Variable Declarations */
    var capturedImage = null;
    var tesseractWorker = null;
    var cvModel = null;
    
    /* Element References */
    var video = document.getElementById("videoElement");
    var enableCameraButton = document.getElementById("enableCameraButton");
    var ocrButton = document.getElementById("ocrButton");
    var computerVisionButton = document.getElementById("computerVisionButton");
    var resultadoDiv = document.getElementById("resultado");
    
    /* Functions */
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
        const constraints = {
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: "environment" // Use a câmera traseira, se disponível
            }
        };
        getMedia(constraints);
    }
    function stopVideo() {
        let stream = video.srcObject;
        let tracks = stream.getTracks();

        tracks.forEach(function (track) {
            track.stop();
        });

        video.srcObject = null;
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

    /* Event Listeners */
    //enableCameraButton
    enableCameraButton.addEventListener('click', startVideo);
    ocrButton.addEventListener('click', async () => {
        if (!video.srcObject) {
            alert('A câmera não está ativa!');
            return;
        }
        capturarImagem();
        stopVideo();
        resultadoDiv.textContent = "Processando OCR...";
        resultadoDiv.textContent = await extrairTexto();
    });
    computerVisionButton.addEventListener('click', async () => {
        if (!video.srcObject) {
            alert('A câmera não está ativa!');
            return;
        }

        capturarImagem();
        stopVideo();
        resultadoDiv.textContent = "Processando Computer Vision...";

        const mensagem = await processComputerVision();
        resultadoDiv.textContent = mensagem;
    });
    /* Main Code Execution */

}