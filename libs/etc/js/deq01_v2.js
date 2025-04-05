// Gloavbl 変数 //

// user define 関連
var formula_dx;
var formula_dy;
var formula_where;
var node_dx;
var node_dy;
var node_where;
let linerFlg = 0;   // 入力された連立微分方程式が線形(1)か非線形(0)か格納する
// 現在表示されているurlを取得して、日本語ページか英語ページかの振り分けを行う
let urlHere = window.location.href;

let max = 99999;
let eps = 0.01;
let dat = 1;
// 係数
let ma;
let mb;
let mc;
let md;
let me;
let mf;
let mg;
let mh;
// 係数使用可否
let ma_used = 1;
let mb_used = 1;
let mc_used = 1;
let md_used = 1;
let me_used = 0;
let mf_used = 0;
let mg_used = 0;
let mh_used = 0;
// 繰返し回数
cnt_dp = 320;
// 刻み幅(時間経過ステップ)
dh = 0.01;

// 近似方法 0: Euler法, 1: 修正Euler法, 2: runge-kutta法
let mode = 2;
//////////////////

let width0 = 8;
let height0 = 8;
const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');

// 描画領域をリセット
ctx.fillStyle = 'rgb( 0, 0, 0)';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// リセットフラグ 再描画の条件を設定する
let resetFlg = true;

// LocalStorage関連 (基本は非使用)
let kzDeq_StorageFlg = false;
//let kzDeq_StorageFlg;

