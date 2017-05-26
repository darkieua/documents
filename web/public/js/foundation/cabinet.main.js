var cabinetModule = (function(){

    var BLOCK = false,
        block,unblock,
        handlers,
        onFormSubmit, onSettingsSubmit, onSignup, onRecoveryPassword,
        onAuthSubmit, onUserUpdateSubmit, onRemoveClick, onLoadHTML,
        searchModule,
        filter_input, changeNumberFrom1,
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

    filter_input = function (e,regexp) {
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

    changeNumberFrom1 = function (current) {
        current.value = current.value.replace(/^(0+)/,"");
    }

    handlers = {
        'timeout': 10000,
        'timeouts': {global_timeout: null},
        'clearTimeout': function (block) {
            clearTimeout(this.timeouts.global_timeout);
            if (this.timeouts[block + '-alert'] != null) clearTimeout(this.timeouts[block + '-alert']);
            if (this.timeouts[block + '-primary'] != null) clearTimeout(this.timeouts[block + '-primary']);
        },
        'SUCCESS_SIGNUP' : function (resp) {
            this.clearTimeout('top');
            $('.primary, .alert').empty();
            $('#signup-popup h5.margin-left-right').removeClass('margin-left-right').addClass('margin-left-bottom-right');
            $('#signup-notify').hide(); // hide block notification
            $('#signup-popup').foundation('close');
            //$('#signup-form').css('display','none');
            $('#signup-popup label input').val('');
            $('#top-notify b.primary').text(resp);
            this.timeouts['top-notify'] = setTimeout(function(){$('#top-notify b.primary').empty();},this.timeout);
        },
        'ERROR_SIGNUP': function (resp) {
            $('.primary, .alert').empty();
            $('#signup-popup h5.margin-left-bottom-right').removeClass('margin-left-bottom-right').addClass('margin-left-right');
            $('#signup-popup b.alert').text(resp);
            $('#signup-notify').fadeIn('slow');
        },
        'SUCCESS_RECOVERY' : function(resp) {
            this.clearTimeout('top');
            $('.alert, .primary').empty();
            $('#recovery-notify').hide(); // hide block notification
            $('#recovery-password h5.callout').removeClass('margin-none');
            $('#recovery-password').foundation('close');
            $('#top-notify .primary').text(resp);
            this.timeouts['top-notify'] = setTimeout(function(){$('#top-notify .primary').empty();},this.timeout);
            $('#email-recovery').val('');
        },
        'ERROR_RECOVERY' : function(resp) {
            $('.alert, .primary').empty();
            $('#recovery-password h5.callout').addClass('margin-none');
            $('#recovery-notify .alert').text(resp);
            $('#recovery-notify').fadeIn('slow');
        },
        'LOCK_RECOVERY' : function(resp) {
            this.clearTimeout('top');
            $('#recovery-notify').hide(); // hide block notification
            $('#recovery-password h5.callout').removeClass('margin-none');
            $('.alert, .primary').empty();
            $('#top-notify .alert').text(resp);
            this.timeouts['top-notify'] = setTimeout(function(){$('#top-notify .alert').empty();},this.timeout);
            $('#email-recovery').val('');
            $('#recovery-password').foundation('close');
        },
        'SUCCESS_UPDATE_USER': function (resp) {
            $('#user-notify b').empty();
            $('#user-notify b.primary').text(resp);
            this.clearTimeout('user');
            this.timeouts['user-primary'] = setTimeout(function () {$('#user-notify b').empty();},this.timeout);
        },
        'ERROR_UPDATE_USER' : function(resp) {
            $('#user-notify b').empty();
            $('#user-notify b.alert').text(resp);
            this.clearTimeout('user');
            this.timeouts['user-alert'] = setTimeout(function(){ $('#user-notfiy b').empty();},this.timeout);
        },
        'SUCCESS_ADD' : function (resp) {
            var $tr = $($.parseHTML(resp.html));
            var cls = $tr.attr('class');
            var $trs = $('#' +cls + 's-settings table tbody tr');
            resp.element.foundation('close');
            if ( $trs.size() ) {
                var number = $trs.size()-1;
                $trs.each(function(index) {
                    if ( $(this).find('input[type=text]').val() == '' ) {
                        number = index;
                        return false;
                    }
                });
                if ( (number == 0 || number != 0) && $trs.eq(number).find('input[type=text]').val() == '' ) {
                    $trs.eq(number).before(resp.html);
                    var added = $trs.eq(number).prev();
                } else {
                    $trs.eq(number).after(resp.html);
                    var added = $trs.eq(number).next();
                }

                added.css('color','#444e8b');
                setTimeout(function(){added.css('color','')},4000);
                added.find('img.description').tooltip();
                $('.' + cls + 's-empty').remove();
            }
        },
        'SUCCESS_UPDATE' : function (resp) {
            resp.element.foundation('close');
            var id = $(resp.html).find('input[id]').attr('id');
            var tr = $('#' + id).closest('tr');
            if ( tr.size() ) {
                tr.replaceWith(resp.html);
                tr = $('#' + id).closest('tr');
                tr.css('color','#444e8b');
                setTimeout( function() { tr.css('color',''); }, 4000 );
                tr.find('a.description').tooltip();
            }
        },
        'SUCCESS_DELETE' : function (resp) {
            var url_split = resp.element.attr('href').replace(/\?(.*)$/g,"").split('/');
            var param = url_split[url_split.length-1].split(':');
            var item = param[0];
            var id = param[1];
            var tr = $('#'+ item + id).closest('tr');
            if ( tr.length > 0 ) {
                tr.remove();
                this.clearTimeout(resp.block);
                $('#' + resp.block + '-notify b').empty();
                $('#' + resp.block + '-notify .primary').text(successRemove[resp.block]);
                this.timeouts[resp.block+'-primary'] = setTimeout(function(){$('#'+resp.block+'-notify .primary').empty()},this.timeout);
            }
            if ( !$('#' +resp.block + '-settings table tbody tr').size() && resp.empty ) {
                $('#' +resp.block + '-settings table tbody').html(resp.empty);
            }
        },
        'SUCCESS_DELETE_PHOTO' : function (resp) {
            cropperRectangle.croppedImg.remove();
            cropperRectangle.croppedImg = {};
            cropperRectangle.cropControlRemoveCroppedImage.hide();
            //maxim add code
            //cropperRectangle.obj.addClass('bg-photo')

            if (typeof (cropperRectangle.options.onAfterRemoveCroppedImg) === typeof(Function)) {
                cropperRectangle.options.onAfterRemoveCroppedImg.call(that);
            }

        },
        'SUCCESS_UPDATE_SRVS_WNDS' : function (resp) {
            $('#'+resp.block+'-settings table tbody').html(resp.table);
            $('#'+resp.block+'-settings table tbody').find('.description').each (function() {
                $(this).tooltip();
            });
            this.clearTimeout(resp.block);
            $('#'+resp.block+'-notify b').empty();
            $('#'+resp.block+'-notify b.primary').text(resp.msg);
            this.timeouts[resp.block+'-primary'] =
                setTimeout( function() {
                                $('#'+resp.block+'-notify .primary').empty();
                            },
                            this.timeout);
        },
        'SUCCESS_UPDATE_SETS_SRV_WND' : function (resp) {
            $('#settings-popup').foundation('close');
            //var type = resp.element.closest('tr').class;
            this.clearTimeout(resp.block);
            $('#'+resp.block+'-notify b').empty();
            $('#'+resp.block+'-notify b.primary').text(resp.msg);
            this.timeouts[resp.block+'-primary'] =
                setTimeout( function() {
                    $('#'+resp.block+'-notify b').empty();
                },
                this.timeout);
        },
        'SUCCESS_MAIL' : function(resp) {
            this.clearTimeout('top');
            $('.alert, .primary').empty();
            this.timeouts['top-notify'] = setTimeout(function(){
                $('#top-notify .primary').empty();
                $('#email-notify').hide();
            },this.timeout);
            
            $('#send-email input[type=text], #send-email textarea').val('');
            $('#send-email').foundation('close');
            //$('#'+ $(".prompt-modal").attr('aria-describedby')).dialog('destroy');
            $('#top-notify .primary').text(resp);
        },
        'ERROR_MAIL' : function(resp) {
            $('.alert, .primary').empty();
            $('#send-email h5.callout').addClass('margin-none');
            $('#email-notify .alert').text(resp.msg);
            $('#email-notify').fadeIn('slow');
        },
        'ERROR' : function (resp) {
            if (typeof (resp.block) == 'undefined' ) {
                resp.block = 'top';
            }
            this.clearTimeout(resp.block);
            $('#'+resp.block+'-notify b').empty();
            $('#'+resp.block+'-notify b.alert').text(resp.msg);
            var $notify = $('#'+resp.block+'-notify');
            $notify.fadeIn('slow');
            if ( $notify.hasClass('d-n') ) {
                $notify.closest('.reveal').find('h5.callout').addClass('margin-none');
            } else {
                this.timeouts[resp.block + '-alert'] =
                    setTimeout(function () {
                        $notify.find('b.alert').empty();
                    }, this.timeout);
            }
        },
        'FORM' : function(resp) {
            var title = resp.element.attr('title');
            var obj = $(resp.form);
            obj.find('h5.callout.cabinet').contents().first()[0].textContent = title;
            obj = obj.appendTo('body');
            var popup = new Foundation.Reveal(obj);
            popup.open();
            /*modalPopup($('<div/>').html(resp.form),{title: resp.title,  width: (typeof(resp.width) != "undefined" ? resp.width : 'inherit'),
             minHeight: (typeof(resp.minHeight) != "undefined" ? resp.minHeight : 'auto'),
             position: $.extend( {my: "center", at: "center", of: window},resp.position),
             dialogClass : (typeof(resp.dialogClass) != "undefined" ? resp.dialogClass : 'content-c dialog-form-wrap')});
             on_submit();*/
        },
        'SUCCESS_BCARD_CANCEL' : function(resp) {
            $('#bcard-cancel').remove();
            this.clearTimeout(resp.block);
            $('#'+resp.block+'-notify .alert, #'+resp.block+'-notify .primary').empty();
            $('#'+resp.block+'-notify .primary').text(resp.msg);
            this.timeouts[resp.block+'_primary'] = setTimeout(function(){$('#'+resp.block+'-notify .primary').empty();},this.timeout);
        },
        'REDIRECT' : function (resp) {
            location = cabinet;
        }
    };

    var AjaxAction = {
        inputData: null,
        url: '/',
        methodHTTP: 'GET',
        data: null,
        dataType: 'json',
        contentType: 'application/x-www-form-urlencoded',
        processData: true,
        beforeReq: function () {
            return true;
        },
        request: function () {
            var that = this;
            $.ajax({
                sourceData : that.inputData,
                beforeSend: that.beforeReq.call(that),
                url: that.url,
                type: that.methodHTTP,
                data: that.data,
                dataType: that.dataType,
                cache: false,
                contentType: that.contentType,
                processData: that.processData,
                success: that.successReq,
                error: function (req, status, errorThrown) {
                    //unblock();
                    alert('Ajax Error! Can\'t find path to file may be. ' + req.status + ' ' + errorThrown.message);
                },
                complete: that.afterReq
            });
        },
        successReq: function (resp) {
            //$('#' + $(".dialog-form-wrap").attr('aria-describedby')).dialog('destroy');
            var $popup = $('.reveal.popup-successed-close');
            if ( $popup.size() > 0 ) {
                $popup.foundation('close');
            }
            resp['result'].element = this.sourceData;
            handlers[resp.status](resp.result);
        },
        afterReq : function () {},

        execute : function (inputData, isBlock) {
            this.inputData = inputData;
            //that.beforeReq();
            if (isBlock == true) {
                if (BLOCK) return false;
                block();
            }
            this.request();
            unblock();
            //this.afterReq();
            return false;
        }
    };

    onSignup = function () {
        $('#signup-button').click(function(){
            var $that = $(this).closest('form');
            if ( $('#signup-popup').size() )  {
                $('#signup-popup').foundation('open');
            } else {
                handlers['ERROR']({block:'top', element: $that, msg: registrationLock});
            }
        });
    }

    onRecoveryPassword = function () {
        $('#a-recovery-password').click(function(e){
            $('#recovery-password').foundation('open');
            e.preventDefault();
        });
    }

    onFormSubmit = function() {
        $('body').on('submit','form.ajax',function() {
            var FormAjaxSubmit = function(){
                this.beforeReq = function() {
                    //if (BLOCK) return false;
                    this.url = this.inputData.attr('action');
                    this.data = this.inputData.serialize();
                    this.methodHTTP = this.inputData.attr('method') || this.methodHTTP;
                    this.contentType = this.inputData.attr('enctype') || this.contentType;
                    //block();
                };
                /*this.afterReq = function (resp) {
                 unblock();
                 $('.reveal').foundation('close');
                 }*/
            };
            FormAjaxSubmit.prototype = AjaxAction;
            return new FormAjaxSubmit().execute($(this),true);
        });
    };

    onSettingsSubmit = function() {
        $('section').on('submit','form.settings',function() {

            var SettingsAjaxSubmit = function(){
                this.beforeReq = function() {
                    //if (BLOCK) return false;
                    this.url = this.inputData.attr('action');
                    this.data = this.inputData.serialize();
                    this.methodHTTP = this.inputData.attr('method') || this.methodHTTP;

                    var $inputs = this.inputData.find('input');
                    var arrayOfData = {};
                    var count = 0;
                    $inputs.each(function() {
                        var $that = $(this);
                        if ( $that.attr('type').toUpperCase() == 'TEXT' && $that.val() != $that.data('current') && $that.prop('checked') != 'false') {
                            arrayOfData[$that.attr('name')] = $that.val();
                            var $checkbox = $that.closest('tr').find('input[type=checkbox]');
                            arrayOfData[$checkbox.attr('name')] = $checkbox.prop('checked');
                            count++;
                        } else if ($that.attr('type').toUpperCase() == 'CHECKBOX' && $that.prop('checked') != $that.data('checked')){
                            arrayOfData[$that.attr('name')] = $that.prop('checked');
                            count++;
                        }
                    });
                    if (count > 0) {
                        var $hidden = this.inputData.find('input[name=csrf_token]');
                        arrayOfData[$hidden.attr('name')] = $hidden.val();
                    }
                    this.data = $.param(arrayOfData);
                    //block();
                };
            };
            SettingsAjaxSubmit.prototype = AjaxAction;
            return new SettingsAjaxSubmit().execute($(this),true);
        });
    };


    onUserUpdateSubmit = function() {
        $('#user-update').submit(function(){
            var UserUpdate = function() {
                this.beforeReq = function () {
                    //if (BLOCK) return false;
                    var form = this.inputData[0];
                    var pass = this.inputData.find('#pass');
                    var repeat_pass = this.inputData.find('#repeat-pass');
                    var v_pass = $.trim(pass.val());
                    var v_repeat_pass = $.trim(repeat_pass.val());

                    if (v_pass != '' && v_pass != '0') {
                        if (v_pass != v_repeat_pass) {
                            handlers['ERROR_UPDATE_USER'](pass_not_eqauls);
                            return false;
                        }
                        if (v_pass.length < pass_length) {
                            handlers['ERROR_UPDATE_USER'](error_pass_length);
                            return false;
                        }
                        form[6].value = hex_md5(v_pass);
                        form[7].value = hex_md5(v_repeat_pass);
                    } else if (v_repeat_pass != '' && v_repeat_pass != '0') {
                        handlers['ERROR_UPDATE_USER'](pass_not_eqauls);
                        return false;
                    }

                    this.url = this.inputData.attr('action');
                    this.data = this.inputData.serialize();
                    this.type = 'POST';
                    pass.val('');
                    repeat_pass.val('');
                    //block();
                }
            }
            UserUpdate.prototype = AjaxAction;
            return new UserUpdate().execute($(this),true);
        });
    }

    onLoadHTML = function () {
        $('form, .h-icons').on('click','input.load-form, button.load-form', function(e) {
            //$('#'+$(this).attr('data-open')).foundation('reveal', 'open', $(this).attr('value'));
            var LoadForm = function () {
                this.beforeReq = function() {
                    //if (BLOCK) return false;
                    this.url = this.inputData.attr('value');
                    //block();
                };
            };
            LoadForm.prototype = AjaxAction;
            return new LoadForm().execute($(this),true);
        });
    }

    onRemoveClick = function () {
        if ($('.remove-dialog').size())
        {
            $('#services-settings form div.table-scroll, #windows-settings form div.table-scroll').on('click','.remove',function(e){

                $('.remove-dialog .first-paragraph').empty();
                $('.remove-dialog .question').empty();
                $('#remove').attr('href','');
                var type = 'service';

                var item = $(this).attr('value').substring(1).split('/');
                if ( item[2].split(':')[0] == 'window' ) {
                    type = 'window';
                }

                var name = $(this).closest('tr').find('td.name').text();
                $('.remove-dialog h5.callout.cabinet').contents().first()[0].textContent = titleRemove[type];
                $('.remove-dialog .first-paragraph').text(textRemove + items[type] + ' \"' + name.trim() + '\". ' + removeNotice);
                $('.remove-dialog .question').text(questionRemove + items[type] + '?');
                $('#remove').attr('href',$(this).attr('value'));
                
                $('.remove-dialog').foundation('open');

                e.preventDefault();
                return false
            });

        }
        $('#remove').click(function() {
            var Remove  = function () {
                this.beforeReq = function () {
                    //block();
                    this.url = this.inputData.attr('href');
                    this.methodHTTP = 'DELETE';
                }
            }
            Remove.prototype = AjaxAction;
            return new Remove().execute($(this),true);
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

    searchModule = function () {
        var countInputLetter = 2,
            start = 0, count = 16, totalCount = 0, returnedTotalCount = 0,
            heightSearchResult = $('#page').height(),
            idLoaderTimeout, lockSearchRequest = false;

        var jqueryMap = {
            $formSearch : $('#search'),
            $inputSearch : $('#search input'),
            $resultSearch : $('#wrap-result-search'),
            $userAbsent : $('#user-absent-notify'),
            $loader : $('#circleG')
        };

        jqueryMap.$inputSearch.focus();


        jqueryMap.$formSearch.submit(function (e) {
            var SearchPerson = function() {
                this.beforeReq = function() {
                    if (heightSearchResult < $(window).height()) {
                        count = Math.round(($(window).height() - heightSearchResult) / 41 + 2) * 4;
                        count = (count > 16 ? count : 16)
                    }
                    idLoaderTimeout = setTimeout(
                        function(){
                            jqueryMap.$loader.show('fast');
                        },100);

                    this.url = this.inputData.attr('action');
                    this.data = this.inputData.serialize() + '&' + $.param({data: {start: start, count: count}});
                };

                this.successReq = function(resp) {
                    clearTimeout(idLoaderTimeout);
                    jqueryMap.$loader.hide(0);
                    if (resp.status == 'USERS_FOUND') {
                        if (start == 0) {
                            returnedTotalCount = resp.result.totalCount;
                            jqueryMap.$resultSearch.html('');
                            jqueryMap.$userAbsent.hide(0);
                        }

                        var result = resp.result.users;
                        for (var key in result) {
                            totalCount++;
                            $('<div class="column media-object d-n">').append('<a class="media-object-section" href="/person/card/' + result[key].value + '" ><img src="' + (result[key].mini_photo ? ('/user/getminiphoto/' + result[key].value ) : '/public/images/mini_user.png') + '" height="32" width="32"/></a><a class="media-object-section" href="/person/card/' + result[key].value + '"><small>' + result[key].label + '</small></a>')
                                .appendTo(jqueryMap.$resultSearch).slideToggle(300);
                        }
                    } else if (resp.status == 'USERS_NOT_FOUND' && start == 0) {
                        jqueryMap.$resultSearch.empty();
                        jqueryMap.$userAbsent.find('b').text(resp.result.label);
                        jqueryMap.$userAbsent.slideDown("slow");

                    }
                };
                this.afterReq = function() {
                    setTimeout(function () {lockSearchRequest = false;}, 200);
                };
            };
            SearchPerson.prototype = AjaxAction;
            return new SearchPerson().execute($(this));


            return false;
        });

        var idSearchTimeout = null;


        //function for getting symbol
        function getCharPress(event) {
            if (event.which == null) { // IE
                if (event.keyCode < 32) return null; // спец. символ
                return String.fromCharCode(event.keyCode)
            }

            if (event.which != 0 && event.charCode != 0) { // все кроме IE
                if (event.which < 32) return null; // спец. символ
                return String.fromCharCode(event.which); // остальные
            }
            return null; // спец. символ
        }

        function searchSubmit(event) {

            var e = event ? event : window.event;
            var key = event.keyCode || event.which;


            if (e.type == "keypress" && !getCharPress(e)) {
                if (key == 13) return false;
                return;
            } else if (e.type == 'keyup') {
                if (key != 13 && key != 40 && key != 8 && key != 46) return false;
            }
            start = 0;

            var searchRequest = jqueryMap.$inputSearch.val();
            if (searchRequest.replace(/\*!/g, "").length <= countInputLetter) {
                if (idSearchTimeout) {
                    clearTimeout(idSearchTimeout);
                }
                jqueryMap.$resultSearch.empty();
                jqueryMap.$userAbsent.hide(0);
                return;
            }
            if (idSearchTimeout) {
                clearTimeout(idSearchTimeout);
            }
            idSearchTimeout = setTimeout(function () {
                jqueryMap.$formSearch.submit();
            }, 500);
        }

        jqueryMap.$inputSearch.bind({
            'input': searchSubmit,
            'keypress': searchSubmit,
            'keyup': searchSubmit
        });


        $(window).scroll(function (event) {
            if ($(window).height() + $(window).scrollTop() >= $(document).height() - 75 && !lockSearchRequest) {
                lockSearchRequest = true;
                if (( start > 0 && returnedTotalCount - start <= count ) || jqueryMap.$inputSearch.val().length <= countInputLetter) {
                    clearTimeout(idSearchTimeout);
                    return;
                }
                start += count;
                if ( start > 0 && returnedTotalCount - start > 0 )
                    jqueryMap.$formSearch.submit();
            }
        });
    }

    initModule = function () {
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

        onFormSubmit();
        onSettingsSubmit();
        onSignup();
        onRecoveryPassword();
        onUserUpdateSubmit();
        onAuthSubmit();
        onLoadHTML();
        onRemoveClick();

        handlers.timeouts.global_timeout = setTimeout(function(){ $('#top-notify .alert, #top-notify .primary').empty()},handlers.timeout);

        $('.min, .max').click( function(e) {
            var that  = $(this);
            var parent = $(this).closest('.callout.clearfix');
            var widget = parent.find('.wrap');
            if ( widget.is(':hidden')) {
                widget.slideDown(300);
                that.removeClass('max').addClass('min');
                Foundation.reInit(parent.find('[data-equalizer]'));
           } else {
                widget.slideUp(300);
                that.removeClass('min').addClass('max');
                /*setTimeout(function() {
                                parent.find('.minimize').removeClass('minimize').addClass('expand');
                           },300);*/
            }
            var sendWindowState = function () {
                this.beforeReq = function() {
                    this.methodHTTP = "POST";
                    this.url = '/settings/wndclose';
                    this.data = "jsonData=" + JSON.stringify({
                        id_wnd : parent.find('h5').attr('id').substr(6),
                        wnd_close : ( that.hasClass('min')  ? 1 : 0 )
                    });
                }
                this.successReq = function(msg){ return true; };
            };
            e.preventDefault();
            sendWindowState.prototype = AjaxAction;
            return new sendWindowState().execute(parent);
        });

        var fontSize = $('html').css('font-size').replace('px','');
        function refreshBlocksHeight() {
            $('.widget-wrap').each(function () {
                if ( !$(this).hasScrollBar().vertical ) {
                    $(this).css("height", "auto");
                }
            });
        }
        var timer = false;

        $(window).resize(function () {
            if(timer !== false)
                clearTimeout(timer);
            timer = setTimeout(refreshBlocksHeight, 200);
        });

        $('.resize').resizable({
            minWidth: 75*fontSize - 2*fontSize,
            maxWidth: 75*fontSize - 2*fontSize,
            handles: "s",
            create: function(event,ui) {
                $(event.target).each(function() {
                    if( $(this).find('.widget-wrap').hasScrollBar().vertical) {
                        $(this).find('.ui-resizable-s').css('margin-left','-16px');
                    }
                });
            },
            stop: function (event,ui) {

                //var id_wnd = ui.element.closest('.window').find('.minimize,.expand').attr('id');
                //var height = ui.size.height >= ui.element.find('.widget-content').height() ? 0 : ui.size.height;
                //ui.element.css('height','auto');
                //ui.element.css('width','auto');
                var SendWindowHeight = function () {
                    this.beforeReq = function () {
                        this.methodHTTP = "POST";
                        this.url = '/settings/wndresize';
                        this.data = "jsonData=" + JSON.stringify({
                                id_wnd: ui.element.closest('.callout.clearfix').find('h5').attr('id').substr(6),
                                wnd_height: ui.size.height >= ui.element.find('.widget-content').height() ? 0 : ui.size.height
                            });
                    }
                    this.successReq = function (msg) {
                        return true;
                    };
                };
                SendWindowHeight.prototype = AjaxAction;
                new SendWindowHeight().execute(ui.element);
                /* $.ajax({
                 type: "POST",
                 url: '/settings/wndresize',
                 data: "jsonData=" + JSON.stringify({id_wnd : id_wnd, wnd_height : height}),
                 dataType : "json",
                 success : function(msg){
                 console.log(msg);
                 },
                 error: function(req,status,errorThrown){
                 alert('Ajax Error! Can\'t find path to file may be. ' + req.status +  ' ' + req.responseText + ' ' + errorThrown.message);
                 }
                 });*/

            },
            resize: function(event,ui) {
                ui.element.find('.widget-wrap').css('height',ui.size.height);
                ui.element.css('height','auto');
                //ui.element.css('width','auto');
                if (ui.element.find('.widget-wrap').hasScrollBar().vertical) {
                    ui.element.find('.ui-resizable-s .ui-icon-grip-solid-horizontal').css('margin-left','-16px');
                } else {
                    ui.element.find('.ui-resizable-s .ui-icon-grip-solid-horizontal').css('margin-left','-8px');
                    ui.element.find('.widget-wrap').css('height','auto');
                }
                event.stopPropagation();
            }

        });

        if (location.pathname == '/settings' ) {
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
                onBeforeRemoveCroppedImg : function () {
                    $('.remove-dialog .first-paragraph').empty();
                    $('.remove-dialog .question').empty();
                    $('#remove').attr('href','');

                    $('.remove-dialog h5.callout.cabinet').contents().first()[0].textContent = titleRemove['photo'];
                    $('.remove-dialog .first-paragraph').text(photoTextRemove);
                    $('.remove-dialog .question').text(photoQuestionRemove);
                    $('#remove').attr('href','/user/removephoto');
                    $('.remove-dialog').foundation('open');
                }

            };
            cropperRectangle = new Croppic('person-photo', cropperOptions);
            $('#avatar').on({
                'mouseenter': function () {
                    $('.cropControlsUpload').slideDown('fast');
                },
                'mouseleave': function () {
                    $('.cropControlsUpload').slideUp('fast');
                }
            }, '#person-photo');

            $("#phone").mask("+38 (999) 999-99-99",{placeholder:"_"});
        }

        if (location.pathname == '/person/search') {
            searchModule();
        }

        $('#bcard-cancel').click(function() {
            var currentItem = $(this);
            block();
            $.ajax({
                url: currentItem.attr('value'),
                type: 'POST',
                cache: false,
                success: function(resp){
                    unblock();
                    handlers[resp.status](resp.result);
                    //currentItem.remove();
                    /*$('#' + $(".delete-popup-wrap").attr('aria-describedby')).dialog('close');
                     resp.result.item = currentItem;
                     handlers[resp.status](resp.result);*/
                },
                error: function(req,status,errorThrown){
                    unblock();
                    alert('Ajax Error! Can\'t find path to file may be. ' + req.status +  ' ' + errorThrown.message);
                }
            });
            return false;
        });


        $("#birthday").mask("99.99.9999",{placeholder:datePlaceholer});
        $('.description').tooltip();
        $('body').on('closed.zf.reveal', '.popup-closed-remove',
            function() {
                $(this).parent().remove();
        });
        $('body').on('closed.zf.reveal', '.reveal', function() {

        });

        $('body').on('change.zf.tabs', '.widget-wrap', function() {
            var $temp = $(this).closest('.widget-wrap').find('[data-equalizer]');
            Foundation.reInit( $temp );
            //$(this).parent().remove();
        });

        return {
            filter_input : filter_input,
            changeNumberFrom1 : changeNumberFrom1
        };
    }



    return {init : initModule};

}()).init();





