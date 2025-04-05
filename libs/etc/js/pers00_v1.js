
let selectedOption;

document.addEventListener('DOMContentLoaded', (event) => {

    // list
    // ローカルストレージから選択状態を取得
    const selectedValue = localStorage.getItem('kzPers_SelectedType');
    const checkboxState = localStorage.getItem('kzPers_StorageFlg') === 'true';
    if (selectedValue) {
        document.getElementById('type').value = selectedValue;
    }
    if (checkboxState) {
        document.getElementById('pers_storage').checked = true;
    }
    // back color
    // ローカルストレージから選択状態を取得
    const backColorValue = localStorage.getItem('kzPers_BackColor');
    const backColorCBState = localStorage.getItem('kzPers_Storage2Flg') === 'true';
//    if (backColorValue) {
//        document.getElementById('kzPers_BackColor').value = backColorValue;
//    }
    if (backColorCBState) {
        document.getElementById('cb_bk_color').checked = true;
        bkColor = 'rgb(255, 255, 255)'
    }
    if (document.getElementById('cb_bk_color').checked == false) {
        ctx.fillStyle = 'rgb(0, 0, 0)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

});


function initialize() {
    // 現在表示されているurlを取得して、日本語ページか英語ページかの振り分けを行う
    const urlHere = window.location.href;
/*
    // 係数
    let ma = parseFloat(document.getElementById('ma').value);
    let mb = parseFloat(document.getElementById('mb').value);
    let mc = parseFloat(document.getElementById('mc').value);
    let md = parseFloat(document.getElementById('md').value);
    let me = parseFloat(document.getElementById('me').value);
    let mf = parseFloat(document.getElementById('mf').value);

    document.getElementById('ma').disabled = true;
    document.getElementById('mb').disabled = true;
    document.getElementById('mc').disabled = true;
    document.getElementById('md').disabled = true;
    document.getElementById('me').disabled = true;
    document.getElementById('mf').disabled = true;

    // 式を表示する
    document.getElementById('fxy').innerText = "$ f(x,y) = x^4 + xy - y^4 $";
    document.getElementById('where').innerText = "";

    // 描画アングルに初期値を設定する
    document.getElementById('angleAlpha').value =  30;
    document.getElementById('angleGamma').value = -30;
*/
//    $("#horizontal-slider").slider("value", 30);
//    $("#vertical-slider").slider("value", -30);

    // 選択ボックスの初期値を設定する
    //const selectType = document.getElementById('type');
    //selectType.selectedIndex = 0;
    changeType(0);

    // URLから選択すべきオプションを取得
    const urlParams = new URLSearchParams(window.location.search);
    const selectedOptionRaw = urlParams.get('selectedOption');
    selectedOption = decodeURIComponent(selectedOptionRaw); // URLデコード
/*
    // Resetボタンを使用不可に設定
    document.getElementById('reset').disabled = true;

    // メッシュ設定
    m_nx = 21;
    changeMesh();

    // 段落のマージンを設定する
    changeDivMargin(false);

    // 格子点数MAXのz値と、等高線探索の出発点を求める過程で、(見つからなかった)探索済みの格子点を格納する配列の初期化
    aryInit();
*/
    // 解説ページから呼ばれたときは、以下を実行する
    // 選択すべきオプションが指定されている場合、そのオプションを選択し、changeType()関数を呼び出します
    if (selectedOption != "null") {
        // goBack関数を呼び出す
        goBack();
        
        const selectElement = document.getElementById('type');
        selectElement.value = selectedOption; // 選択肢を選択
        changeType(0); // 選択肢が変更された場合の処理を実行
        if (selectedOption.substr(0, 2) != "09") {
            setTimeout(function() {
                startDraw(); // 描画の実行
            }, 2000);
            document.getElementById('start').disabled = true;
        }
        else {
            document.getElementById('fxy').focus();
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
        link.href = "etc_pers_doc1_en.html?selectedOption=" + encodeURIComponent(selectedOption);
        // テキストコンテンツを設定
        link.textContent = "return to Explanation page";
    }
    else {
        // href属性を設定
        link.href = "etc_pers_doc1.html?selectedOption=" + encodeURIComponent(selectedOption);
        // テキストコンテンツを設定
        link.textContent = "解説ページに戻る";
    }

    // <p>要素を取得し、リンクを追加
    var paragraphElement = document.querySelector('.cLink');
    paragraphElement.appendChild(link);
}