async function animateGraph() {

    // 描画中に使用不可とするコントロール
    usability(false);

    // スケーリング
    let scaleX = canvas.width / width0;
    let scaleY = canvas.height / height0;

    let linePoints = [];
    let linePoints2 = [];
    // 64個の配列を初期化
    for (let i = 0; i < 64; i++) {
        linePoints.push([]);
        linePoints2.push([]);
    }

    //var dh = Math.sqrt(Math.pow((width0 / canvas.width), 2) + Math.pow((height0 / canvas.height), 2));
    var dt = 0.0;
    var dnt = 0.0;

    // Runge-Kutta法
    var Ru_dx = new Array(64);
    var Ru_dy = new Array(64);
    var Ru_dx_init = new Array(64);   // 全象限初期値格納位置
    var Ru_dy_init = new Array(64);
    var Ru_x0 = 0.0;
    var Ru_y0 = 0.0;
    var Ru_x0_init = new Array(16);   // 第1象限 初期値格納位置
    var Ru_y0_init = new Array(16);
    var Ru_kx = new Array(4);
    var Ru_ky = new Array(4);

    let Ru_r0;
    let Ru_x1;
    let Ru_y1;
    let Ru_r1;
    let Ru_u0;
    let Ru_v0;
    let Ru_u1;
    let Ru_v1;

    let Ru_hq;
    let Ru_dq;
    let pixelX;
    let pixelY;

    // 第1象限に16個の初期点を作る
    // 乱数使用
    var j = 0;
    for (let l = 0; l < 4; l++)
    {
        for (let m = 0; m < 4; m++)
        {
            Ru_x0_init[j] = l * (0.5 * width0 / 4.0) + (l + 1) * (0.5 * width0 / 4.0) * Math.random();
            Ru_y0_init[j] = m * (0.5 * height0 / 4.0) + (m + 1) * (0.5 * height0 / 4.0) * Math.random();
            j++;
        }
    }

    // x軸の描画
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2); // canvasの中心から左右に直線を引く
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.strokeStyle = 'rgb(155, 155, 155)';
    ctx.stroke();

    // y軸の描画
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0); // canvasの中心から上下に直線を引く
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.strokeStyle = 'rgb(155, 155, 155)';
    ctx.stroke();

    for (let k = 0; k < 2; k++) {
    //for (let k = 0; k < 1; k++) {
        // 第1象限から16個の初期点を取って、各象限にコピーする
        for (let j = 0; j < 16; j++)
        {
            Ru_dx[j] = Ru_x0_init[j]; // 第1象限
            Ru_dy[j] = Ru_y0_init[j];
            Ru_dx[j + 16] = -Ru_x0_init[j]; // 第2象限
            Ru_dy[j + 16] = Ru_y0_init[j];
            Ru_dx[j + 32] = -Ru_x0_init[j]; // 第3象限
            Ru_dy[j + 32] = -Ru_y0_init[j];
            Ru_dx[j + 48] = Ru_x0_init[j]; // 第4象限
            Ru_dy[j + 48] = -Ru_y0_init[j];
        }
        for (let i = 0; i < 64; i++) {
            Ru_dx_init[i] = Ru_dx[i];
            Ru_dy_init[i] = Ru_dy[i];
        }

        //// for debug start
        //Ru_dx[0] = 0.25;
        //Ru_dy[0] = 0.5;
        //Ru_dx[0] = 0.01;
        //Ru_dy[0] = 0.01;
        //Ru_dx[0] = 0.22857;
        //-//     Ru_dx[0] = 0.2365;
        //Ru_dx[0] = 0.02;
        //Ru_dy[0] = 0;
        //// for debug   end

        if (k == 1) {
            dh = -dh;
        }

        for (dp = 1; dp <= cnt_dp; dp++) {
            for (let i = 0; i < 64; i++) {
            //for (let i = 0; i < 1; i++) {

                Ru_x0 = Ru_dx[i];
                Ru_y0 = Ru_dy[i];
                dt = dnt;

                if (dp == 1) {
                    pixelX = scaleX * (Ru_dx[i] + width0 / 2);
                    pixelY = scaleY * (height0 / 2 - Ru_dy[i]);

                    if (k == 0) {
                        linePoints[i].push({ x: pixelX, y: pixelY });
                    }
                    else {
                        linePoints2[i].push({ x: pixelX, y: pixelY });
                    }
                }

                switch (mode)
                {
                    case 0:
                        ///////////////////
                        //               //
                        // Euler法       //
                        //               //
                        ///////////////////
                        if (Math.abs(Ru_x0) > Math.abs(width0) || Math.abs(Ru_y0) > Math.abs(height0)) {
                            continue;
                        }
                        Ru_r0 = Math.sqrt(Ru_x0 * Ru_x0 + Ru_y0 * Ru_y0);
                        Ru_u0 = FNF(dh, Ru_x0, Ru_y0) / Ru_r0;
                        Ru_v0 = FNG(dh, Ru_x0, Ru_y0) / Ru_r0;
                        Ru_dq = Math.sqrt(Ru_u0 * Ru_u0 + Ru_v0 * Ru_v0);
                        //Ru_dx[i] = Ru_x0 + FNF(dh, Ru_x0, Ru_y0) * dh;
                        //Ru_dy[i] = Ru_y0 + FNG(dh, Ru_x0, Ru_y0) * dh;
                        ////  Ru_dy[i] = Ru_y0 + FNG(dt, Ru_dx[i], Ru_y0) * dh;   // これありかなぁ？
                        //Ru_dx[i] = Ru_x0 + Ru_u * dh / Ru_q;
                        //Ru_dy[i] = Ru_y0 + Ru_v * dh / Ru_q;
                        Ru_dx[i] = Ru_x0 + Ru_u0 * dh;
                        Ru_dy[i] = Ru_y0 + Ru_v0 * dh;
                        if (Math.abs(Ru_dx[i]) > Math.abs(width0) || Math.abs(Ru_dy[i]) > Math.abs(height0)) {
                            //ovrRangeFlg = 1;
                            //break;
                            continue;
                        }
                        //if (Math.sqrt(Math.pow(Ru_dx[i] - Ru_x0, 2.0) + Math.pow(Ru_dy[i] - Ru_y0, 2.0)) < eps / 10.0) {  // 20230904 epsが0.01は小さすぎるか？
                        if (Math.sqrt(Math.pow(Ru_dx[i] - Ru_x0, 2) + Math.pow(Ru_dy[i] - Ru_y0, 2)) < Math.abs(width0) / 10000) {
                            //ovrRangeFlg = 1;
                            //break;
                            //continue;
                        }

                        break;

                    case 1:
                        /////////////////////
                        ////               //
                        //// 修正Euler法   //
                        ////               //
                        /////////////////////
                        if (Math.abs(Ru_x0) > Math.abs(width0) || Math.abs(Ru_y0) > Math.abs(height0)) {
                            continue;
                        }

                        //Ru_kx[0] = dh * FNF(dt, Ru_x0, Ru_y0);
                        //Ru_ky[0] = dh * FNG(dt, Ru_x0, Ru_y0);
                        //Ru_kx[1] = dh * FNF(dt + dh, Ru_x0 + Ru_kx[0], Ru_y0 + Ru_ky[0]);
                        //Ru_ky[1] = dh * FNG(dt + dh, Ru_x0 + Ru_kx[0], Ru_y0 + Ru_ky[0]);
                        //Ru_dx[i] = Ru_x0 + (Ru_kx[0] + Ru_kx[1] + Ru_kx[2]) / 2.0;
                        //Ru_dy[i] = Ru_y0 + (Ru_ky[0] + Ru_ky[1] + Ru_ky[2]) / 2.0;
                        dnt = dt + dh;
                        Ru_r0 = Math.sqrt(Ru_x0 * Ru_x0 + Ru_y0 * Ru_y0);
                        Ru_u0 = FNF(dh, Ru_x0, Ru_y0) / Ru_r0;
                        Ru_v0 = FNG(dh, Ru_x0, Ru_y0) / Ru_r0;
                        Ru_dq = Math.sqrt(Ru_u0 * Ru_u0 + Ru_v0 * Ru_v0);

                        Ru_u1 = Ru_x0 + 0.5 * Ru_u0 * dh;// Ru_hq;
                        Ru_v1 = Ru_y0 + 0.5 * Ru_v0 * dh;// Ru_hq;
                        Ru_r1 = Math.sqrt(Ru_u1 * Ru_u1 + Ru_v1 * Ru_v1);
                        Ru_x1 = FNF(dh, Ru_u1, Ru_v1) / Ru_r1;
                        Ru_y1 = FNG(dh, Ru_u1, Ru_v1) / Ru_r1;
                        Ru_dx[i] = Ru_x0 + Ru_x1 * dh;// Ru_hq;
                        Ru_dy[i] = Ru_y0 + Ru_y1 * dh;// Ru_hq;
                        if (Math.abs(Ru_dx[i]) > Math.abs(width0) || Math.abs(Ru_dy[i]) > Math.abs(height0)) {
                            //ovrRangeFlg = 1;
                            //break;
                            continue;
                        }
                        //if (Math.sqrt(Math.pow(Ru_dx[i] - Ru_x0, 2.0) + Math.pow(Ru_dy[i] - Ru_y0, 2.0)) < eps / 10.0) {  // 20230904 epsが0.01は小さすぎるか？
                        if (Math.sqrt(Math.pow(Ru_dx[i] - Ru_x0, 2) + Math.pow(Ru_dy[i] - Ru_y0, 2)) < Math.abs(width0) / 10000) {
                            //ovrRangeFlg = 1;
                            //break;
                            //continue;
                        }

                        break;

                    case 2:
                        ///////////////////
                        //               //
                        // Runge-Kutta法 //
                        //               //
                        ///////////////////

                        Ru_kx[0] = dh * FNF(dt, Ru_x0, Ru_y0);
                        Ru_ky[0] = dh * FNG(dt, Ru_x0, Ru_y0);
                        Ru_kx[1] = dh * FNF(dt + dh / 2.0, Ru_x0 + Ru_kx[0] / 2.0, Ru_y0 + Ru_ky[0] / 2.0);
                        Ru_ky[1] = dh * FNG(dt + dh / 2.0, Ru_x0 + Ru_kx[0] / 2.0, Ru_y0 + Ru_ky[0] / 2.0);
                        Ru_kx[2] = dh * FNF(dt + dh / 2.0, Ru_x0 + Ru_kx[1] / 2.0, Ru_y0 + Ru_ky[1] / 2.0);
                        Ru_ky[2] = dh * FNG(dt + dh / 2.0, Ru_x0 + Ru_kx[1] / 2.0, Ru_y0 + Ru_ky[1] / 2.0);
                        Ru_kx[3] = dh * FNF(dt + dh, Ru_x0 + Ru_kx[2], Ru_y0 + Ru_ky[2]);
                        Ru_ky[3] = dh * FNG(dt + dh, Ru_x0 + Ru_kx[2], Ru_y0 + Ru_ky[2]);

                        if (Math.abs(Ru_x0) > Math.abs(width0) || Math.abs(Ru_y0) > Math.abs(height0)) {
                            continue;
                        }

                        if (Math.abs(Ru_kx[3]) > max || Math.abs(Ru_ky[3]) > max) {
                            //ovrRangeFlg = 1;
                            //break;
                            continue;
                        }

                        Ru_dx[i] = Ru_x0 + (Ru_kx[0] + 2.0 * Ru_kx[1] + 2.0 * Ru_kx[2] + Ru_kx[3]) / 6.0;
                        Ru_dy[i] = Ru_y0 + (Ru_ky[0] + 2.0 * Ru_ky[1] + 2.0 * Ru_ky[2] + Ru_ky[3]) / 6.0;
                        dnt = dt + dh;

                        if (Math.abs(Ru_dx[i]) > Math.abs(width0) || Math.abs(Ru_dy[i]) > Math.abs(height0)) {
                            //ovrRangeFlg = 1;
                            //break;
                            continue;
                        }
                        //if (Math.sqrt(Math.pow(Ru_dx[i] - Ru_x0, 2.0) + Math.pow(Ru_dy[i] - Ru_y0, 2.0)) < eps / 10.0) {  // 20230904 epsが0.01は小さすぎるか？
                        if (Math.sqrt(Math.pow(Ru_dx[i] - Ru_x0, 2) + Math.pow(Ru_dy[i] - Ru_y0, 2)) < Math.abs(width0) / 10000) {
                            //ovrRangeFlg = 1;
                            //break;
                            //continue;
                        }
                        break;

                    default:
                        break;
                }

                //const y = a * x * x + b;
                pixelX = scaleX * (Ru_dx[i] + width0 / 2);
                pixelY = scaleY * (height0 / 2 - Ru_dy[i]);

                if (k == 0) {
                    linePoints[i].push({ x: pixelX, y: pixelY });
                }
                else {
                    linePoints2[i].push({ x: pixelX, y: pixelY });
                }

                // Draw the lines
                if (k == 0) {
                    ctx.beginPath();
                    ctx.moveTo(linePoints[i][0].x, linePoints[i][0].y);
                    for (const point of linePoints[i]) {
                        ctx.lineTo(point.x, point.y);
                    }
                    ctx.strokeStyle = 'rgb(100, 149, 237)';
                    ctx.stroke();
                }
                else {
                    ctx.beginPath();
                    ctx.moveTo(linePoints2[i][0].x, linePoints2[i][0].y);
                    for (const point of linePoints2[i]) {
                        ctx.lineTo(point.x, point.y);
                    }
                    ctx.strokeStyle = 'rgb(200, 200, 55)';
                    ctx.stroke();
                }

                //if (dp % baisoku == 0) // 倍速設定  ここで描画ステップを定義することができる 20230904
                if (dp % 20 == 0) { // 倍速設定
                    await new Promise(resolve => setTimeout(resolve, 0)); // Wait for 10 milliseconds
                }
            }
        }
    }
    for (let i = 0; i < 64; i++) {
        // Draw the point
        pixelX = scaleX * (Ru_dx_init[i] + width0 / 2);
        pixelY = scaleY * (height0 / 2 - Ru_dy_init[i]);
        ctx.beginPath();
        ctx.arc(pixelX, pixelY, 2, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
    }
    
    //円周を描く
    const type = String(document.getElementById('type').value);
    const typeAry = type.split('&');
    switch (typeAry[0]) {
        case "04":  // 自励形の諸例
            switch (typeAry[1]) {
                case "02":  // 円周上に8つの平衡点を持つ自励形
                    pixelX = scaleX * (width0 / 2);
                    pixelY = scaleY * (height0 / 2);
                    ctx.beginPath();
                    ctx.arc(pixelX, pixelY, scaleX * Math.sqrt(ma), 0, 2 * Math.PI);
                    ctx.strokeStyle = 'rgb(155, 155, 155)';
                    ctx.stroke();
                    break;
                default:
                    break;
            }
            break;
        default:
            break;
    }

    // 描画後に使用可とするコントロール
    usability(true);
}

