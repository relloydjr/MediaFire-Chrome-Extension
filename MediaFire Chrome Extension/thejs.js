var application_id = 38346;
var api_key = "csopkeatwt1zkqkrsk5s33n53sc1816i2s9ppkzi";
var session_token;
var foldermap = {};
var filemap = {};
var backStack = [];
var robert;
localStorage['email'] = !localStorage['email'] ? '' : localStorage['email'];
localStorage['sessionDate'] = !localStorage['sessionDate'] ? 0 : localStorage['sessionDate'];
localStorage['files'] = !localStorage['files'] ? JSON.stringify({}) : localStorage['files'];
localStorage['folders'] = !localStorage['folders'] ? JSON.stringify({}) : localStorage['folders'];
localStorage['subfoldercount'] = !localStorage['subfoldercount'] ? JSON.stringify({}) : localStorage['subfoldercount'];

function login(){
	var email = $('#givenEmail').val();
	var password = $('#givenPassword').val();
	var signature = SHA1(email+password+application_id+api_key);
	if(localStorage["email"] != email){
		localStorage['files'] = localStorage['folders'] = localStorage['subfoldercount'] = JSON.stringify({});
		refreshMenu();
		localStorage['email'] = email;
	}
	mediaFire.login(email, password, signature);
}

function logout(){
	//delete localStorage['password'];
	delete localStorage['sessionToken'];
	delete localStorage['sessionDate'];
	//localStorage['files'] = localStorage['folders'] = JSON.stringify({});
	refreshMenu();
	window.close(); 
}

