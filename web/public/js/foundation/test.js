(function(){

    var BLOCK = false,
        block,unblock,
        handlers, TemplateAjaxAction,
        submitAjaxFormAction, updateUserAjaxAction,
        onFormSubmit, onAuthSubmit, onUserUpdateSubmit,
        initModule;
    
    block = function () {
        BLOCK = true;
        $('#waitingbg').show();
        $('#circularG').show();
    }

    unblock = function () {
        BLOCK = false;
        $('#waitingbg').hide();
        $('#circularG').hide();
    };
    
    handlers = {
        'timeout': 10000,
        'timeouts': {global_timeout: null},
        'clearTimeout': function (block) {
            clearTimeout(this.timeouts.global_timeout);
            if (this.timeouts[block + '_info'] != null) clearTimeout(this.timeouts[block + '_info']);
            if (this.timeouts[block + '_error'] != null) clearTimeout(this.timeouts[block + '_error']);
        },
        'SUCCESS_UPDATE_USER': function (resp) {
            /*modalPopup($('<div/>'),{modal: false, title: 'Інформація'},'info',msg);*/

            $('#user b').empty();
            $('#user b.success').text(resp);
            //clearTimeout(timeout_id);
            var timeout_id = setTimeout(function () {
                                            $('#user b').empty();
                                        },
                                        this.timeout);
            /*if ($('#photo').val())
                $('.ur-right-part .bg-photo, .ur-right-part img').replaceWith('<div class="person-photo"><img id="person-photo" src="/user/getphoto?' + Math.random() * 1000000 + 1 + '" height="128" width="114" alt="' + photo + '"/></div>');
            $('#photo').val('');*/

        },
        'ERROR_UPDATE_USER' : function(resp) {
            $('#user b').empty();
            $('#user b.alert').text(resp);
            setTimeout(
                function(){
                    $('#user b.alert').empty();
                },
                this.timeout);
        },
        'ERROR_MAIL' : function(resp) {
            $('.error, .info').empty();
            $('#send-email .results-block .error').text(resp);
            $('#send-email .results-block').show('slow');
        },
        'ERROR' : function (resp) {
            if (typeof (resp.block) == 'undefined' ) {
                resp.block = 'result';
            }
            this.clearTimeout(resp.block);
            $('#'+resp.block+' b').empty();
            $('#'+resp.block+' b.alert').text(resp.msg);
            this.timeouts[resp.block+'_alert'] =
                setTimeout( function(){
                                $('#'+resp.block+' b.alert').empty();
                            },
                            this.timeout);
        },
        'FORM' : function(resp) {
            modalPopup($('<div/>').html(resp.form),{title: resp.title,  width: (typeof(resp.width) != "undefined" ? resp.width : 'inherit'),
                minHeight: (typeof(resp.minHeight) != "undefined" ? resp.minHeight : 'auto'),
                position: $.extend( {my: "center", at: "center", of: window},resp.position),
                dialogClass : (typeof(resp.dialogClass) != "undefined" ? resp.dialogClass : 'content-c dialog-form-wrap')});
            on_submit();
        },
        'SUCCESS_UPDATE_SRVS_WNDS' : function (resp) {
            $('#'+resp.block+' table tbody').html(resp.table);
            $('#'+resp.block+' table tbody').find('.description').each (function() {
                $(this).tooltip();
            });
            this.clearTimeout(resp.block);
            $('#'+resp.block+' b').empty();
            $('#'+resp.block+' b.success').text(resp.msg);
            this.timeouts[resp.block+'_success'] =
                setTimeout( function() {
                                $('#'+resp.block+' .success').empty();
                            },
                            this.timeout);
        },
        'REDIRECT' : function (resp) {
            location = cabinet;
        }
    };

    TemplateAjaxAction = function(){
        var that = this;
        this.inputData = null;
        this.url =  '/';
        this.type = 'GET';
        this.data = null;
        this.dataType = 'json';
        this.contentType = 'application/x-www-form-urlencoded';
        this.processData = true;
        TemplateAjaxAction.prototype.beforeReq = function (before) {};
        TemplateAjaxAction.prototype.request = function() {
            $.ajax({
                url: that.url,
                type: that.type,
                data: that.data,
                dataType : that.dataType,
                cache: false,
                contentType: that.contentType,
                processData: that.processData,
                success: function(resp){
                    //$('#' + $(".dialog-form-wrap").attr('aria-describedby')).dialog('destroy');
                    handlers[resp.status](resp.result);
                    console.log('success' + that.url);
                },
                error: function(req,status,errorThrown){
                    //unblock();
                    alert('Ajax Error! Can\'t find path to file may be. ' + req.status +  ' ' + errorThrown.message);
                }
            });
        };
        TemplateAjaxAction.prototype.afterReq = function (resp) { unblock(); }
        TemplateAjaxAction.prototype.execute = function(inputData) {
            that.inputData = inputData;
            that.beforeReq();
            that.request();
            that.afterReq();
        };
        return that;
    };

    submitAjaxFormAction = function() {
        var form_ajax_submit = new TemplateAjaxAction();
        form_ajax_submit.beforeReq = function() {
            if (!this.inputData.hasClass('ajax')) return true;
            if (BLOCK) return false;
            this.url = this.inputData.attr('action');
            this.data = this.inputData.serialize();
            this.type = this.inputData.attr('method') || 'GET';
            //$('#recovery-password .results-block').hide('fast');
            block();
        };
        return form_ajax_submit;
    };

    updateUserAjaxAction = function() {
        var user_update_submit = new TemplateAjaxAction();
        user_update_submit.beforeReq = function() {
            if (BLOCK) return false;
            var form = this.inputData[0];
            var pass = this.inputData.find('#pass');
            var repeat_pass = this.inputData.find('#repeat-pass');
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

            this.url = this.inputData.attr('action');
            this.data = this.inputData.serialize();
            this.type = 'POST';
            //this.contentType = false;
            //this.processData = false;
            pass.val('');
            repeat_pass.val('');
            block();
        }

        return user_update_submit;
    };
    

    onFormSubmit = function() {
        $('body').on('submit','form.ajax',function() {
            submitAjaxFormAction().execute($(this));
            return false;
        });
    };

    onUserUpdateSubmit = function() {
        $('#user-update').submit(function(){
            updateUserAjaxAction().execute($(this));
            return false;
        });
    }

    onAuthSubmit = function() {
        $('#auth-form').submit(function(){
            var pass = $(this).find('#password');
            pass.val(hex_md5(  hex_md5(pass.val()) + $('#challenge').val()) );
            $('#challenge').remove();

        });
    };

    initModule = function () {
        onFormSubmit();
        onUserUpdateSubmit();
        onAuthSubmit();

        $('.description').tooltip();
    }

    return {init : initModule};

}()).init();