// コントロールの使用可否 : 描画中, それ以外の場合
function usability(flg)
{
    // 使用可否属性がdisabledしかないので、trueとfalseが逆になる
    if (flg == true) {
        flg = false;
    }
    else {
        flg = true;
    }
    document.getElementById('type').disabled = flg;
        if (ma_used == 1) {
            document.getElementById('ma').disabled = flg;
        }
        else {
            document.getElementById('ma').disabled = true;
            }
        if (mb_used == 1) {
            document.getElementById('mb').disabled = flg;
        }
        else {
            document.getElementById('mb').disabled = true;
        }
        if (mc_used == 1) {
            document.getElementById('mc').disabled = flg;
        }
        else {
            document.getElementById('mc').disabled = true;
        }
        if (md_used == 1) {
            document.getElementById('md').disabled = flg;
        }
        else {
            document.getElementById('md').disabled = true;
        }
        if (me_used == 1) {
            document.getElementById('me').disabled = flg;
        }
        else {
            document.getElementById('me').disabled = true;
        }
        if (mf_used == 1) {
            document.getElementById('mf').disabled = flg;
        }
        else {
            document.getElementById('mf').disabled = true;
        }
        if (mg_used == 1) {
            document.getElementById('mg').disabled = flg;
        }
        else {
            document.getElementById('mg').disabled = true;
        }
        if (mh_used == 1) {
            document.getElementById('mh').disabled = flg;
        }
        else {
            document.getElementById('mh').disabled = true;
        }
    document.getElementById('width0').disabled = flg;
    document.getElementById('dh').disabled = flg;
    document.getElementById('cnt_dp').disabled = flg;
    document.getElementById('start').disabled = flg;

    // 逆になったtrueとfalseを元に戻す
    if (flg == true) {
        flg = false;
    }
    else {
        flg = true;
    }
    // Stopボタンだけは動きが逆になる
    document.getElementById('stop').disabled = flg;
}

