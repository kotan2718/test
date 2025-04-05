
////////////////////////////// Calc system constitution /////////////////////////////
/// PerPlt() -> Prep()
///          -> ZeroPoint2()
///          -> PltAx()      -> |Aplot() -> |PPlot() -> Call DrawFunc|...<1>| 
///                             |        -> HLN()                           |
///                             |        -> Vanish()   -> HLN()             |...<<0>>
///                             |                      -> <1>               |
///                             |        -> VanishZ0() -> <1>               |
///          -> xyPlt()      -> <<0>>
///          -> ContLN()     -> <<0>>
///                          -> SearchF() -> <<0>>
/////////////////////////////////////////////////////////////////////////////////////

// 定数 //
const D_CONST = 9999.0;
const N_CONST = 9999;
const SCALE = 4 / 3;

// Pers Result Error and Warning
const RES_CONT_NO_ZMIN  = 61
const RES_CONT_NO_ZMAX  = 62
const RES_CONT_NO_ZBOTH = 63

let max = 99999;
let eps = 0.01;
let m_index = 1;
let bkColor = 'rgb(0, 0, 0)';

// ================ //
// Perspective Base //
// ================ //

// ----------- To calcurate parameters start -----------
// 使用関数
// Prep();
// 使用変数
let m_xws;                // 視点座標から見た図形座標底面のx辺(m_xw)の正弦
let m_yws;                // 視点座標から見た図形座標底面のy辺(m_yw)の正弦
let m_xwc;                // 視点座標から見た図形座標底面のx辺(m_xw)の余弦
let m_ywc;                // 視点座標から見た図形座標底面のy辺(m_yw)の余弦
let m_hxfc, m_hyfc;       // 図形座標にスケール変換後の格子点の間隔
let m_zfctr = 0.75;       // 図形座標にスケール変換するときにz方向を縮めるための比率(0.75位が丁度良い)
let m_zc;                 // 図形座標上の原点(X0, Y0, Z0)に対応する透視座標の原点(ξ0、η0)のξ0
let m_zm;                 // 図形座標上の原点(X0, Y0, Z0)に対応する透視座標の原点(ξ0、η0)のη0
let m_el = D_CONST, m_et = D_CONST, m_sg = D_CONST;           // 図形座標から透視座標へ投影処理を制御する変数
// ----------- To calcurate parameters   end -----------

// ----------- ピクチャーボックスでの原点設定 start ----
// 使用関数
// ZeroPoint2()
// 使用変数
let m_RRX = 0.0, m_RRZ = 0.0;  // ピクチャーボックスの原点
// ----------- ピクチャーボックスでの原点設定   end ----


// ================ //
// Perspective Plot //
// ================ //

// ----------- plot axis start -------------------------
// 使用関数
// PltAx();
// ----------- plot axis   end -------------------------

// ----------- XY plot(iDir) start ---------------------
//  *** iDir = 1: parallel to y-axis ***
//  *** iDir = 2: parallel to x-axis ***
// 使用関数
// xyPlt(iDir);
// ----------- XY plot(iDir)   end ---------------------


// ================ //
//   Contour Line   //
// ================ //
// ----------- To find starting point start -------------
// 使用関数
// ContLn();
// 使用変数
let m_ks = N_CONST; // 等高線探索で探索中の格子(P1, P2, P3, P4)の状態を制御する変数(ContLn()のit, jtと組み合わせて使用する)
let m_ksw = [];     // 等高線探索の出発点を求める過程で、(見つからなかった)探索済みの格子点を格納する配列
// ----------- To find starting point   end -------------


// ================ //
//    Plot Main     //
// ================ //
// ----------- APlot(x,y,jp) start --------------------
// 使用関数
// APlot(ax, ay, jp);
// 使用変数
let m_xp = 9999.0, m_zp = 9999.0;  // 図形座標上の点(X, Y, Z)に対応する透視座標の点(ξ、η), m_xpがξに、m_zpがηに対応
// ----------- APlot(x,y,jp)   end --------------------

// ---------- to find vanish point start --------------
// 使用関数
// Vanish(kp, xps1, zps1);
// ---------- to find vanish point   end --------------

// ---------- to find z=0 point start -----------------
// 使用関数
// VanishZ0();    // 描画開始点と終了点が z = 0 を跨ぐとき、z = 0で、線の色を変更する関数
// 使用変数
let m_kpv, m_kqv;   // m_kpv は Vanish() の描画On,Off命令，m_kqv は VanishZ0() の描画On,Off命令
                    // Vanish と VanishZ0 は連動しているので，どちらも PPLOT を呼ぶとき
                    // PPLOT(m_kpv,m_kqv) で呼び出す。
                    // どちらかがOffの場合は PPLOT は描画を行わない
// ---------- to find z=0 point   end -----------------

// ---------- Hidden line start -----------------------
// 使用関数
// HLN();
// 使用変数
let m_xq = D_CONST, m_yq = D_CONST, m_zq = D_CONST;   // 図形座標で表された点
let m_kpl = N_CONST;      // 点(m_xq, m_yq, m_zq)が見えるときは 1 が, 見えないときは -1 が格納される
// ---------- Hidden line   end -----------------------


// ================ //
//       Plot       //
// ================ //
// ---------- plot start ------------------------------
// 使用関数
// PPlot(int lp1, int lp2);
// ---------- plot   end ------------------------------

// 予め定義されている開曲面の関数
/////////////////////////////////////////////////////////
// FXY(x, y, index);
/////////////////////////////////////////////////////////

// fix 関数
// ---------- fix start ------------------------------
// 使用関数
// fix(number);
// ---------- fix   end ------------------------------

// X-Y-Z座標系（図形座標系）で表される曲面は， Z=f(X,Y) で表される開曲面とする。
// X-Y平面上の曲面の領域を，直交する2辺の交点を原点，2辺をそれぞれX軸，Y軸とする矩形領域とする。
// 視点座標系をx-y-zとする。
// 基線（画面）までの視距離をLとし，視点Eと視心Vc（それぞれLの端点）をx-y平面に投影した直線をlとする。
// 視心Vcをx-y平面に投影した点をV0とする。

// Pers Project Common Params( 立体図を画面に投影するためのパラメータ )
let m_lhl = -3;                               // 隠線処理の方法を指定する変数(20240820 現在 -3固定)
let m_ip  = 0;
let m_ipc = 0;

let m_ell = 1000.0;                           // m_ell: 基線（画面）までの視距離
let m_eld = 10.0;                             // m_eld: 矩形領域のうち基線に一番近い頂点から基線までの距離

let m_alpha =  30.0;                          // m_alpha: X軸が基線と成す角
let m_beta = 0.0;                             // m_beta: 視点からX-Y-Z座標系の原点を水平に見込む角度
let m_gamma = -30.0;                          // m_gamma: 基線にもっとも近い矩形の頂点を視点Eから仰ぐ角度

let m_ca = 0.0;                               // m_alphaのcosとsinの値を格納する変数
let m_sa = 0.0;

let m_dHV;                                    // 図形座標の点(X, Y, Z)を透視座標に変換するときZの値を入れておく変数

let m_gamma90Flg = 0;                         // 20230927 描画のmappingでgammaが +/-90 ではどうしてもうまく処理できないので、89で描画を代用する Axis()でこのフラグが1ならばz軸を描画しない
let mappingFlg;                               // 20231002 updpen2, 3で予め角度を指定するときはmapping()の呼び出しを抑制する


let m_xMin, m_yMin;                           // 図形座標の描画範囲
let m_xMax, m_yMax;
let m_zMin, m_zMax;                           // z=f(x,y) のz値の描画範囲。m_zw = m_zMax - m_zMin の関係が成立
rangeDefault();                               // 描画範囲デフォルト値取得

let m_nx = 21, m_ny = 21;                     // 格子線の総本数
let m_mx = 21, m_my = 21;                     // 実際に描画する格子線の本数。m_nx，m_nyと同じでかまわないが，1/2或いは1/4に減らすときは
let m_hx = ((m_xMax - m_xMin) / (m_nx - 1));  // データを与える格子点の間隔
let m_hy = ((m_yMax - m_yMin) / (m_ny - 1));  // データを与える格子点の間隔
                                              // m_nx，m_nyの1/2或いは1/4を指定する
let m_xw = 12.0, m_yw = 12.0, m_zw = 6.0;     // 曲面を収める図形座標の直方体のサイズ

// htmlへ初期データを渡す
// spacing
document.getElementById('m_hx').value = m_hx.toFixed(1);
document.getElementById('m_hy').value = m_hy.toFixed(1);
// scaling
document.getElementById('m_magX').value = (m_xw / (m_xMax - m_xMin)).toFixed(2);
document.getElementById('m_magY').value = (m_yw / (m_yMax - m_yMin)).toFixed(2);
document.getElementById('m_magZ').value = (m_zw / (m_zMax - m_zMin)).toFixed(2);

let m_kh = 3;                                 // 探索する等高線の総本数。
let m_height = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];// m_height()にその高さを指定する。z=m_zMax，z=0，z=m_zMinが普通だと思う
m_height[1] = m_zMin;
m_height[2] = 0;
m_height[3] = m_zMax;

let m_jpl;                // 隠線処理を実行するか否かを決める変数
let m_mpx, m_mpy;         // xyPlt()とHLN()で格子点の制御を行う変数
let m_lCol;               // 描画する線の色を格納する変数
let m_x3, m_x4;           // Aplot()->Vanish(), VanishZ0()で使用される変数
let m_y3, m_y4;
let m_z3, m_z4;

let m_xkai = 0.0, m_zkai = 0.0;

let mjpl;

let zero_wari = [0, 1];
zero_wari[0] = D_CONST;
zero_wari[1] = D_CONST;

///////////////////////////
// 描画する関数の諸量 START
///////////////////////////

// 現在表示されているurlを取得して、日本語ページか英語ページかの振り分けを行う
let urlHere = window.location.href;

// user define 関連
let formula_fxy;
let formula_where;
let node_fxy;
let node_where;

// 係数
let ma;
let mb;
let mc;
let md;
let me;
let mf;
// 係数使用可否
let ma_used = 0;
let mb_used = 0;
let mc_used = 0;
let md_used = 0;
let me_used = 0;
let mf_used = 0;

// 描画が完了したか否かを示すフラグ
let drawnFlg = false;
// アングル以外が変更されたか否かを示すフラグ
let changeFlg = true;

// リセットフラグ <- リセットボタン押下時: true、それ以外は false
// リセットでデフォルトに戻るのは描画アングル(alpha, gamma)のみに限定している
let resetFlg = false;

// -----------to stock z value------------------ 
let m_alt = [];      // 関数の格子点でのz値

const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');

// 描画領域をリセット
//if (document.getElementById('cb_bk_color').checked == false) {
//    ctx.fillStyle = bkColor;
//    ctx.fillRect(0, 0, canvas.width, canvas.height);
//}

// スケーリング
let scaleX = canvas.width / (m_xw * 1.5);
let scaleY = canvas.height / (m_yw * 1.5)

///////////////////////////
// 描画する関数の諸量   END
///////////////////////////


///////////////////////////
// 関数
///////////////////////////

// 配列初期化
function aryInit() {
    // とりあえず、格子点MAXでの初期値を格納しておく
    //  ---------- contour line---------------
    // 等高線探索の出発点を求める過程で、(見つからなかった)探索済みの格子点を格納する配列
    for (let i = 0; i < 122; i++) {
        m_ksw[i] = [];                      // ここで新しい行を初期化
        for (let j = 0; j < 122; j++) {
            m_ksw[i][j] = N_CONST;          // 等高線探索の出発点を求める過程で、(見つからなかった)探索済みの格子点を格納する配列
        }
    }
    // -----------to stock z value------------------ 
    // 物理座標で曲面のz値を格納する配列
    for (let i = 0; i < 122; i++) {
        m_alt[i] = [];                      // ここで新しい行を初期化
        for (let j = 0; j < 122; j++) {
            m_alt[i][j] = N_CONST;          // 関数の格子点でのz値
        }
    }
}


// 物理座標で選択された曲面のz値を格納する
function ALT_Calc(m_index)
{
     for (let i = 1; i < m_nx + 1; i++) {
        const x = m_xMin + m_hx * (i - 1);
        for (let j = 1; j < m_ny + 1; j++) {
            const y = m_yMin + m_hy * (j - 1);
            m_alt[i][j] = FXY(x, y, m_index);
        }
    }
}


// ----------- Perspective Projection Main ------------
function PerPlt(index)
{

    // 描画中に使用不可とするコントロール
    drawnFlg = false;
    //usability(false);

    // 描画領域をリセット
    ctx.fillStyle = bkColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (changeFlg == true) {
        aryInit();
        ALT_Calc(index);
    }

    let iResult = 0;    // 正常終了

    Prep();
    ZeroPoint2();
    PltAx();
    ////debug_s
    ////return 0;
    ////debug_e
    xyPlt(1);
    xyPlt(2);
    // Axis();    // 現在 保留 <- 後で使えそう
    if (m_kh >= 0) {
        m_jpl = 0;
        iResult = ContLn();
    }

    // 描画後にスタートボタンを使用不可にセット(描画範囲などが変更されるまで)
    document.getElementById('start').disabled = true;

    // アングルの変更でライン格納配列を使用可にする
    drawnFlg = true;

    return iResult;
}

