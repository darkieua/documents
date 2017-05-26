jQuery(function($) {
    var fbEditor = document.getElementById('fb-editor');
    var formBuilder = $(fbEditor).formBuilder({
        i18n: {
            locale: 'ru-RU'
        }
    });

    $("#form-edit").submit(function () {
        $("#document-json").val(formBuilder.actions.save());
    });
});