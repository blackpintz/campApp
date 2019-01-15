/*global $*/
$(function (){
    $("#comment").form({
    inline: true,    
    fields: {
      nameofauthor: {
        identifier: 'comment[author]',
        rules: [
          {
            type   : 'empty',
            prompt : 'Please enter your name'
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
                identifier: "infoItem",
                rules: [
                    {
                       type : 'empty',
                       prompt : "Please enter name of the campground"
                    }
                ]
            },
            imageurl: {
                identifier: "imageUrl",
                rules: [
                    {
                        type: "url",
                        prompt: "We can't find image url"
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


