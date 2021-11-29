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

    // function saveCanvas(){
    //     var tojson = JSON.stringify(canvas);
    //     $.ajax({
    //         type: 'POST',
    //         url: 'http://127.0.0.1:8080/generate_meme',
    //         data: { canvas_json: tojson},
    //         success: function(response) { 
    //             if(response == 'OK'){
    //                 console.log('line 86: response sent!');
    //             }else{
    //                 console.log('line 88 error: '+response);
    //             }
    //         },
    //         error: function(xhr, status, err) {
    //           console.log(xhr.responseText);
    //         }
    //     });

    // }

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


    var debounce;
    $('#search_modal').on('scroll', function() {
        if (debounce) clearTimeout(debounce);

        debounce = setTimeout(function(){
        debounce = null;
        if($('#search_modal').scrollTop() + $('#search_modal').innerHeight() >= $('#search_modal')[0].scrollHeight) {
            add_more_images_on_scroll();
        }
        }, 300);
    })



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









/////////////////////////// DAPP . JS ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

deployed_chain = '0x89'; 

document.getElementById('mint_button').onclick = async function(){
  if (typeof Web3 != 'undefined') {
    const provider = await detectEthereumProvider();
    if (provider) {
      const chainId = await ethereum.request({ method: 'eth_chainId' });
      if(chainId == deployed_chain){
        mint();
      }else{
        alert('WRONG NETWORK!');
      }
    } else {
      install_metamask();
    }
  }
};

document.getElementById('connect_wallet').onclick = async function(){
 const provider = await detectEthereumProvider();
  if (provider) {
    connect();
  } else {
    install_metamask();
  }
};

const abi = [{"inputs":[{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_symbol","type":"string"},{"internalType":"string","name":"_initBaseURI","type":"string"},{"internalType":"string","name":"_initNotRevealedUri","type":"string"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"baseExtension","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"cost","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maxMintAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maxSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_mintAmount","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"notRevealedUri","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bool","name":"_state","type":"bool"}],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"reveal","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"revealed","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_newBaseExtension","type":"string"}],"name":"setBaseExtension","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_newBaseURI","type":"string"}],"name":"setBaseURI","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_newCost","type":"uint256"}],"name":"setCost","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_notRevealedURI","type":"string"}],"name":"setNotRevealedURI","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_newmaxMintAmount","type":"uint256"}],"name":"setmaxMintAmount","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenOfOwnerByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"}],"name":"walletOfOwner","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"withdraw","outputs":[],"stateMutability":"payable","type":"function"}];
const contract_address = '0xc5988d9354e2d392de0b0d3c2de98fe43767b246';
const rpcURL = 'https://polygon-mainnet.infura.io/v3/d8737054b1a0401282cb8624a060fc7f';

var waitForWeb3 = setInterval(function () {
    if (typeof Web3 != 'undefined') {
			web3 = new Web3(rpcURL);
			contract = new web3.eth.Contract(abi, contract_address);
      (async function(){
        // var totalSupply = await contract.methods.totalSupply().call();

        const provider = await detectEthereumProvider();
        if (provider) {
          const chainId = await ethereum.request({ method: 'eth_chainId' }); 
          if(chainId != deployed_chain){
            $("#buy_button").attr("disabled", true);
            $("#buy_button").attr("class", 'wrong_blockchain');
            $("#buy_button").html('WRONG NETWORK!');    
          }
        } else {
          install_metamask();
        }
      })();
      clearInterval(waitForWeb3);
    }
}, 40);

var waitForMetamask = setInterval(function () {
    if (typeof ethereum != 'undefined') {

      checkProvider();
      currentAccount = null;
      ethereum
        .request({ method: 'eth_accounts' })
        .then(handleAccountsChanged)
        .catch((err) => {
          console.error(err+" 49");
        });
        ethereum.on('accountsChanged', handleAccountsChanged);

      clearInterval(waitForMetamask);
    }
}, 40);

async function mint() {   
	var account = await getAccount(); 
	var number_for_mint = 1;
	var pret_final_in_gwei = 10000000 * number_for_mint;
	var pret_final = web3.utils.toHex(web3.utils.toWei(pret_final_in_gwei.toString(), 'gwei'));

  var est = await contract.methods.mint(number_for_mint).estimateGas({
      from: account,
      value: pret_final,
      gas: 5e6
  });

  var final_gas = await web3.utils.toHex(est);

  const tx = {
      from: account, 
      to: contract_address,  
      gas: final_gas,
      value: pret_final, 
      data: contract.methods.mint(number_for_mint).encodeABI(),
      chainId: deployed_chain,
  };

  const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [tx],
  }).then( async (result) => {
    console.log('Minting successful! ' + result);
    //send result to nodejs and track it, upon success upload to final json/img folder
    const params = {
      from: account,
      to: contract_address,
      txHash: result,
      chainId: deployed_chain,
      value: pret_final,
      status: 'pending'
    };

      // Post tx data

          $.ajax({
          type: 'POST',
          url: 'http://127.0.0.1:8080/ethereum/send',
          data: { params, canvas_json: tojson },
          success: function(response) { 
              if(response == 'OK'){
                console.log(response+' sent successfully to nodejs!')
              }else{
                  console.log('line 88 error: '+response);
              }
          },
          error: function(xhr, status, err) {
            console.log(xhr.responseText);
          }
      });
  })
  .catch((error) => {
    console.log(error+' 68');
  });
}

async function checkProvider(){
	const provider = await detectEthereumProvider();

	if (provider) {
	  startApp(provider); 
	} else {
	  install_metamask();
	}

	function startApp(provider) {
	  if (provider !== window.ethereum) {
	    console.error('Do you have multiple wallets installed?');
	  }
	}

	const chainId = await ethereum.request({ method: 'eth_chainId' });
	ethereum.on('chainChanged', handleChainChanged);

	function handleChainChanged(_chainId) {
	  window.location.reload();
	}
}
function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    console.log('Please connect to MetaMask.');
  } else if (accounts[0] !== currentAccount) {
    currentAccount = accounts[0];
    document.getElementById('connect_wallet').innerHTML = currentAccount.substr(0,6)+"..."+currentAccount.substr(-4);
  }
}

function connect() {
  ethereum
    .request({ method: 'eth_requestAccounts' })
    .then(handleAccountsChanged)
    .catch((err) => {
      if (err.code === 4001) {
        console.log('Please connect to MetaMask.');
      } else {
        console.error(err);
      }
    });
}

async function getAccount() {
  const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
  const account = accounts[0];
  return account;
}

function install_metamask(){
  alert('Please install MetaMask!');
}

});