var mediaFire = {
login: function(email, password, signature){
	       var loginString =  "https://mediafire.com/api/user/get_session_token.php?email="+email+"&password="+password+
		       "&application_id="+application_id+"&signature="+signature+"&response_format=json&version=1";
	       this.requestToken(loginString);
       },

requestToken: function(loginString) {
		      var req = getXHR();
		      req.open("GET", loginString, true);
		      req.onload = this.setToken_.bind(this);
		      req.send(null);

	      },
renewToken: function(){//unused so far
		    var req = getXHR();
		    req.open("GET", "https://www.mediafire.com/api/user/renew_session_token.php&session_token="+session_token, true);
		    req.onload = this.setToken_.bind(this);
		    req.send(null);

	    },
requestFolders: function(folderkey){
			var req = getXHR();
			req.open("GET", "http://www.mediafire.com/api/folder/get_content.php?session_token="+session_token+"&folder_key="+folderkey+"&response_format=json", true);
			req.onload = this.showFolders.bind(this);
			req.send(null);


		},
requestFiles: function(folderkey){
		      var req = getXHR();
		      req.open("GET", "http://www.mediafire.com/api/folder/get_content.php?session_token="+session_token+"&folder_key="+folderkey+"&content_type=files&filter=document&response_format=json", true);
		      req.onload = this.showFiles.bind(this);
		      req.send(null);


	      },	
showFolders: function (e){
		     $('#loading_gif').css('display', 'none');
		     var json = JSON.parse(e.target.response);
		     robert = json;
		     var folders = json.response.folder_content.folders;
		     var activeFolders = JSON.parse(localStorage["folders"]);
		     for(var i = 0; i < folders.length;i++){
			     var checked = activeFolders[folders[i].folderkey]!=undefined ? 'checked' : '';
			     var hasSubFolder = '';
			     if(JSON.parse(localStorage['subfoldercount'])[folders[i].folderkey] > 0)
				     hasSubFolder = "<img src='arrow.png'>";
			     var newRow = $('<tr class="highlight" id="r_'+folders[i].folderkey+'">'
					     +'<td style="width:15px"><input type="checkbox" id="c_'+folders[i].folderkey+'" '+checked+'></td>'
					     +'<td style="width:50px"><img src="folder.gif"></td>'
					     +'<td class="folderName" style="width:80%"><span class="folderText" id="f_'+folders[i].folderkey+'">'+folders[i].name+'</span></td>'
					     +'<td>'+hasSubFolder+'</td></tr>');
			     $('#content').append(newRow);
			     foldermap[folders[i].folderkey] = folders[i].name;	

		     }
		     /*$("[id^=r_]").mouseover(function()  {
		     //$(this).css("background-color","#F0F0F0");
		     //$(this).css("cursor","pointer");

		     });

		     $("[id^=r_]").mouseout(function() {
		     $(this).css("background-color","white");
		     });*/

		     $("[id^=c_]").on('click', function(){
				     var folderkey = $(this).attr("id").substr($(this).attr("id").indexOf("_")+1);
				     var activeFolders = JSON.parse(localStorage["folders"]);
				     var parentFolders = JSON.parse(localStorage['subfoldercount']);
				     if($(this).is(':checked')){
				     activeFolders[folderkey] = foldermap[folderkey];
				     parentFolders[prev] = parentFolders[prev] ? ++parentFolders[prev] : 1;
				     backStack.forEach(function(folderkey) {
					     parentFolders[folderkey] = parentFolders[folderkey] ? ++parentFolders[folderkey] : 1;
					     //console.log(entry);
					     });
				     console.log("checked: "+folderkey+"["+foldermap[folderkey]+"]");
				     }
				     else{
				     parentFolders[prev]--;
				     console.log("uncheck: "+folderkey+"["+foldermap[folderkey]+"]");
				     backStack.forEach(function(folderkey) {
					     parentFolders[folderkey]--;
					     //console.log(entry);
					     });
				     delete activeFolders[folderkey]
				     }
				     localStorage["folders"] = JSON.stringify(activeFolders);
				     localStorage["subfoldercount"] = JSON.stringify(parentFolders);
				     console.log(localStorage["folders"]);
				     refreshMenu();
		     });

		     $("[id^=f_]").on('click', function(){
				     var folderkey = $(this).attr("id").substr($(this).attr("id").indexOf("_")+1);
				     loadContent(folderkey);
				     });


	     },
showFiles: function (e){
		   $('#loading_gif').css('display', 'none');
		   var json = JSON.parse(e.target.response);
		   robert = json;
		   var files = json.response.folder_content.files;
		   var activeFiles = JSON.parse(localStorage["files"]);
		   for(var i = 0; i < files.length;i++){
			   var checked = activeFiles[files[i].quickkey]!=undefined ? 'checked' : '';
			   var newRow = $('<tr class="highlight" id="r_'+files[i].quickkey+'">'
					   +'<td style="width:15px"><input type="checkbox" id="c_'+files[i].quickkey+'" '+checked+'></td>'
					   +'<td style="width:50px"><img src="file.gif"></td>'
					   +'<td class="folderName"><a href="http://www.mediafire.com/view/'+files[i].quickkey+'" target="_blank">'+files[i].filename+'</a></td></tr>');
			   $('#content').append(newRow);
			   filemap[files[i].quickkey] = files[i].filename;	
		   }
		   /*$("[id^=r_]").mouseover(function()  {
		     $(this).css("background-color","#F0F0F0");
		   //$(this).css("cursor","pointer");

		   });

		   $("[id^=r_]").mouseout(function() {
		   $(this).css("background-color","white");
		   });*/

		   $("[id^=c_]").on('click', function(){
				   var quickkey = $(this).attr("id").substr($(this).attr("id").indexOf("_")+1);
				   var activeFiles = JSON.parse(localStorage["files"]);
				   if($(this).is(':checked')){
				   activeFiles[quickkey] = filemap[quickkey];
				   console.log("checked: "+quickkey+"["+filemap[quickkey]+"]");
				   }
				   else{
				   console.log("uncheck: "+quickkey+"["+filemap[quickkey]+"]");
				   delete activeFiles[quickkey]
				   }
				   localStorage["files"] = JSON.stringify(activeFiles);
				   console.log(localStorage["files"]);
				   refreshMenu();
				   });
	   },
setToken_: function (e){
		   var json = JSON.parse(e.target.response);
		   robert = json;
		   if(json.response.result=='Error'){
			   $('#loginButton').html("<span class='fail'>bad credentials - try again</span>");
			   $('#givenEmail').focus();
			   return;	
		   }
		   session_token = json.response.session_token;
		   localStorage['sessionToken'] = session_token;
		   localStorage['sessionDate'] = Date.now();
		   loadContent("myfiles");
	   },
upload: function(url, filename, key){//not working!
		var req = getXHR();
		req.open("POST", "http://www.mediafire.com/api/upload/add_web_upload.php?session_token="
				+session_token+"&url="+url+"&filename="+filename+"&folder_key="+key, true);
		//req.onload = this.setToken_.bind(this);
		req.send(null);
	}
}

