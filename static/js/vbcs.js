/**
 * @file vbcs.js
 * @description Voice Boost Chat Service
 * @author 398noe
 * @since 2021-03-13
 * @version 0.4.5
 */

/**
 * Global Value (グローバル変数)
 */
/// 通話の音質設定
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
/// SkyWayの設定
var peerSettings = {
    key: "4ea6c5fa-4ca2-4dc4-a67c-d2f520ed1a6c",
    debug: 3
}

/// 予め予約されたStream
///var myStream = null; /// 自身のメディアストリーム(localStream)
///var theirStream = null; /// 相手のメディアストリーム
///var localStream = null; ///

/// ルームモード
var roomMode = "mesh"; /// sfuかmeshを指定

/**
 * @function checkMediaDevices
 * @description メディアデバイスが使用可能か判定します
 */
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
 * @function makeAudioObj オーディオタグを追加する関数
 * @description オーディオタグを追加する関数
 * @param selectId Audioタグを追加する親となるid値 (roomAudio内に追記するのであれば selectId = "roomAudio"となる)
 * @param peerId Audioタグのid値となるpeer.id
 * @param stream 流し込むオーディオソース
 * @example makeAudioObj(roomAudio, peer.id, inputStream)
 */
function makeAudioObj(selectId, peerId, stream) {
    /**
     * audio要素の追加
     */
    var selectRoomAudioId = document.getElementById(selectId);
    var audioTag = document.createElement("audio");
    audioTag.controls = true;
    audioTag.setAttribute("id", peerId);
    selectRoomAudioId.appendChild(audioTag);
    /**
     * audioタグにstreamを流し込む
     */
    var audio = document.getElementById(peerId);
    if ("srcObject" in audio) {
        audio.srcObject = stream;
    } else {
        audio.src = window.URL.createObjectURL(stream);
    }
    /**
     * 再生を開始
     */
    audio.play().catch(function(err) {
        console.log(err);
    });
    return stream;
}



/**
 * @function main
 * @description vbcsのメイン挙動に関する関数です
 */
