console.log("hello from modal.js")

$(document).ready(function(){

$("div[id^='myModal']").each(function(){
    var currentModal = $(this);
    //click next
    currentModal.find('.btn-next').click(function(){
      console.log(currentModal)
      currentModal.modal('hide');
      currentModal.closest("div[id^='myModal']").nextAll("div[id^='myModal']").first().modal('show'); 
    });
    
    //click prev$(document).ready(function(){
    currentModal.find('.btn-prev').click(function(){
      console.log(currentModal)
      currentModal.modal('hide');
      currentModal.closest("div[id^='myModal']").prevAll("div[id^='myModal']").first().modal('show'); 
    });
  
  });

})