
function initialize() {
    // URLから選択すべきオプションを取得
    const urlParams = new URLSearchParams(window.location.search);
    const selectedOptionRaw = urlParams.get('selectedOption');
    const selectedOption = decodeURIComponent(selectedOptionRaw); // URLデコード

    // 描画ページから呼ばれたときは、以下を実行する
    if (selectedOption != "null") {
        window.location.hash = selectedOption;
//        // 現在のスクロール位置を取得
//        const scrollPosition = window.pageYOffset;
//        window.scrollTo(scrollPosition, 5000);
    }
}

