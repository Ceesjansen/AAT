// $(document).ready(function(){
$('body').append(`
<div>
  <div class="condition"></div>
   <div id="header"></div> 
      <div>
        <div class="displayimage" id="imagecontainer">
          <div class="center-image">
            <span id="correct" style="color:green">O</span>
            <span id="wrong" style="color:red">X</span>
            <img class="imagebox" id="load-image">
  
          </div>
        </div>
      </div>
  <div>
    <div class="goalField" id="approach">
    </div>
  </div>
  <div >
    <div class="measureField" id="measureEnlarge">
    </div>
  </div>
  <div id="neutral">
    <div>
        <div class="button">
          <button class="btn btn-primary" id="button"> Druk hier om te starten </button>
        </div>
      </div>
    </div>
  <div >
    <div class="measureField" id="measureShrink">
    </div>
  </div>
  <div >
    <div class="goalField" id="avoid">
    </div>
  </div> 
</div>
<script>
let fileName= [
{id: 1, type: "circle", url: "https://cdn.dribbble.com/users/31371/screenshots/269938/400x300.png"}
]
let random= true;
</script>
`)


let condition = conditionCheck();
let dataService = dataServices();
//adds and removes html elements and initiates response functions
$('#button').on("click", function(){
  addFixationCrossAndDisableButton();
  dataService.mouseOnTargetSwitch(true);
  setTimeout(function(){
    removeFixationCrossAndAddImage();
    getReactionTimesForApproachingOrAvoiding();
}, dataService.timerOptions().timer);
});
//checks and calculates reaction times 
function getReactionTimesForApproachingOrAvoiding(){
  let loggvar;
  t1 = new Date().getTime();
  if(dataService.getMouseOnTarget() === true){
    findMousePositionAndResizeImages();
  }
  loggvar = setInterval(function(){
    if(dataService.getMouseOnTarget() === true){
      $('.goalField').hover(
          function(){
            if(dataService.getMouseOnTarget() === true){
              dataService.mouseOnTargetSwitch(false);
              let movementAnswer = (this.id);
              t2= new Date().getTime();
              rt= t2-t1;
              clearInterval(loggvar);            
              responseTooSlow(rt, loggvar);
              responseTooQuickly(rt, loggvar);
              $('.imagebox').css(dataService.removeCss());
              console.log('t1: ',t1, 't2: ', t2, 'rt: ',rt);
              compareInputToImageSet(movementAnswer, rt)
              }
        }, function(){
            //do nothing
      });
    }
  }, dataService.timerOptions().freq);
 }



function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) { // Decreasing loop
      var j = Math.floor(Math.random() * (i + 1)); // Get random element out of the array
      var temp = array[i]; // Get element [i] from original array and store it temporarily
      array[i] = array[j]; // Overwrite element [i] from original array with the random element
      array[j] = temp; // Put the original element on random element's original place
  }
  return array; // Return the resulting array
}
    
//checks in which condition the participant is
function conditionCheck(){
  let condition= $('.label_qConditieAAT').find('input').eq(0).prop('checked');
  let images;
  if(condition===true){
    condition = "ci";
  } else{
    condition = "sq";
  }
  let conditie;

  if(condition == "sq"){
    conditie = "vierkante";
  }else{
    conditie = "cirkel";
  }
  $('#header').append(`<h2 id="header-text"> Ga op de ${conditie} afbeeldingen af </h2>`);
  $('#header-text').css({"color": "#FFF", "text-align": "center"});
   return {
    condition: condition,
  }
}
//shuffles the images
if (random === true) {
	shuffleArray(fileName);
}
//function that compares movement to images/conditions
function compareInputToImageSet(movementAnswer, rt){
  if(dataService.getCurrentQuestion() < dataService.getImageSetLength()){
  //checks answer with condition and writes away data accordingly
    if(movementAnswer === "approach" && fileName[dataService.getCurrentQuestion()].type === condition.condition 
      || movementAnswer === "avoid" && fileName[dataService.getCurrentQuestion()].type !== condition.condition){
      answeredCorrectly(rt);
    }else{
      answeredIncorrectly(rt);
    }
  } else{
    dataService.clickButton();
  }
}
function answeredCorrectly(rt){
  //writes data to textarea
  $("input").eq(fileName[dataService.getCurrentQuestion()].id).val($("input").val() + (`{"time": "${rt}"}`));
  //checks if there are still questions
    $('#button').prop('disabled', false).text('Druk hier om te starten').css({"min-width": "250px", "background-color": "#337ab7"})
    dataService.clickButton();
    dataService.incrementQuestion();
}
function answeredIncorrectly(rt){
  $('.center-image').html(dataService.checkAnswer().feedbackFalseHtml)
  $('#wrong').css(dataService.checkAnswer().feedbackCss);
  setTimeout(function(){
    $('#wrong').html('');
    $("input").eq(fileName[dataService.getCurrentQuestion()].id).val($("input").val() + (`{"time": "${rt}"}`));
    $('#button').prop('disabled', false).text('Druk hier om te starten').css({"min-width": "250px", "background-color": "#337ab7"})
    dataService.clickButton();
    dataService.incrementQuestion();
  }, dataService.timerOptions().timer);
}
//functions that shows a message if response was too quick
 function responseTooQuickly(rt, loggvar){
    if(rt < dataService.timerOptions().tooFast){
    clearInterval(loggvar);
    $('#header').append(`<h2 style="position: absolute; left: 33%" id="infoMessage">${dataService.checkAnswer().quickMessage}</h2>`);
  }
}
  //function that shows a message if the response was too slow
