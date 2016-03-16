var burl = "";
var jsfile = [];
var urldata = [];
var cmflag = 1;
var jsflag = 0;
var urllist = "";
var num = 0;
var itab = "";

var whiteList = [
    "google.com"
    , "www.facebook.com"
    , "twitter.com"
    , "google-analytics.com"
    , "google.co.jp"
    , "googleads.g.doubleclick.net"
    , "apis.google.com"
    , "gstatic.com"
    , "live.com"
    , "mail.google.com"
];



var URLLoadTimes = {};

// URLLoadTimes の特定URLを初期化します
function assignStartURLLoadTimes(url, dateMillisecond){
    URLLoadTimes[url] = dateMillisecond;
}

function updateURLLoadTimes(url, dateMillisecond){
    if(url in URLLoadTimes){
	var prevMillisecond = URLLoadTimes[url];
	console.log("reload", url, (dateMillisecond - prevMillisecond) * 0.001, "[second]");
	URLLoadTimes[url] = dateMillisecond;
    }else{
	console.log("load", url, dateMillisecond * 0.001, "[second]");
	URLLoadTimes[url] = dateMillisecond;
    }
}


// URL を key として、[{'type': 'onBeforeRequest', 'date': new Date()}, ...] みたいなのを入れて保存しておく入れ物
var timeStamps = {};


// URL毎に eventType を付与した時間を記録します。
function addTimeStampNow(url, eventType){
    console.log("ADD:", eventType, url);
    var newEntry = {'date': new Date(), 'type': eventType};
    if(url in timeStamps){
	timeStamps[url].push(newEntry);
    }else{
	timeStamps[url] = [newEntry];
    }
}

// Date object を2つ受け取り、dateObject1 から dateObject2 までにかかった時間を秒の単位で取得します
function GetDiffTimeInSecond(dateObject1, dateObject2){
    return (dateObject2.getTime() - dateObject1.getTime()) * 0.001;
}

// 時間を計測するべきページを表示させた後、この関数を呼ぶと、計測した時間を表示してくれます。
// これは内部からは呼び出されないですが、chrome拡張のページからバックグラウンドページを開いて、
// その中の console からこの関数を呼び出す事で、
// その時点までに開いたWebPageについての情報を全部取得することができます。
function CalcPageLoadTime(){
    for(var url in timeStamps){
	var entryList = timeStamps[url];

	var firstTime = undefined;
	for(var n in entryList){
	    var entry = entryList[n];
	    var nowTime = entry.date;
	    if(!firstTime){
		firstTime = nowTime;
		continue;
	    }
	    if(firstTime > nowTime){
		firstTime = nowTime;
	    }
	}
	var lastTime = undefined;
	for(var n in entryList){
	    var entry = entryList[n];
	    var nowTime = entry.date;
	    if(!lastTime){
		lastTime = nowTime;
		continue;
	    }
	    if(lastTime < nowTime){
		lastTime = nowTime;
	    }
	}

	for(var n in entryList){
	    var entry = entryList[n];
	    var nowTime = entry.date;
	    var nowType = entry.type;
	    if(!lastTime){
		lastTime = nowTime;
		continue;
	    }
	    if(lastTime < nowTime){
		lastTime = nowTime;
	    }
	}

	console.log(url, "totaltime", GetDiffTimeInSecond(firstTime, lastTime), "[second]");

	var details = [];
	for(var n in entryList){
	    var entry = entryList[n];
	    var nowTime = entry.date;
	    if(!firstTime){
		firstTime = nowTime;
	    }
	    details.push(entry.type + ": " + GetDiffTimeInSecond(firstTime, nowTime));
	}
	console.log(url, "details: ", details.join(", "));
    }
}

