/*global $*/
$(function (){
    $("#comment").form({
    inline: true,    
    fields: {
      nameofauthor: {
        identifier: 'comment[text]',
        rules: [
          {
            type   : 'empty',
            prompt : 'What is the comment?'
          }
        ]
      }
    }
});
})

$(function(){
    $("#campground").form({
        inline: true,
        fields: {
            nameofcampground: {
                identifier: "campground[name]",
                rules: [
                    {
                       type : 'empty',
                       prompt : "Please enter name of the campground"
                    }
                ]
            },
            price: {
                identifier: "campground[price]",
                rules: [
                    {
                        type: "empty",
                        prompt: "How much do they charge per night?"
                    },
                    
                ]
            }
        }
    })
})

$(function() {
    $("#lang").dropdown();
})

$(function() {
    $('.message .close')
  .on('click', function() {
    $(this)
      .closest('.message')
      .transition('fade')
    ;
  });
})

$(function() {
    $('#toggle').click(function() {
    $('.ui.sidebar')
    .sidebar('toggle');
    })
});