function responseTooSlow(rt, loggvar){
    if(rt >= dataService.timerOptions().timeout){
      clearInterval(loggvar);
      $('#header').append(`<h2 style="position: absolute; left: 33%" id="infoMessage">${dataService.checkAnswer().tooSlowMessage}</h2>`);
    }
  
}
//function that calculates the resizing of the displayed images 
function enlargeOrShrinkImages(event){
  let size = 0;
  let resize = (Math.round(event.pageY - $('.measureField').offset().top));
  let resizePercent = 25/125;
  let resizeScale = .25+(1-(resize*resizePercent)/100);
  $('.imagebox').css({"cursor": "pointer", "transform": "scale("+resizeScale+")", "margin": "0 auto"});
}
//checks for mousemovement and calls functions to resize images.
function findMousePositionAndResizeImages(){
    $('.activeImg').css(dataService.getImageCss());
    $('#measureEnlarge').mousemove(function(event){
      enlargeOrShrinkImages(event);
    });
    $('#measureShrink').mousemove(function(event){
      enlargeOrShrinkImages(event);
    });
}
function addFixationCrossAndDisableButton(){
  $('.center-image').html(dataService.getCrossHtml());
  $('#infoMessage').remove();
  $('#fixationcross').css(dataService.getCrossCss());
  $('#button').prop('disabled', true).text('Start gebied').css({"min-width": "250px", "background-color": "red"});
}
function removeFixationCrossAndAddImage(){
  $('#fixationcross').css(dataService.removeCss());
  $('.center-image').html(dataService.getImageHtml(dataService.getCurrentQuestion()));
}



//function to store some variables, work in progress. Could contain most variables in 1 object
function dataServices(){
  let mouseOnTarget;
  let activeQuestion=0;
  let imageLength;
  const freq=1;
  let lowRT= 200;
  let timer= 750;
  let timeout= 3000;
  let quickMessage= "Probeer alstublieft het spel serieus uit te voeren";
  let tooSlowMessage = "Probeer alstublieft sneller te reageren";
  let fixationCross= `<h1 id="fixationcross"> + </h1>`;
  let htmlCorrect = `<span class="feedback" id="correct" style="color:green">GOED</span>`;
  let htmlWrong = `<span class="feedback" id="wrong" style="color:red">FOUT</span>`;
  let crossCss = ({"display": "block", "margin-right": "10px"});
  let removeCss = ({"display": "none"});
  let addImageHtml;
  let button = ($("#btn_continue").length>0) ? $("#btn_continue") : $("#btn_finish");
  let imageCss = ({"display": "block","margin": "0 auto"})
  let answerMessageCss= $('.feedback').css({"display": "block", "margin-top": "90px"});
  let feedbackCss = ({"display": "block", "margin-top": "50px", "text-align": "center", "font-size": "80px"});

  return {
    getCrossHtml(){
      return fixationCross;
    },
    getCrossCss(){
      return crossCss;
    },
    removeCss(){
      return removeCss;
    }, 
    getImageHtml(input){
      return addImageHtml =(`<img class="imagebox activeImg" src="${fileName[input].url}">`);;
    },
    getImageCss(){
      return imageCss;
    }, 
    checkAnswer(){
      return {
        feedbackCorrectHtml: htmlCorrect,
        feedbackFalseHtml: htmlWrong,
        feedbackCss: feedbackCss,
        tooSlowMessage: tooSlowMessage,
        quickMessage: quickMessage
      }
    }, 
    incrementQuestion(){
      return activeQuestion++;
    },
    getCurrentQuestion(){
      return activeQuestion;
    },
    timerOptions(){
      return {
        freq: freq,
        timer: timer,
        timeout: timeout,
        tooFast: lowRT
      }
    }, 
    mouseOnTargetSwitch(input){
      return mouseOnTarget = input;
    },
    getMouseOnTarget(){
      return mouseOnTarget;
    },
    getImageSetLength(){
      return imageLength= Object.keys(fileName).length -1;
    },
    setTimer(){
      return t3 = Date.now();
    },
    resetTimer(){
      return undefined;
    },
    clickButton(){
      return button.click();
    }
  }
}

