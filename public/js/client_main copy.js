$(function() {
    var acc = document.getElementsByClassName("accordion");
    var i;

    for (i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var panel = this.nextElementSibling;
        if (panel.style.maxHeight) {
        panel.style.maxHeight = null;
        } else {
        panel.style.maxHeight = panel.scrollHeight + "px";
        }
    });
    }

    var scrollToTopBtn = document.getElementById("up_to_top");
    scrollToTopBtn.addEventListener("click", scrollToTop)
    var rootElement = document.documentElement;
    function scrollToTop() {
    rootElement.scrollTo({
        top: 0,
        behavior: "smooth"
    });
    }

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

    $('.nft_template').on('click', function(e){
        imageBackground = this.src;
        fabric.Image.fromURL(imageBackground, function(image) {
            image.scaleX = canvas.width / image.width;
            image.scaleY = canvas.height / image.height;
            canvas.setBackgroundImage(image);
            canvas.requestRenderAll();
         });
         toggleSearchModal();
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

    }

    //// site javascript

    var searchModal = $('#search_modal');
    var openBtn = $('#search_button');
    var closeBtn = $('.close');

    openBtn.on('click',toggleSearchModal);
    closeBtn.on('click',toggleSearchModal);

    function toggleSearchModal(){
        searchModal.toggle(50);
        resizeAllGridItems();
        $('body').css('overflow','hidden');
    }
//////////////////////////////////////////
    var recentNFT = $('.recent_nft');
    recentNFT.on('click',openRecentNFT);

    function openRecentNFT(){
        $(this).css('opacity','0.5');
        alert('clicked')
    }




});

function resizeGridItem(item){
    grid = document.getElementsByClassName("grid")[0];
    rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
    rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-row-gap'));
    rowSpan = Math.ceil((item.querySelector('.content').getBoundingClientRect().height+rowGap)/(rowHeight+rowGap));
      item.style.gridRowEnd = "span "+rowSpan;
  }
  
  function resizeAllGridItems(){
    allItems = document.getElementsByClassName("item");
    for(x=0;x<allItems.length;x++){
      resizeGridItem(allItems[x]);
    }
  }
  
  function resizeInstance(instance){
    item = instance.elements[0];
    resizeGridItem(item);
  }
  
  window.onload = resizeAllGridItems();
  window.addEventListener("resize", resizeAllGridItems);
  
  allItems = document.getElementsByClassName("item");
  for(x=0;x<allItems.length;x++){
    imagesLoaded( allItems[x], resizeInstance);
  }