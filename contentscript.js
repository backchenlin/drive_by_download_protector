chrome.extension.sendRequest({"type": "onPageLoad", "date": (new Date()).getTime()});

var ifinfo = document.getElementsByTagName('iframe');
var elements = document.getElementsByTagName('script');
var textarray ="";
var rawjavascript="";
var jsfile = [];
var dfdarray = [];
var dfds = [];

if(ifinfo.length >= 0 ){
    for(i=0;i<ifinfo.length;i++){
	if(ifinfo[i].contentWindow.frameElement.src.indexOf("http") != -1){
	    dfdarray.push(ifinfo[i].contentWindow.frameElement.src);
	}
    }
}

for(i=0;i<elements.length;i++){
    if(elements[i].src != ""){
	textarray = textarray + i + " : " + elements[i].src + "\n";
	if(elements[i].src.indexOf("http") != -1){
	    dfdarray.push(elements[i].src);
	}
	jsfile.push(elements[i].src);
	//console.log(elements[i].src);
    }else{
	rawjavascript = rawjavascript + elements[i].text + "\n";
	jsfile.push(elements[i].text);
    }
}

//chrome.extension.sendRequest(dfdarray.join(""));

for(i=0;i<dfdarray.length;i++){
    console.log("get list : " + dfdarray[i]);
    dfds.push($.get(dfdarray[i]).then(function(data, textStatus, jqXHR,i){
		jsfile.push("Data : " + data);
		//console.log(data);
	    },
	    function(i){
		console.log("Error : " + dfdarray[i] + " !" );
	    }
	    ));
}

//console.log("defferrd : " + dfdarray.length + " " + dfdarray);

$.when.apply($,dfds).then(function(){
	console.log("resoleve");
	strings = jsfile.join("");
	//console.log(strings);
	chrome.extension.sendRequest({"type": "resolve", "data": strings});
    },
    function(){
	console.log("reject");
	strings = jsfile.join("");
	//console.log(strings);
	chrome.extension.sendRequest({"type": "reject", "data": strings});
    }
);


///----- for time mesurment feature -----
/// 時間計測は time_mesurment/top-100.html のようなHTMLを起点として
/// そのHTMLに記述されているURLに遷移して、戻ることによって計測される。
/// そこで、isStartPage() を使って起点ページなのか、それ以外のページなのかを判断し、
/// 起点ページでなければ window.onload イベント(ページが読み込まれた後に発生するイベント)
/// からある程度の時間が経った後に元のページに戻り、
/// また指示されたページへと遷移してしばらくすると戻り、を繰り返すことによって
/// 個々の時間を計測する事になる。
/// したがって、標準の使い方をする場合にはこの機能は邪魔となるので、
/// リリース時には window.onload イベントへの登録を行わないことで封印されている。
var maxCount = 10;
var currentNumber = { "no": 0, "count": 0 };

function isStartPage(){
    return window.location.href.indexOf("file:///E:/work/src/chrome-extension/") >= 0;
}

function UpdateURLHint(no, count){
    var url = window.location.href.replace(/#.*$/, '');
    url = url + "#" + no + "," + count;
    window.location.href = url;
}

function GetURLList(){
    return document.querySelectorAll("a");
}

function GetCurrentNumber() {
    var hint = window.location.href;
    if(hint.indexOf("#") < 0){
	return {"no": 0, "count": 0};
    }
    hint = hint.replace(/.*#/, '');
    if(hint.length <= 0){
	return {"no": 0, "count": 0};
    }
    values = hint.split(",");
    return {"no": Number(values[0]), "count": Number(values[1])};
}

function LogMesureTime(prevURL){
    chrome.extension.sendRequest({"type": "MeasureStart", "prevURL": prevURL});
}

function GetCurrentURL(currentNumber){
    //var currentNumber = GetCurrentNumber();
    var urlList = GetURLList();
    if( urlList.length <= currentNumber.no ){
	return undefined;
    }
    //console.log("current.no", currentNumber.no);
    return urlList[currentNumber.no];
}

function IncrimentCurrentNumber(currentNumber){
    currentNumber.count += 1;
    if(currentNumber.count > maxCount){
	currentNumber.count = 0;
	currentNumber.no += 1;
    }
    //console.log(" ++ current.no", currentNumber.no);
    return currentNumber;
}

function GoNext(){
    currentNumber = GetCurrentNumber();
    var prevURL = GetCurrentURL(currentNumber);
    if(currentNumber.no != 0 || currentNumber.count != 0){
	LogMesureTime(prevURL.href);
    }
    currentNumber = IncrimentCurrentNumber(currentNumber);
    var nextURL = GetCurrentURL(currentNumber);
    if(!nextURL){
	console.log("all done!!!!");
	return;
    }
    UpdateURLHint(currentNumber.no, currentNumber.count);
    window.location.href = nextURL.href;
}

/*
(window.onload = function() {
    if(!isStartPage()){ return; }
    GoNext();
})();
*/