const Peer = window.Peer;
(async function main() {
    const roomName = document.getElementById("room_name").innerText; /// 入室する予定のルーム名
    const roomEnterTrigger = document.getElementById("join_btn"); /// 入室ボタン
    const roomLeaveTrigger = document.getElementById("hang_up_btn_label"); /// 退出ボタン
    const myAudio = document.getElementById("myAudio"); /// 自分の音声
    const roomAudio = document.getElementById("roomAudio"); /// 参加者の音声
    const roomMessages = document.getElementById("roomMessages"); /// ルーム内のメッセージ
    const myText = document.getElementById("msg_input"); /// 自分の投稿予定のテキスト
    const textSendTrigger = document.getElementById("send_msg_btn"); /// テキストチャット投稿ボタン
    /**
     * myAudio(自分の音声)をmyStreamに代入する
     */
    const myStream = await navigator.mediaDevices.getUserMedia(constraints)
        .catch(function(err) {
            console.log(err);
        });
    /**
     * myStreamをmyAudioにレンダリングする
     */
    myAudio.muted = true;
    myAudio.controls = true;
    if ("srcObject" in myAudio) {
        myAudio.srcObject = myStream;
    } else {
        myAudio.src = window.URL.createObjectURL(myStream);
    }
    myAudio.play().catch(function(err) {
        console.log(err);
    });

    /**
     * SkyWay(peer) との接続 
     */
    const peer = (window.peer = new Peer(peerSettings));

    /**
     * EventListener
     * 入室ボタンが押されたら
     * !note : ここでは必ずpeerとの接続が確立されている必要がある
     */
    roomEnterTrigger.addEventListener("click", () => {
        if (peer.open) {
            myname=GE('my_name_input').value
            if(!myname){
                window.alert('please enter your name')
                return 
            }

            /// peerが開いていた場合(peer接続に成功した場合)、コンソールで伝える
            console.log("Peer connection is succeed.");
            console.log("Your ID is [" + peer.id + "]");
            id2name[peer.id]=document.getElementById('my_name_input').value

            GE('my_name').innerText=myname
            GE('start').style.transform='scaleY(0)'
        } else {
            /// peerが閉じていた場合何も返さない
            return;
        }

        /**
         * roomNameに記載されたルームに参加する
         * 自身が参加する際にはmyStreamをもって参加する
         */
        /**
         * roomNameが記載されていなかった場合はアラートを返す
         */
        const room = peer.joinRoom(roomName, {
            mode: roomMode,
            stream: myStream
        });

        /**
         * ルームに入室後に一度だけ行う事
         * ルームメッセージに入室したことを伝える
         */
        room.once("open", () => {
            console.log(`[メッセージ]：あなたは入室しました\nあなたのpeerIDは[${peer.id}]です\n\n`)
            r=Randint(5)+1
            room.send({'username':myname,'text':'connect','iconnum':r})
            iconnum=r
            GE('my_icon').src='../static/img/usericon/girl'+r+'.png'
            AddSystemMsg('あなたが入室しました。')
        });

        /**
         * 他の参加者が入室した場合
         */
        room.on("peerJoin", peerId => {
            console.log(`peerID[${peerId}]さんが入室しました\n`)
        });
        room.on("stream", async stream => {
            /**
             * 他の参加者の音声データをレンダリングする
             */
            const newAudio = document.createElement("audio");
            newAudio.muted = false;
            newAudio.controls = true;
            if ("srcObject" in newAudio) {
                newAudio.srcObject = stream;
            } else {
                newAudio.src = window.URL.createObjectURL(stream);
            }
            newAudio.setAttribute("data-peer-id", stream.peerId);
            newAudio.setAttribute("id", stream.peerId);
            roomAudio.appendChild(newAudio);
            newAudio.play().catch(function(err) {
                console.log(err);
            });
        });
        /**
         * チャットを受信した際 or 新しく人が入ってきたとき
         */
        tmp_user=''
        room.on("data", ({ data, src }) => {
            console.log(`${src}: ${data}\n`)
            if (`${data["text"]}`=='connect' || `${data["text"]}`=='already_connected'){
                if(!Object.keys(id2name).includes(`${src}`)){
                    id2name[`${src}`]=`${data["username"]}`
                    AddMember(`${data["username"]}`,`../static/img/usericon/girl${data["iconnum"]}.png`,`${src}`)
                    if (`${data["text"]}`=='connect'){
                        AddSystemMsg(`${data["username"]}さんが入室しました`)
                    }
                    room.send({'username':myname,'text':'already_connected','iconnum':iconnum})
                }
            }else{
                Send(`nyan/${data["text"]}`,Callback1)
                tmp_user=`${data["username"]}`
            }
        });
        
        function Callback1(res){
            AddMsg(tmp_user,res['message'],false)
        }

        /**
         * 他の参加者が切断した場合
         */
        room.on("peerLeave", peerId => {
            const removeAudio = roomAudio.querySelector(
                `[data-peer-id="${peerId}"]`
            );
            removeAudio.srcObject.getTracks().forEach(track => track.stop());
            removeAudio.srcObject = null;
            removeAudio.remove();
            
            console.log(`${peerId}さんが退出しました\n`)
            AddSystemMsg(id2name[peerId]+'さんが退出しました')
        })
        /**
         * 自身から通話切断する場合
         */
        room.once("close", () => {
            textSendTrigger.removeEventListener("click", onClickSend);
            console.log(`あなたは退出しました\n`)
            AddSystemMsg('あなたが退出しました')
            

            GE('starting_msg').innerText='ルームから退出しました'
            GE('start').style.transform='scaleY(1)'
            
            /**
             * 自身のページからAudio要素を削除
             */
            Array.from(roomAudio.children).forEach(roomAudio => {
                roomAudio.srcObject.getTracks().forEach(track => track.stop());
                roomAudio.srcObject = null;
                roomAudio.remove();
            })

        });

        /**
         * テキストチャット送信ボタンを押した場合
         */
        textSendTrigger.addEventListener("click", onClickSend);
        
        /**
         * ルーム退出ボタンを押した場合
         */
        roomLeaveTrigger.addEventListener("click", () => room.close(), { once: true });
        
        /**
         * Clickで送信する内容
         */
        function onClickSend() {
            /// Web Socketを経由してルーム内の参加者に一斉送信
            /// myTextの内容を一斉送信
            if (myText.value == "") {
                alert("メッセージの内容を入力してください");
                return;
            }
            room.send({'username':myname,'text':myText.value});
            AddMsg(myname,myText.value,true)
            Send('posneg/'+myText.value,Callback2)
            GE('msg_input').value=''
            console.log(`${peer.id}: ${myText.value}\n`)
            myText.value = "";
        }
        function Callback2(res){
            AddMsg('ネコ',res['message'],false)
        }
        

        /**
         * 何かエラーが発生した際はエラーを表示する
         */
        peer.on("error", function (err) {
            console.log(err);
        })
    });
})();