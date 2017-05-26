jQuery(function($) {
    $(".form-datepicker").datepicker();

    $("#document-form :input").each(function(){
        $(this).change(function(){
            previewJpg();
        })
    });

    function previewJpg() {
        if ($('#document-preview').length) {
            $.ajax({
                url: '/view/generated/' + id + '.jpg',
                type: "POST",
                data: $("#document-form").serialize(),
                mimeType: "text/plain; charset=x-user-defined"
            }).done(function( data, textStatus, jqXHR ) {
                $("#document-preview").html('<img src=data:image/jpeg;base64,' + base64Encode(data) + '>');
            }).fail(function( jqXHR, textStatus, errorThrown ) {
                $("#block-notify .alert").html("Неможливо завантажити попередній перегляд: " + errorThrown);
            });
        }
    }

    function base64Encode(str) {
        var CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var out = "", i = 0, len = str.length, c1, c2, c3;
        while (i < len) {
            c1 = str.charCodeAt(i++) & 0xff;
            if (i == len) {
                out += CHARS.charAt(c1 >> 2);
                out += CHARS.charAt((c1 & 0x3) << 4);
                out += "==";
                break;
            }
            c2 = str.charCodeAt(i++);
            if (i == len) {
                out += CHARS.charAt(c1 >> 2);
                out += CHARS.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
                out += CHARS.charAt((c2 & 0xF) << 2);
                out += "=";
                break;
            }
            c3 = str.charCodeAt(i++);
            out += CHARS.charAt(c1 >> 2);
            out += CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
            out += CHARS.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
            out += CHARS.charAt(c3 & 0x3F);
        }
        return out;
    }
});