// 描画に必要な定数を入力データから計算して用意する
function Prep()
{
    // -------------To calcurate parameters-------------
    let xfctr, yfctr;    // 図形座標へスケール変換するための変数

    let Tau;                // 基線(画面)から図形座標の原点までの距離

    let vv, vmin;
    let tg;                // tangent gamma

    xfctr = m_xw / (m_hx * (m_nx - 1));
    yfctr = m_yw / (m_hy * (m_ny - 1));
    m_hxfc = m_hx * xfctr;                // スケール変換実行後の格子間隔
    m_hyfc = m_hy * yfctr;
    m_mpx = 1;
    m_mpy = 1;
    // *******************************
    m_ca = math.cos(math.PI / 180.0 * m_alpha);
    m_sa = math.sin(math.PI / 180.0 * m_alpha);
    m_xwc = m_xw * m_ca;
    m_ywc = m_yw * m_ca;
    m_xws = m_xw * m_sa;
    m_yws = m_yw * m_sa;
    // *******************************
    if (m_alpha < 0.0) {
        if (m_alpha < -90.0) {
            Tau = -(m_xws + m_ywc);
        }
        else {
            Tau = -m_xws;
        }
    }
    else {
        if (m_alpha < 90.0) {
            Tau = 0.0;
        }
        else {
            Tau = -m_ywc;
        }
    }

    m_el = m_ell;
    Tau = Tau + m_eld;
    // *******************************
    m_et = m_el + Tau;
    m_sg = m_et * math.sin(math.PI / 180.0 * m_beta) / math.cos(math.PI / 180.0 * m_beta);
    // *******************************
    m_zfctr = m_zw / (m_zMax - m_zMin);
    // *******************************

    let v1 = m_sg / m_et;
    let v2 = (m_sg - m_yws) / (m_et + m_ywc);
    let v3 = (m_sg + m_xwc) / (m_et + m_xws);
    let v4 = (m_sg + m_xwc - m_yws) / (m_et + m_xws + m_ywc);

    vv = v1;
    if (vv > v2) vv = v2;
    if (vv > v3) vv = v3;
    if (vv > v4) vv = v4;

    // *******************************
    vmin = m_el + m_eld;
    tg = math.sin(math.PI / 180.0 * m_gamma) / math.cos(math.PI / 180.0 * m_gamma);
    m_zc = vmin * tg - m_zMin * m_zfctr;
    m_zm = tg;
    if (m_gamma > 0) {
        m_zm = vmin / (vmin + math.abs(m_xws) + math.abs(m_ywc)) * tg;
    }
    // *******************************
}

// -----------ピクチャーボックスでの原点設定----
function ZeroPoint2()
{
    //  ------------ピクチャーボックスでの原点設定------------------
    let x = m_xw / 2.0;
    let y = m_yw / 2.0;
    let z = 0.0;
    let V;

    V = 1.0 / (x * m_sa + y * m_ca + m_et);
    m_RRX = (x * m_ca - y * m_sa + m_sg) * V * m_el;

    if (m_zMin >= 0.0) {
        z = (m_zMax - m_zMin) / 2.0;
    }
    m_RRZ = ((z * m_zfctr + m_zc) * V - m_zm) * m_el;
}

function PltAx()
{
    if (m_lhl >= 0) {
        return;
    }

    //  ----------plot axis--------------
    let kg0;
    let x, y;
    let i, j;
    let nh;
    let hhv;
    let IZ;
    let mxs, mys;
    let kp;
    let hmx;
    let hmy;

    ctx.strokeStyle = 'rgb(255, 0, 0)';
    m_jpl = 0;
    kp = 3;
    kg0 = 1;
    x = 0.0;
    y = 0.0;
    i = 1;
    j = 1;

    do {
        m_dHV = m_zMin;
        APlot(x, y, 3);
        APlot(x, y, 0);
        m_dHV = m_alt[i][j];

        if (m_dHV >= m_zMin) {

            if (m_dHV > m_zMax) m_dHV = m_zMax;

            nh = 10;
            hhv = (m_dHV - m_zMin) / nh;
            for (IZ = 1; IZ < nh + 1; IZ++) {
                m_dHV = m_zMin + hhv * IZ;
                APlot(x, y, 0);
            }
        }

        switch (kg0)
        {
        case 1:
            kg0 = 2;
            x = m_xw;
            i = m_nx;
            break;
        case 2:
            kg0 = 3;
            y = m_yw;
            j = m_ny;
            break;
        case 3:
            kg0 = 4;
            x = 0.0;
            i = 1;
            break;
        case 4:
            kg0 = 5;
        }
    } while (kg0 < 5);

    // *******************************
    m_dHV = m_zMin;
    mxs = m_mx - 1;
    mys = m_my - 1;
    hmx = m_hxfc * (m_nx - 1) / mxs;
    hmy = m_hyfc * (m_ny - 1) / mys;
    y = 0.0;
    APlot(0.0, y, 3);
    APlot(0.0, y, 0);
    for (i = 1; i < mxs + 1; i++) {
        x = hmx * i;
        APlot(x, y, 0);
    }
    x = m_xw;
    APlot(x, 0.0, 3);
    APlot(x, 0.0, 0);
    for (i = 1; i < mys + 1; i++) {
        y = hmy * i;
        APlot(x, y, 0);
    }
    y = m_yw;
    APlot(m_xw, y, 3);
    APlot(m_xw, y, 0);
    for (i = 1; i < mxs + 1; i++) {
        x = m_xw - hmx * i;
        APlot(x, y, 0);
    }
    x = 0.0;
    APlot(x, m_yw, 3);
    APlot(x, m_yw, 0);
    for (i = 1; i < mys + 1; i++) {
        y = m_yw - hmy * i;
        APlot(x, y, 0);
    }
    // *******************************
}

function xyPlt(iDir)
{
    //  -------------XY plot(L)-------------
    //  *** iDir = 1: parallel to y-axis ***
    //  *** iDir = 2: parallel to x-axis ***
    let nxc, nyc;
    let mpxc, mpyc;
    let m, n;
    let hfc, hw;
    let hxfcc, hyfcc;
    let mp;
    let yxn;
    let vkkk;
    let w;
    let ww;
    let x, y, z;
    let zs;
    let z5, z22;
    let jplv, jplc;
    let ipp;

    nxc = m_nx;
    nyc = m_ny;
    mpxc = m_mpx;
    mpyc = m_mpy;
    m_mpx = (m_nx - 1) / (m_mx - 1);
    m_mpy = (m_ny - 1) / (m_my - 1);
    //  *******************************
    switch (iDir)
    {
    case 1:
        m = m_mx;
        n = m_ny;
        hfc = m_hxfc;
        hw = m_hyfc;
        mp = m_mpx;
        yxn = m_yw;
        break;
    case 2:
        m = m_my;
        n = m_nx;
        hfc = m_hyfc;
        hw = m_hxfc;
        mp = m_mpy;
        yxn = m_xw;
    }
    // *******************************
    m_nx = m_mx;
    m_ny = m_my;
    hxfcc = m_hxfc;
    hyfcc = m_hyfc;
    m_hxfc = hxfcc * m_mpx;
    m_hyfc = hyfcc * m_mpy;
    m_ks = 1;

    for (ipp = 1; ipp < m + 1; ipp++) {
        let iu = mp * (ipp - 1) + 1;
        vkkk = hfc * (iu - 1);

        let ju = 1;
        if (m_ks == -1) ju = n;

        w = 0.0;
        if (m_ks == -1) w = yxn;

        switch (iDir)
        {
        case 1:
            z = m_alt[iu][ju];
            x = vkkk;
            y = w;
            break;
        case 2:
            z = m_alt[ju][iu];
            y = vkkk;
            x = w;
            break;
        }

        zs = z; // z の実際の値を stock
        if (z > m_zMax) z = m_zMax;
        if (z < m_zMin) z = m_zMin;

        m_dHV = z;

        APlot(x, y, 3);

        m_jpl = 0;
        jplv = 0;
        jplc = m_jpl;

        if (zs > m_zMax) {
            m_jpl = 1;
            jplv = 1;
            jplc = 1;
            if (math.abs(m_lhl) == 2) {
                if (ipp == 1 || ipp == m) {
                    m_jpl = 0;
                    jplv = 0;
                    APlot(x, y, 0);
                    m_jpl = 1;
                }
            }
            if (math.abs(m_lhl) == 3) {
                jplv = 0;
            }
            m_jpl = jplv;
        }

        if (zs >= m_zMin) {
            APlot(x, y, 0);
            m_jpl = jplc;
        }

        // *******************************
        for (let j = 2; j < n + 1; j++) {
            let jjv = j;
            if (m_ks == -1) {
                jjv = n - j + 1;
            }
            w = w + hw;

            switch (iDir)
            {
            case 1:
                z = m_alt[iu][jjv];
                y = w;
                break;
            case 2:
                z = m_alt[jjv][iu];
                x = w;
                break;
            }

            if (z > m_zMax) {
                z22 = m_zMax;
                if (zs <= m_zMax) {
                    z5 = m_zMin;
                    if (zs < z5) {
                        m_dHV = z5;
                        ww = w - (z - z5) / (z - zs) * hw;
                        switch (iDir)
                        {
                        case 1:
                            APlot(x, ww, 0);
                            break;
                        case 2:
                            APlot(ww, y, 0);
                            break;
                        }
                    }
                }
                else {
                    m_dHV = z22;
                    jplc = m_jpl;
                    m_jpl = jplv;
                    APlot(x, y, 0);
                    m_jpl = jplc;
                    zs = z;
                    continue;
                }
            }
            else if (z < m_zMin) {
                z22 = m_zMin;
                if (zs >= m_zMin) {
                    z5 = m_zMax;
                    if (zs > z5) {
                        m_dHV = z5;
                        ww = w - (z - z5) / (z - zs) * hw;
                        switch (iDir)
                        {
                        case 1:
                            APlot(x, ww, 0);
                            break;
                        case 2:
                            APlot(ww, y, 0);
                            break;
                        }
                    }
                }
                else {
                    m_dHV = z22;
                    jplc = m_jpl;
                    m_jpl = jplv;
                    APlot(x, y, 0);
                    m_jpl = jplc;
                    zs = z;
                    continue;;
                }
            }
            else if (m_jpl == 1) {
                if (zs > m_zMax) z22 = m_zMax;
                if (zs < m_zMin) z22 = m_zMin;

                m_jpl = jplv;
                jplv = 0;
                m_dHV = z22;
                ww = w - (z - z22) / (z - zs) * hw;
                switch (iDir)
                {
                case 1:
                    APlot(x, ww, 0);
                    m_dHV = z;
                    m_jpl = 0;
                    APlot(x, w, 0);
                    break;
                case 2:
                    APlot(ww, y, 0);
                    m_dHV = z;
                    m_jpl = 0;
                    APlot(w, y, 0);
                    break;
                }
                zs = z;
                continue;;
            }
            else {
                m_dHV = z;
                APlot(x, y, 0);
                zs = z;
                continue;;
                // *******************************
            }

            jplv = 1;
            m_dHV = z22;
            ww = w - (z - z22) / (z - zs) * hw;
            if (math.abs(m_lhl) == 2) {
                if (ipp == 1 || ipp == m) {
                    if (z22 != m_zMin) jplv = 0;
                }
            }

            if (math.abs(m_lhl) == 3) jplv = 0;
            switch (iDir)
            {
            case 1:
                APlot(x, ww, 0);
                m_jpl = jplv;
                APlot(x, w, 0);
                break;
            case 2:
                APlot(ww, y, 0);
                m_jpl = jplv;
                APlot(w, y, 0);
                break;
            }
            m_jpl = 1;
            zs = z;
        }
        // *******************************
        hw = -hw;
        m_ks = -m_ks;
    }
    m_nx = nxc;
    m_ny = nyc;
    m_hxfc = hxfcc;
    m_hyfc = hyfcc;
    m_mpx = mpxc;
    m_mpy = mpyc;

    return
}

function APlot(ax, ay, jp)
{
    //  ------------aplot(x,y,jp)------------------
    m_ip = m_ipc;
    let xps1 = m_xp;
    let zps1 = m_zp;

    let kpls = m_kpl;
    let VVV = 1.0 / (ax * m_sa + ay * m_ca + m_et);

    let ipv;

    m_xp = (ax * m_ca - ay * m_sa + m_sg) * VVV * m_el;
    m_zp = ((m_dHV * m_zfctr + m_zc) * VVV - m_zm) * m_el;

    if (m_lhl == 0) {
        m_ip = 3;
        if (jp != 3) {
            m_ip = 2;
        }
        PPlot(m_ip, 0);
        return;
    }

    m_xq = ax;
    m_yq = ay;
    m_zq = m_dHV;

    // *****JP=3**********( 陰線処理なし )
    if (jp == 3) {
        m_ipc = 3;
        m_kpl = -1;
        PPlot(jp, 0);

        m_x4 = ax;
        m_y4 = ay;
        m_z4 = m_dHV;

        return;
    }

    // *****JP=0 OR 2*****( 陰線処理あり )
    m_kpl = HLN();    // 陰線処理が必要かどうかを判定 (次の点が見える: m_kpl = 1,    見えない: m_kpl = -1)

    m_x3 = m_x4;
    m_x4 = ax;
    m_y3 = m_y4;
    m_y4 = ay;
    m_z3 = m_z4;
    m_z4 = m_dHV;

    // 図形座標で表される点から次の点に向かうベクトルを描くとき、その途中で見えなくなる点、或いは見えてくる点Mが存在するかどうかの判定
    // m_kpl == kpls: 見える->見える、見えない->見えない, m_kpl != kpls: 見える->見えない、見えない->見える
    if (m_kpl != kpls) {                                
        Vanish(m_ip, xps1, zps1);    // 点Mが存在するとき、二分法によってその点を求める

        m_ipc = m_ip;

        return;
    }

    // *******************************
    if (m_z3 * m_z4 < 0) {
        VanishZ0();                    // 描画開始点と終了点が z = 0 を跨ぐとき、z = 0で、線の色を変更する関数
    }

    ipv = m_ip;

    if (m_jpl == 1) {
        ipv = 3;
    }

    if ((m_z3 < 0 && m_dHV <= 0) || m_dHV < 0) {
        ctx.strokeStyle = 'rgb(0, 0, 255)';
    }
    else {
        ctx.strokeStyle = 'rgb(255, 0, 0)';
    }

    PPlot(ipv, 0);

    return;
}

