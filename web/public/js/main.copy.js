var BLOCK = false;
var cropperRectangle = null;
function block()
{
    BLOCK = true;
    $('#waitingbg').css({ height: $(document).height() }).show();
}

function unblock()
{
    $('#waitingbg').css({ height: 0 }).hide();
    BLOCK = false;
}

(function($) {
    $.fn.hasScrollBar = function() {
        var hasScrollBar = {},
            e = this.get(0);
        hasScrollBar.vertical = e.scrollHeight > e.clientHeight;
        hasScrollBar.horizontal = e.scrollWidth > e.clientWidth;
        return hasScrollBar;
    }
})(jQuery);

$.widget("ui.dialog", $.ui.dialog, {
    _allowInteraction: function(event) {
        return !!$(event.target).closest(".cke_dialog").length || this._super(event);
    }
});

function getCookie(name) {
    var matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

function filter_input(e,regexp)
{
    e=e || window.event;
    var target=e.target || e.srcElement;
    var isIE=document.all;

    if (target.tagName.toUpperCase()=='INPUT')
    {
        var code=isIE ? e.keyCode : e.which;
        if (code<32 || e.ctrlKey || e.altKey) return true;

        var char=String.fromCharCode(code);
        if (!regexp.test(char)) return false;
    }
    return true;
}

function changeNumberFrom1(current) {
    current.value = current.value.replace(/^(0+)/,"");

}

function check_form(_form,_mode,_arr)
{
    var err = [];
    var _focus = false;
    switch(_mode)
    {
        case 'submit':
        {
            $('.required',_form).each(function()
            {
                var obj = $(this);
                if (obj.get(0).tagName == 'INPUT' || obj.get(0).tagName == 'SELECT' || obj.get(0).tagName == 'TEXTAREA')
                {
                    if ($.trim(obj.val()) == '' || $.trim(obj.val()) == '0')
                    {
                        var title = obj.next().html();
                        err.push(title ? title : obj.attr('title') );
                        if (!_focus)
                        {
                            obj.focus();
                            _focus = true;
                        }
                    }
                }
            });
        }
            break;
        case 'result':
        {
        }
            break;
        default:
        {
            return false;
        }
            break;
    }
    if (err.length > 0)
    {
        var last = '';
        if (err.length > 1)
        {
            last = ' �� '+err.pop();
        }
        if ($('.ui-dialog span.info').size())
        {
            $('.ui-dialog span.info').css({color: '#E82236'}).html('�������. ������ ����-����� ������� ����: '+err.join(', ')+last+'.');
            $('.ui-dialog .results-block').slideDown('fast');
        }
        else
        {
            $('span.info').first().css({color: '#E82236'}).html('�������. ������ ����-����� ������� ����: '+err.join(', ')+last+'.');
            $('.results-block').first().slideDown('fast');
        }
        return false;
    }
    return true;
}

var handlers = {
    'timeout' : 10000,
    'timeouts' : { global_timeout : null },
    'clearTimeout': function(block) {
        clearTimeout(this.timeouts.global_timeout);
        if (this.timeouts[block+'_info'] != null) clearTimeout(this.timeouts[block+'_info']);
        if (this.timeouts[block+'_error'] != null) clearTimeout(this.timeouts[block+'_error']);
    },
    'SUCCESS_UPDATE_USER' : function (resp) {
        /*modalPopup($('<div/>'),{modal: false, title: '����������'},'info',msg);*/

        $('.signup-form .info, .signup-form .error').empty();
        $('.signup-form .info').text(resp);
        //clearTimeout(timeout_id);
        var timeout_id = setTimeout(function(){$('.signup-form .info').empty();},this.timeout);
        if ($('#photo').val())
            $('.ur-right-part .bg-photo, .ur-right-part img').replaceWith('<div class="person-photo"><img id="person-photo" src="/user/getphoto?' + Math.random()*1000000+1 + '" height="128" width="114" alt="' + photo + '/></div>');
        $('#photo').val('');

    },
    'ERROR_UPDATE_USER' : function(resp) {
        $('.signup-form .error, .signup-form .info').empty();
        $('.signup-form .error').text(resp);
        setTimeout(function(){$('.signup-form .error').empty();},this.timeout);
    },
    'SUCCESS_ADD' : function (resp) {
        var tr = $(resp).find("input[id]").closest('tr');
        var cls = tr.attr('class');
        var trs = $('#' +cls + 's-bl table tbody tr');
        if ( trs.size() ) {
            var number = trs.size()-1;
            trs.each(function(index) {
                if ( $(this).find('input[id]').val() == '' ) {
                    number = index;
                    return false;
                }
            });
            if ( (number == 0 || number != 0) && trs.eq(number).find('input[id]').val() == '' ) {
                trs.eq(number).before(resp);
                var added = trs.eq(number).prev();
            } else {
                trs.eq(number).after(resp);
                var added = trs.eq(number).next();
            }

            added.css('color','#444e8b');
            setTimeout(function(){added.css('color','')},4000);
            added.find('a.description').tooltip();
            $('.' + cls + 's-empty').remove();
        }
    },
    'SUCCESS_UPDATE' : function (resp) {
        var id = $(resp).find('input[id]').attr('id');
        var tr = $('#' + id).closest('tr');
        if ( tr.size() ) {
            tr.replaceWith(resp);
            tr = $('#' + id).closest('tr');
            tr.css('color','#444e8b');
            setTimeout( function() { tr.css('color',''); }, 4000 );
            tr.find('a.description').tooltip();
        }
    },
    'SUCCESS_DELETE' : function (resp) {
        var url_split = resp.item.attr('href').split('/');
        var item = url_split[url_split.length-1].split('-')[0];
        var id = url_split[url_split.length-1].split('-')[1];
        var tr = $('#'+ item + id).closest('tr');
        if ( tr.length > 0 ) {
            tr.remove();
            this.clearTimeout(resp.block);
            $('#' + resp.block + 's-bl .info, #' + resp.block + 's-bl .error').empty();
            $('#' + resp.block + 's-bl .info').text(successRemove[resp.block]);
            this.timeouts[resp.block+'_info'] = setTimeout(function(){$('#'+resp.block+'s-bl .info').empty()},this.timeout);
        }
        if ( !$('#' +resp.block + 's-bl table tbody tr').size() && resp.empty ) {
            $('#' +resp.block + 's-bl table tbody').html(resp.empty);
        }
    },
    'SUCCESS_DELETE_PHOTO' : function (resp) {
        cropperRectangle.croppedImg.remove();
        cropperRectangle.croppedImg = {};
        cropperRectangle.cropControlRemoveCroppedImage.hide();
        //maxim add code
        cropperRectangle.obj.addClass('bg-photo')

        if (typeof (cropperRectangle.options.onAfterRemoveCroppedImg) === typeof(Function)) {
            cropperRectangle.options.onAfterRemoveCroppedImg.call(that);
        }

    },
    'SUCCESS_UPDATE_SRVS_WNDS' : function (resp) {
        $('#'+resp.block+'s-bl table tbody').html(resp.table);
        $('#'+resp.block+'s-bl table tbody').find('a.description').each (function() {
            $(this).tooltip();
        });
        this.clearTimeout(resp.block);
        $('#'+resp.block+'s-bl .error, #'+resp.block+'s-bl .info').empty();
        $('#'+resp.block+'s-bl .info').text(resp.msg);
        this.timeouts[resp.block+'_info'] = setTimeout(function(){$('#'+resp.block+'s-bl .info').empty();},this.timeout);
    },
    'SUCCESS_SIGNUP' : function (resp) {
        this.clearTimeout('signup');
        $('.error, .info').empty();
        //$('.signup-form').slideUp('fast',function(){$('.results-block-show .info').text(resp)});
        this.timeouts['signup_info'] = setTimeout(function(){$('.results-block-show .info').empty()},this.timeout);
    },
    'ERROR_SIGNUP': function (resp) {
        this.clearTimeout('signup');
        $('.error, .info').empty();
        $('.signup-form .error').html(resp);
        this.timeouts['signup_error'] = setTimeout(function(){$('.signup-form .error').empty()},this.timeout);
        //$('.signup-form .message-block .error').slideDown('fast');
    },
    'SUCCESS_RECOVERY' : function(resp) {
        this.clearTimeout('result');
        $('.error, .info').empty();
        $('#results-bl .info').text(resp);
        this.timeouts['result_info'] = setTimeout(function(){$('#results-bl .info').empty();},this.timeout);
        $('#email-recovery').val('');
        $('#recovery-password').dialog('close');
    },
    'ERROR_RECOVERY' : function(resp) {
        $('.error, .info').empty();
        $('#recovery-password .results-block .error').text(resp);
        $('#recovery-password .results-block').show('slow');
    },
    'LOCK_RECOVERY' : function(resp) {
        this.clearTimeout('result');
        $('.error, .info').empty();
        $('#results-bl .error').text(resp);
        this.timeouts['result_error'] = setTimeout(function(){$('#results-bl .error').empty();},this.timeout);
        $('#email-recovery').val('');
        $('#recovery-password').dialog('close');
    },
    'FORM' : function(resp) {
        modalPopup($('<div/>').html(resp.form),{title: resp.title,  width: (typeof(resp.width) != "undefined" ? resp.width : 'auto'),
            minHeight: (typeof(resp.minHeight) != "undefined" ? resp.minHeight : 'auto'),
            position: $.extend( {my: "center", at: "center", of: window},resp.position)  });
        on_submit();
    },
    'ERROR' : function (resp) {
        this.clearTimeout(resp.block);
        $('#'+resp.block+'s-bl .error, #'+resp.block+'s-bl .info').empty();
        $('#'+resp.block+'s-bl .error').text(resp.msg);
        this.timeouts[resp.block+'_error'] = setTimeout(function(){$('#'+resp.block+'s-bl .error').empty();},this.timeout);
    },
    'USERS_FOUND' : function(resp) {
        for (var key in resp)
            $('<div>').append('<a href="/user/bcard/' + resp[key].value + '" target="_blank"><img src="'+ (resp[key].mini_photo ? ('/user/getminiphoto/' + resp[key].value ) : '/public/images/mini_user.png')  +  '" height="32" width="32"/></a><table><tr><td><a href="/user/bcard/' + resp[key].value + '" target="_blank">' + resp[key].label + '</a></td></tr></table>')
                .appendTo( $('#search-result') ).hide().fadeIn(1500);
    },
    'USERS_NOT_FOUND' : function (resp) {
        if ( !$('#search-result').is('p') && resp.start == 0) {
            $('<p>').text(resp.label).appendTo($('#search-result').html(''));
        }
    },
    'REDIRECT' : function (resp) {
        location = cabinet;
    }

};

function auth_submit() {
    $('#auth-form').submit(function(){
        var pass = $(this).find('#password');
        pass.val(hex_md5(  hex_md5(pass.val()) + $('#challenge').val()) );
        $('#challenge').remove();

    });
}

function on_submit()
{
    $('form').each(function(){
        var _form = $(this);
        _form.unbind().submit(function(){
            if (_form.hasClass('no-ajax')) return true;
            if (!_form.hasClass('ajax')) return true;
            if (BLOCK) return false;
            /*if (typeof(CKEDITOR) != 'undefined') {
             for (instance in CKEDITOR.instances) {
             CKEDITOR.instances[instance].updateElement();
             }
             }*/
            var _data = _form.serialize();
            var _url = _form.attr('action');
            //if (!check_form(_form, 'submit', '')) return false;

            block();
            //$('span.info').html('');
            $('#recovery-password .results-block').hide('fast');
            //$('.results-block').slideUp('fast');
            //$('.results-block-show').removeClass('results-block-show').addClass('results-block');
            $.ajax({
                url: _url,
                type: 'POST',
                data: _data,
                cache: false,
                success: function(resp){
                    unblock();
                    $('#' + $(".dialog-form-wrap").attr('aria-describedby')).dialog('destroy');
                    handlers[resp.status](resp.result);
                },
                error: function(req,status,errorThrown){
                    unblock();
                    alert('Ajax Error! Can\'t find path to file may be. ' + req.status +  ' ' + errorThrown.message);
                }
            });

            return false;
        });
    });

    $('#user-update').unbind().submit(function(e){
        if (BLOCK) return false;
        var form = $(this)[0];
        var pass = $('#pass');
        var repeat_pass = $('#repeat-pass');
        var v_pass = $.trim(pass.val());
        var v_repeat_pass = $.trim(repeat_pass.val());

        if (v_pass != '' && v_pass != '0') {
            if ( v_pass != v_repeat_pass ) {
                handlers['ERROR_UPDATE_USER'](pass_not_eqauls);
                return false;
            }
            if ( v_pass.length < pass_length ) {
                handlers['ERROR_UPDATE_USER'](error_pass_length);
                return false;
            }
            form[7].value = hex_md5(v_pass);
            form[8].value = hex_md5(v_repeat_pass);
        } else if (v_repeat_pass != '' && v_repeat_pass != '0') {
            handlers['ERROR_UPDATE_USER'](pass_not_eqauls);
            return false;
        }


        var _url = $(this).attr('action');
        var fd = new FormData(form);
        $('#pass').val('');
        $('#repeat-pass').val('');
        block();
        $.ajax({
            url: _url,
            type: 'POST',
            data: fd,
            cache: false,
            contentType: false, // ����� - ������� �������������� ������ �� ���������
            processData: false, // ����� - ������� �������������� ����� �� ���������
            success: function(resp){
                unblock();
                handlers[resp.status](resp.result);
            },
            error: function(req,status,errorThrown){
                unblock();
                alert('Ajax Error! Can\'t find path to file may be. ' + req.status +  ' ' + errorThrown.message);
            }
        });

        //e.preventDefault();
        return false;
    });
}

function load_form(elems)
{
    $('table, div.submit-row, .ur-right-part').on('click','input.load-form, button.load-form', function(e)
    {
        if (BLOCK) return false;
        block();
        var _obj = $(this);
        var _url = $(this).attr('value');
        $.get(
            _url,
            function(resp){
                unblock();
                resp.result['title'] = _obj.attr('title');
                handlers[resp.status](resp.result);
            }
        );
        return false;
    });
}

function closeRemove() {
    $( '#' + $(".dialog-form-wrap").attr('aria-describedby')).dialog('destroy');
    return true;
}

function modalPopup (jObj,params,type,msg,show_time) {
    if (show_time === undefined) {
        show_time = 2500;
    }
    if ( type == 'error' ) {
        jObj.html('<div class="popup-error"><p class="error">' + msg + '</p><button type="button" class="button-ok" title="��">��</button></div>');
    } else if ( type == 'info' ) {
        jObj.html('<div class="popup-info"><span class="info">' + msg + '</span><button type="button" class="button-ok" role="button" title="��">��</button></div>');
        var effect = {effect: "fade",duration: 1000};
        params['show'] = effect;
        params['hide'] = effect;
        setTimeout(function(){jObj.dialog('close','widget').dialog('destroy')},show_time);
    }

    jObj.dialog($.extend(
        {autoOpen: true,
            modal: true,
            close:closeRemove(),
            closeOnEscape:true,
            resizable: false,
            dialogClass: 'dialog-form-wrap content-c'},
        params),
        'widget');
    jObj.find('.close, .button-ok').click( function() {
        $('#' + $(".dialog-form-wrap").attr('aria-describedby')).dialog('destroy');
    });
    jObj.find('.close').click(function(){
        $('.remove-dialog, #recovery-password, #signup-form').dialog('close');
        $(this).closest('form').find('.results-block').hide();
        //$(this).closest('form').find('input[type="text"],input[type="email"],input[type="url"]').val('');
    });
}



function remove_item() {
    if ($('.remove-dialog').size())
    {
        modalPopup($('.remove-dialog'),{autoOpen:false,title: '', dialogClass: 'delete-popup-wrap content-c'});

        $('#services-bl table, #windows-bl table').on('click','input.remove',function(e){

            $('.remove-dialog .first-paragraph').empty();
            $('.remove-dialog .question').empty();
            $('#remove').attr('href','');
            var type = 'service';

            var item = $(this).attr('value').substring(1).split('/');
            if ( item[2].split('-')[0] == 'window' ) {
                type = 'window';
            }

            var name = $(this).closest('tr').find('td.name').text();
            $('.delete-popup-wrap .ui-dialog-titlebar .ui-dialog-title').text(titleRemove[type]);
            $('.remove-dialog .first-paragraph').text(textRemove + items[type] + ' \"' + name.trim() + '\". ' + removeNotice);
            $('.remove-dialog .question').text(questionRemove + items[type] + '?');
            $('#remove').attr('href',$(this).attr('value'));
            $('.remove-dialog').dialog('open');

            e.preventDefault();
        });

    }
    $('#remove').click(function() {
        var currentItem = $(this);
        block();
        $.ajax({
            url: currentItem.attr('href'),
            type: 'POST',
            cache: false,
            success: function(resp){
                unblock();
                $('#' + $(".delete-popup-wrap").attr('aria-describedby')).dialog('close');
                resp.result.item = currentItem;
                handlers[resp.status](resp.result);
            },
            error: function(req,status,errorThrown){
                unblock();
                alert('Ajax Error! Can\'t find path to file may be. ' + req.status +  ' ' + errorThrown.message);
            }
        });
        return false;
    });
}

function recovery_password() {
    if ( $('#recovery-password').size() )
    {
        modalPopup($('#recovery-password'),{autoOpen:false, title: password_repair, dialogClass: 'delete-popup-wrap content-c',width: 'auto'});
    }
    $('#a-recovery-password').click(function(e){
        $('#recovery-password').dialog('open');
        e.preventDefault();
    });
}

function signup() {
    if ( $('#signup-form').size() ) {
        modalPopup($('#signup-form'),{autoOpen:false, title: registration, dialogClass: 'delete-popup-wrap content-c',width: 'auto'});
    }
    $('#signup-button').click(function(){
        if ( $('#signup-form').size() ) {
            $('#signup-form').dialog('open');
        } else {
            handlers['ERROR']({block:'result', msg: registrationLock});
            //$('.results-block-show .error').text(registrationLock);

            /*setTimeout(function () {
             $('.results-block-show .error').empty()
             }, 10000);*/
        }
        //e.preventDefault();
    });
}

$(document).ready(function () {

    $("#service-list, .col-1").on('mouseenter', '.service-item', function () {
        $(this).addClass("outline");
    });
    $("#service-list, .col-1").on('mouseleave', '.service-item', function () {
        $(this).removeClass("outline");
    });

    /*$(".slide-button").click(function () {
     var _block = $(this).data("slide");
     if ($(_block).size()) {
     $(_block).slideToggle();
     } else if (_block == '.signup-form') {
     $('.results-block-show .error').text(registrationLock);
     setTimeout(function () {$('.results-block-show .error').empty()}, 10000);
     }
     return false;
     });*/

    var currentFocus;
    var currentValueFocus;
    $('#services-bl table, #windows-bl table ').on('focus', 'input.order-window', function () {
        currentValueFocus = $(this).val();
        currentFocus = $(this);
    });


    var currentChanged;
    var currentChangedValue;
    /*$('#services-bl table, #windows-bl table').on('change','input.order-window',function() {
     currentChanged = $(this);
     currentChangedValue = $(this).val();
     var lessThanChanged = null;
     var delay = 900;
     $('#' + $(this).closest('div').attr('id') + ' input.order-window').each( function(index) {
     var loopValue = $(this).val();
     if ( loopValue == currentChangedValue && $(this).attr('id') != currentChanged.attr('id') ) {
     $(this).val(currentValueFocus);
     var this_tr = $(this).closest('tr').fadeOut(delay-100);
     var changed_tr = currentChanged.closest('tr').fadeOut(delay-100);
     var this_tr_clone = this_tr.clone();
     var changed_tr_clone = changed_tr.clone();
     this_tr_clone.find('a.description').tooltip();
     changed_tr_clone.find('a.description').tooltip();
     setTimeout(function(){this_tr.after(changed_tr_clone.fadeIn(delay));},delay+50);
     setTimeout(function(){changed_tr.after(this_tr_clone.fadeIn(delay));},delay+50);
     setTimeout(function(){this_tr.remove();},2*delay+50);
     setTimeout(function(){changed_tr.remove();},2*delay+50);

     return;
     } else if ( +currentChangedValue > +loopValue ) {
     lessThanChanged = $(this);
     }
     });

     if (lessThanChanged != null && lessThanChanged.attr('id') != currentChanged.attr('id') ) {
     var changed_tr = currentChanged.closest('tr').fadeOut(delay);
     setTimeout(function(){lessThanChanged.closest('tr').after( changed_tr.fadeIn(delay+100));},delay+50);
     } else if (lessThanChanged == null  ) {
     var changed_tr = currentChanged.closest('tr').fadeOut(delay);
     var first = $('#' + $(this).closest('div').attr('id') + ' table tbody tr').first();
     setTimeout(function(){first.before(changed_tr.fadeIn(delay+100));},delay+50);
     }


     });*/

    /*$('#' + div.attr('id') + ' input.order-window').each( function() {
     if ( $(this).val() == currentChangedValue && $(this).attr('id') != currentChanged.attr('id') ) {
     $(this).val(currentValueFocus);
     var delay = 900;
     var this_tr = $(this).closest('tr').fadeOut(delay);
     var changed_tr = currentChanged.closest('tr').fadeOut(delay);
     setTimeout(function(){this_tr.after(changed_tr.clone().fadeIn(delay+100));},delay+50);
     setTimeout(function(){changed_tr.after(this_tr.clone().fadeIn(delay+100));},delay+50);
     setTimeout(function(){this_tr.remove();},2*delay+50);
     setTimeout(function(){changed_tr.remove();},2*delay+50);
     return;
     }
     });*/

    $('.resize').resizable({
        minWidth: $('.content-c').width() - 2,
        maxWidth: $('.content-c').width() - 2,
        handles: "s, se",
        create: function (event, ui) {
            $(event.target).each(function () {
                if ($(this).find('.widget-wrap').hasScrollBar().vertical) {
                    $(this).find('.ui-resizable-se').css('right', '17px');
                }
            });
        },
        stop: function (event, ui) {
            var id_wnd = ui.element.closest('.window').find('.minimize,.expand').attr('id');
            var height = ui.size.height >= ui.element.find('.widget-content').height() ? 0 : ui.size.height;
            //ui.element.css('height','auto');
            $.ajax({
                type: "POST",
                url: '/settings/wndresize',
                data: "jsonData=" + JSON.stringify({id_wnd: id_wnd, wnd_height: height}),
                dataType: "json",
                success: function (msg) {
                    console.log(msg);
                },
                error: function (req, status, errorThrown) {
                    alert('Ajax Error! Can\'t find path to file may be. ' + req.status + ' ' + req.responseText + ' ' + errorThrown.message);
                }
            });

        },
        resize: function (event, ui) {
            ui.element.find('.widget-wrap').css('height', ui.size.height);
            ui.element.css('height', 'auto');
            if (ui.element.find('.widget-wrap').hasScrollBar().vertical) {
                ui.element.find('.ui-resizable-se').css('right', '17px');
            } else {
                ui.element.find('.ui-resizable-se').css('right', '1px');
                ui.element.find('.widget-wrap').css('height', 'auto');
            }
        }

    });

    $('.minimize, .expand').click(function (e) {
        var parent = $(this).parent();
        if (parent.next().is(':hidden')) {
            parent.next().slideDown(300);
            $(this).removeClass('expand');
            $(this).addClass('minimize');
            var window = $(this).closest('.window');
            if (window.find('.widget-wrap').hasScrollBar().vertical) {
                window.find('.ui-resizable-se').css('right', '17px');
            }
        } else {
            parent.next().slideUp(300);

            $(this).removeClass('minimize');
            $(this).addClass('expand');
        }
        $.ajax({
            type: "POST",
            url: '/settings/wndclose',
            data: "jsonData=" + JSON.stringify({
                id_wnd: $(this).attr('id'),
                wnd_close: ( $(this).hasClass('minimize') ? 1 : 0 )
            }),
            dataType: "json",
            success: function (msg) {
                console.log(msg);
            },
            error: function (req, status, errorThrown) {
                alert('Ajax Error! Can\'t find path to file may be. ' + req.status + ' ' + req.responseText + '' + errorThrown.message);
            }
        });
        e.preventDefault();
        return false;
    });


    $('a.description').tooltip();

    signup();
    recovery_password();
    remove_item();
    load_form();
    on_submit();
    auth_submit();
    handlers.timeouts.global_timeout = setTimeout(function () {$('#results-bl .error, #results-bl .info').empty()}, handlers.timeout);

    if (location.pathname == '/settings') {
        var cropperOptions = {
            modal: true,
            loaderHtml: '<div class="loader"><img width="47" height="47" src="/public/images/old/waiting.gif" alt="Waiting"></div>',
            rotateFactor: 90,
            enableMousescroll: true,
            imgEyecandyOpacity: 0.4,
            scaleToFill: true,
            uploadUrl: '/user/uploadPhoto',
            cropUrl: '/user/cropPhoto',
            raiseObjSize: 2,
            onError: function (resp) {
                handlers[resp.status](resp.result);
            },
            onBeforeRemoveCroppedImg: function () {
                $('.remove-dialog .first-paragraph').empty();
                $('.remove-dialog .question').empty();
                $('#remove').attr('href', '');

                $('.delete-popup-wrap .ui-dialog-titlebar .ui-dialog-title').text(titleRemove['photo']);
                $('.remove-dialog .first-paragraph').text(photoTextRemove);
                $('.remove-dialog .question').text(photoQuestionRemove);
                $('#remove').attr('href', '/user/removephoto');
                $('.remove-dialog').dialog('open');
            }

        };
        cropperRectangle = new Croppic('person-photo', cropperOptions);
        $('.ur-right-part').on({
            'mouseenter': function () {
                $('.cropControlsUpload').slideDown('fast');
            },
            'mouseleave': function () {
                $('.cropControlsUpload').slideUp('fast');
            }
        }, '#person-photo');
        $("#phone").mask("+38(999) 999-99-99", {placeholder: "_"});
    };

    $("#birthday").mask("99.99.9999",{placeholder:"��.��.����"});


    $('#search input').keyup(function(){
        if ($(this).val() == '' ) {
            $('#search-result').html('');
        }
    })


    function UriParser (action) {
        var start = 0;
        var count = 16;


        this.parse = function () {
            var param = action.slice(action.indexOf('?')+1).split('&');
            for(var i = 0; i < param.length;i++) {
                var res = param[i].split('=');
                this[res[0].match(/\[(\w+)]/)[1]] = res[1];
            }
        }
        this.getStart = function() {
            return start;
        }
        this.getCount = function() {
            return count;
        }
    }

    function getChar(event) {
        if (event.which == null) { // IE

            if (event.keyCode < 32) return null; // спец. символ
            return event.keyCode;
        }

        if (event.which != 0 ) { // все кроме IE

            switch(event.which) {
                case 8:  /*BACKSPACE*/
                case 46: /*DELETE*/
                case 40: /*DOWN*/
                case 13: /*ENTER*/
                case 32: /*SPACE*/
                    return event.which;
                case 27: /*ESCAPE*/
                case 37: /*LEFT*/
                case 33: /*PAGE_UP*/
                case 34: /*PAGE_DOWN*/
                case 35: /*END*/
                case 36: /*HOME*/
                case 39: /*RIGHT*/
                case 38: /*UP*/
                    return false;
            }
            if ( event.which < 32) return null; // спец. символ
            return event.which; // остальные
        }

        return null; // спец. символ
    }

    if (location.pathname == '/user/search') {
        var start = 0;
        var count = 16;
        var heightSearchResult = $('.content-t').height() + $('.content-c').height();
        if ( heightSearchResult < $(window).height() ) {
            count = Math.round( ($(window).height() - heightSearchResult) / 41 + 2) * 4;
            count = (count > 16 ? count : 16)
        }

        $('#search').submit( function() {
            $('#search input').addClass('ui-autocomplete-loading');
            var _form = $(this);
            //if (BLOCK) return false;
            if (start == 0) {
                $('#search-result').html('');
            }

            //block();
            $.ajax({
                url: '/user/search',
                type: 'POST',
                data: _form.serialize() + '&' + $.param({data: {start : start,count : count}}),
                cache: false,
                success: function (resp) {
                    if (resp.status == 'USERS_FOUND') {
                        result = resp.result;
                        for (var key in result) {
                            $('<div>').append('<a href="/user/bcard/' + result[key].value + '" target="_blank"><img src="' + (result[key].mini_photo ? ('/user/getminiphoto/' + result[key].value ) : '/public/images/mini_user.png') + '" height="32" width="32"/></a><table><tr><td><a href="/user/bcard/' + result[key].value + '" target="_blank">' + result[key].label + '</a></td></tr></table>')
                                .appendTo($('#search-result')).hide().fadeIn(1500);
                        }
                    } else if (resp.status == 'USERS_NOT_FOUND') {
                        if ( !$('#search-result').is('p') ) {
                            $('<p>').text(resp.result.label).appendTo($('#search-result').html(''));
                        }
                    }
                },
                error: function (req, status, errorThrown) {
                    alert('Ajax Error! Can\'t find path to file may be. ' + req.status + ' ' + errorThrown.message);
                },
                complete: function () {
                    //unblock();
                    $('#search input').removeClass('ui-autocomplete-loading');
                }
            });
            return false;
        });


        function searchSubmit () {
            var countInputLetter = 2;
            if ($('#search input').val().length > countInputLetter) {
                $('#search').submit();
            }
        }
        var input = document.forms.search.elements[0];
        /*input.onpropertychange = function () {
         if ('propertyName' in event) {  // Internet Explorer
         submit();
         }
         }*/
        input.onkeyup = function () {
            if (document.all) {
                searchSubmit();
                start = 0;
            }
        }

        $('#search input').bind('input',function (event) {
            //if (event.type == 'input') {
            searchSubmit ();
            start = 0;
            return;
            //}
        });

        var block = false;
        $(window).scroll(function (event) {

            if($(window).height() + $(window).scrollTop() >= $(document).height() /*&& !block*/) {
                block = true;
                start += count;
                searchSubmit();

                /*$(".load").fadeIn(500, function () {
                 page++;
                 $.ajax({
                 url:"index.php",
                 type:"GET",
                 data:"page="+page+"&move=1",
                 success:function(html) {
                 if(html) {
                 $(html).appendTo($("#posts")).hide().fadeIn(1000);
                 $(".pager").text(page);
                 }
                 $(".load").fadeOut(500);
                 block = false;
                 }
                 });
                 });*/
            }
        });

        /*$("#search .text-search").autocomplete({
         minLength: 3,
         source: '/user/search',
         //appendTo : "#search-result",
         response: function (event,ui) {
         $('#search-result').html('');
         /!*if ( $('#search input').val() == '') {

         }*!/
         }

         })*/
        /*.autocomplete( "instance" )._renderItem = function( ul, item ) {
         //$('#search-result').empty();
         if (item.value == 'empty') {
         $('<p>').text(item.label).appendTo( $('#search-result') );
         return ul;
         } else {
         $('<div>').append('<a href="/user/bcard/' + item.value + '" target="_blank"><img src="'+ (item.mini_photo ? ('/user/getminiphoto/' + item.value ) : '/public/images/mini_user.png')  +  '" height="32" width="32"/></a><table><tr><td><a href="/user/bcard/' + item.value + '" target="_blank">' + item.label + '</a></td></tr></table>')
         .appendTo( $('#search-result') );
         //ul.html('');

         }
         return ul;
         // $( "<li>" )
         //     .append( "<div>" + item.label + "<br>" + item.desc + "</div>" )
         //     .appendTo( ul );
         // };
         };*/
    }

});


