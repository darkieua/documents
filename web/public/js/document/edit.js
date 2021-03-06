jQuery(function($) {
    var json = $("#document-json");
    var fbEditor = $("#fb-editor");
    var automatization = $("#document-automatization");
    var dshElementsArray = $(".dsh-element");
    var isDocumentDsh = automatization.val() == 0;
    var fbArray = [];

    if(isDocumentDsh) {
        dshElementsArray.each(function() {
            $(this).hide();
        });
    }

    $(".fb-editor").each(function() {
        fbArray.push($(this).formBuilder({
            dataType: 'json',
            formData: json.val(),
            i18n: {
                locale: 'ru-RU'
            }
        }));
    });

    automatization.change(function() {
        isDocumentDsh = automatization.val() == 0;
        if (isDocumentDsh) {
            console.log("DSH");
            dshElementsArray.each(function() {
                $(this).slideUp(1000);
            });
        } else {
            console.log("NOT DSH");
            dshElementsArray.each(function() {
                $(this).slideDown(1000);
            });
        }
    });



    $("#form-edit").submit(function (e) {
        if (!isDocumentDsh)
            fbArray.forEach(function(fb_instance) {
                json.val(fb_instance.actions.save());
            })
    });

    $(".form-datepicker").datepicker();
});