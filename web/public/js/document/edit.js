jQuery(function($) {
    var json = $("#document-json");
    var fbEditor = document.getElementById('fb-editor');
    var formBuilder = $(fbEditor).formBuilder({
        dataType: 'json',
        formData: json.val(),
        i18n: {
            locale: 'ru-RU'
        }
    });

    $("#form-edit").submit(function () {
        json.val(formBuilder.actions.save());
    });

    $(".form-datepicker").datepicker();
});