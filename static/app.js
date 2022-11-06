(() => {

    var student_page = $('.student-page');
    var ins_page = $('.ins-page');
    var form_book = $('.form-book');
    var form_cs = $('.form-cs');
    var alert = $('.added-alert');
    var info = $('.info');
    var app_div = $('.appointment');
    var accept = $('.accept');
    var errors = [];
    var app = {};

    var baseurl ='http://localhost:5000'

    app.month_map = {
        0: 'January', 1: 'February', 2: 'March', 3: 'April',
        4: 'May', 5: 'June', 6: 'July', 7: 'August',
        8: 'September', 9: 'October', 10: 'November', 11: 'December'
    }
    app.sh_month_map = {
        0: 'Jan', 1: 'Feb', 2: 'Mar', 3: 'Apr',
        4: 'May', 5: 'Jun', 6: 'Jul', 7: 'Aug',
        8: 'Sep', 9: 'Oct', 10: 'Nov', 11: 'Dec'
    }
    app.day_map = {
        'Sat': 'Saturday', 'Sun': 'Sunday', 'Mon': 'Monday', 'Tue': 'Tuesday',
        'Wed': 'Wednesday', 'Thu': 'Thursday', 'Fri': 'Friday'
    }
    app.weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

    app.get = (url, data, data_type = 'json') => {
        return $.ajax({
            cache: false,
            url: url,
            dataType: data_type,
            contentType: 'application/json',
            type: 'get',
            data: JSON.stringify(data)
        });
    }

    app.post = (url, data, data_type = 'json') => {
        return $.ajax({
            cache: false,
            url: url,
            dataType: data_type,
            contentType: 'application/json',
            type: 'post',
            data: JSON.stringify(data)
        });
    }

    app.get_uid = () => {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }

    app.show_alert = (alert_cont, success, message) => {
        alert_cont.find('.alert').removeClass('alert-success');
        alert_cont.find('.alert').removeClass('alert-danger');
        if (success) {
            alert_cont.find('.alert').addClass('alert-success');
        } else {
            alert_cont.find('.alert').addClass('alert-danger');
        }
        alert_cont.find('.alert').html(message);
        alert_cont.show();
    }

    app.get_data_object = (data) => {
        let data_object = {};
        data.forEach(function (item) {
            data_object[item.name] = item.value.trim();
        });
        return data_object;
    }

    app.convert_to_am_pm = (time) => {
        time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

        if (time.length > 1) {
            time = time.slice (1);
            time[5] = +time[0] < 12 ? ' AM' : ' PM';
            time[0] = +time[0] % 12 || 12;
        }
        return time.join ('');
    }

    app.format_date_time = (t) => {
        // Oct 10 2022 1:33PM
        let tarr = t.split('T')
        let dtarr = tarr[0].split('-')
        let yr = parseInt(dtarr[0])
        let mn = parseInt(dtarr[1])
        let mn_name = app.sh_month_map[mn-1]
        let dt = parseInt(dtarr[2])

        let aptime = app.convert_to_am_pm(tarr[1])
        let ap = aptime.split(' ')[1]
        let hr = aptime.split(' ')[0].split(':')[0]
        let mi = aptime.split(' ')[0].split(':')[1]

        let custom_frmt = mn_name+' '+dt+' '+yr+' '+hr+':'+mi+''+ap
        return custom_frmt
    }

    app.validate_student_form = (data) => {
        let valid = true;
        errors = [];

        Object.keys(data).forEach(function (key) {
            let element = student_page.find("[name='" + key + "']");
            element.css('border', '1px solid #00C851');
            element.parent().find('.err').hide();
            if (key == 'fname' && data[key] == '') {
                element.css('border', '1px solid red');
                element.parent().find('.err').show();
                errors.push('Enter first name');
                valid = false;
            }
            if (key == 'lname' && data[key] == '') {
                element.css('border', '1px solid red');
                element.parent().find('.err').show();
                errors.push('Enter last name');
                valid = false;
            }
            if (key == 'email' && data[key] == '') {
                element.css('border', '1px solid red');
                element.parent().find('.err').show();
                errors.push('Enter a valid email address');
                valid = false;
            }
            if (key == 'phone' && data[key] == '') {
                element.css('border', '1px solid red');
                element.parent().find('.err').show();
                errors.push('Enter a valid phone number');
                valid = false;
            }
            if (key == 'address' && data[key] == '') {
                element.css('border', '1px solid red');
                element.parent().find('.err').show();
                errors.push('Enter your address');
                valid = false;
            }
            if (key == 'time' && data[key] == '') {
                element.css('border', '1px solid red');
                element.parent().find('.err').show();
                errors.push('Enter appointment date time');
                valid = false;
            }
        });
        
        let ack = accept.is(':checked');
        if (!ack) {
            errors.push('Accept terms and conditions');
        }

        return valid;
    }

    app.validate_schedule_form = (data) => {
        let valid = true;
        errors = [];

        Object.keys(data).forEach(function (key) {
            let element = ins_page.find("[name='" + key + "']");
            element.css('border', '1px solid #00C851');
            element.parent().find('.err').hide();
            if (key == 'title' && data[key] == '') {
                element.css('border', '1px solid red');
                element.parent().find('.err').show();
                errors.push('Enter Title');
                valid = false;
            }
            if (key == 'ftime' && data[key] == '') {
                element.css('border', '1px solid red');
                element.parent().find('.err').show();
                errors.push('Enter Date Time- From');
                valid = false;
            }
            if (key == 'ttime' && data[key] == '') {
                element.css('border', '1px solid red');
                element.parent().find('.err').show();
                errors.push('Enter Date Time- To');
                valid = false;
            }
        });

        return valid;
    }

    app.validate_login_form = (data) => {
        let valid = true;
        errors = [];

        Object.keys(data).forEach(function (key) {
            let element = ins_page.find("[name='" + key + "']");
            element.css('border', '1px solid #00C851');
            element.parent().find('.err').hide();
            if (key == 'username' && data[key] == '') {
                element.css('border', '1px solid red');
                element.parent().find('.err').show();
                errors.push('Enter Username');
                valid = false;
            }
            if (key == 'password' && data[key] == '') {
                element.css('border', '1px solid red');
                element.parent().find('.err').show();
                errors.push('Enter Password');
                valid = false;
            }
        });

        return valid;
    }

    app.to_date = (ds) => {
        const [year, month, day] = ds.split("-");
        return new Date(year, month - 1, day);
    }

    app.get_date_str = (data) => {
        let date = data['sdate'];
        date = app.to_date(date);
        let month = app.month_map[date.getMonth()];
        let day_count = date.getDate();
        day_count = ('0' + day_count).slice(-2);
        let day = app.weekday[date.getDay()];
        let ds = month + ' ' + day_count + ' (' + day + ')';
        console.log(ds)
        return ds // August 05 (Friday)
    }

    app.show_schedules = (data) => {
        let ds = app.get_date_str(data);
        console.log(ds)
    }

    app.populate_times = () => {

        let select = student_page.find("[name='time']");
        let request = app.get('/list_schedules', {});

        request.done(function (response, textStatus, jqXHR){

            let data_obj_list = response.data;
            let options = [];

            data_obj_list.forEach(function(obj) {
                options.push(obj.schedule);
            });

            select.find('option').remove();
            select.append(
                $('<option selected=""></option>').val('').html('Select an appointment date-time')
            );

            $.each(options, function(i, text) {
                select.append(
                    $('<option></option>').val(text).html(text)
                );
            });

        });

    }

    // appointment block
    app.load_appointment_list_table = () => {

        let tbody = $('.my-appointment-tbody');
        tbody.html('');

        let request = app.get('/list_appointments', {});

        request.done(function (response, textStatus, jqXHR){

            let appointment_list = response.data;

            appointment_list.forEach(function(obj) {

                let name = obj.fname + ' ' + obj.lname;
                let objstr = JSON.stringify(obj);

                let tr = `
                    <tr class="appttr" data-id=`+ obj.id +`>
                        <td>` + name + `</td>
                        <td>` + obj.email + `</td>
                        <td>` + obj.phone + `</td>
                        <td>` + obj.address + `</td>
                        <td>` + obj.app_date + `</td>
                        <td><a class="delete-appointment" data-id=`+ obj.id +` href="#">Delete</a> • <a class="update-appointment" data-objstr=\`+objstr+\` data-id=\`+ obj.id +\` href="#">Update</a></td>
                        
                    </tr>
                `
    
                tbody.append(tr);
                
            });
    
            $('.delete-appointment').unbind().bind('click', function() {
    
                if (confirm('Confirm Delete?')) {
                    let id = $(this).data('id');
                    // app.schedule_list = app.schedule_list.filter(x=>x.id !=id);

                    // app.load_scheload_appointment_list_tabledule_list_table();
                    let request = app.post('/delete_booking/'+id, {});
                        request.done(function (response, textStatus, jqXHR){
                            app.load_appointment_list_table();
                        })
                    
                }
            });

            $('.update-appointment').unbind().bind('click', function() {
    
                // update 
            });
            
        });

        request.fail(function (jqXHR, textStatus, errorThrown){
            // Log the error to the console
            console.error(
                "The following error occurred: "+
                textStatus, errorThrown
            );
        });
        
    }

    app.save_student_booking = (data) => {

        // ['Oct', '23,', '2022', '05:14PM', '-', '07:14PM']
        let dt = data.time;
        let arr = dt.split(' ');

        let month = arr[0];
        let day = arr[1].split(',')[0];
        let yr = arr[2];
        let ftime = arr[3];
        let ttime = arr[5];

        let dt_from = month + ' ' + day + ' ' + yr + ' ' + ftime;
        let dt_to = month + ' ' + day + ' ' + yr + ' ' + ttime;

        let param = {
            'fname': data.fname,
            'lname': data.lname,
            'email': data.email,
            'phone': data.phone,
            'address': data.address,

            'app_date_time_from': dt_from,
            'app_date_time_to': dt_to,

            'create_date': data.create_date
        }

        let request = app.post('/book_appointment', param);

        request.done(function (response, textStatus, jqXHR){

            info.show();
            app_div.hide();
            alert.hide();
            
        });

        request.fail(function (jqXHR, textStatus, errorThrown){
            // Log the error to the console
            console.error(
                "The following error occurred: "+
                textStatus, errorThrown
            );
        });
    }

    $('.btn-book').click(function (e) {
        let data = form_book.serializeArray();
        data = app.get_data_object(data);
        let ack = accept.is(':checked');

        if (!ack) {
            accept.parent().find('.err').show();
        } else {
            accept.parent().find('.err').hide();
        }
        
        if (app.validate_student_form(data) && ack) {
            data['create_date'] = '' + new Date();
            console.log(data)

            app.save_student_booking(data);

        } else {

            let err_txt = '<span>Please fix the following errors and try again:</span>';
            err_txt += '<ul>';
            errors.forEach(function(err) {
                err_txt += '<li>' + err + '</li>';
            });
            err_txt += '</ul>';
            app.show_alert(alert, false, err_txt);

            window.scrollTo(0, 0);

        }
    });

    $('.terms-conds').click(function() {

        window.open('http://stackoverflow.com/', '_blank');
    });

    // schedule block
    app.load_schedule_list_table = () => {

        let tbody = $('.ins-schedule-tbody');
        tbody.html('');

        let param = {}
        let request = app.get('/list_schedules', param);

        request.done(function (response, textStatus, jqXHR){

            app.schedule_list = response.data;

            app.schedule_list.forEach(function(s) {

                let tr = `
                    <tr class="sttr" data-id=`+ s.id +`>
                        <td>` + s.title + `</td>
                        <td>` + s.schedule + `</td>
                        <td><a class="delete-schedule" data-id=`+ s.id +` href="#">Delete</a></td>
                    </tr>
                `
    
                tbody.append(tr);
                
            });
    
            $('.delete-schedule').unbind().bind('click', function() {
    
                if (confirm('Confirm Delete?')) {
                    let id = $(this).data('id');
                    // app.schedule_list = app.schedule_list.filter(x=>x.id !=id);
                    // app.load_schedule_list_table();
                    let request = app.post('/schedule_delete/'+id, {});
                        request.done(function (response, textStatus, jqXHR){
                            app.load_schedule_list_table();
                        })
                    
                }
            });
            
        });

        request.fail(function (jqXHR, textStatus, errorThrown){
            // Log the error to the console
            console.error(
                "The following error occurred: "+
                textStatus, errorThrown
            );
        });
        
    }

    app.save_schedule = (data) => {

        let param = {
            //'create_date': data.create_date,
            'ftime': app.format_date_time(data.ftime),
            'ttime': app.format_date_time(data.ttime),
            'title': data.title
        }

        let request = app.post('/add_schedule', param);

        request.done(function (response, textStatus, jqXHR){

            let ok = response.ok;

            if (ok) {

                app.show_alert(alert, true, 'Schedule is created successfully!');

                app.load_schedule_list_table();
            }

        });

        request.fail(function (jqXHR, textStatus, errorThrown){
            // Log the error to the console
            console.error(
                "The following error occurred: "+
                textStatus, errorThrown
            );
        });
    }

    $('.btn-create-schedule').click(function() {
        let data = form_cs.serializeArray();
        data = app.get_data_object(data);

        if (app.validate_schedule_form(data)) {
            // data['id'] = app.get_uid();
            data['create_date'] = '' + new Date();
            console.log(data)
            
            app.save_schedule(data);
            
        } else {

            let err_txt = '<span>Please fix the following errors and try again:</span>';
            err_txt += '<ul>';
            errors.forEach(function(err) {
                err_txt += '<li>' + err + '</li>';
            });
            err_txt += '</ul>';
            app.show_alert(alert, false, err_txt);
        }
    });

    // login/logout block
    // $('.ins-login').click(function() {


    // });

    $('#login-button').click(function() {

        let data = $('.form-login').serializeArray();
        data = app.get_data_object(data);

        if (app.validate_login_form(data)) {
            console.log(data)
            
            let request = app.post('/login', data);

            request.done(function (response, textStatus, jqXHR){

                let ok = response.ok;

                if (ok) {

                    let baseurl = 'http://localhost:5000'
                    window.location.href = 'http://localhost:5000/my_appointments' // baseurl + '/my_appointments';
                }
                else {

                    $('#idloginuser').css('border', '1px solid red');
                    $('#idloginpass').css('border', '1px solid red');

                    app.show_alert(alert, false, 'Invalid username or password!');
                }

            });

            request.fail(function (jqXHR, textStatus, errorThrown){
                // Log the error to the console
                $('#idloginuser').css('border', '1px solid red');
                $('#idloginpass').css('border', '1px solid red');
                console.error(
                    "The following error occurred: "+
                    textStatus, errorThrown
                );
            });
            
        } else {

            let err_txt = '<span>Please fix the following errors and try again:</span>';
            err_txt += '<ul>';
            errors.forEach(function(err) {
                err_txt += '<li>' + err + '</li>';
            });
            err_txt += '</ul>';
            app.show_alert(alert, false, err_txt);
        }

    });

    // rating block
    $('.rate-with-five-stars').find('input[type=radio]').click(function() {

        app.star = $(this).val();
        console.log(app.star)
    });

    $('.btn-send-ratings').click(function() {

        let rating = {
            'username': $('#id_rate_username').val().trim(),
            'star': typeof app.star == 'undefined' ? 0 : parseInt(app.star),
            'comments': $('#id_comment').val().trim()
        }

        let is_valid = true;

        $('#id_rate_username').css('border', '1px solid #00C851');
        $('#id_comment').css('border', '1px solid #00C851');
        $('#id_rate_lbl').css('color', '#00C851');

        if (rating.username == '') {
            is_valid = false;
            $('#id_rate_username').css('border', '1px solid red');
        }

        if (rating.star <= 0) {
            is_valid = false;
            $('#id_rate_lbl').css('color', 'red');
        }

        if (rating.comment == '') {
            is_valid = false;
            $('#id_comment').css('border', '1px solid red');
        }

        if (is_valid) {

            let request = app.post('/add_rating', rating);

            request.done(function (response, textStatus, jqXHR){

                let ok = response.ok;

                if (ok) {

                    $('.secsion-hdr').text('Thank you for your feedback!')

                    $('#id_rate_username').val('');
                    $('#id_comment').val('');
                    $('.rate-with-five-stars').find('input[type=radio]').prop('checked', false);
                    rating.star = 0;
                }
                else {

                }

            });

            request.fail(function (jqXHR, textStatus, errorThrown){
                // Log the error to the console
                $('#id_rate_username').css('border', '1px solid red');
                $('#id_rate_lbl').css('border', '1px solid red');
                $('#id_comment').css('border', '1px solid red');
                console.error(
                    "The following error occurred: "+
                    textStatus, errorThrown
                );
            });

        }
    });

    app.list_approved_ratings = () => {

        let request = app.get('/approved_rating_list', {});

        request.done(function (response, textStatus, jqXHR){

            let ok = response.ok;
            let ratings = response.data;

            if (ok) {

                let holder = $('.user-ratings-holder');

                ratings.forEach(function(obj) {

                    let rtng = obj.star;
                    let ccode1 = rtng >= 1 ? '#00C851' : '#ccc';
                    let ccode2 = rtng >= 2 ? '#00C851' : '#ccc';
                    let ccode3 = rtng >= 3 ? '#00C851' : '#ccc';
                    let ccode4 = rtng >= 4 ? '#00C851' : '#ccc';
                    let ccode5 = rtng >= 5 ? '#00C851' : '#ccc';

                    let htm = `
                        <div style="border: 1px solid #00C851;border-radius: 5px; padding: 8px; margin-bottom: 8px">
                            <div class="user-textview-container" 
                            style="
                            border-bottom: 1px solid #ccc;
                            height: 47px;
                            ">
                            <div style="font-weight: bold;">`+obj.username+`</div>
        
                            <div class="rate rate-with-five-stars"
                            style="
                            pointer-events:none;
                            height: 0px;
                            "
                            >
                                <input type="radio" disabled id="star5" name="rate" value="5" />
                                <label style="font-size: 16px !important;color: `+ccode5+`;" for="star5" title="text">5 stars</label>
                                <input type="radio" disabled id="star4" name="rate" value="4" />
                                <label style="font-size: 16px !important;color: `+ccode4+`;" for="star4" title="text">4 stars</label>
                                <input type="radio" disabled id="star3" name="rate" value="3" />
                                <label style="font-size: 16px !important;color: `+ccode3+`;" for="star3" title="text">3 stars</label>
                                <input type="radio" disabled id="star2" name="rate" value="2" />
                                <label style="font-size: 16px !important;color: `+ccode2+`;" for="star2" title="text">2 stars</label>
                                <input type="radio" disabled id="star1" name="rate" value="1" />
                                <label style="font-size: 16px !important;color: `+ccode1+`;" for="star1" title="text">1 star</label>
                            </div>
        
                            </div>
        
                            <div class="text-view-comment" style="margin-top: 7px;">`+obj.comments+`</div>
        
                        </div>
                    `
                    holder.append(htm);

                });

            }

        });

        request.fail(function (jqXHR, textStatus, errorThrown){
            // Log the error to the console
            console.error(
                "The following error occurred: "+
                textStatus, errorThrown
            );
        });

    }

    app.list_all_ratings = () => {

        let request = app.get('/get_ratings', {});

        request.done(function (response, textStatus, jqXHR){

            let ok = response.ok;
            let ratings = response.data;

            if (ok) {

                let tbody = $('.all-ratings-tbody');
                tbody.html('');

                ratings.forEach(function(obj) {

                    let approve = `<a class="approve-rating" data-username="`+obj.username+`"  data-star="`+obj.star+`"  data-comments="`+obj.comments+`" data-id="`+obj.id+`" href="#">Approve</a>  •  `;
                    if (obj.approve) {
                        approve = '';
                    }

                    let tr = `
                        <tr class="appttr" data-id=`+ obj.id +`>
                            <td> `+obj.username+` </td>
                            <td> `+obj.star+` </td>
                            <td> `+obj.comments+` </td>
                            <td>`+approve+` <a class="delete-rating" data-id="`+obj.id+`" href="#">Delete</a></td>
                        </tr>
                    `
                    tbody.append(tr);

                });

                $('.approve-rating').unbind().bind('click', function() {

                    let id = $(this).data('id');
                    let username = $(this).data('username');
                    let star = $(this).data('star');
                    let comments = $(this).data('comments');
                    let obj = {
                        'username': username,
                        'star': star,
                        'comments':comments
                    }

                    let req = app.post('/approve_comments/'+id, obj);

                    req.done(function (res, ts, jqXHR){

                        let ok = res.ok;

                        if (ok) {

                            app.list_all_ratings();
                        }

                    });

                    req.fail(function (jqXHR, textStatus, errorThrown){
                        // Log the error to the console
                        console.error(
                            "The following error occurred: "+
                            textStatus, errorThrown
                        );
                    });

                });

                $('.delete-rating').unbind().bind('click', function() {

                    if (confirm('Confirm Delete?')) {
                        let id = $(this).data('id');
                        let request = app.post('/rating_delete/'+id, {});
                        request.done(function (response, textStatus, jqXHR){
                            app.list_all_ratings();
                        })
                    }
                });
            }

        });

        request.fail(function (jqXHR, textStatus, errorThrown){
            // Log the error to the console
            console.error(
                "The following error occurred: "+
                textStatus, errorThrown
            );
        });

    }

   app.view_file = (url,filename) => {
        let req = app.get('/'+url+'/'+filename, {});

        req.done(function (res, ts, jqXHR){

            let ok = res.ok;
            let response_array = res.data;
            let tbody = $('.ins-viewfiles-tbody')

            if (ok) {
                let tr = '<tr>';
                response_array.forEach(function(row_dict) {
                    let column_names = Object.keys(row_dict);

                    let thead_tr = $('.xl-csv-thead-tr');
                    let tds = '';
                    column_names.forEach(function(clm) {
                        tds += '<th>'+clm+'</th>'
                    });
                    
                    thead_tr.html(tds);

                    column_names.forEach(function(column) {
                        tr +='<td>'+row_dict[column]+'</td>'
                    })
                    tr += '</tr>'
                });

               tbody.append(tr);

            }

        });

    }


    app.list_files = () => {

        let request = app.get('/get_all_files', {});

        request.done(function (response, textStatus, jqXHR){

            let ok = response.ok;
            let files = response.data;

            if (ok) {

                let tbody = $('.ins-files-tbody');
                tbody.html('');

                files.forEach(function(file) {
                    let url = '';
                    let delete_url = baseurl + '/view_files?'+file+'+delete_file'
                    
                    let fileExt = file.split('.').pop();

                    if (fileExt == 'xls' || fileExt == 'xlsx'){
                        url = baseurl + '/view_files?'+file+'+load_xls_file'
                    }
                    else if (fileExt == 'csv' ){
                        url = baseurl + '/view_files?'+file+'+load_csv_file'
                    }

                    let view_or_download = '<a class="view-file" data-file="'+file+'" href="'+url+'">View</a> '
                    let file_ext = file.split('.').pop();
                    if (file_ext == 'pdf' || file_ext == 'doc' || file_ext == 'docx'){
                        view_or_download = '<a class="download-file" data-file="'+file+'" href="/download_file/'+file+'" target="_blank">Download</a> '
                    }

                    let tr = `
                        <tr>
                            <td>`+file+`</td>
                            <td>
                                 `+view_or_download+`  •
                                 <a class="delete-file" data-file="`+file+`" href="#" >Delete</a>
                            </td>
                        </tr>
                    `
                    tbody.append(tr);

                });

                $('.delete-file').unbind().bind('click', function() {

                    if (confirm('Confirm Delete?')) {
                        let file = $(this).data('file');
                        let request = app.post('/delete_file/'+file, {});
                        request.done(function (response, textStatus, jqXHR){
                            app.list_files();
                        })
                    }

                    
                });
            }

        });

        request.fail(function (jqXHR, textStatus, errorThrown){
            // Log the error to the console
            console.error(
                "The following error occurred: "+
                textStatus, errorThrown
            );
        });

    }

    app.load_file_list_table = () => {

        let tbody = $('.ins-files-tbody');
        tbody.html('');

        let request = app.get('/list_files_dict', {});

        request.done(function (response, textStatus, jqXHR){

            let appointment_list = response.data;

            appointment_list.forEach(function(obj) {

                let keys = Object.keys(obj);
                let tr = '<tr>';

                for (let i = 0; i < keys.length; i++) {

                    let key = keys[i];

                    tr = tr + "<td> " + obj[key] + " </td>"
                }

                tr = tr + "</tr>"

                tbody.append(tr);

            });

        });
    }

    // init func
    let pathname = window.location.pathname

    if (pathname == '/') {
        app.list_approved_ratings();
    }

    if (pathname == '/book_an_appointment') {
        app.populate_times();
    }

    if (pathname == '/my_appointments') {
        app.load_appointment_list_table();
    }

    if (pathname == '/my_schedule') {
        app.load_schedule_list_table();
    }

    if (pathname == '/ratings') {
        app.list_all_ratings();
    }

    if (pathname == '/my_files') {
        app.list_files();
    }

    if (pathname == '/view_files') {
        let arr = window.location.search.split('?')[1].split('+')
        let file = arr[0];
        let url = arr[1];

        app.view_file(url, file);

        $('.pg-details').text(file);
    }
   

})();