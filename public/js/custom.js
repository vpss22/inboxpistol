function login(){
    if(loginValidation()==true){ 
        showpreloader();
        var xhttp= new XMLHttpRequest();
        xhttp.onreadystatechange = function(){
            if(this.readyState == 4 && this.status == 200 ){ 
                var res=JSON.parse(this.responseText)
                hidepreloader();
                if(res.status == true){
                    var typeAlert = 'ok'
                    isValid(typeAlert, res.message);
                    setTimeout(function(){
                        window.location.href = '/dashboard/'
                    },500)
                }else{
                    var typeAlert = 'error'
                    isValid(typeAlert, res.message);
                }
            }
        }

        var requestData = `email=${email.value}&&password=${password.value}`
        
        xhttp.open('post', "/", true)
        xhttp.setRequestHeader('content-type','application/x-www-form-urlencoded')
        xhttp.send(requestData);
    }else{
        loginValidation();
    }
}

function loginValidation(){
    emailError.innerHTML = '';
    passwordError.innerHTML = '';
    
    var name = 0; var password1=0;

    //email validation
    if (email.value == '' || email.value != ''){
        var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if (email.value == '' || !filter.test(email.value)) {
            var text = "Please enter a valid email.";
            emailError.innerHTML= text;
            emailError.classList.add('ig_input_error');
            name=0;
        }else{
            name=1;
            emailError.classList.remove('ig_input_error');
        }
    }

    //password validation
    if (password.value == '') {
        var text = "Password is required.";
        passwordError.innerHTML= text;
        passwordError.classList.add('ig_input_error');
        password1 = 0;
    }else if(password.value != ''){ 
        if(password.value.length < 6) {
            var text = "Password must be at least 6 characters long."
            passwordError.innerHTML= text;
            passwordError.classList.add('ig_input_error');
            password1 = 0;
        }else{
           password1 = 1;
           passwordError.classList.remove('ig_input_error');
        }
    }

    if(name==1 && password1==1){
        return true;
    }else{
        return false;
    }
}

function register(){
    if(registerValidation()==true){ 
        showpreloader();
        var xhttp= new XMLHttpRequest();
        xhttp.onreadystatechange = function(){
            if(this.readyState == 4 && this.status == 200 ){ 
                hidepreloader();
                var res=JSON.parse(this.responseText)
                if(res.status == true){
                    var typeAlert = 'ok'
                    isValid(typeAlert, res.message);
                    setTimeout(function(){
                        window.location.href = '/'
                    },500)
                }else{
                    var typeAlert = 'error'
                    isValid(typeAlert, res.message);
                }
            }
        }

        var requestData = `email=${email1.value}&&username=${user.value}&&password=${pass.value}`
        
        xhttp.open('post', "/register", true)
        xhttp.setRequestHeader('content-type','application/x-www-form-urlencoded')
        xhttp.send(requestData);
    }else{
        registerValidation();
    }
}

function registerValidation() {
    email1Error.innerHTML='';
    userError.innerHTML = '';
    passError.innerHTML = '';
    
    var mail=0; var name1 = 0; var pass1=0; 

    if (email1.value == '' || email1.value != ''){
        var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if (email1.value == '' || !filter.test(email1.value)) {
            var text = "Please enter a valid email.";
            email1Error.innerHTML= text;
            email1Error.classList.add('ig_input_error');
            mail=0;
        }else{
            mail=1;
            email1Error.classList.remove('ig_input_error');
        }
    }

    //username validation
    if (user.value == '' || user.value == null) {
        var text = "Please provide name"
        userError.innerHTML= text;
        userError.classList.add('ig_input_error');
        name1=0;
    }else{
        name1=1;
        userError.classList.remove('ig_input_error');
    }

    //password validation
    if (pass.value == '') {
        var text = "Password is required.";
        passError.innerHTML= text;
        passError.classList.add('ig_input_error');
        pass1 = 0;
    }else if(pass.value != ''){ 
        if(pass.value.length < 6) {
            var text = "Password must be at least 6 characters long."
            passError.innerHTML= text; 
            passError.classList.add('ig_input_error');
            pass1 = 0;
        }else{
            pass1 = 1;
            passError.classList.remove('ig_input_error');
        }
    }

    if(mail && name1 && pass1){
        return true;
    }else{
        return false;
    }
}

function forgot(){
    if(forgotPassword()==true){ 
        var pass = ''; 
        var str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +  
                'abcdefghijklmnopqrstuvwxyz0123456789@#$'; 
            
        for (i = 1; i <= 8; i++) { 
            var char = Math.floor(Math.random() 
                        * str.length + 1); 
                
            pass += str.charAt(char) 
        } 

        var xhttp= new XMLHttpRequest();
            xhttp.onreadystatechange = function(){
                if(this.readyState == 4 && this.status == 200 ){ 
                    var res=JSON.parse(this.responseText)
                    console.log(res)
                    if(res.status == true){
                        let typeAlert='ok';
                        let message = res.message
                        isValid(typeAlert,message);
                        setTimeout(function(){
                            window.location.href = '/';
                        },500)
                    }else{
                        let typeAlert='error';
                        let message = res.message
                        isValid(typeAlert,message);                   
                    }
                }
            }
        
        var requestData = `email=${forgot_email.value}&&newPassword=${pass}`
            
        xhttp.open('post',"/forgot-password", true)
        xhttp.setRequestHeader('content-type','application/x-www-form-urlencoded')
        xhttp.send(requestData);
    }else{
        forgotPassword();
    }
}

function forgotPassword() {
    forgotEmailError.innerHTML='';

    if (forgot_email.value == '' || forgot_email.value != ''){
        var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if (forgot_email.value == '' || !filter.test(forgot_email.value)) {
            var text = "Please enter a valid email.";
            forgotEmailError.innerHTML= text;
            forgotEmailError.classList.add('ig_input_error');
            return false;
        }else{
            forgotEmailError.classList.remove('ig_input_error');
            return true;
        }
    }
}

$('.ig_login input').keypress(function(event){
    if(event.keyCode === 13){
        $('#ig_log_btn').click();
    }
});

$('.ig_reg input').keypress(function(event){
    if(event.keyCode === 13){
        $('#ig_reg_btn').click();
    }
});

$('.ig_forgot input').keypress(function(event){
    if(event.keyCode === 13){
        $('#ig_reg_btn').click();
    }
});

/*-----------------------------------------------------
	Fix Toastr
-----------------------------------------------------*/
function isValid(typeAlert,message) { 
    if(typeAlert=='ok')
	{
		$('.ig_alert_wrapper').addClass('alert_open');
		$('.ig_alert_wrapper').addClass('success');
		$(".ig_alert").text(message);
		setTimeout(function(){ $('.ig_alert_wrapper').removeClass('alert_open'); }, 3000);
		setTimeout(function(){ 
            setTimeout(function(){ 
                $('.ig_alert_wrapper').removeClass('success'); 
            }, 300);
        }, 3000);
	}
    else
	{
		$('document').ready(function(){
			$('.ig_alert_wrapper').addClass('alert_open');
			$('.ig_alert_wrapper').addClass('error');
			$(".ig_alert").text(message);
			setTimeout(function(){ $('.ig_alert_wrapper').removeClass('alert_open'); }, 3000);
			setTimeout(function(){ 
                setTimeout(function(){ 
                    $('.ig_alert_wrapper').removeClass('error'); 
                }, 300);
            }, 3000);
		});
	}
}

/* loader function */
function showpreloader(){
    $('.ms_preloader_wrapper').addClass('preloader_open');
}

function hidepreloader(){
    $('.ms_preloader_wrapper').remove('preloader_open');
}