/*$(function() {
    cabinet.init();
});*/


var modal_popup = function() {
    var html_template =  '<div class="reveal padding-bottom small" data-reveal id="recovery" data-close-on-click>' +
                              '<h5 class="callout cabinet margin-left-top-right small">Помилка' +
                                  '<button class="close-button end" data-close aria-label="Close reveal" type="button">' +
                                      '<span aria-hidden="true">&times;</span>' +
                                  '</button>' +
                              '</h5>' +
                              /*'<div class="small-12 column text-center min-height-info">' +
                                  '<b class="alert"></b>' +
                                  '<b class="primary"></b>' +
                              '</div>' +*/
                              '<form  id="recovery-password" class="small-12 column popup-window ajax " action="#" method="post">' +
                                '<p class="text-justify">' +
                                    'Введіть, будь-ласка, електронну адресу, яку Ви використовуєте в якості логіну до особистого кабінету.'+
                                '</p>' +
                                '<label for="email-recovery">Електронна адреса' +
                                    '<input id="email-recovery" class="margin-none" type="email" name="email" required/>' +
                                '</label>' +
                                '<input class="button submit m-t" type="submit" value="Відновити" title="Відновити"/>' +
                                '<input type="button" class="button close m-t" data-close value="Відмінити" title="Відмінити" />' +
                              '</form>' +
                           '</div>';
}

function on_submit()
{
    $('form').each(function(){
        var _form = $(this);
        _form.unbind().submit(function(){
            if (_form.hasClass('no-ajax')) return true;
            if (!_form.hasClass('ajax')) return true;
            if (BLOCK) return false;
             var _data = _form.serialize();
            var _url = _form.attr('action');
            block();
            $('#recovery-password .results-block').hide('fast');
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
            contentType: false, // важно - убираем форматирование данных по умолчанию
            processData: false, // важно - убираем преобразование строк по умолчанию
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
    $('table, div.submit-row, .ur-right-part, h3').on('click','input.load-form, button.load-form', function(e)
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