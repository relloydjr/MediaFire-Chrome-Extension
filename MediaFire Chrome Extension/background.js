// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
var session_token;
function appendText(key) {
	return function(info, tab) {
		var text = info.selectionText;
		alert(text);
	}
}

function uploadToFolder(key) {
	return function(info, tab) {
		localStorage['sessionDate'] = !localStorage['sessionDate'] ? 0 : localStorage['sessionDate'];
		if(Date.now() - localStorage['sessionDate'] >= 10 * 60 * 1000){
			//mediaFire.renewToken();
			alert("sign in again!");
			return;
		}
		var url = 'info.html#' + info.srcUrl;
		var link = info.srcUrl!=undefined ? info.srcUrl : info.linkUrl;    
		var name;
		var extension = "";
		if(link.lastIndexOf(".") > link.lastIndexOf('/') + 1){
			name = link.substring(link.lastIndexOf('/') + 1, link.lastIndexOf("."));
			extension = (link.substr(link.lastIndexOf('/') + 1)).split('.').pop();
		}
		else{
			name = link.substr(link.lastIndexOf('/') + 1);//could be empty
			extension = "html";
		}
		//if(extension.length==0)
		//   extension = "html";
		var prepend = false;
		if(name.length==0 || prepend){//prepend url?
			var str = tab.url;
			var match = str.match(/(?:https?:\/\/)?(?:www\.)?(.*?)\//);
			console.log(match[match.length-1]);
			name = "{"+match[match.length-1]+"}";
		}
		var filename=prompt("Please enter a file name",name+"."+extension);
		if (filename==null)
			return;
		//mediaFire.requestToken();
		//mediaFire.upload(link+"#"+ha(10), filename, key);
		session_token = localStorage['sessionToken'];
		var req = getXHR();
		req.open("POST","http://www.mediafire.com/api/upload/add_web_upload.php?r="+ha(4),true);
		req.setRequestHeader("Content-type","application/x-www-form-urlencoded; charset=UTF-8");
		req.setRequestHeader("Cache-Control", "no-cache; must-revalidate");
		req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
		req.send("url="+encodeURIComponent(link+"#"+ha(10))+"&folder_key="+key+"&filename="+encodeURIComponent(filename)+"&session_token="
				+session_token+"&response_format=json&version=2");
	};
};


var mediaFire = {
renewToken: function(){
		    var req = getXHR();
		    req.open("GET", "https://www.mediafire.com/api/user/renew_session_token.php&session_token="+session_token, false);
		    //req.onload = this.setToken_.bind(this);
		    req.send(null);

	    },
setToken_: function (e){//unused
		   var json = JSON.parse(e.target.response);
		   session_token = json.response.session_token;

	   },
upload: function(url, filename, key){//unused & not working
		var req = getXHR();
		req.open("POST", "https://www.mediafire.com/api/upload/add_web_upload.php?session_token="
				+localStorage["sessionToken"]+"&url="+url+"&filename="+filename+"&folder_key="+key, true);
		//req.onload = this.setToken_.bind(this);
		req.send(null);
	}

}




chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
		if(request.refresh)
			refresh();
		});

function refresh(){
	chrome.contextMenus.removeAll(function(){
			chrome.contextMenus.create({
				"title" : "Upload to MediaFire",
				"id": "folder_parent",
				"type" : "normal",
				"contexts" : ["image", "link"], 
				});
			chrome.contextMenus.create({//root folder
				"title" : "Root Folder",
				"parentId": "folder_parent",
				"id" : "myfiles",
				"type" : "normal",
				"contexts" : ["image", "link"],
				"onclick" : uploadToFolder("myfiles")
				});

			var activeFolders = JSON.parse(localStorage["folders"]);
			for (var key in activeFolders) {
				chrome.contextMenus.create({
					"title" : activeFolders[key],
					"parentId": "folder_parent",
					"id" : key,
					"type" : "normal",
					"contexts" : ["image", "link"],
					"onclick" : uploadToFolder(key)
				});
			}

			chrome.contextMenus.create({
					"title" : "Append to MediaFire",
					"id": "file_parent",
					"type" : "normal",
					"contexts" : ["selection"], 
					});
			chrome.contextMenus.create({//root folder
					"title" : "Root Folder",
					"parentId": "file_parent",
					"id" : "myfiles",
					"type" : "normal",
					"contexts" : ["selection"],
					"onclick" : appendText("myfiles")
					});

			var activeFolders = JSON.parse(localStorage["files"]);
			for (var key in activeFolders) {
				chrome.contextMenus.create({
						"title" : activeFolders[key],
						"parentId": "file_parent",
						"id" : key,
						"type" : "normal",
						"contexts" : ["selection"],
						"onclick" : appendText(key)
						});
			}
	});

}

refresh();



















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

