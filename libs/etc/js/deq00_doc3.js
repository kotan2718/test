
function initialize() {
    // URLから選択すべきオプションを取得
    const urlParams = new URLSearchParams(window.location.search);
    const selectedOption = urlParams.get('selectedOption');

    // 解説ページから呼ばれたときは、以下を実行する
    if (selectedOption) {
        window.location.hash = selectedOption;
    }
}

