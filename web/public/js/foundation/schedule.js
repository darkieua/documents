(function() {

    init();

    function init() {
        var widget = $("#window" + id);
        widget.append('<div class="h-icons">' +
            '<button id="schedule-button" data-open="schedule-popup" tabindex="0">' +
            '<img src="http://asu.sumdu.edu.ua/www/cabinet/images/calendar(5)-24px.png" height="24" width="23" alt="Запит розкладу">' +
            '</button>' +
            '</div>');

    }

    function setSchedule(teacher, group, aud, begin, interval) {
        var dataString = 'teacher='+ teacher + '&group=' + group + '&aud=' + aud + '&begin=' + begin +'&interval=' + interval + '&window_id=' + id;
        $.ajax({
            type: "POST",
            url: "/schedule/getGeneratedSchedule/",
            data: dataString,
            cache: false,
            beforeSend: function() {
                $("#schedule-block").html('<p class="primary text-center margin-bottom-none">Завантаження...</p>');
            },
            success: function(result){
                $("#schedule-block").parent().html(result);
                var parent = $("#schedule-block").closest('.callout.clearfix');
                console.log(parent.find('[data-equalizer]'));
                Foundation.reInit(parent.find('[data-equalizer]'));

            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("Error when loading schedule in AJAX method: " + textStatus);
            }
        });
    }



    $("#schedule-button").on("click", function(e) {
        if ( $(this).attr('data-open')) {
            window.location.hash = "window" + id;
            $('#' + $(this).attr('data-open')).foundation('open');
        }

        $.ajax({
            type: "POST",
            url: "/schedule/getSessionParams/",
            cache: false,
            success: function (result) {
                try {
                    sessionArray = JSON.parse(result);
                    console.log(sessionArray);
                    $("#teacher").attr({ 'data-ajax-id' : sessionArray['teacher'], 'value' : sessionArray['teacherName'] });
                    $("#group").attr({ 'data-ajax-id' : sessionArray['group'], 'value' : sessionArray['groupName'] });
                    $("#aud").attr({ 'data-ajax-id' : sessionArray['aud'], 'value' : sessionArray['audName'] });
                } catch (e) {
                    console.log(e);
                }
            }
        });
        e.stopPropagation();
    });

    $("#settings-submit").on("click", function(event){
        var teacher = undefined != $("#teacher").attr('data-ajax-id') ? $("#teacher").attr('data-ajax-id') : '';
        var group = undefined != $("#group").attr('data-ajax-id') ? $("#group").attr('data-ajax-id') : '';
        var aud = undefined != $("#aud").attr('data-ajax-id') ? $("#aud").attr('data-ajax-id') : '';
        var begin = $("#begin-interval").val() ? $("#begin-interval").val() : '';
        var interval = $("#end-interval").val();
        setSchedule(teacher, group, aud, begin, interval);
        if ( $("#schedule-button").attr('data-open')) {
            $('#' + $("#schedule-button").attr('data-open')).foundation('close');
        }
        event.preventDefault();
    });

    $("#settings-reset").on("click", function(event) {
        $("#begin-interval").datepicker("setDate", new Date());
        $("#teacher, #group, #aud").attr({ 'data-ajax-id' : null, 'value' : null });
        $("#end-interval").val($("#end-interval option:first").val());
    });

    $( "#begin-interval" ).datepicker({
        dateFormat: "dd.mm.yy",
        minDate: new Date()
    }).datepicker("setDate", new Date());

    $( ".autocomplete-input" ).each(function() {
        $(this).autocomplete({
            maxShowItems: 5,
            source: String($(this).attr('data-source')) + '?type=' + $(this).attr('name'),
            minLength: 3,
            appendTo: "#schedule-popup",
            select: function (event, ui) {
                if (ui.item != null) {
                    event.preventDefault();
                    $(this).val(ui.item.label);
                    $(this).attr('data-ajax-id', ui.item.value);
                }
            },
            change: function () {
                if($(this).val().length == 0) {
                    $(this).attr('data-ajax-id', null);
                }
            },
            focus: function (event, ui) {
                event.preventDefault();
                $(this).val(ui.item.label);
            }
        });
    });

    $(".ui-autocomplete").css({
        'max-height': '152px',
        'overflow-y': 'auto',
        'overflow-x': 'hidden'});
    }());

