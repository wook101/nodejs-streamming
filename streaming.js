const express     = require('express');
const app         = express();
const fs          = require('fs');

app.listen(3000, function() {
    console.log("[Server] Application Listening on Port 3000");
});

app.use(express.static('public'));  //정적인 파일들이 있는 디렉토리

//메인 페이지
app.get('/api',function(req,res){
    res.sendFile(__dirname+"/public/html/home.html");
});

//스트리밍 오디오
app.get('/api/play', function(req, res) {
    //var key = req.params.key;            //0.요청 파라미터(파일명)
    var key = "Giriboy-Sick"
    var music = 'music/' + key + '.mp3'; //1.노래 경로
    var stat = fs.statSync(music);       //2.파일상태를 읽음

    const readStream = fs.createReadStream(music); //스트림생성 스트림으로 읽는다.

    res.header({
        'Content-Type': 'audio/mpeg',
        'Content-Length': stat.size
    });
    
    var count = 0;
    // 잘게 쪼개진 data를 전송할 수 있으면 data 이벤트 발생 
    readStream.on('data', function(data) {
      count = count + 1;
      res.write(data);                      //해당 data를 클라이언트로 전송
    });
    
    //스트림을 통한 전송이 완료
    readStream.on('end',()=>{
        console.log('end streaming');
        // 클라이언트에 전송완료를 알림
        res.end();
    });
    
    //전송중 에러
    readStream.on('error',()=>{
        res.end('500 Internal Server '+err);
    });

    //readStream.pipe(res); //읽은 스트림을 바로 응답한다.

});