var prev;
function loadContent(folderkey){
	var folderName;
	if(prev)
		backStack.push(prev);
	prev = folderkey;
	$('#backstack').html(backStack);
	if(folderkey=="myfiles")
		folderName = "My Files";
	else
		folderName = foldermap[folderkey];
	$('#loginForm').remove();
	$('#header_text').html(folderName);
	$("#logoutButton").html("Logout - "+localStorage['email']);
	$('#loading_gif').css('display', 'block');
	$('#loading_gif').center();
	$('#content').css('display', 'block');
	$("#content tr").remove();
	mediaFire.requestFolders(folderkey);
	mediaFire.requestFiles(folderkey);


}

function refreshMenu(){
	chrome.extension.sendMessage({refresh: true}, function (res) {});
}


$( document ).ready(function() {
		$("#loginForm").submit( function(event){
			$("#loginButton").html("logging in...");
			login();
			event.preventDefault();
			});
		$("#logoutButton").on('click', function(){
			logout();
			});
		$("#icon").on('click', function(){
			if(backStack.length > 0){
			prev = null;
			loadContent(backStack.pop());
			}
			});

		if(localStorage['email'].length > 0){
		$('#givenEmail').val(localStorage['email']);
		}
		//if session is valid?
		if(Date.now() - localStorage['sessionDate'] < 10 * 60 * 1000){
			//session is still fresh
			session_token = localStorage['sessionToken'];
			loadContent("myfiles");

		}
		else
			$('#loginForm').css('display', 'block');
		/*if(localStorage['email'].length > 0 && localStorage['password'].length > 0){
		  $('#givenPassword').val(localStorage['password']);
		  $('#loginButton').click();
		  }*/

		//mediaFire.requestToken();
		//$("#loading_gif").center();
});



















/* other functions */


















/* from MediaFire */
function ha(len){var varAlpha="";var varBeta="";while(len>0){var rndNum=Math.random();rndNum=parseInt(rndNum*1000);rndNum=(rndNum%26)+65;varBeta=String.fromCharCode(rndNum);varAlpha=varAlpha+varBeta;len--;}varBeta=varAlpha.toLowerCase();return varBeta;}


function getXHR(){
	try{
		return new XMLHttpRequest();
	} catch (e){
		try{
			return new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try{
				return new ActiveXObject("Microsoft.XMLHTTP");
			} catch (e){
				alert("Bad browser");
				return null;
			}
		}
	}
}