function PPlot(lp1, lp2)
{
    // gammaの変化に関わらずy方向の拡大率を一定に保つ処理
    const EXP_DEC_X0 =  0.0;
    const EXP_DEC_Y0 =  0.0;
    const EXP_DEC_A1 =  6.18893975111;
    const EXP_DEC_T1 = 42.4994092028;
    const EXP_DEC_A2 =  5.52820541383e-006;
    const EXP_DEC_T2 =  4.94077941896;
    const EXP_DEC_A3 = -3.25277800372e-008;
    const EXP_DEC_T3 =  4.02121236769;
    const EXP_DEC_A4 = -3.25277800372e-008;
    const EXP_DEC_T4 =  4.02121236769;
    const EXP_DEC_A5 =  5.70538289849e-023;
    const EXP_DEC_T5 =  1.55673261973;

    const PERS_BASE_HEIGHT = 12.538928450054133;

    let curtDeg = -(math.abs(m_gamma));
    let curtHeight;

    if (math.abs(m_gamma) == 89.0) {            // +/-89.0では近似式は使わず、固定値で拡大率を処理する
        curtHeight = 678.551409;
    }
    else if (math.abs(m_gamma) == 90.0) {        // +/-90.0では近似式は使わず、固定値で拡大率を処理する( 真上から見た図になる )
        curtHeight = 1.38959E+16 / 1.9;

    }
    else if (math.abs(m_gamma) >= 30.0) {        // 30°以上で描画が大きく歪むので、30～88に適用
        curtHeight = EXP_DEC_Y0 +
            EXP_DEC_A1 * math.exp(-(curtDeg - EXP_DEC_X0) / EXP_DEC_T1) +
            EXP_DEC_A2 * math.exp(-(curtDeg - EXP_DEC_X0) / EXP_DEC_T2) +
            EXP_DEC_A3 * math.exp(-(curtDeg - EXP_DEC_X0) / EXP_DEC_T3) +
            EXP_DEC_A4 * math.exp(-(curtDeg - EXP_DEC_X0) / EXP_DEC_T4) +
            EXP_DEC_A5 * math.exp(-(curtDeg - EXP_DEC_X0) / EXP_DEC_T5);
    }
    else {
        curtHeight = PERS_BASE_HEIGHT;
    }

    //  -------------plot-----------------
    let XPP, ZPP;

    if (lp1 == 3 || lp2 == 3) {
        m_xkai = m_xp;
        m_zkai = m_zp;
        return;
    }

    XPP = m_xp;
    ZPP = m_zp;

    let xStart, yStart;
    let xEnd, yEnd;

    xStart = -m_RRX + m_xkai;
    yStart = (-m_RRZ + m_zkai) * PERS_BASE_HEIGHT / curtHeight;
    xEnd   = -m_RRX + XPP;
    yEnd   = (-m_RRZ + ZPP) * PERS_BASE_HEIGHT / curtHeight;

//    // DrawLine Overflow 対策
//    if (math.abs(obj.x3) > max || math.abs(obj.y3) > max)
//    {
//        msg(0, obj.x3, obj.y3, obj.z3);
//        // 座標系の回転で更にoverflowの可能性があり、その場合は無限ループになるので回転は不可とする
//        rotateFlg = false;
//    }

    pixelX = scaleX * (m_xw / SCALE + xStart);
    pixelY = scaleY * (m_yw / SCALE - yStart);    // SCALE or m_zfctr どちらがいいかな？
    pixelX1 = scaleX * (m_xw / SCALE + xEnd);
    pixelY1 = scaleY * (m_yw / SCALE - yEnd);

    ctx.beginPath();
    ctx.moveTo(pixelX, pixelY);
    ctx.lineTo(pixelX1, pixelY1);
    ctx.stroke();

    m_xkai = m_xp;
    m_zkai = m_zp;
    // *********************************************************************

    return;
}

function Vanish(kp, xps1, zps1)
{
    //  ---------to find vanish point--------------
    let KPL1, kpls;
    let DX, DY, DZ;
    let ZZV;
    let LL;
    let VV1;
    let XPS, ZPS;
    
    let px = 0.02;
    let pz = 0.02;
    let px1 = 1.1 * px;
    let pz1 = 1.1 * pz;
    
    DX = -0.5 * (m_x4 - m_x3);
    DY = -0.5 * (m_y4 - m_y3);
    DZ = -0.5 * (m_z4 - m_z3);
    ZZV = m_z4;
    let xp_stock = m_xp;
    let zp_stock = m_zp;
    KPL1 = m_kpl;

    for (LL = 1; LL <= 6; LL++) {
        m_xq = m_xq + DX;
        m_yq = m_yq + DY;
        ZZV = ZZV + DZ;
        VV1 = 1.0 / (m_xq * m_sa + m_yq * m_ca + m_et);
        XPS = m_xp;
        ZPS = m_zp;
        m_xp = (m_xq * m_ca - m_yq * m_sa + m_sg) * VV1 * m_el;
        m_zp = ((ZZV * m_zfctr + m_zc) * VV1 - m_zm) * m_el;
        m_zq = ZZV;
        kpls = m_kpl;

        m_kpl = HLN();

        if (math.abs(m_xp - XPS) <= px && math.abs(m_zp - ZPS) <= pz) {
            break;
        }
        DX = 0.5 * DX;
        DY = 0.5 * DY;
        DZ = 0.5 * DZ;
        if (m_kpl != kpls) {
            DX = -DX;
            DY = -DY;
            DZ = -DZ;
        }
    }

    if (math.abs(m_xp - xp_stock) <= px1 && math.abs(m_zp - zp_stock) <= pz1) {
        m_xp = xp_stock;
        m_zp = zp_stock;
    }
    else if (math.abs(m_xp - xps1) <= px1 && math.abs(m_zp - zps1) <= pz1) {
        m_xp = xps1;
        m_zp = zps1;
    }

    m_kpv = kp;
    if (m_jpl == 1) {
        m_kpv = 3;
    }

    if ((m_z3 < 0 && ZZV <= 0) || ZZV < 0) {
    ctx.strokeStyle = 'rgb(0, 0, 255)';
    }
    else {
    ctx.strokeStyle = 'rgb(255, 0, 0)';
    }

    PPlot(m_kpv, m_kqv);
    m_kpl = KPL1;

    kp = 5 - kp;

    m_xp = xp_stock;
    m_zp = zp_stock;
    m_kpv = kp;

    if (m_jpl == 1) {
        m_kpv = 3;
    }
    if ((m_z4 < 0 && ZZV <= 0) || ZZV < 0) {
        ctx.strokeStyle = 'rgb(0, 0, 255)';
    }
    else {
        ctx.strokeStyle = 'rgb(255, 0, 0)';
    }
    PPlot(m_kpv, m_kqv);

    // Vanish() の結果を Aplot() へ戻す
    m_ip = kp;

    return;
}


// ----------- VanishZ0 ------------------ 

// 描画開始点と終了点が z = 0 を跨ぐとき、z = 0で、線の色を変更する関数
// m_kpv は Vanish() の描画On,Off命令，m_kqv は VanishZ0() の描画On,Off命令
// Vanish と VanishZ0 は連動しているので，どちらも PPLOT を呼ぶとき
// PPLOT(m_kpv,m_kqv) で呼び出す。
// どちらかがOffの場合は PPLOT は描画を行わない
function VanishZ0()
{
    //  ------to find z=0 point--------------
    let Z33, Z44;
    let LLL;
    let DZGG;
    let VV1GG;
    let XQQ, YQQ;

    m_kqv = 2;
    if (m_z4 < 0.0) {
        Z33 = m_z4;
        Z44 = m_z3;
    }
    else {
        Z44 = m_z4;
        Z33 = m_z3;
    }
    let xp_stock = m_xp;
    let zp_stock = m_zp;

    for (LLL = 1; LLL <= 6; LLL++) {
        DZGG = 0.5 * (Z44 + Z33);
        if (math.abs(DZGG) <= 0.001) {
            break;
        }
        else {
            if (DZGG >= 0.0) {
                Z44 = DZGG;
            }
            else {
                Z33 = DZGG;
            }
        }
    }

    XQQ = (m_x4 - m_x3) * (m_z4 / (m_z4 - m_z3));
    m_xq = m_xq - XQQ;
    YQQ = (m_y4 - m_y3) * (m_z4 / (m_z4 - m_z3));
    m_yq = m_yq - YQQ;
    VV1GG = 1.0 / (m_xq * m_sa + m_yq * m_ca + m_et);
    m_xp = (m_xq * m_ca - m_yq * m_sa + m_sg) * VV1GG * m_el;
    m_zp = ((DZGG * m_zfctr + m_zc) * VV1GG - m_zm) * m_el;

    if (m_jpl == 1) {
        m_kqv = 3;
    }

    if (m_z4 > 0.0) {
        ctx.strokeStyle = 'rgb(0, 0, 255)';
    }
    else {
        ctx.strokeStyle = 'rgb(255, 0, 0)';
    }

    PPlot(m_kpv, m_kqv);
    m_xp = xp_stock;
    m_zp = zp_stock;
    m_kqv = 2;

    if (m_jpl == 1) {
        m_kqv = 3;
    }

    if (m_z4 < 0) {
        ctx.strokeStyle = 'rgb(0, 0, 255)';
    }
    else {
        ctx.strokeStyle = 'rgb(255, 0, 0)';
    }

    PPlot(m_kpv, m_kqv);

    return;
}

// ================ //
//   Contour Line   //
// ================ //
// -----------To find starting point-------------
function ContLn()
{
    let rt;
    let irep;
    let ua1, ua2;
    let kvb;
    let iab, jab;
    let it, jt;            // 等高線探索で探索中の格子(P1, P2, P3, P4)の状態を制御する変数(m_ksと組み合わせて使用する)
    let i, j;
    let KKB;
    let KXB, KYB;
    let KERR;
    let KG;
    let MB;
    let BVB;
    let alx, aly;

    let flg_zMaxNotFound = false;
   let flg_zMinNotFound = false;
    let iResult = 0;

    for (let i = 1; i < m_nx + 1; i++) {
        for (let j = 1; j < m_ny + 1; j++) {
            m_ksw[i][j] = 0;
        }
    }

    //////// ==========================
    for (KKB = 1; KKB < m_kh + 1; KKB++) {
        KERR = 0;

        kvb = KKB;
        m_dHV = m_height[kvb];
        if (m_dHV < 0) {
            ctx.strokeStyle = 'rgb(0, 0, 255)';
        }
        else {
            ctx.strokeStyle = 'rgb(255, 0, 0)';
        }
        //// ==============================
        for (KXB = 1; KXB < m_nx + 1; KXB++) {
            BVB = m_alt[KXB][1] - m_dHV;
            if (BVB < 0) {
                KG = 2;
            }
            else if (BVB == 0) {
                KG = 3;
            }
            else {
                KG = 1;
            }

            if (m_ksw[KXB][1] == kvb) {
                if (m_alt[KXB][2] - m_dHV <= 0) {
                    KG = 2;
                }
            }
            //// ==============================
            for (KYB = 2; KYB < m_ny + 1; KYB++) {
                BVB = m_alt[KXB][KYB] - m_dHV;
                // xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                if (m_ksw[KXB][KYB] == kvb) {
                    switch (KG)
                    {
                    case 1:
                        KG = 2;
                        if (KYB != m_ny && m_alt[KXB][KYB + 1] - m_dHV > 0) {
                            KG = 1;
                        }
                        break;
                    case 2:
                        KG = 1;
                        if (BVB < 0) {
                            KG = 2;
                        }
                        break;
                    }
                }
                // xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                else {
                // xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                    switch (KG) // switch start
                    {
                    case 1:
                        // ----- m_alt(KXB,1) > HV -----
                        if (BVB <= 0) {
                            irep = 0;
                            // =========================
                            for (MB = 1; MB <= 2; MB++) {
                                iab = KXB;
                                jab = KYB - 1;
                                switch (MB)
                                {
                                case 1:
                                    if (KXB == m_nx) continue;

                                    it = 1;
                                    m_ks = -1;
                                    break;
                                case 2:
                                    if (KXB == 1)    continue;
                                    if (irep >= 2)   continue;

                                    it = -1;
                                    m_ks = 1;
                                    m_ksw[iab][jab] = 0;
                                    break;
                                }
                                jt = 0;
                                ua1 = m_alt[iab][jab];
                                ua2 = m_alt[iab][jab + 1];
                                alx = m_hxfc * (iab - 1);
                                rt = (ua2 - m_dHV) / (ua1 - ua2);
                                aly = m_hyfc * (jab + rt);
                                KERR = 1;
                                APlot(alx, aly, 3);
                                APlot(alx, aly, 0);
                                SearchF(ua1, ua2, kvb, iab, jab, it, jt);
                            }
                            // MB ======================

                            KG = 2;
                        }
                        break;
                    case 2:
                        // ----- m_alt(KXB,1) < HV -----
                        if (BVB > 0) {
                            irep = 0;
                            // =========================
                            for (MB = 1; MB <= 2; MB++) {
                                iab = KXB;
                                jab = KYB;
                                switch (MB)
                                {
                                case 1:
                                    if (KXB == m_nx) continue;

                                    it = 1;
                                    m_ks = 1;
                                    break;
                                case 2:
                                    if (KXB == 1 || irep >= 2) continue;

                                    it = -1;
                                    m_ks = -1;
                                    m_ksw[iab][jab] = 0;
                                    break;
                                }
                                jt = 0;
                                ua1 = m_alt[iab][jab];
                                ua2 = m_alt[iab][jab - 1];
                                alx = m_hxfc * (iab - 1);
                                rt = (ua1 - m_dHV) / (ua1 - ua2);
                                aly = m_hyfc * ((jab - 1) - rt);
                                KERR = 1;
                                APlot(alx, aly, 3);
                                APlot(alx, aly, 0);
                                SearchF(ua1, ua2, kvb, iab, jab, it, jt);
                            }
                            // MB ==================

                            KG = 1;
                        }
                        break;
                    case 3:
                        if (BVB < 0) {
                            KG = 2;
                        }
                        else if (BVB == 0) {
                            KG = 3;
                        }
                        else {
                            KG = 1;
                        }

                    } // switch end
                }
                // xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
            }
            //// KYB =========================
        }
        //// KXB =========================
        if (KERR == 0) {
            if (m_dHV == m_zMax) flg_zMaxNotFound = true;
            if (m_dHV == m_zMin) flg_zMinNotFound = true;
        }
    }
    //////// KKB ======================

    if (flg_zMaxNotFound && flg_zMinNotFound) {
        iResult = RES_CONT_NO_ZBOTH;
    }
    else if (!flg_zMaxNotFound && flg_zMinNotFound) {
        iResult = RES_CONT_NO_ZMIN;
    }
    else if (flg_zMaxNotFound && !flg_zMinNotFound) {
        iResult = RES_CONT_NO_ZMAX;
    }

    return iResult;
}

