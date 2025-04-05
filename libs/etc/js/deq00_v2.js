
let selectedOption;


document.addEventListener('DOMContentLoaded', (event) => {
    // ローカルストレージから選択状態を取得
    const selectedValue = localStorage.getItem('kzDeq_SelectedType');
    const checkboxState = localStorage.getItem('kzDeq_StorageFlg') === 'true';

    if (selectedValue) {
        document.getElementById('type').value = selectedValue;
    }

    if (checkboxState) {
        document.getElementById('cb_storage').checked = true;
    }
});


function initialize() {
    // 描画範囲の初期化
    let width0 = parseFloat(document.getElementById('width0').value);
    let wmax = width0 / 2;
    let wmin = -wmax;
    document.getElementById('wmax').innerText = wmax;
    document.getElementById('wmin').innerText = wmin;

    // 現在表示されているurlを取得して、日本語ページか英語ページかの振り分けを行う
    const urlHere = window.location.href;

    //const selectType = document.getElementById('type');
    //selectType.selectedIndex = 4;
    changeType();

    const selectMode = document.getElementById('mode');
    selectMode.selectedIndex = 2;

    // URLから選択すべきオプションを取得
    const urlParams = new URLSearchParams(window.location.search);
    const selectedOptionRaw = urlParams.get('selectedOption');
    selectedOption = decodeURIComponent(selectedOptionRaw); // URLデコード

    // 解説ページから呼ばれたときは、以下を実行する
    // 選択すべきオプションが指定されている場合、そのオプションを選択し、changeType()関数を呼び出します
    if (selectedOption != "null") {
        // goBack関数を呼び出す
        goBack();
        
        const selectElement = document.getElementById('type');
        selectElement.value = selectedOption; // 選択肢を選択
        changeType(); // 選択肢が変更された場合の処理を実行
        if (selectedOption.substr(0, 5) != "09&09") {
            setTimeout(function() {
                startAnimation(); // 描画の実行
            }, 2000);
            document.getElementById("stop").focus();
            document.getElementById('start').disabled = true;
        }
        else {
            document.getElementById('dxdt').focus();
        }
    }
}

// 解説のページに戻る関数
function goBack() {
    // window.history.back(); // ブラウザの「戻る」ボタンと同じ動作 <- 戻る位置(行)が10行程度ずれることがある
    // <a>要素を作成
    var link = document.createElement('a');

    // 現在表示されているurlを取得して、日本語ページか英語ページかの振り分けを行う
    const urlHere = window.location.href;

    if (urlHere.indexOf('en') != -1) {
        // href属性を設定
        link.href = "etc_DEQ_doc2_en.html?selectedOption=" + encodeURIComponent(selectedOption);
        // テキストコンテンツを設定
        link.textContent = "return to Explanation page";
    }
    else {
        // href属性を設定
        link.href = "etc_DEQ_doc2.html?selectedOption=" + encodeURIComponent(selectedOption);
        // テキストコンテンツを設定
        link.textContent = "解説ページに戻る";
    }

    // <p>要素を取得し、リンクを追加
    var paragraphElement = document.querySelector('.cLink');
    paragraphElement.appendChild(link);
}


