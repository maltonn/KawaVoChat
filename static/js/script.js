/**
 * @file script.js
 * @description SkyWay Connection
 * @author 398noe
 * @since 2021-03-13
 * @version 1.0.0
 */



/**
 * Global Value (グローバル変数類)
 */
/**
 * @description constraints
 * @description 音質設定を記載する項目です
 */
var constraints = {
    audio: {
        sampleRate: {
            ideal: 48000,
            min: 44100
        },
        channelCount: {
            ideal: 2,
            min: 1
        },
        sampleSize: 16,
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
    },
    video: false
}

/**
 * Peer / SkyWayの設定です
 */
const peer = new Peer({
    key: "4ea6c5fa-4ca2-4dc4-a67c-d2f520ed1a6c",
    debug: 3
});

/**
 * Stream
 */
let localStream;
navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    })
    .then(stream => {
        // 成功時にvideo要素にカメラ映像をセットし、再生
        const videoElm = document.getElementById('my-video');
        videoElm.srcObject = stream;
        videoElm.play();
        // 着信時に相手にカメラ映像を返せるように、グローバル変数に保存しておく
        localStream = stream;
    }).catch(error => {
        // 失敗時にはエラーログを出力
        console.error('mediaDevice.getUserMedia() error:', error);
        return;
    });

peer.on("open", () => {
    document.getElementById("my-id").textContent = peer.id;
});
//着信処理
peer.on('call', mediaConnection => {
    mediaConnection.answer(localStream);
    setEventListener(mediaConnection);
});

/**Event Listener */
// 発信処理
document.getElementById('make-call').onclick = () => {
    const theirID = document.getElementById('their-id').value;
    const mediaConnection = peer.call(theirID, localStream);
    setEventListener(mediaConnection);
};

// イベントリスナを設置する関数
const setEventListener = mediaConnection => {
    mediaConnection.on('stream', stream => {
        // video要素にカメラ映像をセットして再生
        const videoElm = document.getElementById('their-video')
        videoElm.srcObject = stream;
        videoElm.play();
    });
}

function checkMediaDevices() {
    /**
     * 新しいAPIが使用可能であればそれを使用します
     */
    navigator.mediaDevices = navigator.mediaDevices || ((navigator.mozGetUserMedia || navigator.webkitGetUserMedia || navigator.msGetUserMedia) ? {
        getUserMedia: function(c) {
            return new Promise(function(y, n) {
                (navigator.mozGetUserMedia ||
                    navigator.webkitGetUserMedia || navigator.msGetUserMedia).call(navigator, c, y, n);
            });
        }
    } : null);
    /**
     * getUserMedia()関数が利用可能かどうかコンソール出力します
     */
    if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
        console.log("Error : getUserMedia() is not supported!!");
        alert("Error : Sorry, you can not use VBCS...");
    } else {
        console.log("Info  : getUserMedia() is supported.");
        console.log("Info  : Welcome to VBCS!!");
    }
    if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = function(constraints) {
            var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
            if (!getUserMedia) {
                return Promise.reject(new Error("Error : getUserMedia is not implemented in this browser"));
            }
            return new Promise(function(resolve, reject) {
                getUserMedia.call(navigator, constraints, resolve, reject);
            });
        }
    }
}

/**
 * @function makeMyAudio
 * 
 */

/**
 * @function makeAudioObj オーディオタグを追加する関数
 * @description オーディオタグを追加する関数
 * @param {string} [selectID=""]
 * @example makeAudioObj(roomAudio, peer.id, inputStream)
 */


function makeAudioObj(selectId, userId, stream) {
    /**
     * audioタグの追加
     */
    var selectRoomAudioId = document.getElementById(selectId);
    var audioTag = document.createElement("audio");
    audioTag.controls = true;
    audioTag.setAttribute("id", userId);
    selectRoomAudioId.appendChild(audioTag);
    /**
     * audioタグにstreamを流し込む
     */
    var audio = document.getElementById(userId);
    if ("srcObject" in audio) {
        audio.srcObject = stream;
    } else {
        audio.src = window.URL.createObjectURL(stream);
    }
    /**
     * 再生を開始
     */
    audio.play();
    return stream;
}