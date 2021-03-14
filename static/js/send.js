function Send(str,callback){
  $(function () {
    $.ajax({
      url: 'https://easy-nyan-response-api.herokuapp.com/'+str,
      type: 'GET',
      //data:JSON.stringify(dic),
      contentType: 'application/json',
    })
      .done((res) => {
        console.log(res)
        loader=document.getElementById('loader')
        if(loader){
          loader.style.display = 'none'
        }
        if(callback){
          callback(res)
        }
      })
      .fail((res) => {
        window.alert('通信に失敗しました')
        console.log(res);
      })
  });
}
