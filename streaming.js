var express     = require('express');
var app         = express();
var fs          = require('fs');

app.listen(3000, function() {
    console.log("[NodeJS] Application Listening on Port 3000");
});

app.get('/api/play/:key', function(req, res) {
    var key = req.params.key;            //0.요청 파라미터(파일명)
    var music = 'music/' + key + '.mp3'; //1.노래 경로

    var stat = fs.statSync(music);       //2.파일상태를 읽음
    range = req.headers.range;
    var readStream;

    if (range !== undefined) {
        var parts = range.replace(/bytes=/, "").split("-");

        var partial_start = parts[0];
        var partial_end = parts[1];

        if ((isNaN(partial_start) && partial_start.length > 1) || (isNaN(partial_end) && partial_end.length > 1)) {
            return res.sendStatus(500); //ERR_INCOMPLETE_CHUNKED_ENCODING
        }

        var start = parseInt(partial_start, 10);
        var end = partial_end ? parseInt(partial_end, 10) : stat.size - 1;
        var content_length = (end - start) + 1;
        

        res.status(206).header({    //206 잘게 쪼갠 부분에 대한 응답
            'Content-Type': 'audio/mpeg',
            'Content-Length': content_length,
            'Content-Range': "bytes " + start + "-" + end + "/" + stat.size
        });

        readStream = fs.createReadStream(music, {start: start, end: end});
    } else {
        res.header({
            'Content-Type': 'audio/mpeg',
            'Content-Length': stat.size
        });
        readStream = fs.createReadStream(music); //스트림으로 읽는다.
    }

    var count = 0;
    // 3. 잘게 쪼개진 data를 전송할 수 있으면 data 이벤트 발생 
    readStream.on('data', function(data) {
      count = count + 1;
      console.log('data count='+count);
      // 3.1. data 이벤트가 발생되면 해당 data를 클라이언트로 전송
      res.write(data);
    });

    //readStream.pipe(res); //읽은 스트림을 응답한다.

});