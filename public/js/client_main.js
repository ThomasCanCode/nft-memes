$(function() { //canvas this the main shit, if anyone ever reads this, lmk in the contact section lol
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
    // create a wrapper around native canvas element (with id="c")
    let imageBackground = '';
    let cursorMode = false;
    let textCount = 0;
    var canvas = new fabric.Canvas('canvas', {
        selectionColor: 'blue',
        selectionLineWidth: 2,
        //isDrawingMode : true
    });

    ///default image
    
    defaultimage = './images/canvas_default.webp';
    fabric.Image.fromURL(defaultimage, function(defaultimage) {
        defaultimage.scaleX = canvas.width / defaultimage.width;
        defaultimage.scaleY = canvas.height / defaultimage.height;
        canvas.setBackgroundImage(defaultimage);
        canvas.requestRenderAll();
     });
      
    
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
    
    $('body').on('click', 'img.nft_template', function(e) {
        imageBackground = this.src;
        fabric.Image.fromURL(imageBackground, function(image) {
            image.scaleX = canvas.width / image.width;
            image.scaleY = canvas.height / image.height;
            canvas.setBackgroundImage(image);
            canvas.requestRenderAll();
         });
         toggleSearchModal();
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
            left: obj.e.offsetX - (name.width/2),
            top: obj.e.offsetY-name.height,
        });
        canvas.add(name);
        canvas.renderAll();
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

    ////modal

    var searchModal = $('#search_modal');
    var openBtn = $('.search_button');
    var closeBtn = $('.close');

    openBtn.on('click',toggleSearchModal);
    closeBtn.on('click',toggleSearchModal);

    function toggleSearchModal(){
        searchModal.toggle(50);
        resizeAllGridItems();
        $('body').toggleClass('overflow_hidden');
    }
/////////test on recent nfts
    var recentNFT = $('.recent_nft');
    recentNFT.on('click',openRecentNFT);

    function openRecentNFT(){
        $(this).css('opacity','0.5');
        alert('clicked')
    }


    $('#search_modal').on('scroll', function() {
        if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
            add_more_images_on_scroll();
        }
    })


});

//meme templates grid
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

  function delay(callback, ms) {
    var timer = 0;
    return function() {
      var context = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        callback.apply(context, args);
      }, ms || 0);
    };
  }

  

  ///meme template search functions
  var all_items = Array;
  $('#search').keyup(delay(function (e) {
    // 1. grab the search term from the input field
    var search_term = $(this).val();
    ajax_search_call(search_term);
  }, 500));


function ajax_search_call(search_term){
    // 2. send it to your back-end via ajax in the body 
    $.ajax({
        method: "POST",
        url: "/api/search",            // <-- your back-end endpoint
        data: "search=" + search_term,  // <-- what you're sending
        dataType: "json",              // <-- what you're expecting back
        success: function(json){       // <-- do something with the JSON you get
          var res = JSON.parse(JSON.stringify(json));
          if(search_term != "*"){
            $('.grid').find('*').not('.close').remove();
          }
          if(res.length > 60){
              //console.log('large array! > 50 items')
              all_items = res;
              add_more_images_on_scroll();
          }else if(res.length == 0){
              $('.grid').find('*').not('.close').remove();
              $('.grid').append('<h4>No templates have been found, please search something else!</h4>');
          }else{
              for(image of res){
                  let image_name = image.replace('.jpg','');
                  let to_append = '<div class="item"><div class="content"><h4>'+image_name+'</h4><img class="nft_template hidden" src="./meme_templates/'+image+'" alt="'+image_name+'"></div></div>';
                  $('.grid_hidden').append(to_append);
              }
          }
          setImages();
        },
        error: function(data){
          console.log('Error', data);
        }
      });
}

function add_more_images_on_scroll(){
    var grid_length = $('.grid .item').length;
    var total_items_to_be = grid_length + 20;
    var all_items_length = all_items.length;

    if(all_items_length <= 1){
        ajax_search_call('*'); //scroll without typing anything in first
    }else{
        var small_all_items = all_items.slice(grid_length,total_items_to_be)
        for(let i =0; i<20;i++){ 
            if(grid_length+i == all_items_length){
                return;
            }
            let image = small_all_items[i];
            let image_name = image.replace('.jpg','');
            let to_append = '<div class="item"><div class="content"><h4>'+image_name+'</h4><img class="nft_template hidden" src="./meme_templates/'+image+'" alt="'+image_name+'"></div></div>';
            $('.grid_hidden').append(to_append);
        }
    }
    setImages();
}

function setImages() {    
    $('.grid_hidden').imagesLoaded( function() {
        $('.grid_hidden').children().appendTo(".grid");
        resizeAllGridItems();
    });
}