//  ----------To draw contour line---------------
function SearchF(ua1, ua2, kvb, iab, jab, it, jt)
{
    let rt;
    let irep;
    //  --------To draw contour line------------
    let LN, LL;
    let IAV, JAV;
    let ITV, JTV;
    let va1, va2;
    let alx = 0.0, aly = 0.0;

    LN = 800;
    irep = 0;

    //// ******************************* 
    for (LL = 2; LL < LN + 1; LL++) {
        if (m_ksw[iab][jab] == kvb) {
            APlot(alx, aly, 3);
            return;
        }

        IAV = iab + it;
        if (IAV <= 0 || IAV > m_nx) {
            m_ksw[iab][jab] = kvb;
            APlot(alx, aly, 3);
            return;
        }

        JAV = jab + jt;
        if (JAV <= 0 || JAV > m_ny) {
            m_ksw[iab][jab] = kvb;
            APlot(alx, aly, 3);
            return;
        }

        va1 = m_alt[IAV][JAV];
        if (va1 - m_dHV > 0.0) {
            irep = 0;
            ITV = m_ks * jt;
            JTV = -m_ks * it;
            IAV = IAV + ITV;
            JAV = JAV + JTV;
            va2 = m_alt[IAV][JAV];
            if (va2 - m_dHV > 0.0) {
                ITV = m_ks * jt;
                JTV = -m_ks * it;
                rt = (ua2 - m_dHV) / (ua2 - va2);
                alx = m_hxfc * (iab + ITV - 1 + rt * it);
                aly = m_hyfc * (jab + JTV - 1 + rt * jt);
                APlot(alx, aly, 2);
                m_ksw[iab][jab] = kvb;
                iab = iab + it + ITV;
                jab = jab + jt + JTV;
                it = ITV;
                jt = JTV;
                ua1 = va2;
            }
            else {
                rt = (va1 - m_dHV) / (va1 - va2);
                alx = m_hxfc * (iab + it - 1 + rt * ITV);
                aly = m_hyfc * (jab + jt - 1 + rt * JTV);
                APlot(alx, aly, 2);
                m_ksw[iab][jab] = kvb;
                iab = iab + it;
                jab = jab + jt;
                ua1 = va1;
                ua2 = va2;
            }
        }
        else {
            irep = irep + 1;
            rt = (ua1 - m_dHV) / (ua1 - va1);
            alx = m_hxfc * (iab - 1 + rt * it);
            aly = m_hyfc * (jab - 1 + rt * jt);
            APlot(alx, aly, 2);

            ITV = it;
            it = -m_ks * jt;
            jt = m_ks * ITV;
            ua2 = va1;
            if (irep >= 4) {
                m_ksw[iab][jab] = kvb;
                APlot(alx, aly, 3);
                return;
            }
        }
    }
    //// ******************************* 

    APlot(alx, aly, 3);

    return;
}

function HLN()
{
    //return;
    //  ------Hidden line---------------
    let v1;

    let eps;
    let u, v;
    let dTX, dTY;
    let KPQ;
    let dDX, dDY;
    let dXv, dYv, dZv;
    let dXvS, dYvS, dZvS;
    let dZvC;
    let dZpv;
    let IV, JV;
    let IA, JA;
    let IAV;
    let AKX, AKY;
    let KR;
    let KY;
    let KYL;
    let KXLV, KYLV;
    let KXV, KYV;
    let KXXV, KYYV;
    let K;
    let dXvv, dYvv;
    let z2;
    let KHL;
    let KX;
    let KXL;
    let JAV;

    let kpl = 1;

    if (m_lhl == 0) {
        return kpl;
    }

    eps = 0.0001;

    IV = 0; // 20230814 add
    JV = 0;

    u = m_ca - m_xp / m_el * m_sa;
    if (u == 0.0) u = 0.00001;

    v = m_xp / m_el * m_ca + m_sa;
    if (v == 0.0) v = 0.00001;

    dTX = u / v;
    dTY = v / u;

    // *******************************
    KPQ = 0;

    dDY = dTX * m_xq;
    dYv = m_yq - dDY;
    if (dYv >= -eps && dYv <= m_yw + eps) {
        IV = fix(0.9999 * m_xq / m_hxfc) + 1;

        if (m_xq < eps) IV = 0;

        JV = fix((math.abs(dDY) + eps) / m_hyfc);

        IA = IV + 1;
        AKY = m_yq / m_hyfc;
        JA = fix(1.0001 * AKY) + 1;
        KR = 0;
        if (math.abs(AKY - (JA - 1)) > eps) {
            KR = 1;
        }
        KPQ = 1;
        KXV = -1;
        KYV = -1;

        if (dDY < 0.0) KYV = 1;
        if (KYV == -1) JA = JA + KR;

        v = dYv * m_ca;
    }

    dDY = dTX * (m_xw - m_xq);
    dYv = m_yq + dDY;
    if (dYv >= -eps && dYv <= m_yw + eps) {
        v1 = m_xws + dYv * m_ca;
        if (KPQ == 0 || v1 <= v) {
            IV = fix(0.9999 * (m_xw - m_xq) / m_hxfc) + 1;

            if (m_xq > m_xw - eps) IV = 0;

            JV = fix((math.abs(dDY) + eps) / m_hyfc);
            IA = m_nx - IV;
            AKY = m_yq / m_hyfc;
            JA = fix(1.0001 * AKY) + 1;
            KR = 0;
            if (math.abs(AKY - (JA - 1)) > eps) {
                KR = 1;
            }
            KPQ = 1;
            KXV = 1;
            KYV = 1;

            if (dDY < 0.0) KYV = -1;
            if (KYV == -1) JA = JA + KR;

            v = v1;
        }
    }

    dDX = dTY * m_yq;
    dXv = m_xq - dDX;
    if (dXv >= -eps && dXv <= m_xw + eps) {
        v1 = dXv * m_sa;
        if (KPQ == 0 || v1 < v) {
            IV = fix((math.abs(dDX) + eps) / m_hxfc);
            JV = fix(0.9999 * m_yq / m_hyfc) + 1;

            if (m_yq < eps) JV = 0;

            AKX = m_xq / m_hxfc;
            IA = fix(1.0001 * AKX) + 1;
            KR = 0;
            if (math.abs(AKX - (IA - 1)) > eps) {
                KR = 1;
            }
            JA = JV + 1;
            KPQ = 1;
            KYV = -1;
            KXV = -1;

            if (dDX < 0.0) KXV = 1;
            if (KXV == -1) IA = IA + KR;

            v = v1;
        }
    }

    dDX = dTY * (m_yw - m_yq);
    dXv = m_xq + dDX;
    if (dXv >= -eps && dXv <= m_xw + eps) {
        v1 = m_ywc + dXv * m_sa;
        if (KPQ == 0 || v1 < v) {
            IV = fix((math.abs(dDX) + eps) / m_hxfc);
            JV = fix(0.9999 * (m_yw - m_yq) / m_hyfc) + 1;

            if (m_yq > m_yw + eps) JV = 0;

            AKX = m_xq / m_hxfc;
            IA = fix(1.0001 * AKX) + 1;
            KR = 0;
            if (math.abs(AKX - (IA - 1)) > eps) {
                KR = 1;
            }
            JA = m_ny - JV;
            KYV = 1;
            KXV = 1;

            if (dDX < 0.0) KXV = -1;
            if (KXV == -1) IA = IA + KR;

            v = v1;
        }
    }
    // *******************************

        if (JV != 0) {
            dXv = m_xq;
            dYv = m_yq;
            dZv = m_zq;
            // *******************************
            for (K = 1; K < JV + 1; K++) {
                JA = JA + KYV;
                dYvS = dYv;
                dXvS = dXv;
                dYv = m_hyfc * (JA - 1);
                dXv = m_xq + dTY * (dYv - m_yq);
                AKX = dXv / m_hxfc;
                KX = fix(1.0001 * AKX) + 1;
                KXL = KX + 1;
                dZvS = dZv;
                dXvv = m_hxfc * (KX - 1);
                JAV = m_mpy * (JA - 1) + 1;
                KXXV = m_mpx * (KX - 1) + 1;
                KXLV = m_mpx * (KXL - 1) + 1;
                dZv = (m_alt[KXLV][JAV] - m_alt[KXXV][JAV]) * (dXv - dXvv) / m_hxfc + m_alt[KXXV][JAV];

                if (dZv > m_zMax) z2 = m_zMax;
                if (dZv < m_zMin) z2 = m_zMin;

                if (dZv > m_zMax || dZv < m_zMin) {
                    dZvC = 0.0;
                    if (z2 != dZvS) {
                        if (dZv != dZvS) {
                            dZvC = (dZv - z2) / (dZv - dZvS);
                        }
                    }
                    dXv = dXv - dZvC * (dXv - dXvS);
                    dYv = dYv - dZvC * (dYv - dYvS);
                    dZv = z2;
                }

                dZpv = ((dZv * m_zfctr + m_zc) / (dXv * m_sa + dYv * m_ca + m_et) - m_zm) * m_el;
                if (K == 1) {
                    KHL = 2;
                    if (m_zp < dZpv)    KHL = 1;
                }
                else {
                    switch (KHL)
                    {
                    case 1:
                        if (m_zp > dZpv) {
                            kpl = -1;
                            return kpl;
                        }
                        break;
                    case 2:
                        if (m_zp < dZpv) {
                            kpl = -1;
                            return kpl;
                        }
                        break;
                    }
                }
            }
            // *******************************
        }
        //// ******************************* 
        if (IV != 0) {
            dXv = m_xq;
            dYv = m_yq;
            dZv = m_zq;
            // *******************************
            for (K = 1; K < IV + 1; K++) {
                IA = IA + KXV;
                dXvS = dXv;
                dYvS = dYv;
                dXv = m_hxfc * (IA - 1);
                dYv = m_yq + dTX * (dXv - m_xq);
                AKY = dYv / m_hyfc;
                KY = fix(1.0001 * AKY) + 1;
                KYL = KY + 1;
                dZvS = dZv;
                dYvv = m_hyfc * (KY - 1);
                IAV = m_mpx * (IA - 1) + 1;
                KYYV = m_mpy * (KY - 1) + 1;
                KYLV = m_mpy * (KYL - 1) + 1;
                dZv = (m_alt[IAV][KYLV] - m_alt[IAV][KYYV]) * (dYv - dYvv) / m_hyfc + m_alt[IAV][KYYV];

                if (dZv > m_zMax) z2 = m_zMax;
                if (dZv < m_zMin) z2 = m_zMin;

                if (dZv > m_zMax || dZv < m_zMin) {
                    dZvC = 0.0;
                    if (z2 != dZvS) {
                        if (dZv != dZvS) {
                            dZvC = (dZv - z2) / (dZv - dZvS);
                        }
                    }
                    dXv = dXv - dZvC * (dXv - dXvS);
                    dYv = dYv - dZvC * (dYv - dYvS);
                    dZv = z2;
                }

                dZpv = ((dZv * m_zfctr + m_zc) / (dXv * m_sa + dYv * m_ca + m_et) - m_zm) * m_el;
                if (K == 1) {
                    KHL = 2;
                    if (m_zp < dZpv) KHL = 1;
                }
                else {
                    switch (KHL)
                    {
                    case 1:
                        if (m_zp > dZpv) {
                            kpl = -1;
                            return kpl;
                        }
                        break;
                    case 2:
                        if (m_zp < dZpv) {
                            kpl = -1;
                            return kpl;
                        }
                        break;
                    }
                }
            }
            // *******************************
            if (JV < IV) {
                return kpl;
            }
        }

    return kpl;
}

function fix(number)
{
    let fix_number;

    // fix が使えず，sgn もないので...
    let sgn = 1;
    if (number < 0) {
        sgn = -1;
    }
    fix_number = sgn * Math.trunc(math.abs(number));

    return fix_number;
}

// ******************************************************************
// html <-> js のI/O
// ******************************************************************

