$(function() {
    // create a wrapper around native canvas element (with id="c")
    let imageBackground = '';
    let cursorMode = false;
    let textCount = 0;
    var canvas = new fabric.Canvas('canvas', {
        selectionColor: 'blue',
        selectionLineWidth: 2,
        //isDrawingMode : true
      });

    // var text = new fabric.IText('hello world', { 
    //     left: 0, 
    //     top: 0,
    //     cornerColor: 'rgb(255,0,0)'
    // });
    // canvas.add(text);
    
    canvas.on('mouse:up', function(obj) {
        if(obj.target==null && cursorMode == true){
            addTextMode(false);
            addNewText(obj,textCount);
        }else{
            return
        }
    })

    $('#addText').on('click', function(){
        addTextMode(true);
    });

    $('#nodeCall').on('click', function(e){
        saveCanvas();
    });

    $('#img_container img').on('click', function(e){
        imageBackground = this.src;
        fabric.Image.fromURL(imageBackground, function(image) {
            image.scaleX = canvas.width / image.width;
            image.scaleY = canvas.height / image.height;
            canvas.setBackgroundImage(image);
            canvas.requestRenderAll();
         });
         //getAllObjects(); idk if needed?
    });

    function addTextMode(mode){
        if(mode == true){
            cursorMode = true;
            canvas.set({ defaultCursor: "crosshair" });
        }else{
            cursorMode = false;
            canvas.set({ defaultCursor: "auto" });
        }
    }

    function addNewText(obj, name){
        textCount++;
        var name = new fabric.IText('New text', { 
            cornerColor: 'rgb(255,255,0)',
            inCompositionMode: true
        });
        name.set({ 
            name: 'text_'+textCount,
            left: obj.e.x - (name.width/2),
            top: obj.e.y-name.height,
        });
        canvas.add(name);
        canvas.renderAll();
    }

    function getAllObjects(){
        var objs = canvas.getObjects().map(function(o) {
            console.log(o.set('active', true));
        });
    }

    function saveCanvas(){
        var tojson = JSON.stringify(canvas);
        $.ajax({
            type: 'POST',
            url: 'http://127.0.0.1:8080/generate_meme',
            data: { canvas_json: tojson},
            success: function(response) { 
                if(response == 'OK'){
                    console.log('line 86: response sent!');
                }else{
                    console.log('line 88 error: '+response);
                }
            },
            error: function(xhr, status, err) {
              console.log(xhr.responseText);
            }
        });
    //     const dataURL = canvas.toDataURL({
    //         width: canvas.width,
    //         height: canvas.height,
    //         left: 0,
    //         top: 0,
    //         format: 'png',
    //    });
    //    const link = document.createElement('a');
    //    link.download = 'image.png';
    //    link.href = dataURL;
    //    document.body.appendChild(link);
    //    link.click();
    //    document.body.removeChild(link);
    }
});