function startAnimation() {
    ma = parseFloat(document.getElementById('ma').value);
    mb = parseFloat(document.getElementById('mb').value);
    mc = parseFloat(document.getElementById('mc').value);
    md = parseFloat(document.getElementById('md').value);
    me = parseFloat(document.getElementById('me').value);
    mf = parseFloat(document.getElementById('mf').value);
    mg = parseFloat(document.getElementById('mg').value);
    mh = parseFloat(document.getElementById('mh').value);
    dh = parseFloat(document.getElementById('dh').value);

    if (dat == 99) {
        var errorMessages = document.getElementById('errorMessages');
        // 20240513 add for user definition
        formula_dx = document.getElementById('dxdt').value;
        formula_dy = document.getElementById('dydt').value;
        formula_where = document.getElementById('dxdy_where').value;
        dx.innerHTML = '';
        dy.innerHTML = '';
        where.innerHTML = '';
        errorMessages.innerHTML = '';
        
        let ngFlg;
        ngFlg = checkSubFunction(ngFlg);
        if (ngFlg == true) {
            errorMessages.innerHTML += '<p>Error in : where</p>';
            return;
        }

        // 入力された方程式(右辺)に数字(ただし、1～9)が含まれていないかつxもyも含まれていない場合をチェック
        if (containsNumbers(formula_dx) == false && formula_dx.indexOf('x') == -1 && formula_dx.indexOf('y') == -1) {
            errorMessages.innerHTML += '<p>Error in : dx/dt</p>';
            return;
        }
        if (containsNumbers(formula_dy) == false && formula_dy.indexOf('x') == -1 && formula_dy.indexOf('y') == -1) {
            errorMessages.innerHTML += '<p>Error in : dy/dt</p>';
            return;
        }

        // 数式であるか判定し、NGの場合はメッセージを表示して、終了する
        try {
            node_dx = math.parse(formula_dx);
        } catch (error) {
            errorMessages.innerHTML += '<p>Error in dx/dt</p>';
            return;
        }
        try {
            node_dy = math.parse(formula_dy);
        } catch (error) {
            errorMessages.innerHTML += '<p>Error in dy/dt</p>';
            return;
        }
        try {
            node_where = math.parse(formula_where);
        } catch (error) {
            errorMessages.innerHTML += '<p>Error in where</p>';
            return;
        }

        // 入力された式が線形か非線形かを判定する
        checkLinearity();

        // 式を表示する
        node_dx = math.parse(formula_dx);
        node_dy = math.parse(formula_dy);
        node_where = math.parse(formula_where);
        errorMessages.innerHTML = '';

        var dxTex = "\\frac{dx}{dt} &=& " + node_dx.toTex();
        var dyTex = "\\frac{dy}{dt} &=& " + node_dy.toTex();
        var whereTex = "r = " + node_where.toTex();

        // "\cdot" を削除する
        //dxTex = dxTex.replace(/\\cdot/g, "");
        //dyTex = dyTex.replace(/\\cdot/g, "");
        //whereTex = whereTex.replace(/\\cdot/g, "");

        // 長い式を分割
        var maxLineLength = 40; // 最大文字数（調整可能）
        let splitDxTex;
        let splitDyTex;
//        var splitDxTex = splitLongTex(dxTex, maxLineLength);
        if (dxTex.length > 120) {
            splitDxTex = splitLongTex(dxTex, maxLineLength);
        }
        else {
            splitDxTex = dxTex;
        }
//        var splitDyTex = splitLongTex(dyTex, maxLineLength);
        if (dyTex.length > 120) {
            splitDyTex = splitLongTex(dyTex, maxLineLength);
        }
        else {
            splitDyTex = dyTex;
        }

        document.getElementById('dx').innerHTML = "\\[ \\begin{eqnarray*}" + splitDxTex + "\\end{eqnarray*} \\]";
        document.getElementById('dy').innerHTML = "\\[ \\begin{eqnarray*}" + splitDyTex + "\\end{eqnarray*} \\]";
        console.log("\\[ \\begin{eqnarray*}" + splitDxTex + "\\end{eqnarray*} \\]");
        if (whereTex == "r = undefined") {
            document.getElementById('where').innerHTML = "$\\;$ where, $\\;r = $ unused";
        }
        else {
            document.getElementById('where').innerHTML = "$\\;$ where, $\\;" + whereTex + "$";
        }
    }
    width0 = parseFloat(document.getElementById('width0').value) || width0;
    height0 = parseFloat(document.getElementById('width0').value) || width0;
    cnt_dp = parseInt(document.getElementById('cnt_dp').value) || width0;

    // 固有値を求める
    // ラベルを一度非表示にする
    document.getElementById('lambda').style.visibility ="hidden";
    document.getElementById('KAI1').style.visibility ="hidden";
    document.getElementById('pm').style.visibility ="hidden";
    document.getElementById('KAI2').style.visibility ="hidden";

    // 以下はtype = 1 の場合、或いはユーザー入力で線形の場合のみ実行
    if (dat == 1 || (dat == 99 && linerFlg == 1)) {

            // 現在表示されているurlを取得して、日本語ページか英語ページかの振り分けを行う
            if (urlHere.indexOf('en') != -1) {
                // ラベル「固有値」を表示する
                document.getElementById('koyu').innerText = "Eigenvalues";
            }
            else {
                // ラベル「固有値」を表示する
                document.getElementById('koyu').innerText = "固有値";
            }
        document.getElementById('koyu').style.visibility ="visible";
        document.getElementById('lambda').style.visibility ="visible";

        // 判別式
        const han = (ma + md) * (ma + md) - 4 * (ma * md - mb * mc);
        const han2 = ma + md;
        // 解を求める
        let kaiA = ((ma + md) - Math.sqrt(han)) / 2;
        let kaiB = Math.sqrt(Math.abs(han)) / 2;
        // 重根
        if (han == 0) {
            document.getElementById('KAI1').innerText = kaiA;
            document.getElementById('KAI1').style.visibility ="visible";
        }
        if (han > 0) {
            kaiA = (ma + md) / 2;
                document.getElementById('pm').style.visibility ="visible";
                document.getElementById('KAI1').innerText = kaiA;
                document.getElementById('KAI2').innerText = kaiB;
                document.getElementById('KAI1').style.visibility ="visible";
                document.getElementById('KAI2').style.visibility ="visible";
        }
        if (han < 0) {
            // 純虚数根
            if (han2 == 0) {
                document.getElementById('pm').style.visibility ="visible";
                document.getElementById('KAI2').innerText = String(kaiB) + "i";
                document.getElementById('KAI2').style.visibility ="visible";
            }
            else {
            // 実部と虚部を持つ根
                kaiA = (ma + md) / 2;
                document.getElementById('pm').style.visibility ="visible";
                document.getElementById('KAI1').innerText = kaiA;
                document.getElementById('KAI2').innerText = String(kaiB) + "i";
                document.getElementById('KAI1').style.visibility ="visible";
                document.getElementById('KAI2').style.visibility ="visible";
            }
        }
    }
    // 描画領域をリセット
    if (resetFlg == true) {
        ctx.fillStyle = 'rgb( 0, 0, 0)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    // 他の処理が終わった後にMathJaxを再度実行する
    TeX();
    
    // 描画の実行
    animateGraph();
}

// リセットフラグ
function handleCheckbox(flg) {
    if (flg) {
        resetFlg = true;
    } else {
        resetFlg = false;
    }
}

// ストレージフラグ
function handleCheckboxStorage(flg) {
    kzDeq_StorageFlg = flg;
    localStorage.setItem('kzDeq_StorageFlg', flg);
    if (!flg) {
        localStorage.removeItem('kzDeq_SelectedType');
        localStorage.removeItem('kzDeq_StorageFlg'); // フラグを削除

    }
}

// 途中中断処理
function stopAnimation() {
    cnt_dp = dp - 1;
    document.getElementById('stop').disabled = true;
}

function updateRange() {
    const width0 = parseFloat(document.getElementById('width0').value);
    const wmax = width0 / 2;
    const wmin = -wmax;
    document.getElementById('wmax').innerText = wmax;
    document.getElementById('wmin').innerText = wmin;
}

function setRange() {
    document.getElementById('width0').value = 8;
    document.getElementById('cnt_dp').value = 320;
    document.getElementById('dh').value = 0.01;
    updateRange();
}

// 計算モード指定
function changeMode() {
    const calc = String(document.getElementById('mode').value);
    switch (calc) {
        case "1":  // Euler法
            mode = 0;
            break;
        case "2":  // 修正Euler法
            mode = 1;
            break;
        case "3":  // Runge-Kutta法
            mode = 2;
            break;
        default:
            break;
    }
}
/*
// 解説のページに戻る関数 <- deq00_v2.jsへ移動
function goBack() {
  window.history.back(); // ブラウザの「戻る」ボタンと同じ動作
}
*/

function changeType() {
    const type = String(document.getElementById('type').value);

    // ここでチェックボックスの状態を確認し、ストレージフラグを更新
    kzDeq_StorageFlg = document.getElementById('cb_storage').checked;

    if (kzDeq_StorageFlg == true) {
        // 選択状態をローカルストレージに保存
        localStorage.setItem('kzDeq_SelectedType', type);
    }

    const typeAry = type.split('&');

    const selectMode = document.getElementById('mode');

    document.getElementById('where').innerText = "";

    // 係数入力ボックスを表示する
    dispCoef(1);

    // 方程式入力ボックスを表示する
    dispFormula(0);

    switch (typeAry[0]) {
        case "01":  // 2次元1次線形自励系
            selectMode.selectedIndex = 2;
            mode = 2;
            dat = 1;
            switch (typeAry[1]) {
                case "01":  // 固有値の1つが0の場合
                    changeProperty(0);
                    document.getElementById('ma').value = 1;
                    document.getElementById('mb').value = 1;
                    document.getElementById('mc').value = 2;
                    document.getElementById('md').value = 2;
                    setRange();
                    break;
                case "02":  // λ1 < 0 < λ2 (鞍状点)
                    changeProperty(0);
                    document.getElementById('ma').value = -2;
                    document.getElementById('mb').value = 2;
                    document.getElementById('mc').value = -2;
                    document.getElementById('md').value = 3;
                    setRange();
                    break;
                case "03":  // 0 < λ1 < λ2 (不安定結節点)
                    changeProperty(0);
                    document.getElementById('ma').value = 1;
                    document.getElementById('mb').value = 0;
                    document.getElementById('mc').value = 3;
                    document.getElementById('md').value = 2;
                    setRange();
                    break;
                case "04":  // 0 < λ1 < λ2 (1)
                    changeProperty(0);
                    document.getElementById('ma').value = 1;
                    document.getElementById('mb').value = 0;
                    document.getElementById('mc').value = 0;
                    document.getElementById('md').value = 2;
                    setRange();
                    break;
                case "05":  // λ1 < λ2 < 0 (安定結節点)
                    changeProperty(0);
                    document.getElementById('ma').value = -4;
                    document.getElementById('mb').value = -3;
                    document.getElementById('mc').value = 2;
                    document.getElementById('md').value = -11;
                    setRange();
                    break;
                case "06":  // 重複する固有値  > 0 かつ 行列Aが対角化可能の場合 (不安定退化結節点)
                    changeProperty(0);
                    document.getElementById('ma').value = 2;
                    document.getElementById('mb').value = 0;
                    document.getElementById('mc').value = 0;
                    document.getElementById('md').value = 2;
                    setRange();
                    break;
                case "07":  // 固有値 λが重根で、行列Aが対角化不可能な場合
                    changeProperty(0);
                    document.getElementById('ma').value = 2;
                    document.getElementById('mb').value = 1;
                    document.getElementById('mc').value = 0;
                    document.getElementById('md').value = 2;
                    setRange();
                    break;
                case "08":  // 固有値 λが純虚数の場合
                    changeProperty(0);
                    document.getElementById('ma').value = 1;
                    document.getElementById('mb').value = 2;
                    document.getElementById('mc').value = -1;
                    document.getElementById('md').value = -1;
                    setRange();
                    break;
                case "09":  // 固有値 λが実部と虚部を持つ場合
                    changeProperty(0);
                    document.getElementById('ma').value = -1;
                    document.getElementById('mb').value = -1;
                    document.getElementById('mc').value = 2;
                    document.getElementById('md').value = -1;
                    setRange();
                    break;
                defaut:
                    break;
            }
            document.getElementById('ma').disabled = false;
            document.getElementById('mb').disabled = false;
            document.getElementById('mc').disabled = false;
            document.getElementById('md').disabled = false;
            ma_used = 1;
            mb_used = 1;
            mc_used = 1;
            md_used = 1;
            // 現在表示されているurlを取得して、日本語ページか英語ページかの振り分けを行う
            if (urlHere.indexOf('en') != -1) {
                // ラベル「固有値」を表示する
                document.getElementById('koyu').innerText = "Eigenvalues";
            }
            else {
                // ラベル「固有値」を表示する
                document.getElementById('koyu').innerText = "固有値";
            }
            // 式を表示する
            document.getElementById('dx').innerText = "\\[ \\frac{dx}{dt} = ax + by \\]";
            document.getElementById('dy').innerText = "\\[ \\frac{dy}{dt} = cx + dy \\]";

            // 段落のマージンを設定する
            changeDivMargin(true);
            break;

        case "02":  // 2次元2次線形自励系
            selectMode.selectedIndex = 2;
            mode = 2;
            dat = 2;
            switch (typeAry[1]) {
                case "01":  // 結節峠点型
                    changeProperty(0);
                    document.getElementById('ma').value = 1;
                    document.getElementById('mb').value = 0;
                    document.getElementById('mc').value = 0;
                    document.getElementById('md').value = 2;
                    document.getElementById('me').value = -4;
                    document.getElementById('mf').value = 2;
                    setRange();
                    document.getElementById('cnt_dp').value = 1280;
                    break;
                case "02":  // 退化結節峠点型
                    changeProperty(0);
                    document.getElementById('ma').value = 4;
                    document.getElementById('mb').value = 0;
                    document.getElementById('mc').value = 0;
                    document.getElementById('md').value = 1;
                    document.getElementById('me').value = 0;
                    document.getElementById('mf').value = 4;
                    setRange();
                    document.getElementById('cnt_dp').value = 1280;
                    document.getElementById('dh').value = 0.004;
                    break;
                case "03":  // 双楕円型
                    changeProperty(0);
                    document.getElementById('ma').value = -1;
                    document.getElementById('mb').value = 0;
                    document.getElementById('mc').value = 1;
                    document.getElementById('md').value = 0;
                    document.getElementById('me').value = -2;
                    document.getElementById('mf').value = 0;
                    setRange();
                    break;
                case "04":  // 3峠型
                    changeProperty(0);
                    document.getElementById('ma').value = 1;
                    document.getElementById('mb').value = 0;
                    document.getElementById('mc').value = -1;
                    document.getElementById('md').value = 0;
                    document.getElementById('me').value = -2;
                    document.getElementById('mf').value = 0;
                    setRange();
                    break;
                case "05":  // 退化結節峠点型
                    changeProperty(0);
                    document.getElementById('ma').value = -1;
                    document.getElementById('mb').value = 0;
                    document.getElementById('mc').value = 0;
                    document.getElementById('md').value = 0;
                    document.getElementById('me').value = 0;
                    document.getElementById('mf').value = 1;
                    setRange();
                    break;
                case "06":  // 放物型角領域
                    changeProperty(0);
                    document.getElementById('ma').value = 0;
                    document.getElementById('mb').value = 0;
                    document.getElementById('mc').value = -1;
                    document.getElementById('md').value = 1;
                    document.getElementById('me').value = 0;
                    document.getElementById('mf').value = 0;
                    setRange();
                    document.getElementById('cnt_dp').value = 1280;
                    break;
                defaut:
                    break;
            }
            document.getElementById('ma').disabled = false;
            document.getElementById('mb').disabled = false;
            document.getElementById('mc').disabled = false;
            document.getElementById('md').disabled = false;
            document.getElementById('me').disabled = false;
            document.getElementById('mf').disabled = false;
            document.getElementById('mg').disabled = true;
            document.getElementById('mh').disabled = true;
            ma_used = 1;
            mb_used = 1;
            mc_used = 1;
            md_used = 1;
            me_used = 1;
            mf_used = 1;
            // ラベル「固有値」は非表示にする
            document.getElementById('koyu').innerText = "";
            // 式を表示する
            document.getElementById('dx').innerText = "\\[ \\frac{dx}{dt} = ax^2 + bxy + cy^2 \\]";
            document.getElementById('dy').innerText = "\\[ \\frac{dy}{dt} = dx^2 + exy + fy^2 \\]";

            // 段落のマージンを設定する
            changeDivMargin(true);
            break;

        case "03":  // 高次の自励系
            selectMode.selectedIndex = 2;
            mode = 2;
            switch (typeAry[1]) {
                case "01":  // 周期解を持つ同次自励形
                    dat = 31;
                    changeProperty(0);
                    // 式を表示する
                    document.getElementById('dx').innerText = "\\[ \\frac{dx}{dt} = -y^3 \\]";
                    document.getElementById('dy').innerText = "\\[ \\frac{dy}{dt} = x^3 \\]";
                    setRange();
                    break;
                case "02":  // 8つの放物型角領域を持つ同次自励形
                    dat = 32;
                    changeProperty(0);
                    // 式を表示する
                    document.getElementById('dx').innerText = "\\[ \\frac{dx}{dt} = x^3 \\]";
                    document.getElementById('dy').innerText = "\\[ \\frac{dy}{dt} = y^3 \\]";
                    //document.getElementById('width0').value = 32;
                    document.getElementById('cnt_dp').value = 1280;
                    //document.getElementById('dh').value = 0.001;
                    //updateRange();
                    selectMode.selectedIndex = 0;
                    mode = 0;
                    break;
                case "03":  // 複合角領域を持つ同次自励形
                    dat = 33;
                    changeProperty(0);
                    // 式を表示する
                    document.getElementById('dx').innerText = "\\[ \\frac{dx}{dt} = x^2(y - x) \\]";
                    document.getElementById('dy').innerText = "\\[ \\frac{dy}{dt} = y^2(y - 2x) \\]";
                    setRange();
                    //document.getElementById('width0').value = 64;
                    document.getElementById('cnt_dp').value = 1280;
                    //document.getElementById('dh').value = 0.00005;
                    //updateRange();
                    selectMode.selectedIndex = 1;
                    mode = 1;
                    break;
                case "04":  // Vinograd(ヴィノグラード)の自励形
                    dat = 34;
                    changeProperty(0);
                    // 式を表示する
                    document.getElementById('dx').innerText = "\\[ \\frac{dx}{dt} = x^2(y - x) + y^5 \\]";
                    document.getElementById('dy').innerText = "\\[ \\frac{dy}{dt} = y^2(y - 2x) \\]";
                    setRange();
                    document.getElementById('width0').value = 4;
                    document.getElementById('cnt_dp').value = 1280;
                    document.getElementById('dh').value = 0.01;
                    updateRange();
                    break;
                defaut:
                    break;
            }

            // 段落のマージンを設定する
            changeDivMargin(true);

            // ラベル「固有値」は非表示にする
            document.getElementById('koyu').innerText = "";
            break;
        case "04":  // 非線形の自励系
            selectMode.selectedIndex = 2;
            mode = 2;
            switch (typeAry[1]) {
                case "01":  // その1 pπ, P = +/-1, +/-2...に平衡点を持つ
                    dat = 41;
                    changeProperty(0);
                    // 式を表示する
                    document.getElementById('dx').innerText = "\\[ \\frac{dx}{dt} = y \\]";
                    document.getElementById('dy').innerText = "\\[ \\frac{dy}{dt} = \\sin x + y^3 \\]";
                    document.getElementById('width0').value = 12.8;
                    document.getElementById('cnt_dp').value = 1280;
                    document.getElementById('dh').value = 0.1;
                    updateRange();
                    break;
                case "02":  // その2 円周上に8つの平衡点を持つ
                    dat = 42;
                    changeProperty(0);
                    document.getElementById('ma').value = 4;
                    // 式を表示する
                    document.getElementById('dx').innerText = "\\[ \\frac{dx}{dt} = x^2y^2 - 1 \\]";
                    document.getElementById('dy').innerText = "\\[ \\frac{dy}{dt} = x^2 + y^2 - a \\]";
                    setRange();
                    document.getElementById('width0').value = 8;
                    document.getElementById('cnt_dp').value = 1280;
                    document.getElementById('dh').value = 0.01;
                    document.getElementById('ma').disabled = false;
                    ma_used = 1;
                    break;
                case "03":  // その3 平面上に規則的な平衡点を持つ自励形
                    dat = 43;
                    changeProperty(0);
                    // 式を表示する
                    document.getElementById('dx').innerText = "\\[ \\frac{dx}{dt} = \\cos x + \\cos y \\]";
                    document.getElementById('dy').innerText = "\\[ \\frac{dy}{dt} = \\sin x \\sin y \\]";
                    document.getElementById('width0').value = 25.6;
                    document.getElementById('cnt_dp').value = 320;
                    document.getElementById('dh').value = 0.5;
                    updateRange();
                    break;
                case "04":  // 極限円の例1
                    dat = 44;
                    changeProperty(0);
                    document.getElementById('ma').value = 1;
                    document.getElementById('mb').value = 1;
                    document.getElementById('mc').value = -1;
                    document.getElementById('md').value = 1;
                    // 式を表示する
                    document.getElementById('dx').innerText = "\\[ \\frac{dx}{dt} = ay + bx(1 - x^2 - y^2) \\]";
                    document.getElementById('dy').innerText = "\\[ \\frac{dy}{dt} = cx + dy(1 - x^2 - y^2) \\]";
                    setRange();
                    document.getElementById('width0').value = 4;
                    document.getElementById('cnt_dp').value = 640;
                    document.getElementById('dh').value = 0.01;
                    updateRange();
                    document.getElementById('ma').disabled = false;
                    document.getElementById('mb').disabled = false;
                    document.getElementById('mc').disabled = false;
                    document.getElementById('md').disabled = false;
                    ma_used = 1;
                    mb_used = 1;
                    mc_used = 1;
                    md_used = 1;
                    break;
                case "05":  // 極限円の例2 von del Polの自励形
                    dat = 45;
                    changeProperty(0);
                    document.getElementById('ma').value = 1;
                    // 式を表示する
                    document.getElementById('dx').innerText = "\\[ \\frac{dx}{dt} = y \\]";
                    document.getElementById('dy').innerText = "\\[ \\frac{dy}{dt} = -x + ay(1 - x^2) \\]";
                    setRange();
                    document.getElementById('width0').value = 6.4;
                    document.getElementById('cnt_dp').value = 1280;
                    document.getElementById('dh').value = 0.01;
                    document.getElementById('ma').disabled = false;
                    ma_used = 1;
                    updateRange();
                    break;
                case "06":  // 極限軌道の例 3 Lemniscate(レムニスケート)
                    dat = 46;
                    changeProperty(0);
                    document.getElementById('ma').value = 1;
                    document.getElementById('mb').value = 1;
                    document.getElementById('mc').value = -1;

                    selectMode.selectedIndex = 1;   // 修正Euler法を使用
                    mode = 1;

                    // 式を表示する
                    document.getElementById('dx').innerText = "\\[ \\frac{dx}{dt} = a \\cdot y(1 + 2x^2 + 2y^2) \\]";
                      document.getElementById('dy').innerText = "\\begin{eqnarray*}" +
                                   "\\frac{dy}{dt} &=& b \\cdot x(1 - 2x^2 - 2y^2) \\\\" +
                                   "& & {} + c \\cdot y(1 + 2x^2 + 2y^2)((x^2 + y^2)^2 - (x^2 - y^2)) \\\\" +
                                   "\\end{eqnarray*}";

                    setRange();
                    document.getElementById('width0').value = 3.2;
                    document.getElementById('cnt_dp').value = 1280;
                    document.getElementById('dh').value = 0.003;
                    document.getElementById('ma').disabled = false;
                    document.getElementById('mb').disabled = false;
                    document.getElementById('mc').disabled = false;
                    ma_used = 1;
                    mb_used = 1;
                    mc_used = 1;
                    updateRange();
                    break;
                case "07":  // 極限軌道の例 4 純虚固有値の場合 1
                    dat = 47;
                    changeProperty(0);
                    // 式を表示する
                    document.getElementById('dx').innerText = "\\[ \\frac{dx}{dt} = y \\]";
                    document.getElementById('dy').innerText = "\\[ \\frac{dy}{dt} = -x - y^3 \\]";

                    setRange();
                    document.getElementById('width0').value = 3.2;
                    document.getElementById('cnt_dp').value = 640;
                    document.getElementById('dh').value = 0.01;
                    updateRange();
                    break;
                case "08":  // 極限軌道の例 5 純虚固有値の場合 2
                    dat = 48;
                    changeProperty(0);
                    // 式を表示する
                    //document.getElementById('dx').innerText = "\\[ \\frac{dx}{dt} = -y + 5x \\, e^{(-1 / \\sqrt{r})} \\sin(1 / r)\\]";
                    //document.getElementById('dy').innerText = "\\[ \\frac{dy}{dt} = x + 5y \\, e^{(-1 / \\sqrt{r})} \\sin(1 / r)\\]";
                    document.getElementById('dx').innerText = "\\[ \\frac{dx}{dt} = -y + 10x \\, e^{(-1 / \\sqrt{r})} \\sin(1 / r)\\]";
                    document.getElementById('dy').innerText = "\\[ \\frac{dy}{dt} = x + 10y \\, e^{(-1 / \\sqrt{r})} \\sin(1 / r)\\]";
                    document.getElementById('where').innerText = "$\\;$ where $\\; r = \\sqrt{x^2 + y^2} $";

                    setRange();
                    document.getElementById('width0').value = 0.8;
                    document.getElementById('cnt_dp').value = 640;
                    document.getElementById('dh').value = 0.01;
                    updateRange();
                    break;
                case "09":  // Hamilton型の例 1 Casiniの燈形
                    dat = 49;
                    changeProperty(0);
                    // 式を表示する
                    document.getElementById('dx').innerText = "\\[ \\frac{dx}{dt} = y(1 + x^2 + y^2)\\]";
                    document.getElementById('dy').innerText = "\\[ \\frac{dy}{dt} = x(1 - x^2 - y^2)\\]";

                    setRange();
                    document.getElementById('width0').value = 4;
                    document.getElementById('cnt_dp').value = 640;
                    document.getElementById('dh').value = 0.01;
                    updateRange();
                    break;
                case "10":  // Hamilton型の例 2 Descartesの葉線
                    dat = 410;
                    changeProperty(0);
                    // 式を表示する
                    document.getElementById('dx').innerText = "\\[ \\frac{dx}{dt} = 2x - 2y^2\\]";
                    document.getElementById('dy').innerText = "\\[ \\frac{dy}{dt} = -2y + 3x^2\\]";

                    setRange();
                    document.getElementById('width0').value = 4;
                    document.getElementById('cnt_dp').value = 640;
                    document.getElementById('dh').value = 0.01;
                    updateRange();
                    break;
                case "11":  // Hamilton型の例 3
                    dat = 411;
                    changeProperty(0);
                    // 式を表示する
                    document.getElementById('dx').innerText = "\\[ \\frac{dx}{dt} = 2x^2 - 5y^4\\]";
                    document.getElementById('dy').innerText = "\\[ \\frac{dy}{dt} = -4xy + 5x^4\\]";

                    setRange();
                    document.getElementById('width0').value = 4;
                    document.getElementById('cnt_dp').value = 2560;
                    document.getElementById('dh').value = 0.002;
                    updateRange();
                    break;
                case "12":  // Hamilton型の例 4
                    dat = 412;
                    changeProperty(0);
                    // 式を表示する
                    document.getElementById('dx').innerText = "\\[ \\frac{dx}{dt} = \\sin(y)\\]";
                    document.getElementById('dy').innerText = "\\[ \\frac{dy}{dt} = \\sin(x)\\]";

                    setRange();
                    document.getElementById('width0').value = 25.6;
                    document.getElementById('cnt_dp').value = 1280;
                    document.getElementById('dh').value = 0.01;
                    updateRange();
                    break;
                defaut:
                    break;
            }
            // 段落のマージンを設定する
            changeDivMargin(true);

            // ラベル「固有値」は非表示にする
            document.getElementById('koyu').innerText = "";

            break;

        case "09":  // ユーザー定義
            selectMode.selectedIndex = 2;
            mode = 2;

            dat = 99;
            changeProperty(0);
            // 式を非表示にする
            document.getElementById('dxdt').innerText = "";
            document.getElementById('dydt').innerText = "";
            document.getElementById('dxdy_where').innerText = "";
            document.getElementById('dx').innerText = "";
            document.getElementById('dy').innerText = "";
            document.getElementById('where').innerText = "";

            // data set
            document.getElementById('width0').value = 3.2;
            document.getElementById('cnt_dp').value = 640;
            document.getElementById('dh').value = 0.01;

            switch (typeAry[1]) {
                case "090":
                    // 方程式入力ボックスを表示する
                    dispFormula(1);

                    // 式を評価する
                    document.getElementById('dxdt').innerText = "";
                    document.getElementById('dydt').innerText = "";
                    document.getElementById('dxdy_where').innerText = "";

                    // 20240513 add for user definition
                    formula_dx = "";
                    formula_dy = "";
                    formula_where = ""
                    break;
                case "091":
                    // 方程式入力ボックスを表示する
                    dispFormula(1);

                    // 式を評価する
                    document.getElementById('dxdt').innerText = "-2*x + 2*y";
                    document.getElementById('dydt').innerText = "-2*x + 3*y";
                    document.getElementById('dxdy_where').innerText = "";

                    // 20240513 add for user definition
                    formula_dx = "-2*x + 2*y";
                    formula_dy = "-2*x + 3*y";
                    formula_where = ""
                    break;
                case "092":
                    // 方程式入力ボックスを表示する
                    dispFormula(1);

                    // 式を評価する
                    document.getElementById('dxdt').innerText = "1";
                    document.getElementById('dydt').innerText = "2 * y / x";
                    document.getElementById('dxdy_where').innerText = "";

                    // 20240513 add for user definition
                    formula_dx = "1";
                    formula_dy = "2*y / x";
                    formula_where = ""
                    break;
                case "093":
                    // 方程式入力ボックスを表示する
                    dispFormula(1);

                    // 式を評価する
                    document.getElementById('dxdt').innerText = "x^2 * (y - x) + y^5";
                    document.getElementById('dydt').innerText = "y^2 * (y - 2 * x)";
                    document.getElementById('dxdy_where').innerText = "";

                    // 20240513 add for user definition
                    formula_dx = "x^2 * (y - x) + y^5";
                    formula_dy = "y^2 * (y - 2 * x)";
                    formula_where = ""
                    break;
                case "094":
                    // 方程式入力ボックスを表示する
                    dispFormula(1);

                    selectMode.selectedIndex = 1;   // 描画は修正Euler法を使用
                    mode = 1;
                    document.getElementById('cnt_dp').value = 1280;
                    document.getElementById('dh').value = 0.003;

                    // 式を評価する
                    document.getElementById('dxdt').innerText = "y * (1 + 2 * r)";
                    document.getElementById('dydt').innerText = "x * (1 - 2 * r) - y * (1 + 2 * r) * (r^2 - (x^2 - y^2))";
                    document.getElementById('dxdy_where').innerText = "x^2 + y^2";

                    // 20240513 add for user definition
                    formula_dx = "y * (1 + 2 * r)";
                    formula_dy = "x * (1 - 2 * r) - y * (1 + 2 * r) * (r^2 - (x^2 - y^2))";
//debug//                    formula_dy = "x * (1 - 2 * r) - y * (1 + 2 * r) * (2 * x^2 - y^2)";
                    formula_where = "x^2 + y^2"
                    break;
                case "095":
                    // 方程式入力ボックスを表示する
                    dispFormula(1);

                    // 式を評価する
                    document.getElementById('dxdt').innerText = "-y + 10 * x * exp(-1 / sqrt(r)) * sin(1 / r)";
                    document.getElementById('dydt').innerText = "x + 10 * y * exp(-1 / sqrt(r)) * sin(1 / r)";
                    document.getElementById('dxdy_where').innerText = "sqrt(x^2 + y^2)";

                    // 20240513 add for user definition
                    formula_dx = "-y + 10 * x * exp(-1 / sqrt(r)) * sin(1 / r)";
                    formula_dy = "x + 10 * y * exp(-1 / sqrt(r)) * sin(1 / r)";
                    formula_where = "sqrt(x^2 + y^2)"
                    break;

                defaut:
                    break;

            }
            // 式を表示する
            node_dx = math.parse(formula_dx);
            node_dy = math.parse(formula_dy);
            node_where = math.parse(formula_where);

            var dxTex = "\\frac{dx}{dt} &=& " + node_dx.toTex();
            var dyTex = "\\frac{dy}{dt} &=& " + node_dy.toTex();
            var whereTex = "r = " + node_where.toTex();
            // "\cdot" を削除する
            //dxTex = dxTex.replace(/\\cdot/g, "");
            //dyTex = dyTex.replace(/\\cdot/g, "");
            //whereTex = whereTex.replace(/\\cdot/g, "");

            // 長い式を分割
            var maxLineLength = 40; // 最大文字数（調整可能）
            let splitDxTex;
            let splitDyTex;
    //        var splitDxTex = splitLongTex(dxTex, maxLineLength);
            if (dxTex.length > 120) {
                splitDxTex = splitLongTex(dxTex, maxLineLength);
            }
            else {
                splitDxTex = dxTex;
            }
    //        var splitDyTex = splitLongTex(dyTex, maxLineLength);
            if (dyTex.length > 120) {
                splitDyTex = splitLongTex(dyTex, maxLineLength);
            }
            else {
                splitDyTex = dyTex;
            }

            document.getElementById('dx').innerHTML = "\\[ \\begin{eqnarray*}" + splitDxTex + "\\end{eqnarray*} \\]";
            document.getElementById('dy').innerHTML = "\\[ \\begin{eqnarray*}" + splitDyTex + "\\end{eqnarray*} \\]";
            if (whereTex == "r = undefined") {
                document.getElementById('where').innerHTML = "$\\;$ where, $\\;r = $ unused";
            }
            else {
                document.getElementById('where').innerHTML = "$\\;$ where, $\\;" + whereTex + "$";
            }

            // 係数入力ボックスを非表示にする
            dispCoef(0);

            updateRange();

            // 段落のマージンを設定する
            changeDivMargin(false);
            // ラベル「固有値」は非表示にする
            document.getElementById('koyu').innerText = "";

            document.getElementById('dxdt').focus();

            break;
    }

    // 固有値
    // ラベルを一度非表示にする
    document.getElementById('lambda').style.visibility ="hidden";
    document.getElementById('KAI1').style.visibility ="hidden";
    document.getElementById('pm').style.visibility ="hidden";
    document.getElementById('KAI2').style.visibility ="hidden";

    // 描画領域をリセット
    ctx.fillStyle = 'rgb( 0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 他の処理が終わった後にMathJaxを再度実行する
    TeX();
}

function changeProperty(flg) {
        ma_used = 0;
        mb_used = 0;
        mc_used = 0;
        md_used = 0;
        me_used = 0;
        mf_used = 0;
        mg_used = 0;
        mh_used = 0;
        document.getElementById('ma').value = "";
        document.getElementById('mb').value = "";
        document.getElementById('mc').value = "";
        document.getElementById('md').value = "";
        document.getElementById('me').value = "";
        document.getElementById('mf').value = "";
        document.getElementById('mg').value = "";
        document.getElementById('mh').value = "";
        if (flg == 0) {
            document.getElementById('ma').disabled = true;
            document.getElementById('mb').disabled = true;
            document.getElementById('mc').disabled = true;
            document.getElementById('md').disabled = true;
            document.getElementById('me').disabled = true;
            document.getElementById('mf').disabled = true;
            document.getElementById('mg').disabled = true;
            document.getElementById('mh').disabled = true;
        }
        else {
            document.getElementById('ma').disabled = false;
            document.getElementById('mb').disabled = false;
            document.getElementById('mc').disabled = false;
            document.getElementById('md').disabled = false;
            document.getElementById('me').disabled = false;
            document.getElementById('mf').disabled = false;
            document.getElementById('mg').disabled = false;
        }
}

function dispFormula(flg) {
    if (flg == 0) {
        // 「方程式」表示位置の変更
        document.getElementById('equation_input').style.display = "none";
        document.getElementById('equation_default').style.display = "inline-block";
        // 方程式入力ボックスを非表示にする
        document.getElementById('l_dxdt').style.display = "none";
        document.getElementById('dxdt').style.display = "none";
        document.getElementById('l_dydt').style.display = "none";
        document.getElementById('dydt').style.display = "none";
        document.getElementById('l_where').style.display = "none";
        document.getElementById('dxdy_where').style.display = "none";
    }
    else if (flg == 1) {
        // 「方程式」表示位置の変更
        document.getElementById('equation_input').style.display = "inline-block";
        document.getElementById('equation_default').style.display = "none";
        // 方程式入力ボックスを表示する
        document.getElementById('l_dxdt').style.display = "inline-block";
        document.getElementById('dxdt').style.display = "inline-block";
        document.getElementById('l_dydt').style.display = "inline-block";
        document.getElementById('dydt').style.display = "inline-block";
        document.getElementById('l_where').style.display = "inline-block";
        document.getElementById('dxdy_where').style.display = "inline-block";
    }
}

function dispCoef(flg) {
    if (flg == 0) {
        // 係数入力ボックスを非表示にする
        document.getElementById('l_coef').style.display = "none";

        document.getElementById('l_ma').style.display = "none";
        document.getElementById('l_me').style.display = "none";
        document.getElementById('ma').style.display = "none";
        document.getElementById('me').style.display = "none";
        document.getElementById('l_mb').style.display = "none";
        document.getElementById('l_mf').style.display = "none";
        document.getElementById('mb').style.display = "none";
        document.getElementById('mf').style.display = "none";
        document.getElementById('l_mc').style.display = "none";
        document.getElementById('l_mg').style.display = "none";
        document.getElementById('mc').style.display = "none";
        document.getElementById('mg').style.display = "none";
        document.getElementById('l_md').style.display = "none";
        document.getElementById('l_mh').style.display = "none";
        document.getElementById('md').style.display = "none";
        document.getElementById('mh').style.display = "none";
    }
    else if (flg == 1) {
        // 係数入力ボックスを表示する
        document.getElementById('l_coef').style.display = "inline-block";

        document.getElementById('l_ma').style.display = "inline-block";
        document.getElementById('l_me').style.display = "inline-block";
        document.getElementById('ma').style.display = "inline-block";
        document.getElementById('me').style.display = "inline-block";
        document.getElementById('l_mb').style.display = "inline-block";
        document.getElementById('l_mf').style.display = "inline-block";
        document.getElementById('mb').style.display = "inline-block";
        document.getElementById('mf').style.display = "inline-block";
        document.getElementById('l_mc').style.display = "inline-block";
        document.getElementById('l_mg').style.display = "inline-block";
        document.getElementById('mc').style.display = "inline-block";
        document.getElementById('mg').style.display = "inline-block";
        document.getElementById('l_md').style.display = "inline-block";
        document.getElementById('l_mh').style.display = "inline-block";
        document.getElementById('md').style.display = "inline-block";
        document.getElementById('mh').style.display = "inline-block";
    }
}

function FNF(dt, x, y) {
    let FNF;
    switch (dat)
    {
        case 1:
            FNF = ma * x + mb * y;
            return FNF;
        case 2:
            FNF = ma * x * x + mb * x * y + mc * y * y;
            return FNF;
        case 31:
            FNF = -y * y * y;
            //formula_dx = "-y * y * y";
            //FNF = f(dt, x, y);
            return FNF;
        case 32:
            FNF = x * x * x;
            return FNF;
        case 33:
            FNF = x * x * (y - x);
            return FNF;
        case 34:
            FNF = x * x * (y - x) + math.pow(y, 5);
            return FNF;
        case 41:
            FNF = y;
            return FNF;
        case 42:
            FNF = x*x*y*y - 1;
            return FNF;
        case 43:
            FNF = math.cos(x) + math.cos(y);
            return FNF;
        case 44:
            FNF = ma * y + mb * x * (1 - x*x - y*y);
            return FNF;
        case 45:
            FNF = y;
            return FNF;
        case 46:
            FNF = ma * y * (1 + 2 * x*x + 2 * y*y);
            return FNF;
        case 47:
            FNF = y;
            return FNF;
        case 48:
            let r = math.sqrt(x*x + y*y);
            //FNF = -y + 5 * x * math.exp(-1 / math.sqrt(r)) * math.sin(1 / r);
            FNF = -y + 10 * x * math.exp(-1 / math.sqrt(r)) * math.sin(1 / r);
            //FNF = 10 * x * math.exp(-1 / math.sqrt(r)) * math.sin(1 / r); // 第2項のみ(半径 1 / kπの円周を境に向きを変えるvector fieldの検証用)
            return FNF;
        case 49:
            FNF = y * (1 + x*x + y*y);
            return FNF;
        case 410:
            FNF = 2 * x - 3 * y*y;
            return FNF;
        case 411:
            FNF = 2 * x*x - 5 * math.pow(y, 4);
            return FNF;
        case 412:
            FNF = math.sin(y);
            //FNF = 4 * x*x * y;
            return FNF;
        case 99:
            FNF = f(dt, x, y);
            return FNF;
        default:
            break;
    }
    return 0.0;
}
function FNG(dt, x, y) {
    let FNG;
    switch (dat)
    {
        case 1:
            FNG = mc * x + md * y;
            return FNG;
        case 2:
            FNG = md * x * x + me * x * y + mf * y * y;
            return FNG;
        case 31:
            FNG = x * x * x;
            return FNG;
        case 32:
            FNG = y * y * y;
            return FNG;
        case 33:
            FNG = y * y * (y - 2 * x);
            return FNG;
        case 34:
            FNG = y * y * (y - 2 * x);
            return FNG;
        case 41:
            FNG = math.sin(x) + math.pow(y, 2);
            return FNG;
        case 42:
            FNG = x*x + y*y - ma;
            return FNG;
        case 43:
            FNG = math.sin(x) * math.sin(y);
            return FNG;
        case 44:
            FNG = mc * x + md * y * (1 - x*x - y*y);
            return FNG;
        case 45:
            FNG = -x + ma * y * (1 - x*x);
            return FNG;
        case 46:
            FNG = mb * x * (1 - 2 * x*x - 2 * y*y) + mc * y * (2 * x*x + 2 * y*y + 1) * (math.pow(x*x + y*y, 2) - (x*x - y*y));
            return FNG;
        case 47:
            FNG = -x - y*y*y;
            return FNG;
        case 48:
            let r = math.sqrt(x*x + y*y);
            //FNG = x + 5 * y * math.exp(-1 / math.sqrt(r)) * math.sin(1 / r);
            FNG = x + 10 * y * math.exp(-1 / math.sqrt(r)) * math.sin(1 / r);
            //FNG = 10 * y * math.exp(-1 / math.sqrt(r)) * math.sin(1 / r); // 第2項のみ(半径 1 / kπの円周を境に向きを変えるvector fieldの検証用)
            return FNG;
        case 49:
            FNG = x * (1 - x*x - y*y);
            return FNG;
        case 410:
            FNG = -2 * y + 3 * x*x;
            return FNG;
        case 411:
            FNG = -4*x*y + 5 * math.pow(x, 4);
            return FNG;
        case 412:
            FNG = math.sin(x);
            //FNG = y * x;
            return FNG;
        case 99:
            FNG = g(dt, x, y);
            return FNG;
        default:
            break;
    }
    return 0.0;
}

function f(dt, x, y) {
    // まず、rを計算
    let r = math.evaluate(formula_where, { x: x, y: y });
    // 次に、計算されたrを使って最終的な数式を評価
    return math.evaluate(formula_dx, { dt: dt, x: x, y: y, r: r });
}

function g(dt, x, y) {
    // まず、rを計算
    let r = math.evaluate(formula_where, { x: x, y: y });
    // 次に、計算されたrを使って最終的な数式を評価
    return math.evaluate(formula_dy, { dt: dt, x: x, y: y, r: r });
}

// Texを使用を反映させるためにMathJaxを再度実行する
function TeX() {
    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
}

function splitLongTex(tex, maxLineLength) {
    var result = '';
    var currentLine = '';
    var brackets = 0;
    var characters = tex.split('');

    characters.forEach(function(char, index) {
        if (char === '{' || char === '(') {
            brackets++;
        } else if (char === '}' || char === ')') {
            brackets--;
        }

        if (currentLine.length >= maxLineLength && (char === '+' || char === '-' || (char === '*' && characters[index + 1] !== '*') || char === '/') && brackets === 0) {
            result += currentLine + char + ' \\\\ & & {}';
            currentLine = '';
        } else {
            currentLine += char;
        }
    });

    result += currentLine;
    return result;
}

function changeDivMargin(isDefaultEquation) {
    const divElement = document.getElementById('targetDiv');

    if (isDefaultEquation) {
        divElement.style.marginTop = "0px";
    } else {
        divElement.style.marginTop = "-60px";
    }
}

//-//////////////////////////////////////////////////////////////////////
// 入力された方程式(右辺)の諸チェック

function checkSubFunction() {
    let flg = false;
    // formula_dx または formula_dy に r が含まれていないのに、whereに値が入っていた場合は、エラー終了する
    if (formula_dx.indexOf('r') == -1 || formula_dy.indexOf('r') == -1) {
        if (formula_where.length > 0) {
            flg = true;
        }
    }
    // formula_dx または formula_dy に r が含まれているのに、whereに値が入っていない場合は、エラー終了する
    if (formula_dx.indexOf('r') != -1 || formula_dy.indexOf('r') != -1) {
        if (formula_where.length == 0) {
            flg = true;
        }
    }
    return flg;
}

// 入力された方程式(右辺)に数字が含まれているかチェック
function containsNumbers(str) {
    let flg;
    flg =  /[1-9]/.test(str);
    return flg;
}

//-//////////////////////////////////////////////////////////////////////
// 入力された方程式(右辺)が線形か非線形か判別し、線形の場合は係数を求める
function checkLinearity() {
    // sin, cos, sqrt, expなど、数学関数が含まれているか判定し、含まれている場合は、非線形と判断して追跡を中止する
    if (containsMathFunctions(formula_dx) || containsMathFunctions(formula_dy)) {
        // 非線形であることが確定
        //document.getElementById('result').innerText = 'Non-linear equations (contains math functions)';
        return;
    }

    // 入力された方程式を+/-の符号で区切り、項に分割するサブ関数
    // 第1項がマイナスの符号で始まる場合(-2*x など)、スペースだけの項が作られてしまうので、filterでスペースだけの項は省く
    const splitExpression = (expr) => {
        return expr.replace(/\s+/g, '').split(/(?=[-+])/).filter(term => term !== '');
    };

    // 各項の係数を解析するサブ関数
    const parseCoefficients = (terms) => {
        let coefficients = { x: 0, y: 0, constant: 0 };

        // 項数が4以上は非線形として追跡中止
        if (terms.length >= 4) {
            return null;
        }

        // 項毎に'x', 'y', '^' が含まれているか調べる
        for (let term of terms) {
            let hasX = term.includes('x');
            let hasY = term.includes('y');
            const xCount = countOccurrences(term, 'x');
            const yCount = countOccurrences(term, 'y');
            let hasPower = term.includes('^');

            // '^'が含まれている(係数がべき表記されていた場合は、諦める)、
            // 'x'が2つ以上、或いは'y'が2つ以上含まれている場合は、非線形として追跡中止
            if (hasPower || xCount > 1 || yCount > 1) {
                return null; // Non-linear
            }

            // x, yが含まれる場合は、非線形として追跡中止
            if (hasX && hasY) {
                return null;
            }

            // ここまでreturnではねられずに残った場合は、線形と判断して係数を取得する
            // 'x'のみが含まれている場合
            if (hasX) {
                let coefficient = parseFloat(term.replace('x', ''));
                coefficient = isNaN(coefficient) ? (term.startsWith('-') ? -1 : 1) : coefficient;
                coefficients.x += coefficient;
            // 'y'のみが含まれている場合
            } else if (hasY) {
                let coefficient = parseFloat(term.replace('y', ''));
                coefficient = isNaN(coefficient) ? (term.startsWith('-') ? -1 : 1) : coefficient;
                coefficients.y += coefficient;
            } else {
                coefficients.constant += parseFloat(term);
            }
        }

        return coefficients;
    };

    const terms_dx = splitExpression(formula_dx);
    const terms_dy = splitExpression(formula_dy);

    const coefficients_dx = parseCoefficients(terms_dx);
    const coefficients_dy = parseCoefficients(terms_dy);

    if (coefficients_dx && coefficients_dy) {
        linerFlg = 1;   // 入力された連立微分方程式は線形である
        ma = coefficients_dx.x;
        mb = coefficients_dx.y;
        mc = coefficients_dy.x;
        md = coefficients_dy.y;
    }
}

// 項の中に x または y が幾つ含まれているか調べる
function countOccurrences(str, subStr) {
    return (str.match(new RegExp(subStr, 'g')) || []).length;
}

// 式に数学数学関数が含まれているか調べる
function containsMathFunctions(expr) {
    const node = math.parse(expr);
    let containsFunction = false;

    // Function to recursively traverse the node
    const traverseNode = (node) => {
        if (node.type === 'FunctionNode') {
            containsFunction = true;
            // Stop traversal
            return;
        }

        // Recursively traverse child nodes
        if (node.args) {
            node.args.forEach(arg => traverseNode(arg));
        }
    };

    // Start traversal
    traverseNode(node);

    return containsFunction;
}
//-//////////////////////////////////////////////////////////////////////