// timeStamps に入っている物が、targetURL を load するためだけのものだと仮定して
// 記録されている最初のものから最後の物までの時間を savedMesureTimeList に追加します
var savedMesureTimeList = {};
function UpdateMesureData(targetURL){
    var firstTime = undefined;
    var lastTime = undefined;
    console.log("UPGRADE MESURE DATA: ", targetURL);
    for(var url in timeStamps){
	if(url.indexOf("file:///") == 0){
	    // 起点ページは入れません。
	    continue;
	}
	var entryList = timeStamps[url];

	for(var n in entryList){
	    var entry = entryList[n];
	    var nowTime = entry.date;
	    if(!firstTime){
		firstTime = nowTime;
		continue;
	    }
	    if(firstTime > nowTime){
		firstTime = nowTime;
	    }
	}
	for(var n in entryList){
	    var entry = entryList[n];
	    var nowTime = entry.date;
	    if(!lastTime){
		lastTime = nowTime;
		continue;
	    }
	    if(lastTime < nowTime){
		lastTime = nowTime;
	    }
	}
    }
    var diffTime = GetDiffTimeInSecond(firstTime, nowTime);
    
    if(targetURL in savedMesureTimeList){
	savedMesureTimeList[targetURL].push(diffTime);
    }else{
	savedMesureTimeList[targetURL] = [diffTime];
    }
    timeStamps = {};
}

// savedMesureTimeList の中身を報告させます
function ReportMesureData(){
    var report = '';
    for(var url in savedMesureTimeList){
	var diffTimeList = savedMesureTimeList[url];
	report += '"' + url + '"';
	for(var i in diffTimeList){
	    var diffTime = diffTimeList[i];
	    report += ", " + diffTime;
	}
	report += "\n";
    }
    console.log(report);
}


function updateTab(){

    redirect = urllist[num];
    urldata = [];
    jsflag = 0;
    chrome.tabs.update(itab,{url:redirect},function (){
            console.log("Site  : "+urllist[num]);
	    num++;
        });

}

function reloadPage(tabId){
    chrome.tabs.reload(tabId);
}

function domainExt(url){

    tmp = url.split(":")[1];
    urlsplit = tmp.split("/");

    return urlsplit[2];
}

function checkDomainList(url){

    domain = domainExt(url);
    if(urldata.toString().indexOf(domain) == -1){
	urldata.push(domain);
    }
    return 0;
};

function slashDomain(domain){

    sdomain = domain.split(".");
    tdomain = "";
    if(sdomain.length > 2){
	for(i=1;i<sdomain.length;i++){
	    tdomain = tdomain + sdomain[i];
	    if(i < (sdomain.length -1)){
		tdomain = tdomain + ".";
	    }
	}
    }
    return tdomain;
}

function checkDomain(domain){

    flag = 0;

    if(urldata.toString().indexOf(domain) != -1){
	flag = 1;
    }else if(jsfile.toString().indexOf(domain) != -1){
	flag = 2;
    }else if(whiteList.toString().indexOf(domain) != -1){
	flag = 3;
    }else if(domain.split(".").length > 2){
	flag = checkDomain(slashDomain(domain));
	if(flag != 0){
	    flag = flag + 100;
	}
    }
    //console.log(domain + " : " + dd + " : " + flag);
    //console.log(domain + " : " + flag);
    return flag;
};

chrome.webRequest.onBeforeSendHeaders.addListener(function(details){

	if("main_frame" == details.type){
	    	//return {cancel:true};
	    var header = details.requestHeaders;
	    for(i=0;i<header.length;i++){
		if(header[i].name == "Referer"){
		    if(checkDomain(domainExt(details.url)) == 0){
			if(details.tabId != -1){
			    console.log("referer Malicious?");
			    return {cancel:true};
			}
		    }   
		}
	    }
	}
    },

    {urls:["*://*/*"]
            },
    ["requestHeaders",
     "blocking"]
);

