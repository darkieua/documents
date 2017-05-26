(function() {
    $( ".edit" ).each(function() {
        $(this).on("click", function(e) {
            if ($(this).attr('data-open')) {
                $.ajax({
                    type: "POST",
                    data: 'id=' + $(this).attr('data-window-id'),
                    url: "/widget/formBuilder/",
                    cache: false,
                    success: function(result){
                        $('#settings-popup').html(result);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.log("Error when loading schedule in AJAX method: " + textStatus);
                    }
                });
                $('#' + $(this).attr('data-open')).foundation('open');
            }
            e.stopPropagation();
        })
    });
}());