// 描画開始処理
function startDraw() {
    ma = parseFloat(document.getElementById('ma').value);
    mb = parseFloat(document.getElementById('mb').value);
    mc = parseFloat(document.getElementById('mc').value);
    md = parseFloat(document.getElementById('md').value);
    me = parseFloat(document.getElementById('me').value);
    mf = parseFloat(document.getElementById('mf').value);
    m_xMin = parseFloat(document.getElementById('m_xMin').value);
    m_xMax = parseFloat(document.getElementById('m_xMax').value);
    m_yMin = parseFloat(document.getElementById('m_yMin').value);
    m_yMax = parseFloat(document.getElementById('m_yMax').value);
    m_zMin = parseFloat(document.getElementById('m_zMin').value);
    m_zMax = parseFloat(document.getElementById('m_zMax').value);
    // メッシュ読み込み
    changeMeshDraw()
    
    if (m_index >= 901) {
        let r;
        var errorMessages = document.getElementById('errorMessages');
        // 20240513 add for user definition
        formula_fxy = document.getElementById('i_fxy').value;
        formula_where = document.getElementById('i_where').value;
        fxy.innerHTML = '';
        where.innerHTML = '';
        errorMessages.innerHTML = '';
        
        let ngFlg;
        ngFlg = checkSubFunction(ngFlg);
        if (ngFlg == true) {
            errorMessages.innerHTML += '<p>Error in : where</p>';
            return;
        }

        // 入力された方程式(右辺)に数字(ただし、1～9)が含まれていないかつxもyも含まれていない場合をチェック
        if (containsNumbers(formula_fxy) == false && formula_fxy.indexOf('x') == -1 && formula_fxy.indexOf('y') == -1) {
            errorMessages.innerHTML += '<p>Error in : f(x, y)</p>';
            return;
        }

        // 数式であるか判定し、NGの場合はメッセージを表示して、終了する
        try {
            // まず、rを計算
            r = math.evaluate(formula_where, { x: 0, y: 0 });
        } catch (error) {
            errorMessages.innerHTML += '<p>Error in where</p>';
            return;
        }
        try {
            // 次に、計算されたrを使って最終的な数式を評価
            const mathTmp = math.evaluate(formula_fxy, { x: 0, y: 0, r: r });
        } catch (error) {
            errorMessages.innerHTML += '<p>Error in f(x, y)</p>';
            return;
        }

        try {
            node_fxy = math.parse(formula_fxy);
        } catch (error) {
            errorMessages.innerHTML += '<p>Error in f(x, y)</p>';
            return;
        }
        try {
            node_where = math.parse(formula_where);
        } catch (error) {
            errorMessages.innerHTML += '<p>Error in where</p>';
            return;
        }

        errorMessages.innerHTML = '';

        let fxyTex = "f(x, y) &=& " + node_fxy.toTex();
        let whereTex = "r = " + node_where.toTex();

        // 長い式を分割
        let maxLineLength = 40; // 最大文字数（調整可能）
        let splitfxyTex;
        if (fxyTex.length > 120) {
            splitfxyTex = splitLongTex(fxyTex, maxLineLength);
        }
        else {
            splitfxyTex = fxyTex;
        }

        document.getElementById('fxy').innerHTML = "$ \\begin{eqnarray*}" + splitfxyTex + "\\end{eqnarray*} $";
        if (whereTex == "r = undefined") {
            document.getElementById('where').innerHTML = "$\\;$ where, $\\;r = $ unused";
        }
        else {
            document.getElementById('where').innerHTML = "$\\;$ where, $\\;" + whereTex + "$";
        }
    }

    // 描画領域をリセット
    ctx.fillStyle = bkColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    m_yw = m_xw;

    // スケーリング
    scaleX = canvas.width / (m_xw * 1.5);
    scaleY = canvas.height / (m_yw * 1.5);

    // 他の処理が終わった後にMathJaxを再度実行する
    TeX();

    // アングル以外が変更されたか否かを示すフラグ
    changeFlg = true;
    PerPlt(m_index)
}

//-//////////////////////////////////////////////-//
// 入力ボックスの式を評価するためのサブ関数 START
//-//////////////////////////////////////////////-//

// 入力された方程式(右辺)の諸チェック

