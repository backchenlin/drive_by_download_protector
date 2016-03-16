# これは何

Drive by download を防ぐ chrome extension です。

詳しくは

難読化の特徴を用いたドライブバイダウンロード攻撃検知手法の設計と実装 藤原寛高 奈良先端科学技術大学院大学, 2015.3
https://library.naist.jp/mylimedio/search/av1.do?target=local&bibid=75689

等を参照。

# 導入方法

1. Google chrome ブラウザを起動
2. chrome://extensions/ を開く
3. 「デベロッパーモード」チェックボックスを ON にする
4. 「パッケージ化されていない拡張機能を読み込む……」を選択し、このファイルのあるフォルダを選択
5. Content Script Crawler が追加され、有効になっていれば起動している

# 起こること

Drive by download が検知されると、犬の絵や鳴き声が表示・再生され、注意を喚起します。


------
以下、開発者側へのコメント

# 時間計測の方法

時間計測は time_mesurment/top-100.html のようなHTMLを起点として
そのHTMLに記述されているURLに遷移して、戻ることによって計測される。
そこで、isStartPage() を使って起点ページなのか、それ以外のページなのかを判断し、
起点ページでなければ window.onload イベント(ページが読み込まれた後に発生するイベント)
からある程度の時間が経った後に元のページに戻り、
また指示されたページへと遷移してしばらくすると戻り、を繰り返すことによって
個々の時間を計測する事になる。
したがって、標準の使い方をする場合にはこの機能は邪魔となるので、
リリース時には window.onload イベントへの登録を行わないことで封印されている。

時間計測を行う時、具体的には以下の作業が必要となる。

1. Content Script Crawler を含めた全ての chrome extension を無効化する
  (Content Script Crawler 以外のものも無効化するのは、時間計測の妨げになる可能性があるものをできるだけ排除するため)
2. contentscript.js の一番下の行にあるコメントアウトされている window.onload イベントハンドラのコメントアウトを解除する
3. background.js 内部を "TIME_MESURE" で検索して出てくるコメントアウトを解除する
4. Content Script Crawler を有効化し、リロードする
5. Content Script Crawler のバックグラウンドページを表示する
6. 添付されている time_mesurement/top-100.html (か、それと同じようなHTML)を開く。
この時点で時間計測が開始されるのである程度の計測を行うまで放置する
7. 現在の計測されている時間を取得するには 5. で表示させたバックグラウンドページの console にて
ReportMesureData();
と入力することで、CSV形式の計測時間(単位は秒)が取得できる。