/* from http://www.webtoolkit.info/javascript-sha1.html#.UqlQhmRDuCk */
function SHA1 (msg) {

	function rotate_left(n,s) {
		var t4 = ( n<<s ) | (n>>>(32-s));
		return t4;
	};

	function lsb_hex(val) {
		var str="";
		var i;
		var vh;
		var vl;

		for( i=0; i<=6; i+=2 ) {
			vh = (val>>>(i*4+4))&0x0f;
			vl = (val>>>(i*4))&0x0f;
			str += vh.toString(16) + vl.toString(16);
		}
		return str;
	};

	function cvt_hex(val) {
		var str="";
		var i;
		var v;

		for( i=7; i>=0; i-- ) {
			v = (val>>>(i*4))&0x0f;
			str += v.toString(16);
		}
		return str;
	};


	function Utf8Encode(string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";

		for (var n = 0; n < string.length; n++) {

			var c = string.charCodeAt(n);

			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}

		}

		return utftext;
	};

	var blockstart;
	var i, j;
	var W = new Array(80);
	var H0 = 0x67452301;
	var H1 = 0xEFCDAB89;
	var H2 = 0x98BADCFE;
	var H3 = 0x10325476;
	var H4 = 0xC3D2E1F0;
	var A, B, C, D, E;
	var temp;

	msg = Utf8Encode(msg);

	var msg_len = msg.length;

	var word_array = new Array();
	for( i=0; i<msg_len-3; i+=4 ) {
		j = msg.charCodeAt(i)<<24 | msg.charCodeAt(i+1)<<16 |
			msg.charCodeAt(i+2)<<8 | msg.charCodeAt(i+3);
		word_array.push( j );
	}

	switch( msg_len % 4 ) {
		case 0:
			i = 0x080000000;
			break;
		case 1:
			i = msg.charCodeAt(msg_len-1)<<24 | 0x0800000;
			break;

		case 2:
			i = msg.charCodeAt(msg_len-2)<<24 | msg.charCodeAt(msg_len-1)<<16 | 0x08000;
			break;

		case 3:
			i = msg.charCodeAt(msg_len-3)<<24 | msg.charCodeAt(msg_len-2)<<16 | msg.charCodeAt(msg_len-1)<<8	| 0x80;
			break;
	}

	word_array.push( i );

	while( (word_array.length % 16) != 14 ) word_array.push( 0 );

	word_array.push( msg_len>>>29 );
	word_array.push( (msg_len<<3)&0x0ffffffff );


	for ( blockstart=0; blockstart<word_array.length; blockstart+=16 ) {

		for( i=0; i<16; i++ ) W[i] = word_array[blockstart+i];
		for( i=16; i<=79; i++ ) W[i] = rotate_left(W[i-3] ^ W[i-8] ^ W[i-14] ^ W[i-16], 1);

		A = H0;
		B = H1;
		C = H2;
		D = H3;
		E = H4;

		for( i= 0; i<=19; i++ ) {
			temp = (rotate_left(A,5) + ((B&C) | (~B&D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
			E = D;
			D = C;
			C = rotate_left(B,30);
			B = A;
			A = temp;
		}

		for( i=20; i<=39; i++ ) {
			temp = (rotate_left(A,5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
			E = D;
			D = C;
			C = rotate_left(B,30);
			B = A;
			A = temp;
		}

		for( i=40; i<=59; i++ ) {
			temp = (rotate_left(A,5) + ((B&C) | (B&D) | (C&D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
			E = D;
			D = C;
			C = rotate_left(B,30);
			B = A;
			A = temp;
		}

		for( i=60; i<=79; i++ ) {
			temp = (rotate_left(A,5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
			E = D;
			D = C;
			C = rotate_left(B,30);
			B = A;
			A = temp;
		}

		H0 = (H0 + A) & 0x0ffffffff;
		H1 = (H1 + B) & 0x0ffffffff;
		H2 = (H2 + C) & 0x0ffffffff;
		H3 = (H3 + D) & 0x0ffffffff;
		H4 = (H4 + E) & 0x0ffffffff;

	}

	var temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);

	return temp.toLowerCase();

}

jQuery.fn.center = function () {
	this.css("position","absolute");
	this.css("top", Math.max(0, (($(window).height() - this.outerHeight()) / 2) + 
				$(window).scrollTop()) + "px");
	this.css("left", Math.max(0, (($(window).width() - this.outerWidth()) / 2) + 
				$(window).scrollLeft()) + "px");

	//this.css("text-align", "center");
	return this;
}