function checkSubFunction() {
    let flg = false;
    // formula_fxy に r が含まれていないのに、whereに値が入っていた場合は、エラー終了する
    if (formula_fxy.indexOf('r') == -1) {
        if (formula_where.length > 0) {
            flg = true;
        }
    }
    // formula_fxy に r が含まれているのに、whereに値が入っていない場合は、エラー終了する
    if (formula_fxy.indexOf('r') != -1) {
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

function splitLongTex(tex, maxLineLength) {
    let result = '';
    let currentLine = '';
    let brackets = 0;
    let characters = tex.split('');

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

//-//////////////////////////////////////////////-//
// 入力ボックスの式を評価するためのサブ関数   END
//-//////////////////////////////////////////////-//

// ユーザー定義関数が変更されたときはスタートボタンを使用可にセットする
function changeUserInput() {
    document.getElementById('start').disabled = false;
}

// 係数が変更されたときはスタートボタンを使用可にセットする
function changeCoef() {
    document.getElementById('start').disabled = false;
}

// リセット処理(アングルをデフォルトに戻す)
function resetDraw() {
    resetFlg = true;
    changeType();
    // slider bar
    $("#horizontal-slider").slider("value", m_alpha);
    $("#vertical-slider").slider("value", m_gamma);

    // アングル以外が変更されたか否かを示すフラグ
    changeFlg = true;
    PerPlt(m_index)

    resetFlg = false;
    document.getElementById('reset').disabled = true;
}

/// ストレージフラグ
function handleCheckboxStorage(flg) {
    kzPers_StorageFlg = flg;
    localStorage.setItem('kzPers_StorageFlg', flg);
    if (!flg) {
        localStorage.removeItem('kzPers_SelectedType');
        localStorage.removeItem('kzPers_StorageFlg'); // フラグを削除
    }
}
function handleCheckboxBackColor(flg) {
    kzPers_Storage2Flg = flg;
    localStorage.setItem('kzPers_Storage2Flg', flg);
    if (!flg) {
        bkColor = 'rgb(0, 0, 0)';
        localStorage.removeItem('kzPers_BackColor');
        localStorage.removeItem('kzPers_Storage2Flg'); // フラグを削除
    }
    else {
        bkColor = 'rgb(255, 255, 255)';
    }
}

// 描画範囲の変更
function updateRange() {
    m_xMin = parseFloat(document.getElementById('m_xMin').value);
    m_xMax = parseFloat(document.getElementById('m_xMax').value);
    m_yMin = parseFloat(document.getElementById('m_yMin').value);
    m_yMax = parseFloat(document.getElementById('m_yMax').value);
    m_zMin = parseFloat(document.getElementById('m_zMin').value);
    m_zMax = parseFloat(document.getElementById('m_zMax').value);

    m_hx = ((m_xMax - m_xMin) / (m_nx - 1));  // データを与える格子点の間隔
    m_hy = ((m_yMax - m_yMin) / (m_ny - 1));  // データを与える格子点の間隔
    // html
    // spacing
    document.getElementById('m_hx').value = m_hx.toFixed(1);
    document.getElementById('m_hy').value = m_hy.toFixed(1);
    // scaling
    document.getElementById('m_magX').value = (m_xw / (m_xMax - m_xMin)).toFixed(2);
    document.getElementById('m_magY').value = (m_yw / (m_yMax - m_yMin)).toFixed(2);
    document.getElementById('m_magZ').value = (m_zw / (m_zMax - m_zMin)).toFixed(2);

    // 等高線の高さ指定
    m_height[1] = m_zMin;
    m_height[2] = 0;
    m_height[3] = m_zMax;

    // スケーリング
    scaleX = canvas.width / m_xw;
    scaleY = canvas.height / m_yw;

    // スタートボタンを使用可にセット
    document.getElementById('start').disabled = false;
}

// 描画範囲をhtmlへ通知する
// changeType()で描画関数が変更されたときにデフォルトとは異なる描画範囲が指定されることがあるため
function range_to_html() {
    document.getElementById('m_xMin').value = m_xMin;
    document.getElementById('m_xMax').value = m_xMax;
    document.getElementById('m_yMin').value = m_yMin;
    document.getElementById('m_yMax').value = m_yMax;
    document.getElementById('m_zMin').value = m_zMin;
    document.getElementById('m_zMax').value = m_zMax;
}

function rangeDefault() {
    // 描画範囲
    m_xMin = -2.0;
    m_xMax =  2.0;
    m_yMin = -2.0;
    m_yMax =  2.0;
    m_zMin = -2.0;
    m_zMax =  2.0;
}

// メッシュ設定 (計算用のライン数と描画用のライン数の設定) html -> js
// 計算用ライン数ごとにセレクトボックスで選択できる描画用ライン数を切り換える
function changeMesh() {
    const lineNum = 
        {
        "20": ["20", "10"],
        "30": ["30", "15", "10"],
        "40": ["40", "20", "10"],
        "50": ["50", "25", "10"],
        "60": ["60", "30", "15", "10"],
        "70": ["70", "35", "10"],
        "80": ["80", "40", "20", "10"],
        "90": ["90", "45", "10"],
        "100": ["100", "50", "25", "10"],
        "110": ["110", "55", "10"],
        "120": ["120", "60", "30", "15", "10"],
        };
    // 1つ目のセレクトボックスの値を取得
    const selectedValue = document.getElementById("m_nx").value;

    // 2つ目のセレクトボックスの要素を取得
    m_mx = document.getElementById("m_mx");

    // 2つ目のセレクトボックスの内容をクリア
    m_mx.innerHTML = "";

    // データを取得し、2つ目のセレクトボックスにセット
    if (lineNum[selectedValue]) {
        lineNum[selectedValue].forEach(value => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = value; // 表示名
            m_mx.appendChild(option);
        });
        m_mx.disabled = false; // データがセットされたら有効化
    } else {
        m_mx.disabled = true; // データがない場合は無効化
    }
    // スタートボタンを使用可にセット
    document.getElementById('start').disabled = false;
}

// 描画用ライン数の選択で変更されるspacingとscalingをhtmlへ通知する
function changeMeshDraw() {
    m_nx = parseInt(document.getElementById('m_nx').value) + 1 || m_nx;
    m_mx = parseInt(document.getElementById('m_mx').value) + 1 || m_mx;
    m_ny = m_nx;
    m_my = m_mx;
    m_hx = ((m_xMax - m_xMin) / (m_nx - 1));  // データを与える格子点の間隔
    m_hy = ((m_yMax - m_yMin) / (m_ny - 1));  // データを与える格子点の間隔
    // html
    // spacing
    document.getElementById('m_hx').value = m_hx.toFixed(2);
    document.getElementById('m_hy').value = m_hy.toFixed(2);
    // scaling
    document.getElementById('m_magX').value = (m_xw / (m_xMax - m_xMin)).toFixed(2);
    document.getElementById('m_magY').value = (m_yw / (m_yMax - m_yMin)).toFixed(2);
    document.getElementById('m_magZ').value = (m_zw / (m_zMax - m_zMin)).toFixed(2);

    // スタートボタンを使用可にセット
    document.getElementById('start').disabled = false;
}

// 描画角度 変更 html -> js
function changeAngle() {
    if (document.getElementById('angleAlpha').value != "") {
        m_alpha = parseInt(document.getElementById('angleAlpha').value);
    }
    if (document.getElementById('angleGamma').value != "") {
        m_gamma = parseInt(document.getElementById('angleGamma').value);
    }
//    m_alpha = parseInt(document.getElementById('angleAlpha').value) || m_alpha;
//    m_gamma = parseInt(document.getElementById('angleGamma').value) || m_gamma;

    if (m_gamma >= 90.0) {
        m_gamma90Flg = 1;
        m_gamma = 89.0;
    }
    else {
        m_gamma90Flg = 0;
    }
    if (m_gamma <= -90.0) {
        m_gamma90Flg = 1;
        m_gamma = -89.0;
    }
    else {
        m_gamma90Flg = 0;
    }

    // アングル以外が変更されたか否かを示すフラグ
    changeFlg = false;

    if (drawnFlg == true)
        {
        // Resetボタンを使用可に設定
        document.getElementById('reset').disabled = false;
        ///mapping();
        PerPlt(m_index);
    }
}

// 描画角度 設定 js -> html
function setAngle() {
    document.getElementById('angleAlpha').value = m_alpha;
    document.getElementById('angleGamma').value = m_gamma;
    // slider bar
    $("#horizontal-slider").slider("value", m_alpha);
    $("#vertical-slider").slider("value", m_gamma);

}

// 係数入力ボックスの使用可否をhtmlに通知する
function changeProperty(flg) {
        ma_used = 0;
        mb_used = 0;
        mc_used = 0;
        md_used = 0;
        me_used = 0;
        mf_used = 0;
        document.getElementById('ma').value = "";
        document.getElementById('mb').value = "";
        document.getElementById('mc').value = "";
        document.getElementById('md').value = "";
        document.getElementById('me').value = "";
        document.getElementById('mf').value = "";
        if (flg == 0) {
            document.getElementById('ma').disabled = true;
            document.getElementById('mb').disabled = true;
            document.getElementById('mc').disabled = true;
            document.getElementById('md').disabled = true;
            document.getElementById('me').disabled = true;
            document.getElementById('mf').disabled = true;
        }
        else {
            document.getElementById('ma').disabled = false;
            document.getElementById('mb').disabled = false;
            document.getElementById('mc').disabled = false;
            document.getElementById('md').disabled = false;
            document.getElementById('me').disabled = false;
        }
}

// 係数入力ボックスの表示/非表示を切り換える
function dispCoef(flg) {
    if (flg == 0) {
        // 係数入力ボックスを非表示にする
        document.getElementById('l_coef').style.display = "none";

        document.getElementById('l_ma').style.display = "none";
        document.getElementById('l_mb').style.display = "none";
        document.getElementById('l_mc').style.display = "none";
        document.getElementById('l_md').style.display = "none";
        document.getElementById('l_me').style.display = "none";
        document.getElementById('l_mf').style.display = "none";
        document.getElementById('ma').style.display = "none";
        document.getElementById('mb').style.display = "none";
        document.getElementById('mc').style.display = "none";
        document.getElementById('md').style.display = "none";
        document.getElementById('me').style.display = "none";
        document.getElementById('mf').style.display = "none";
    }
    else if (flg == 1) {
        // 係数入力ボックスを表示する
        document.getElementById('l_coef').style.display = "inline-block";

        document.getElementById('l_ma').style.display = "inline-block";
        document.getElementById('l_mb').style.display = "inline-block";
        document.getElementById('l_mc').style.display = "inline-block";
        document.getElementById('l_md').style.display = "inline-block";
        document.getElementById('l_me').style.display = "inline-block";
        document.getElementById('l_mf').style.display = "inline-block";
        document.getElementById('ma').style.display = "inline-block";
        document.getElementById('mb').style.display = "inline-block";
        document.getElementById('mc').style.display = "inline-block";
        document.getElementById('md').style.display = "inline-block";
        document.getElementById('me').style.display = "inline-block";
        document.getElementById('mf').style.display = "inline-block";
    }
}

// ユーザー定義関数入力ボックスの表示/非表示を切り換える
function dispFormula(flg) {
    if (flg == 0) {
        // 方程式入力ボックスを非表示にする
        document.getElementById('l_fxy').style.display = "none";
        document.getElementById('i_fxy').style.display = "none";
        document.getElementById('l_where').style.display = "none";
        document.getElementById('i_where').style.display = "none";
    }
    else if (flg == 1) {
        // 方程式入力ボックスを表示する
        document.getElementById('l_fxy').style.display = "inline-block";
        document.getElementById('i_fxy').style.display = "inline-block";
        document.getElementById('l_where').style.display = "inline-block";
        document.getElementById('i_where').style.display = "inline-block";
    }
}

function clearInpBox() {
    // ユーザー定義関数入力ボックスの式をクリアする
    document.getElementById('i_fxy').innerText = "";
    document.getElementById('i_where').innerText = "";
    document.getElementById('fxy').innerText = "";
    document.getElementById('where').innerText = "";
    document.getElementById('errorMessages').innerText = "";
}

////////////////////
//                //
// 描画関数の変更 //
//                //
////////////////////
function changeType(befFlg) {
    const type = String(document.getElementById('type').value);

    // ここでチェックボックスの状態を確認し、ストレージフラグを更新
    kzPers_StorageFlg = document.getElementById('pers_storage').checked;
    if (kzPers_StorageFlg == true) {
        // 選択状態をローカルストレージに保存
        localStorage.setItem('kzPers_SelectedType', type);
    }

    kzPers_Storage2Flg = document.getElementById('cb_bk_color').checked;
    if (kzPers_Storage2Flg == true) {
        // 選択状態をローカルストレージに保存
        localStorage.setItem('kzPers_BackColor', 'rgb(255, 255, 255)');
    }

    let meshSelected;
    const typeAry = type.split('&');

    // スタートボタンを使用可にセット
    document.getElementById('start').disabled = false;

    // Angle
    m_alpha =  30.0;
    m_gamma = -30.0;
    if (befFlg == 0) {
        setAngle();
    }

    if (parseInt(typeAry[0]) < 9) {
        // 方程式入力ボックスを非表示にする
        dispFormula(0);
    }

    if (parseInt(typeAry[0]) > 2 && parseInt(typeAry[0]) < 9) {
        // 係数入力ボックスを表示する
        dispCoef(1);
        // 段落のマージンを設定する
        changeDivMargin(true);
    }
    else {
        changeProperty(0);
        // 係数入力ボックスを非表示にする
        dispCoef(0);
        // 段落のマージンを設定する
        changeDivMargin(false);
    }

    switch (typeAry[0]) {
        case "01":
            switch (typeAry[1]) {
                case "01":  // f(x,y) = x^4 + xy - y^4
                    m_index = 101;
                    if (resetFlg) {
                        return;
                    }
                    // 入力ボックスの式をクリアする
                    clearInpBox();
                    // 描画範囲
                    rangeDefault();
                    range_to_html();
                    // メッシュ
                    meshSelected = document.getElementById("m_nx");
                    meshSelected.value = '20';
                    changeMesh();
                    // 係数デフォルト値
                    // 式を表示する
                    document.getElementById('fxy').innerText = "$ f(x, y) = x^4 + xy - y^4 $";
                    break;
                case "15":  // f(x,y) = x^3 - 3xy + y^3
                    m_index = 115;
                    if (resetFlg) {
                        return;
                    }
                    // 入力ボックスの式をクリアする
                    clearInpBox();
                    // 描画範囲
                    rangeDefault();
                    range_to_html();
                    // メッシュ
                    meshSelected = document.getElementById("m_nx");
                    meshSelected.value = '20';
                    changeMesh();
                    // 係数デフォルト値
                    // 式を表示する
                    document.getElementById('fxy').innerText = "$ f(x, y) = x^3 - 3xy + y^3 $";
                    break;
                case "18":  // f(x,y) = x^3 + 3xy + y^3
                    m_index = 118;
                    if (resetFlg) {
                        return;
                    }
                    // 入力ボックスの式をクリアする
                    clearInpBox();
                    // 描画範囲
                    rangeDefault();
                    range_to_html();
                    // メッシュ
                    meshSelected = document.getElementById("m_nx");
                    meshSelected.value = '20';
                    changeMesh();
                    // 係数デフォルト値
                    // 式を表示する
                    document.getElementById('fxy').innerText = "$ f(x, y) = x^3 + 3xy + y^3 $";
                    break;
                case "02":  // f(x,y) = (y - x^2)^2 + x^5
                    m_index = 102;
                    if (resetFlg) {
                        return;
                    }
                    // 入力ボックスの式をクリアする
                    clearInpBox();
                    // 描画範囲
                    rangeDefault();
                    range_to_html();
                    // メッシュ
                    meshSelected = document.getElementById("m_nx");
                    meshSelected.value = '20';
                    changeMesh();
                    // 係数デフォルト値
                    // 式を表示する
                    document.getElementById('fxy').innerText = "$ f(x, y) = (y - x^2)^2 + x^5 $";
                    break;
                case "03":  // f(x,y) = x^2y^2 / (x^2 + y^2), f(0,0) = 0
                    m_index = 103;
                    if (resetFlg) {
                        return;
                    }
                    // 入力ボックスの式をクリアする
                    clearInpBox();
                    // 描画範囲
                    rangeDefault();
                    range_to_html();
                    // メッシュ
                    meshSelected = document.getElementById("m_nx");
                    meshSelected.value = '20';
                    changeMesh();
                    // 係数デフォルト値
                    // 式を表示する
                    document.getElementById('fxy').innerText = "$ f(x, y) = x^2y^2 / (x^2 + y^2) \\quad $ where, $ \\; f(0, 0) = 0 $";
                    break;
                case "04":  // f(x,y) = (x - y) / (x + y)
                    m_index = 104;
                    if (resetFlg) {
                        return;
                    }
                    // 入力ボックスの式をクリアする
                    clearInpBox();
                    // 描画範囲
                    rangeDefault();
                    m_xMin = -1.0;
                    m_xMax =  1.0;
                    m_yMin = -1.0;
                    m_yMax =  1.0;
                    m_zMin = -5.0;
                    m_zMax =  5.0;
                    range_to_html();
                    // メッシュ
                    meshSelected = document.getElementById("m_nx");
                    meshSelected.value = '80';
                    changeMesh();
                    // 係数デフォルト値
                    // 式を表示する
                    document.getElementById('fxy').innerText = "$ f(x, y) = (x - y) / (x + y) $";
                    break;
                case "05":  // f(x,y) = |x|^y, f(0,y) = 0
                    m_index = 105;

                    m_alpha =  -125.0;
                    setAngle();

                    if (resetFlg) {
                        return;
                    }
                    // 入力ボックスの式をクリアする
                    clearInpBox();
                    // 描画範囲
                    rangeDefault();
                    m_zMin =  0.0;
                    m_zMax =  5.0;
                    range_to_html();
                    // メッシュ
                    meshSelected = document.getElementById("m_nx");
                    meshSelected.value = '20';
                    changeMesh();
                    // 係数デフォルト値
                    // 式を表示する
                    document.getElementById('fxy').innerText = "$ f(x, y) = |x|^y \\quad $ where, $ \\; f(0, y) = 0 $";
                    break;
                case "06":  // f(x,y) = xy*log(x^2 + y^2), f(0,0) = 0
                    m_index = 106;
                    if (resetFlg) {
                        return;
                    }
                    // 入力ボックスの式をクリアする
                    clearInpBox();
                    // 描画範囲
                    rangeDefault();
                    m_xMin = -1.5;
                    m_xMax =  1.5;
                    m_yMin = -1.5;
                    m_yMax =  1.5;
                    m_zMin = -0.5;
                    m_zMax =  0.5;
                    range_to_html();
                    // メッシュ
                    meshSelected = document.getElementById("m_nx");
                    meshSelected.value = '20';
                    changeMesh();
                    // 係数デフォルト値
                    // 式を表示する
                    document.getElementById('fxy').innerText = "$ f(x, y) = xy \\cdot \\log(x^2 + y^2) \\quad $ where, $ \\; f(0, 0) = 0 $"
                    break;
                case "07":  // f(x,y) = exp(-|x + y|*(x^2 + y^2))
                    m_index = 107;

                    m_alpha =  -5.0;
                    setAngle();

                    if (resetFlg) {
                        return;
                    }
                    // 入力ボックスの式をクリアする
                    clearInpBox();
                    // 描画範囲
                    rangeDefault();
                    m_xMin = -3.0;
                    m_xMax =  3.0;
                    m_yMin = -3.0;
                    m_yMax =  3.0;
                    m_zMin =  0.0;
                    m_zMax =  2.0;
                    range_to_html();
                    // メッシュ
                    meshSelected = document.getElementById("m_nx");
                    meshSelected.value = '20';
                    changeMesh();
                    // 係数デフォルト値
                    // 式を表示する
                    document.getElementById('fxy').innerText = "$ f(x, y) = \\exp(-|x + y| \\cdot (x^2 + y^2)) $";
                    break;
                case "08":  // f(x,y) = sqrt(|xy|)
                    m_index = 108;
                    if (resetFlg) {
                        return;
                    }
                    // 入力ボックスの式をクリアする
                    clearInpBox();
                    // 描画範囲
                    rangeDefault();
                    range_to_html();
                    // メッシュ
                    meshSelected = document.getElementById("m_nx");
                    meshSelected.value = '20';
                    changeMesh();
                    // 係数デフォルト値
                    // 式を表示する
                    document.getElementById('fxy').innerText = "$ f(x, y) = \\sqrt{|xy|} $";
                    break;
                case "09":  // f(x,y) = sqrt(x^2 + y^2)
                    m_index = 109;
                    if (resetFlg) {
                        return;
                    }
                    // 入力ボックスの式をクリアする
                    clearInpBox();
                    // 描画範囲
                    rangeDefault();
                    range_to_html();
                    // メッシュ
                    meshSelected = document.getElementById("m_nx");
                    meshSelected.value = '20';
                    changeMesh();
                    // 係数デフォルト値
                    // 式を表示する
                    document.getElementById('fxy').innerText = "$ f(x, y) = \\sqrt{x^2 + y^2} $";
                    break;
                case "10":  // f(x,y) = xy / sqrt(x^2 + y^2), f(0,0) = 0
                    m_index = 110;
                    if (resetFlg) {
                        return;
                    }
                    // 入力ボックスの式をクリアする
                    clearInpBox();
                    // 描画範囲
                    rangeDefault();
                    range_to_html();
                    // メッシュ
                    meshSelected = document.getElementById("m_nx");
                    meshSelected.value = '20';
                    changeMesh();
                    // 係数デフォルト値
                    // 式を表示する
                    document.getElementById('fxy').innerText = "$ f(x, y) = xy / \\sqrt{x^2 + y^2} \\quad $ where, $ \\; f(0, 0) = 0 $";
                    break;
                case "11":  // f(x,y) = xy * sin( 1 / sqrt(x^2 + y^2)), f(0,0) = 0
                    m_index = 111;
                    if (resetFlg) {
                        return;
                    }
                    // 入力ボックスの式をクリアする
                    clearInpBox();
                    // 描画範囲
                    rangeDefault();
                    m_xMin = -0.2;
                    m_xMax =  0.2;
                    m_yMin = -0.2;
                    m_yMax =  0.2;
                    m_zMin = -0.025;
                    m_zMax =  0.025;
                    range_to_html();
                    // メッシュ
                    meshSelected = document.getElementById("m_nx");
                    meshSelected.value = '40';
                    changeMesh();
                    // 係数デフォルト値
                    // 式を表示する
                    document.getElementById('fxy').innerText = "$ f(x, y) = xy \\cdot \\sin( 1 / \\sqrt{x^2 + y^2}) \\quad $ where, $ \\; f(0, 0) = 0 $";
                    break;
                case "12":  // f(x,y) = x^y * y^x
                    m_index = 112;
                    if (resetFlg) {
                        return;
                    }
                    // 入力ボックスの式をクリアする
                    clearInpBox();
                    // 描画範囲
                    rangeDefault();
                    m_xMin = 0.0;
                    m_yMin = 0.0;
                    range_to_html();
                    // メッシュ
                    meshSelected = document.getElementById("m_nx");
                    meshSelected.value = '20';
                    changeMesh();
                    // 係数デフォルト値
                    // 式を表示する
                    document.getElementById('fxy').innerText = "$ f(x, y) = x^y \\cdot y^x $";
                    break;
                case "13":  // f(x,y) = exp(-|x + y|/(x^2 + y^2)), f(0,0) = 0
                    m_index = 113;
                    if (resetFlg) {
                        return;
                    }
                    // 入力ボックスの式をクリアする
                    clearInpBox();
                    // 描画範囲
                    rangeDefault();
                    m_zMin = 0.0;
                    m_zMax = 1.0;
                    range_to_html();
                    // メッシュ
                    meshSelected = document.getElementById("m_nx");
                    meshSelected.value = '20';
                    changeMesh();
                    // 係数デフォルト値
                    // 式を表示する
                    document.getElementById('fxy').innerText = "$ f(x, y) = e^{-|x + y|/(x^2 + y^2)} \\; $ where, $ \\, f(0, 0) = 0 $";
                    break;
                case "14":  // f(x,y) = log(x^2 + y^2), f(0,0) = -∞
                    m_index = 114;
                    if (resetFlg) {
                        return;
                    }
                    // 入力ボックスの式をクリアする
                    clearInpBox();
                    // 描画範囲
                    rangeDefault();
                    range_to_html();
                    // メッシュ
                    meshSelected = document.getElementById("m_nx");
                    meshSelected.value = '20';
                    changeMesh();
                    // 係数デフォルト値
                    // 式を表示する
                    document.getElementById('fxy').innerText = "$ f(x, y) = \\log(x^2 + y^2) \\quad $ where, $ \\; f(0, 0) = - \\infty $";
                    break;
                case "16":  // f(x,y) = exp(-(x^2 + y^2) * sin(x + y))
                    m_index = 116;
                    if (resetFlg) {
                        return;
                    }
                    // 入力ボックスの式をクリアする
                    clearInpBox();
                    // 描画範囲
                    rangeDefault();
                    range_to_html();
                    // メッシュ
                    meshSelected = document.getElementById("m_nx");
                    meshSelected.value = '20';
                    changeMesh();
                    // 係数デフォルト値
                    // 式を表示する
                    document.getElementById('fxy').innerText = "$ f(x, y) = \\exp(-(x^2 + y^2) \\cdot \\sin(x + y)) $";
                    break;
                case "17":  // f(x,y) = x^4 + 2*x^2*y^2 - 6*x^2*y + y^2
                    m_index = 117;
                    if (resetFlg) {
                        return;
                    }
                    // 入力ボックスの式をクリアする
                    clearInpBox();
                    // 描画範囲
                    rangeDefault();
                    m_xMin = -3.0, m_yMin = -3.0, m_xMax = 3.0, m_yMax = 3.0;
                    m_zMin = -3.0, m_zMax = 3.0;
                    range_to_html();
                    // メッシュ
                    changeMesh();
                    meshSelected = document.getElementById("m_nx");
                    meshSelected.value = '40';
                    changeMesh();
                    // 係数デフォルト値
                    // 式を表示する
                    document.getElementById('fxy').innerText = "$ f(x, y) = x^4 + 2x^2y^2 - 6x^2y + y^2 $";
                    break;
                case "19":  // f(x,y) = x^2 + xy + y^2 - 4x - 2y
                    m_index = 119;
                    if (resetFlg) {
                        return;
                    }
                    // 入力ボックスの式をクリアする
                    clearInpBox();
                    // 描画範囲
                    rangeDefault();
                    range_to_html();
                    // メッシュ
                    meshSelected = document.getElementById("m_nx");
                    meshSelected.value = '20';
                    changeMesh();
                    // 係数デフォルト値
                    // 式を表示する
                    document.getElementById('fxy').innerText = "$ f(x, y) = x^2 + xy + y^2 - 4x - 2y $";
                    break;
                case "20":  // f(x,y) = x*sin(y / x), f(0,y) = 0
                    m_index = 120;
                    if (resetFlg) {
                        return;
                    }
                    // 入力ボックスの式をクリアする
                    clearInpBox();
                    // 描画範囲
                    rangeDefault();
                    range_to_html();
                    // メッシュ
                    meshSelected = document.getElementById("m_nx");
                    meshSelected.value = '20';
                    changeMesh();
                    // 係数デフォルト値
                    // 式を表示する
                    document.getElementById('fxy').innerText = "$ f(x, y) = x \\cdot \\sin(y / x) \\quad $ where, $ \\; f(0, y) = 0 $";
                    break;
                case "21":  // f(x,y) = exp(-(x^3 + y^3) * sin(x + y))
                    m_index = 121;
                    // 描画範囲
                    rangeDefault();
                    m_zMin = 0.0, m_zMax = 24.0;
                    range_to_html();
                    if (resetFlg) {
                        return;
                    }
                    // 入力ボックスの式をクリアする
                    clearInpBox();
                    // メッシュ
                    meshSelected = document.getElementById("m_nx");
                    meshSelected.value = '20';
                    changeMesh();
                    // 係数デフォルト値
                    // 式を表示する
                    document.getElementById('fxy').innerText = "$ f(x, y) = \\exp(-(x^3 + y^3) \\cdot \\sin(x + y)) $";
                    break;
                case "22":  // f(x,y) = x^4 + y^4 - 2(x^2 + y^2)
                    m_index = 122;
                    if (resetFlg) {
                        return;
                    }
                    // 入力ボックスの式をクリアする
                    clearInpBox();
                    // 描画範囲
                    rangeDefault();
                    range_to_html();
                    // メッシュ
                    meshSelected = document.getElementById("m_nx");
                    meshSelected.value = '20';
                    changeMesh();
                    // 係数デフォルト値
                    // 式を表示する
                    document.getElementById('fxy').innerText = "$ f(x, y) = x^4 + y^4 - 2(x^2 + y^2) $";
                    break;
                case "23":  // f(x,y) = sqrt((x^2 - y^2 - 1)^2 + 4 * x^2 * y^2)
                    m_index = 123;
                    if (resetFlg) {
                        return;
                    }
                    // 入力ボックスの式をクリアする
                    clearInpBox();
                    // 描画範囲
                    rangeDefault();
                    range_to_html();
                    // メッシュ
                    meshSelected = document.getElementById("m_nx");
                    meshSelected.value = '20';
                    changeMesh();
                    // 係数デフォルト値
                    // 式を表示する
                    document.getElementById('fxy').innerText = "$ f(x, y) = \\sqrt{(x^2 - y^2 - 1)^2 + 4 \\cdot x^2 \\cdot y^2} $";
                    break;
                defaut:
                    break;
            }
            break;
        case "02":
            switch (typeAry[1]) {
                case "01":  // f(x,y) = |sin(ω)|, ω = x + iy, x:-6.25to6.25 y:-10to10 //20230815 add
                    m_index = 201;
                    if (resetFlg) {
                        return;
                    }
                    // 入力ボックスの式をクリアする
                    clearInpBox();
                    // 描画範囲
                    rangeDefault();
                    m_xMin = -6.25, m_xMax= 6.25;
                    m_yMin =  0.0, m_yMax= 2.0;
                    m_zMin =  0.0, m_zMax =3.0;
                    range_to_html();
                    // メッシュ
                    meshSelected = document.getElementById("m_nx");
                    meshSelected.value = '40';
                    changeMesh();
                    // 係数デフォルト値
                    // 式を表示する
                    document.getElementById('fxy').innerText = "$ f(x, y) = |\\sin(\\omega)|, \\omega = x + iy $";
                    break;
                case "02":  // f(x,y) = |cos(ω)|, ω = x + iy, x:-6.25to6.25 y:-10to10 //20230815 add
                    m_index = 202;
                    if (resetFlg) {
                        return;
                    }
                    // 入力ボックスの式をクリアする
                    clearInpBox();
                    // 描画範囲
                    rangeDefault();
                    m_xMin = -6.25, m_xMax= 6.25;
                    m_yMin =  0.0, m_yMax= 2.0;
                    m_zMin =  0.0, m_zMax =3.0;
                    range_to_html();
                    // メッシュ
                    meshSelected = document.getElementById("m_nx");
                    meshSelected.value = '40';
                    changeMesh();
                    // 係数デフォルト値
                    // 式を表示する
                    document.getElementById('fxy').innerText = "$ f(x, y) = |\\cos(\\omega)|, \\omega = x + iy $";
                    break;
                case "03": //  f(x,y) = |Γ(ω)|, ω = x + iy //20230815 add
                    m_index = 203;
                    if (resetFlg) {
                        return;
                    }
                    // 入力ボックスの式をクリアする
                    clearInpBox();
                    // 描画範囲
                    rangeDefault();
//                    m_xMin = -3.5, m_xMax= 3.5;
                    m_xMin = -5.5, m_xMax= 2.5;
                    m_yMin = -3.0, m_yMax= 3.0;
                    m_zMin =  0.0, m_zMax =8.0;
                    range_to_html();
                    // メッシュ
                    meshSelected = document.getElementById("m_nx");
                    meshSelected.value = '100';
                    changeMesh();
                    // 係数デフォルト値
                    // 式を表示する
                    document.getElementById('fxy').innerText = "$ f(x, y) = |\\Gamma(\\omega)| \\,, \\quad \\omega = x + iy $";
                    break;
                defaut:
                    break;
            }
            break;
        case "03":
            switch (typeAry[1]) {
                case "01":  // f(x,y) = (x^2 + y^2 + a^2)^2 - 4a^2x^2 - b^4, Cassini Ovals, a = 0.6, b=0.4 //20230815 add
                    m_index = 301;

                    m_gamma =  -15.0;
                    setAngle();

                    if (resetFlg) {
                        return;
                    }
                    // 入力ボックスの式をクリアする
                    clearInpBox();
                    // 描画範囲
                    rangeDefault();
                    m_zMin =  -3.0, m_zMax =3.0;
                    range_to_html();
                    // メッシュ
                    meshSelected = document.getElementById("m_nx");
                    meshSelected.value = '40';
                    changeMesh();
                    // 係数デフォルト値
                    document.getElementById('ma').value = 0.6;
                    document.getElementById('mb').value = 0.4;
                    document.getElementById('ma').disabled = false;
                    document.getElementById('mb').disabled = false;
                    ma_used = 1;
                    mb_used = 1;
                    // 式を表示する
                    document.getElementById('fxy').innerText = "$ f(x, y) = (x^2 + y^2 + a^2)^2 - 4a^2x^2 - b^4 $";
//                    document.getElementById('fxy').innerText = "$ f(x, y) = (x^2 + y^2 + a^2)^2 - 4a^2x^2 - b^4 $";
                    // 係数入力ボックスを表示する
                    dispCoef(1);
                    // 段落のマージンを設定する
                    changeDivMargin(true);
                    break;
                case "02":  // f(x,y) = x^a - 2x^b*y + y^a //20230815 add
                    m_index = 302;
                    if (resetFlg) {
                        return;
                    }
                    // 入力ボックスの式をクリアする
                    clearInpBox();
                    // 描画範囲
                    rangeDefault();
                    m_zMin =  -3.0, m_zMax =3.0;
                    range_to_html();
                    // メッシュ
                    meshSelected = document.getElementById("m_nx");
                    meshSelected.value = '40';
                    changeMesh();
                    // 係数デフォルト値
                    document.getElementById('ma').value = 5.0;
                    document.getElementById('mb').value = 2.0;
                    document.getElementById('ma').disabled = false;
                    document.getElementById('mb').disabled = false;
                    ma_used = 1;
                    mb_used = 1;
                    // 式を表示する
                    document.getElementById('fxy').innerText = "$ f(x, y) = x^a - 2x^b \\cdot y + y^a  $";
                    // 係数入力ボックスを表示する
                    dispCoef(1);
                    // 段落のマージンを設定する
                    changeDivMargin(true);
                    break;
                case "03":  // f(x,y) = cos(y) - cos(x) //20230815 add
                    m_index = 303;
                    if (resetFlg) {
                        return;
                    }
                    // 入力ボックスの式をクリアする
                    clearInpBox();
                    // 描画範囲
                    rangeDefault();
                    m_xMin = -12.8, m_xMax = 12.8;
                    m_yMin = -12.8, m_yMax = 12.8;
                    m_zMin = -6.0, m_zMax = 6.0;
                    range_to_html();
                    // メッシュ
                    meshSelected = document.getElementById("m_nx");
                    meshSelected.value = '40';
                    changeMesh();
                    // 係数デフォルト値
                    document.getElementById('ma').value = "";
                    document.getElementById('mb').value = "";
                    document.getElementById('ma').disabled = true;
                    document.getElementById('mb').disabled = true;
                    ma_used = 0;
                    mb_used = 0;
                    // 式を表示する
                    document.getElementById('fxy').innerText = "$ f(x, y) = \\cos(y) - \\cos(x) $";
                    break;
                defaut:
                    break;
            }
            break;
        case "09":
            switch (typeAry[1]) {
                case "01":  // ユーザー定義
                    m_index = 901;
                    if (resetFlg) {
                        return;
                    }
                    // 入力ボックスの式をクリアする
                    clearInpBox();
                    // 方程式入力ボックスを表示する
                    dispFormula(1);

                    // 式を評価する
                    document.getElementById('i_fxy').innerText = "";
                    document.getElementById('i_where').innerText = "";

                    // 20240513 add for user definition
                    formula_fxy = "";
                    formula_where = ""

                    // 描画範囲
                    rangeDefault();
                    range_to_html();
                    // メッシュ
                    meshSelected = document.getElementById("m_nx");
                    meshSelected.value = '20';
                    changeMesh();
                    // 入力ボックスにフォーカスを合わせる
                    document.getElementById('i_fxy').focus();
                    break;
                case "02":  // ユーザー定義 サンプル 1
                    m_index = 901;
                    if (resetFlg) {
                        return;
                    }
                    // 入力ボックスの式をクリアする
                    clearInpBox();
                    // 方程式入力ボックスを表示する
                    dispFormula(1);

                    // 式を評価する
                    document.getElementById('i_fxy').innerText = "x^3 - 3*x*y + y^3";
                    document.getElementById('i_where').innerText = "";

                    // 20240513 add for user definition
                    formula_fxy = "x^3 - 3*x*y + y^3";
                    formula_where = ""

                    // 描画範囲
                    rangeDefault();
                    range_to_html();
                    // メッシュ
                    meshSelected = document.getElementById("m_nx");
                    meshSelected.value = '20';
                    changeMesh();
                    // 入力ボックスにフォーカスを合わせる
                    document.getElementById('i_fxy').focus();
                    break;
                case "03":  // ユーザー定義 サンプル 2
                    m_index = 901;
                    if (resetFlg) {
                        return;
                    }
                    // 入力ボックスの式をクリアする
                    clearInpBox();
                    // 方程式入力ボックスを表示する
                    dispFormula(1);

                    // 式を評価する
                    document.getElementById('i_fxy').innerText = "x * (1 - 2 * r) - y * (1 + 2 * r) * (r^2 - (x^2 - y^2))";
//debug//                    document.getElementById('i_fxy').innerText = "x * (1 - 2 * r) - y * (1 + 2 * r)";
//                    document.getElementById('i_fxy').innerText = "(x - y) / (x + y)";
//                    document.getElementById('i_fxy').innerText = "x(1 - 2r) - y(1 + 2r) * (r^2 - (x^2 - y^2))";
                    document.getElementById('i_where').innerText = "x^2 + y^2";
//                    document.getElementById('i_where').innerText = "";

                    // 20240513 add for user definition
                    formula_fxy = "x * (1 - 2 * r) - y * (1 + 2 * r) * (r^2 - (x^2 - y^2))";
//debug//                    formula_fxy = "x * (1 - 2 * r) - y * (1 + 2 * r) * (x^2 - y^2)";
                    formula_where = "x^2 + y^2"
//                    formula_fxy = "(x - y) / (x + y)";
//                    formula_where = ""

                    // 描画範囲
                    rangeDefault();
                    range_to_html();
                    // メッシュ
                    meshSelected = document.getElementById("m_nx");
                    meshSelected.value = '80';
                    changeMesh();
                    // 入力ボックスにフォーカスを合わせる
                    document.getElementById('i_fxy').focus();
                    break;
                defaut:
                    break;
            }
                    // 式を表示する
                    node_fxy = math.parse(formula_fxy);
                    node_where = math.parse(formula_where);

                    let fxyTex = "f(x, y) &=& " + node_fxy.toTex();
                    let whereTex = "r = " + node_where.toTex();

                    // 長い式を分割
                    let maxLineLength = 40; // 最大文字数（調整可能）
                    let splitfxyTex;
                    if (fxyTex.length > 120) {
                        splitfxyTex = splitLongTex(fxyTex, maxLineLength);
                    }
                    else {
                        splitfxyTex = fxyTex;
                    }

                    if (fxyTex == "f(x, y) &=& undefined") {
                        document.getElementById('fxy').innerHTML = "$ f(x, y) = $ undefined";
                    }
                    else {
                        document.getElementById('fxy').innerHTML = "$ \\begin{eqnarray*}" + splitfxyTex + "\\end{eqnarray*} $";
                    }
                    if (whereTex == "r = undefined") {
                        document.getElementById('where').innerHTML = "$\\;$ where, $\\;r = $ unused";
                    }
                    else {
                        document.getElementById('where').innerHTML = "$\\;$ where, $\\;" + whereTex + "$";
                    }

        defaut:
            break;
    }
    // スケーリング
    scaleX = canvas.width / m_xw;
    scaleY = canvas.height / m_yw;

    updateRange();
//    // 描画開始 <- 最初に画面がloadされたとき、一発目だけアングルの変更でこける why?
//    startDraw();

    // 他の処理が終わった後にMathJaxを再度実行する
    TeX();

}

// 描画関数の定義
// changeType()で選択された関数のz値をALT_Calc(m_index)で求める
function FXY(x, y, m_index) {
    let FXY;
    switch (m_index)
    {
        case 101:
            //描画関数 [01] 01  f(x,y) = x^4 +xy - y^4 
            //FXY = math.sin(math.sqrt(x * x + y * y));
            //FXY = x * y;
            FXY = x*x*x*x + x * y - y*y*y*y;
            return FXY;
        case 102:
            //描画関数 [01] 02  f(x,y) = (y - x^2)^2 + x^5 
            FXY = (y - x*x) * (y - x*x) + x*x*x*x*x;
            return FXY;
        case 103:
            //描画関数 [01] 03  f(x,y) = x^2 * y^2 / (x^2 + y^2), f(0,0) = 0
            if (x == 0.0 && y == 0.0) {
                FXY = 0.0;
            }
            else {
                //FXY = x*x * y*y / (x*x + y*y);
                FXY = math.pow(x, 2.0) * math.pow(y, 2.0) / (math.pow(x, 2.0) + math.pow(y, 2.0));
            }
            
            return FXY;
        case 104:
            //描画関数 [01] 04  f(x,y) = (x - y) / (x + y) 
            if (x + y == 0.0) {
                if (x - y >= 0.0) {
                    //zValue = 2.2250738585072014E+8;
                    FXY = D_CONST;
                }
                else {

                    //zValue = -2.2250738585072014E+8;
                    FXY = -D_CONST;
                }
            }
            else {
                FXY = (x - y) / (x + y);
            }
            return FXY;
        case 105:
            //描画関数 [01] 05  f(x,y) = |x|^y, f(0,y) = 0
            if (x == 0.0) {
                FXY = 0.0;
            }
            else {
                FXY = math.pow(math.abs(x), y);
            }
            return FXY;
        case 106:
            //描画関数 [01] 06  f(x,y) =  xy*log(x^2 + y^2), f(0,0) = 0
            if (x == 0.0 && y == 0.0) {
                FXY = 1.0;
            }
            else {
                FXY = x * y * math.log(math.pow(x, 2.0) + math.pow(y, 2.0));
            }
            return FXY;
        case 107:
            //描画関数 [01] 07  f(x,y) = exp(-|x + y|*(x^2 + y^2)), f(0,0) = 0
            //描画関数 [01] 07  f(x,y) = exp(-|x + y|*(x^2 + y^2))
            //FXY = exp(-fabs(x + y)*(x*x + y*y));
            FXY = math.exp(-math.abs(x + y)*(math.pow(x, 2.0) + math.pow(y, 2.0)));
            return FXY;
        case 108:
            //描画関数 [01] 08  f(x,y) = sqrt(|xy|), f(0,0) = 0
            FXY = math.sqrt(math.abs(x*y));
            return FXY;
        case 109:
            //描画関数 [01] 08  f(x,y) = sqrt(x^2 + y^2)
            FXY = math.sqrt(x*x + y*y);
            return FXY;
        case 110:
            //描画関数 [01] 10  f(x,y) = xy / sqrt(x^2 + y^2), f(0,0) = 0
            if (x == 0.0 && y == 0.0) {
                FXY = 0.0;
            }
            else {
                //FXY = exp(-fabs(x + y)*(x*x + y*y));
                FXY = x*y / math.sqrt(x*x + y*y);
            }
            return FXY;
        case 111:
            //描画関数 [01] 11  f(x,y) = xy * sin( 1 / sqrt(x^2 + y^2)), f(0,0) = 0
            if (x == 0.0 && y == 0.0) {
                FXY = 0.0;
            }
            else {
                FXY = x*y * math.sin(1.0 / math.sqrt(x*x + y*y));
            }
            return FXY;
        case 112:
            //描画関数 [01] 12  f(x,y) = x^y * y^x
            FXY = math.pow(x, y) * math.pow(y, x);
            if (FXY > 1000.0) FXY = 1000.0
            if (FXY < -1000.0) FXY = -1000.0
            return FXY;
        case 113:
            //描画関数 [01] 13  f(x,y) = exp(-|x + y|/(x^2 + y^2)), f(0,0) = 0
            if (x == 0.0 && y == 0.0) {
                FXY = 0.0;
            }
            else {
                FXY = math.exp(-math.abs(x + y) / (x*x + y*y));
            }
            return FXY;
        case 114:
            //描画関数 [01] 14  f(x,y) = log(x^2 + y^2)
            if (x == 0.0 && y == 0.0) {
                FXY = -1.797693e+308;
            }
            else {
                FXY = math.log(x*x + y*y);
            }
            return FXY;
        case 115:
            //描画関数 [01] 15  f(x,y) = x^3 - 3xy + y^3
            FXY = x*x*x - 3.0 * x * y + y*y*y;
            return FXY;
        case 116:
            //描画関数 [01] 16  f(x,y) = exp(-(x^2 + y^2) * sin(x + y))
            FXY = math.exp(-(x*x + y*y) * math.sin(x + y));
            return FXY;
        case 117:
            //描画関数 [01] 16  f(x,y) = x^4 + 2*x^2*y^2 - 6*x^2*y + y^2
            FXY = x*x*x*x + 2.0 * x*x * y*y - 6.0 * x*x * y + y*y;
            return FXY;
        case 118:
            //描画関数 [01] 18  f(x,y) = x^3 + 3xy + y^3
            FXY = x*x*x + 3.0 * x * y + y*y*y;
            return FXY;
        case 119:
            //描画関数 [01] 19  f(x,y) = x^2 + xy + y^2 - 4x - 2y
            FXY = x*x + x*y + y*y - 4*x - 2*y;
            return FXY;
        case 120:
            //描画関数 [01] 20  f(x,y) = x*sin(y / x), f(0,y) = 0
            if (x == 0.0) {
                FXY = 0.0;
            }
            else {
                FXY = x*math.sin(y / x);
            }
            return FXY;
        case 121:
            //描画関数 [01] 21  f(x,y) = exp(-(x^3 + y^3) * sin(x + y))
            FXY = math.exp(-(x*x*x + y*y*y) * math.sin(x + y));
            return FXY;
        case 122:
            //描画関数 [01] 22  f(x,y) = x^4 + y^4 - 2(x^2 + y^2)
            FXY = x*x*x*x + y*y*y*y - 2.0 * (x*x + y*y);
            return FXY;
        case 123:
            //描画関数 [01] 23  f(x,y) = sqrt((x^2 - y^2 - 1)^2 + 4 * x^2 * y^2)
            FXY = math.sqrt((x*x - y*y - 1.0)*(x*x - y*y - 1.0) + 4.0 * x*x * y*y);
            return FXY;
        case 201:
            //描画関数 [02] 01  f(x,y) = |sin(ω)|, ω = x + iy 
            FXY = math.sqrt(math.sin(x)*math.sin(x)*math.cosh(y)*math.cosh(y) + math.cos(x)*math.cos(x)*math.sinh(y)*math.sinh(y));
            return FXY;
        case 202:
            //描画関数 [02] 02  f(x,y) = |cos(ω)|, ω = x + iy 
            FXY = math.sqrt(math.cos(x)*math.cos(x)*math.cosh(y)*math.cosh(y) + math.sin(x)*math.sin(x)*math.sinh(y)*math.sinh(y));
            return FXY;
        case 203:
            //20230815 add
            //描画関数 [02] 03  f(x,y) = |Γ(ω)|, ω = x + iy 
            //|Γ(x + iy)| = |Γ(x)| / ΠSQRT(1 + (y / (n + x))^2), n:0～∞
            //以下の近似式では、n=15で打ち切っているが、十分な精度が出ているようで、よく見られるGamma関数の絶対値のグラフと一致している
            FXY = math.abs(math.gamma(x)) / 
                (math.sqrt(1 + (y / x)*(y / x)) * 
                math.sqrt(1 + (y / (1.0 + x))*(y / (1.0 + x))) * 
                math.sqrt(1 + (y / (2.0 + x))*(y / (2.0 + x))) * 
                math.sqrt(1 + (y / (3.0 + x))*(y / (3.0 + x))) * 
                math.sqrt(1 + (y / (4.0 + x))*(y / (4.0 + x))) *
                math.sqrt(1 + (y / (5.0 + x))*(y / (5.0 + x))) *
                math.sqrt(1 + (y / (6.0 + x))*(y / (6.0 + x))) *
                math.sqrt(1 + (y / (7.0 + x))*(y / (7.0 + x))) *
                math.sqrt(1 + (y / (8.0 + x))*(y / (8.0 + x))) *
                math.sqrt(1 + (y / (9.0 + x))*(y / (9.0 + x))) *
                math.sqrt(1 + (y / (10.0 + x))*(y / (10.0 + x))) *
                math.sqrt(1 + (y / (11.0 + x))*(y / (11.0 + x))) *
                math.sqrt(1 + (y / (12.0 + x))*(y / (12.0 + x))) *
                math.sqrt(1 + (y / (13.0 + x))*(y / (13.0 + x))) *
                math.sqrt(1 + (y / (14.0 + x))*(y / (14.0 + x))) *
                math.sqrt(1 + (y / (15.0 + x))*(y / (15.0 + x)))
                );
            return FXY;
            break;
        case 303:
            //描画関数 [03] 02  f(x,y) = cos(y) - cos(x)
            FXY = math.cos(y) - math.cos(x);
            return FXY;
        case 301:
//            //描画関数 [03] 03  f(x,y) = (x^2 + y^2 + a^2)^2 - 4a^2x^2 - b^4, a = 0.6, b=0.4
            //描画関数 [03] 03  f(x,y) = (x^2 + y^2 + a^2)^2 - 4a^2x^2 - 4*b, a = 1.0, b=0.25
            //FXY = math.pow(math.pow(x, 2) + math.pow(y, 2) + math.pow(ma, 2), 2) - 4.0 * math.pow(ma, 2) * math.pow(x, 2) - math.pow(mb, 4);
//            FXY = math.pow(x*x + y*y + ma*ma, 2) - 4.0 * ma*ma * x*x - mb*mb*mb*mb;
            FXY = math.pow(x*x + y*y + ma*ma, 2) - 4.0 * ma*ma * x*x - math.pow(mb, 4);
            return FXY;
        case 302:
            //描画関数 [03] 04  f(x,y) = x^a - 2x^b*y + y^a, a = 5.0, b=2.0
            FXY = math.pow(x, ma) - 2*math.pow(x, mb) * y + math.pow(y, ma);
            return FXY;
        case 901:
            //描画関数 [09] 90～  ユーザー定義
            FXY = f(x, y);
            return FXY;
        default:
            break;
    }
    return 0.0;
}

// ユーザー定義関数のz値を計算
function f(x, y) {
    // まず、rを計算
    let r = math.evaluate(formula_where, { x: x, y: y });
    // 次に、計算されたrを使って最終的な数式を評価
    let zValue = math.evaluate(formula_fxy, { x: x, y: y, r: r });

    // ゼロ割チェック(D_CONSTあたりが無難。Number.Max_VALUEを指定するとうまく描画できない)
    if (zValue == Infinity) {
        zValue = D_CONST;
    }
    if (zValue == -Infinity) {
        zValue = -D_CONST;
    }

    return zValue;
}

// 係数入力ボックス・ユーザー定義関数入力ボックスの表示/非表示に応じて、html画面右側の配置を動的に変更する
function changeDivMargin(isDefaultEquation) {
    const divElement = document.getElementById('targetDiv');

    if (isDefaultEquation) {
        divElement.style.marginTop = "0px";
    } else {
        divElement.style.marginTop = "-60px";
    }
}

// Texを使用を反映させるためにMathJaxを再度実行する
function TeX() {
    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
}


///////////////////////
// 以下、jQuery用の処理
///////////////////////

// slider bar
$(function() {
    $("#horizontal-slider").slider({
        max: 180,
        min: -180,
        value: m_alpha,
        step: 1,
        slide: function(event, ui) {
            $("#angleAlpha").val(ui.value);
            changeAngle();
        }
    });

    $("#vertical-slider").slider({
        orientation: "vertical",
        max: 90,
        min: -90,
        value: m_gamma,
        step: 1,
        slide: function(event, ui) {
            $("#angleGamma").val(ui.value);
            changeAngle();
        }
    });

    // Initialize slider values based on the text boxes
    $("#horizontal-slider").slider("value", $("#angleAlpha").val());
    $("#vertical-slider").slider("value", $("#angleGamma").val());

    // Update sliders when the text box values change
    $("#angleAlpha").on("change", function() {
        $("#horizontal-slider").slider("value", $(this).val());
        changeAngle();
    });

    $("#angleGamma").on("change", function() {
        $("#vertical-slider").slider("value", $(this).val());
        changeAngle();
    });

});


