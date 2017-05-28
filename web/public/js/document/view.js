jQuery(function($) {
    var docPreview = $("#document-preview");

    $(".form-datepicker").datepicker();

    $("#document-form").find(":input").each(function(){
        $(this).change(function(){
            previewJpg();
        });
        $(this).attr('name', 'document[' + $(this).attr('name') + ']');
    });

    $(".render-preview").each(function() {
       $(this).data('render');
       $(this).click(function() {
           switch ($(this).data('render')) {
               case 'jpg':
                   previewJpg();
                   break;
               case 'pdf':
                   previewPdf();
                   break;
               default:
                   console.log("Unknown preview format attribute");
           }
       })
    });

    function previewJpg() {
        if (docPreview.length) {
            $.ajax({
                url: '/view/generated/' + id + '.jpg',
                type: "POST",
                data: $("#document-form").serialize(),
                mimeType: "text/plain; charset=x-user-defined",
                beforeSend: function () {
                    var loadingImg = '<img class="document-preview-loading" src="/public/images/cube.svg">';
                    var docPreview = $("#document-preview");
                    if (!(/\S/.test(docPreview.html()))) docPreview.html(loadingImg);
                    docPreview.css('opacity', '0.3');
                },
                success: function( data ) {
                    var imgSrc = 'data:image/jpeg;base64,' + base64Encode(data);
                    docPreview.css('opacity', '1.0');
                    docPreview.html('<img class="document-preview-rendered" src="' + imgSrc + '">');
                },
                error: function( jqXHR, textStatus, errorThrown ) {
                    $("#block-notify").find(".alert").html("Неможливо завантажити попередній перегляд: " + errorThrown);
                    console.log("Preview failed: " + " " + textStatus + " [" + errorThrown + "]");
                }
            });
        }
    }

    function previewPdf() {
        if (docPreview.length) {
            $.ajax({
                url: '/view/generated/' + id + '.pdf',
                type: "POST",
                data: $("#document-form").serialize(),
                mimeType: "text/plain; charset=x-user-defined",
                beforeSend: function () {
                    var loadingImg = '<img class="document-preview-loading" src="/public/images/cube.svg">';
                    var docPreview = $("#document-preview");
                    if (!(/\S/.test(docPreview.html()))) docPreview.html(loadingImg);
                    docPreview.css('opacity', '0.3');
                },
                success: function( data ) {
                    var pdfSrc = 'data:application/pdf;base64,' + base64Encode(data);
                    docPreview.css('opacity', '1.0');
                    docPreview.html('<object data="' + pdfSrc + '" type="application/pdf" class="document-preview-rendered" width="75%" height="500px">' +
                                    + '<a href="data/test.pdf">test.pdf</a>'
                                    + '</object>');
                },
                error: function( jqXHR, textStatus, errorThrown ) {
                    $("#block-notify").find(".alert").html("Неможливо завантажити попередній перегляд: " + errorThrown);
                    console.log("Preview failed: " + " " + textStatus + " [" + errorThrown + "]");
                }
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

    previewJpg();
});