// ! request! 
chrome.webRequest.onBeforeRequest.addListener(function(details){
	
	url=details.url;
	//console.log(burl + " : " + url);

	if("main_frame" == details.type){
	    assignStartURLLoadTimes(url, (new Date()).getTime());
	    addTimeStampNow(url, "onBeforeRequest");
	    if(burl != url){
		jsflag = 0;
	    }
	    return {cancel:false};
	}else if("xmlhttprequest" == details.type){
	    if(url.indexOf(".html") >= 0){
		return {cancel:false};
	    }
	}else if("script" == details.type){
	    return {cancel:false};
	}else{
	    if(jsflag){
		if("stylesheet" == details.type){
		    checkDomainList(url);
		    return {cancel:false};
		}else if("image" == details.type){
		    //chackDomaiList(url);
		    return {cancel:false};
		}
		if(checkDomain(domainExt(url)) == 0){
		    if(details.tabId != -1){
			setTimeout(function(){
			    chrome.tabs.executeScript(details.tabId, {file: "warning_dog_start.js"},function(){
				console.log("Malicious? : " + domainExt(url) + " : " + details.type);
				return {cancel:true};
			    });
			}, 1000*0.5);
		    }else{
			return {cancel:true};
		    }
		}else{
		    return {cancel:false};
		}
	    }else{
		return {cancel:true};
	    }	    
	}
	return {cancel:true};
    },
    {urls:["*://*/*"],
	    types:["main_frame","sub_frame","xmlhttprequest","other"]
	    },
    ["blocking"]
);


// !Windows!
chrome.windows.onCreated.addListener(function(window){

	//console.log("Test window" + window.tabs + " " + window.tabs.requestId );
    }
);

chrome.tabs.onUpdated.addListener(function(tabId, info, tab){
	checkDomainList(tab.url);
    });

chrome.webRequest.onCompleted.addListener(function(details){
    if("main_frame" == details.type){
	addTimeStampNow(details.url, "onCompleted");
	/// XXX: TIME_MESURE: 時間計測を行う場合はこのコメントアウトされた行を有効化する
	/// これを有効化してしまうと、どのページに遷移しても「戻る」が実行されてしまうので
	/// 時間計測を行う場合以外はコメントアウトしておくこと
	// chrome.tabs.executeScript(details.tabId, {file: "back.js"});
    }
	
    //console.log("completed ID : " + details.requestId);
},
{urls:["*://*/*"]},
[]
);

// !Tabs!
chrome.tabs.onCreated.addListener(function(tab) {

	if(tab.url){
	    console.log("Test tab" + tab.url + " " + tab.requestId);
	}
    }
);

//  !Redirect!
chrome.webRequest.onBeforeRedirect.addListener(function(details){
	//console.log("Redirect : "+details.url + " to " + details.redirectUrl + " " + details.requestId);
	checkDomainList(details.redirectUrl);
    },
    {
	urls:[
	      "*://*/*"
	      ]
	    });

function isStartPage(url){
    return url.indexOf("file:///E:/work/src/chrome-extension/") >= 0;
}

// onRequest
chrome.extension.onRequest.addListener(function(request,sender,sendResponse){
    console.log("onRequest in");
    if(!("type" in request)){
	console.log("invalid request:", request);
	return;
    }
    if(request.type == "resolve" || request.type == "reject"){
	if(burl != sender.tab.url){
	    burl = sender.tab.url;
	    jsfile = request;
	    jsflag = 1;
	    urldata = [];
	    console.log("GET DATA: " + burl + " <-> " + sender.tab.url);
	    if(!isStartPage(sender.tab.url)){
		reloadPage(sender.tab.id);
		checkDomainList(burl); // XXX modified: url -> burl
	    }
	    //console.log(jsfile);
	}
    }
    if(request.type == "onPageLoad"){
	//updateURLLoadTimes(sender.tab.url, request.date);
    }
    if(request.type == "MeasureStart"){
	// 次の計測がはじまる。
	UpdateMesureData(request.prevURL);
    }
});

chrome.browserAction.onClicked.addListener(function(tab){
	chrome.alarms.create({periodInMinutes:0.5});
	console.log(tab.id);
	itab = tab.id;
    });


chrome.alarms.onAlarm.addListener(function(){
	if(num < (urllist.length-1)){
	    updateTab();
	}else{
	    chrome.alarms.clearAll(function(){
		    console.log("Crawler finish.");
		});
	}
    });
