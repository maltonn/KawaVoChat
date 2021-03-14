url = new URL(location.href)
room_name = url.searchParams.get("room");
GE('room_name').innerText=room_name || 'Public room'

myname='anymous'
id2name={}
bucket_relay=true

//TODO 入った時点でユーザーがすでにいるユーザーをuser_tableに追加

GE('mute_btn').addEventListener('change',()=>{
    if(GE('mute_btn').checked){
        //ミュートになったときの処理
    }else{
        //ミュート解除時の処理
    }
})

GE('speaker_mute_btn').addEventListener('change',()=>{
    if(GE('speaker_mute_btn').checked){
        myAudio.srcObject.getTracks().forEach((track) => (track.enabled = false));
    }else{
        myAudio.srcObject.getTracks().forEach((track) => (track.enabled = true));
    }
})

GE('send_msg_btn').addEventListener('click',()=>{
    //function onClickSend() {
})

function AddMsg(user,msg,isMe){
    div=CE('div')
    div.classList.add('msg')
    if (isMe){
        div.classList.add('me')
    }
    span=CE('span')
    span.innerText=user
    p=CE('p')
    p.innerText=msg
    div.appendChild(span)
    div.appendChild(p)
    GE('msg_space').appendChild(div)
}
function AddSystemMsg(msg){
    div=CE('div')
    div.classList.add('system_msg')
    p=CE('p')
    p.innerText=msg
    div.appendChild(p)
    GE('msg_space').appendChild(div)
}

function AddMember(name,icon_path,userid){
    //〇〇が来ましたメッセージを送信
    
    div=CE('div')
    div.classList.add('member_div')
    //セキュリティは気にしない
    div.innerHTML='<input type="checkbox" id="'+userid+'"><label for="'+userid+'"><div class="member"><img src="'+icon_path+'"></div></label><div class="username"><span id="'+userid+'_name'+'">'+name+'</span></div><audio id="'+userid+'"></audio>'
    GE('members').appendChild(div)
}

function RemoveMember(userid){
    document.getElementById(userid).parentNode.outerHTML=''
    delete id2name[userid]
}

function Randint(max){
    return Math.floor(Math.random() * Math.floor(max));
}

function CE(str){
    return document.createElement(str)
}
function GE(id){
    return document.getElementById(id)
}