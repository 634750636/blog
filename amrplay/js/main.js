var button = document.getElementById('play');
var amr = document.getElementById('amr');

// File Reader 返回 buffer array
function readBlob(blob, callback) {
    var reader = new FileReader();
    reader.onload = function (e) {
        var data = new Uint8Array(e.target.result);
        callback(data);
    };
    reader.readAsArrayBuffer(blob);
}

// AMR 解码
function playAmrArray(array) {
    var samples = AMR.decode(array);
    if (!samples) {
        // alert('Failed to decode!');
        return;
    }
    playPcm(samples);
}

// 播放 AudioContext
function playPcm(samples) {
    var ctx = getAudioContext();
    var src = ctx.createBufferSource();
    var buffer = ctx.createBuffer(1, samples.length, 8000);
    if (buffer.copyToChannel) {
        buffer.copyToChannel(samples, 0, 0)
    } else {
        var channelBuffer = buffer.getChannelData(0);
        channelBuffer.set(samples);
    }

    src.buffer = buffer;
    src.connect(ctx.destination);
    src.start();
}

// 返回 AudioContext 音频处理对象
// https://developer.mozilla.org/zh-CN/docs/Web/API/AudioContext
function getAudioContext() {
    if (!gAudioContext) {
        gAudioContext = new AudioContext();
    }
    return gAudioContext;
}

var gAudioContext = new AudioContext();

button.addEventListener('click', function () {
    fetch(amr.getAttribute('href'))
        .then(function (res) {
            // Response stream
            return res.blob();
        })
        .then(function (myBlob) {
            readBlob(myBlob, function (data) {
                playAmrArray(data);
            });
        });
})