

// 現在のページに HTML を追加します
function InjectHTML(html){
    $(document.body).append(html);
}

var WARNING_DOG_IMAGE_ID = "_WARNING_DOG_IMAGE_ID_HOGEHOGE_";
var DogImages = [
	"img/dog1.png"
	, "img/dog2.png"
	, "img/dog3.png"
	, "img/dog4.png"
	];
var DogSound = "img/ani_ge_dog_wan03.mp3";

// 危険だよとされる犬の画像を挿入します。
function InjectWarningDogPictures(){
    for( var i = 0; i < DogImages.length; i++){ 
	InjectHTML("<div class=\"INJECT_ABSOLUTE_IMAGE\" id=\"" + WARNING_DOG_IMAGE_ID + i + "\"><img src=\"" + chrome.extension.getURL(DogImages[i]) + "\"></div>");
	// クリックされたら消えるようにしておきます。
	$("#" + WARNING_DOG_IMAGE_ID + i).click(function(){$(this).hide();});
    }
}

// 真ん中に表示される「危険ですよ」の html を挿入します
function InjectWarningMessage(){
    InjectHTML("<div class=\"INJECT_MESSAGE\">WARNING: this page has obfuscate JavaScript code.<br>extension blocked contents.</div>");
    // クリックされたら消えるようにしておきます。
    $(".INJECT_MESSAGE").click(function(){$(this).hide();});
}

// 吠え声を鳴らします
function BowWow(){
    var audio = new Audio("");
    audio.src = chrome.extension.getURL(DogSound);
    audio.currentTime = 0;
    audio.play();
}

// img を新しく作って、犬画像のサイズ( {width: #, height: #} )を取得します
function GetWarningDogImageSize(id){
    var img = new Image();
    img.src = $(id).find("img").attr('src');

    var width = img.width;
    var height = img.height;

    return {"width": width, "height": height};
}

// num匹 の犬を画面に召喚します。
function CallWarningDog(num){
    var startPointList = [ 
	{  "x": -1, "y": 1.0 }
	, {"x": 1,  "y": 1.0 }
	, {"x": -1, "y": 0.5 }
	, {"x": 1,  "y": 0.5 }
	];

    var scrollLeft = $(document).scrollLeft();
    var windowWidth = $(window).width();
    var xCenter = scrollLeft + windowWidth / 2;
    var halfWidth = windowWidth / 2;
    var windowHeight = $(window).height();
    var halfHeight = windowHeight / 2;
    var yCenter = halfHeight;

    /*
    console.log("scrollLeft: ", scrollLeft
		, "xCenter:", xCenter
		, "halfWidth:", halfWidth
		, "yCenter:", yCenter
		, "halfHeight:", halfHeight
		, "windowWidth:", windowWidth
		);
     */

    if(num > 0){
	// 数が1以上なら吠え声を上げて
	BowWow();

	// 真ん中に warning 表示を出します
	$(".INJECT_MESSAGE").show();
    }else{
	// 数が 0以下なら真ん中に出ているであろう warning 表示 を消します
	$(".INJECT_MESSAGE").hide();
    }

    for(var i = 0; i < DogImages.length; i++){
	var targetID = WARNING_DOG_IMAGE_ID + i;
	var target = $("#" + targetID);
	if(i >= num){
	    // 必要ない犬の画像は消しておきます。
	    target.hide();
	    continue;
	}

	// display: none だと outerWidth() は取れません。
	//var targetWidth = target.outerWidth();
	//var targetHeight = target.outerHeight();
	// なので、とりあえず固定値で入れておきます。('A`)
	var targetWidth = 300;
	var targetHeight = 200;

	var point = startPointList[i];
	// まず画面外へ移動
	var x = 0;
	if(point.x > 0){
	    x = xCenter + point.x * halfWidth;
	}else{
	    x = xCenter + point.x * halfWidth - targetWidth;
	}
	var y = yCenter + point.y * halfHeight - targetHeight;
	target.css({left: x + "px", top: y + "px"});

	// 表示する
	target.show();
	// 画面内に入ってくる
	var newX = 0;
	if(point.x < 0){
	    newX = xCenter + point.x * halfWidth;
	}else{
	    newX = xCenter + point.x * halfWidth - targetWidth;
	}
	target.delay(Math.random() * 500).animate({left: newX}, 1000*2);
	//console.log("targetID:", targetID, "x:", x, "y:", y, "newX:", newX, "targeWidth:", targetWidth, "targetHeight:", targetHeight);
    }
}

// 必要なタグを挿入します
InjectWarningDogPictures();
InjectWarningMessage();

function main(){
    // CallWarningDog( # ) の呼び出しで 4匹 まで犬が召喚できます。
    // 呼び出された犬はクリックで消えます。
    CallWarningDog(4);
    
    setTimeout(function(){
	// CallWarningDog(0) で消せます。
	CallWarningDog(0);
    }, 1000*10);
}

main();

