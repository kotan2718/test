// Gloavbl 変数 //
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
let md_used = 0;
let me_used = 0;
let mf_used = 0;
let mg_used = 0;
let mh_used = 0;
// 繰返し回数
cnt_dp = 3200;
// 刻み幅(時間経過ステップ)
dh = 0.01;
// 描画速度
let spd = 2;

// 描画が完了したか否かを示すフラグ
let drawnFlg = false;

// リセットフラグ
let resetFlg = false;

// 描画角度
let m_alpha = -20.0;   // X軸が基線と成す角
let m_gamma = -30.0;   // 基線にもっとも近い矩形の頂点を視点Eから仰ぐ角度

let m_ca = 0.0;        // m_alphaのcosとsinの値を格納する変数
let m_sa = 0.0;

let m_zfctr = 0.75;       // 図形座標にスケール変換するときにz方向を縮めるための比率(0.75位が丁度良い)
let m_zc;                 // 図形座標上の原点(X0, Y0, Z0)に対応する透視座標の原点(ξ0、η0)のξ0
let m_zm;                 // 図形座標上の原点(X0, Y0, Z0)に対応する透視座標の原点(ξ0、η0)のη0
let m_el, m_et;           // 図形座標から透視座標へ投影処理を制御する変数

let m_RRX = 0.0, m_RRZ = 0.0;  // ピクチャーボックスの原点

let m_dHV;               // 図形座標の点(X, Y, Z)を透視座標に変換するときZの値を入れておく変数

let m_gamma90Flg = 0;    // 20230927 描画のmappingでgammaが +/-90 ではどうしてもうまく処理できないので、89で描画を代用する Axis()でこのフラグが1ならばz軸を描画しない
let mappingFlg;          // 20231002 updpen2, 3で予め角度を指定するときはmapping()の呼び出しを抑制する

let vAx = 3;             // 20231010 vertical Axis(1 : x軸, 2 : y軸, 3 : z軸 ==default==)
//////////////////

let width0 = 100;
let height0 = 100;

let mag;
const magStd = 80;

const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');

// 描画領域をリセット
ctx.fillStyle = 'rgb( 0, 0, 0)';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// スケーリング
let scaleX = canvas.width / width0;
let scaleY = canvas.height / height0;

// 初期値
var init1 = new Array(3);   // 初期値
var init2 = new Array(3);
init1[0] = 0;
init1[1] = 1;
init1[2] = 2;
init2[0] = 0;
init2[1] = 1;
init2[2] = 2.01;

let linePoints = [];
let ary3D = [];
let arr_y = [];
let arr_z = [];


async function animateGraph() {

    // 描画中に使用不可とするコントロール
    drawnFlg = false;
    usability(false);

    prep();

    // 描画領域をリセット
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 3軸の描画
    Axis();

    // 2つの初期点から解軌道を描くために、配列に要素をセットする
    for (let i = 0; i < 2; i++) {
        linePoints.push([]);
    }

    // 解曲線3D用配列のクリア
    ary3D.length = 0;
    // 2つの初期点から解軌道の3Dデータを格納するために、配列に要素をセットする
    for (let i = 0; i < 2; i++) {
        ary3D.push([]);
    }

    var dt = 0.0;
    var dnt = 0.0;

    // Runge-Kutta法
    var Ru_dx = new Array(2);
    var Ru_dy = new Array(2);
    var Ru_dz = new Array(2);
    var Ru_x0 = 0.0;
    var Ru_y0 = 0.0;
    var Ru_z0 = 0.0;
    var Ru_x0_init = new Array(2);   // 初期値
    var Ru_y0_init = new Array(2);
    var Ru_kx = new Array(4);
    var Ru_ky = new Array(4);
    var Ru_kz = new Array(4);

    let Ru_r0;
    let Ru_x1;
    let Ru_y1;
    let Ru_z1;
    let Ru_r1;
    let Ru_u0;
    let Ru_v0;
    let Ru_w0;
    let Ru_u1;
    let Ru_v1;
    let Ru_w1;

    let Ru_hq;
    let Ru_dq;
    let pixelX;
    let pixelY;

    let vx1 = 0.0, vy1 = 0.0, vz1 = 0.0, vx2 = 0.0, vy2 = 0.0, vz2 = 0.0;
    let obj1 = {x3: vx1, y3: vy1, z3: vz1};
    let obj2 = {x3: vx2, y3: vy2, z3: vz2};

    //// for debug start
    Ru_dx[0] = init1[0];
    Ru_dy[0] = init1[1];
    Ru_dz[0] = init1[2];
    Ru_dx[1] = init2[0];
    Ru_dy[1] = init2[1];
    Ru_dz[1] = init2[2];
    //// for debug   end

    for (dp = 1; dp <= cnt_dp; dp++) {
        for (let i = 0; i < 2; i++) {

            Ru_x0 = Ru_dx[i];
            Ru_y0 = Ru_dy[i];
            Ru_z0 = Ru_dz[i];

            if (i % 2 == 0) { // 20231229 dtのカウントが2倍で効いていたバグを修正
                dt = dnt;
            }

            if (dp == 1) {
                ary3D[i].push({ x: Ru_x0,  y: Ru_y0, z: Ru_z0 });

                R3D(Ru_x0, Ru_y0, Ru_z0, obj1);

                pixelX = scaleX * (obj1.x + width0 / 2);
                pixelY = scaleY * (height0 / 2 - obj1.y);
                linePoints[i].push({ x: pixelX, y: pixelY });
            }

            ///////////////////
            //               //
            // Runge-Kutta法 //
            //               //
            ///////////////////

            Ru_kx[0] = dh * FNF(dt, Ru_x0, Ru_y0, Ru_z0);
            Ru_ky[0] = dh * FNG(dt, Ru_x0, Ru_y0, Ru_z0);
            Ru_kz[0] = dh * FNH(dt, Ru_x0, Ru_y0, Ru_z0);
            Ru_kx[1] = dh * FNF(dt + dh / 2.0, Ru_x0 + Ru_kx[0] / 2.0, Ru_y0 + Ru_ky[0] / 2.0, Ru_z0 + Ru_kz[0] / 2.0);
            Ru_ky[1] = dh * FNG(dt + dh / 2.0, Ru_x0 + Ru_kx[0] / 2.0, Ru_y0 + Ru_ky[0] / 2.0, Ru_z0 + Ru_kz[0] / 2.0);
            Ru_kz[1] = dh * FNH(dt + dh / 2.0, Ru_x0 + Ru_kx[0] / 2.0, Ru_y0 + Ru_ky[0] / 2.0, Ru_z0 + Ru_kz[0] / 2.0);
            Ru_kx[2] = dh * FNF(dt + dh / 2.0, Ru_x0 + Ru_kx[1] / 2.0, Ru_y0 + Ru_ky[1] / 2.0, Ru_z0 + Ru_kz[1] / 2.0);
            Ru_ky[2] = dh * FNG(dt + dh / 2.0, Ru_x0 + Ru_kx[1] / 2.0, Ru_y0 + Ru_ky[1] / 2.0, Ru_z0 + Ru_kz[1] / 2.0);
            Ru_kz[2] = dh * FNH(dt + dh / 2.0, Ru_x0 + Ru_kx[1] / 2.0, Ru_y0 + Ru_ky[1] / 2.0, Ru_z0 + Ru_kz[1] / 2.0);
            Ru_kx[3] = dh * FNF(dt + dh, Ru_x0 + Ru_kx[2], Ru_y0 + Ru_ky[2], Ru_z0 + Ru_kz[2]);
            Ru_ky[3] = dh * FNG(dt + dh, Ru_x0 + Ru_kx[2], Ru_y0 + Ru_ky[2], Ru_z0 + Ru_kz[2]);
            Ru_kz[3] = dh * FNH(dt + dh, Ru_x0 + Ru_kx[2], Ru_y0 + Ru_ky[2], Ru_z0 + Ru_kz[2]);

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
            Ru_dz[i] = Ru_z0 + (Ru_kz[0] + 2.0 * Ru_kz[1] + 2.0 * Ru_kz[2] + Ru_kz[3]) / 6.0;

            if (i % 2 == 0)
            {
                dnt = dt + dh;
            }

            //////////
            //      //
            // 描画 //
            //      //
            //////////

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

            if (i == 0) {
                ary3D[i].push({ x: Ru_dx[i],  y: Ru_dy[i], z: Ru_dz[i] });
                R3D(Ru_dx[i], Ru_dy[i], Ru_dz[i], obj2);

                pixelX = scaleX * (obj2.x3 + width0 / 2);
                pixelY = scaleY * (height0 / 2 - obj2.y3);

                linePoints[i].push({ x: pixelX, y: pixelY });

                ctx.beginPath();
                ctx.moveTo(linePoints[i][0].x, linePoints[i][0].y);
                for (const point of linePoints[i]) {
                    ctx.lineTo(point.x, point.y);
                }
                ctx.strokeStyle = 'rgb(100, 149, 237)';
                ctx.stroke();

                // Draw the point
                ctx.beginPath();
                ctx.arc(pixelX, pixelY, 2, 0, 2 * Math.PI);
                ctx.fillStyle = 'red';
                ctx.fill();
            }

            if (i == 1) {
                ary3D[i].push({ x: Ru_dx[i],  y: Ru_dy[i], z: Ru_dz[i] });
                R3D(Ru_dx[i], Ru_dy[i], Ru_dz[i], obj2);

                pixelX = scaleX * (obj2.x3 + width0 / 2);
                pixelY = scaleY * (height0 / 2 - obj2.y3);

                linePoints[i].push({ x: pixelX, y: pixelY });

                ctx.beginPath();
                ctx.moveTo(linePoints[i][0].x, linePoints[i][0].y);
                for (const point of linePoints[i]) {
                    ctx.lineTo(point.x, point.y);
                }
                ctx.strokeStyle = 'rgb(200, 200, 55)';
                ctx.stroke();

                // Draw the point
                ctx.beginPath();
                ctx.arc(pixelX, pixelY, 2, 0, 2 * Math.PI);
                ctx.fillStyle = 'orange';
                ctx.fill();
            }
        }
        if (dp % 100 == 0 || dp == cnt_dp - 1) // 描画リフレッシュステップ
        {
            // 経過ステップを表示
            document.getElementById('keika').innerText = dp;
            if (dp != cnt_dp) {
                // 描画領域をリセット
                ctx.fillStyle = 'rgb( 0, 0, 0)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
    // 3軸の描画
    Axis();

            }
        }
        switch (spd) {
            case 1:
                spd = 1;
                if (dp % spd == 0) { // 倍速設定
                    await new Promise(resolve => setTimeout(resolve, 40)); // Wait for 10 milliseconds
                }
                break;
            case 2:
                spd =1;
                if (dp % spd == 0) { // 倍速設定
                    await new Promise(resolve => setTimeout(resolve, 20)); // Wait for 10 milliseconds
                }
                break;
            case 4:
            case 8:
                if (dp % spd == 0) { // 倍速設定
                    await new Promise(resolve => setTimeout(resolve, 20)); // Wait for 10 milliseconds
                }
                break;
            case 20:
                if (dp % spd == 0) { // 倍速設定
                    await new Promise(resolve => setTimeout(resolve, 0)); // Wait for 10 milliseconds
                }
                break;
            default:
                break;
        }
    }
    // 描画後に使用可とするコントロール
    usability(true);
    // アングルの変更でライン格納配列を使用可にする
    drawnFlg = true;
//            mapping();
}

// 描画に必要な定数を入力データから計算して用意する
function prep()
{
    let tau;             // 基線(画面)から図形座標の原点までの距離
    let tg;              // tangent gamma
    let zMin = -1.5;     // z方向描画領域の最小値

    m_el = 1000.0;  // 基線（画面）までの視距離
    tau  =   10.0;  // 矩形領域のうち基線に一番近い頂点から基線までの距離
    // *******************************
    m_et = m_el + tau;
    // *******************************

    // *******************************
    tg = Math.sin(Math.PI / 180.0 * m_gamma) / Math.cos(Math.PI / 180.0 * m_gamma);
    m_zc = m_et * tg - zMin * m_zfctr;
    m_zm = tg;
    // *******************************
}

        // 3Dデータ(計算値)を平面の画面に変換する
function R3D(x, y, z, obj)
{
    // 透視図描画で俯角/仰角の変更に対して、描画高さを一定にするための基準高さの定義
    // 各gamma角毎にPPlot()での(yMax - yMin)を求め、gamma角に対する描画領域高さを近似した
    // 5重指数減少関数で近似( これじゃぁ、単なる対処方法でしかない )
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

    let VVV;
    switch (vAx)
    {
        case 1:
            m_dHV = x;
            m_ca = Math.cos(Math.PI / 180.0 * m_alpha);
            m_sa = Math.sin(Math.PI / 180.0 * m_alpha);
            VVV = 1.0 / (z * m_sa + y * m_ca + m_et);

            z = (z * m_ca - y * m_sa) * VVV * m_el;
            x = ((m_dHV * m_zfctr + m_zc) * VVV - m_zm) * m_el;
            break;
        case 2:
            m_dHV = y;
            m_ca = Math.cos(Math.PI / 180.0 * m_alpha);
            m_sa = Math.sin(Math.PI / 180.0 * m_alpha);
            VVV = 1.0 / (z * m_sa + x * m_ca + m_et);

            x = (z * m_ca - x * m_sa) * VVV * m_el;
            y = ((m_dHV * m_zfctr + m_zc) * VVV - m_zm) * m_el;
            break;
        case 3:
            m_dHV = z;
            m_ca = Math.cos(Math.PI / 180.0 * m_alpha);
            m_sa = Math.sin(Math.PI / 180.0 * m_alpha);
            VVV = 1.0 / (x * m_sa + y * m_ca + m_et);

            x = (x * m_ca - y * m_sa) * VVV * m_el;
            z = ((m_dHV * m_zfctr + m_zc) * VVV - m_zm) * m_el;
            break;
        default:
            break;
    }

    let curtDeg = -(Math.abs(m_gamma));
    let curtHeight;

    if (Math.abs(m_gamma) == 89.0) {            // +/-89.0では近似式は使わず、固定値で拡大率を処理する
        curtHeight = 678.551409;
    }
    else if (Math.abs(m_gamma) == 90.0)         // +/-90.0では近似式は使わず、固定値で拡大率を処理する( 真上から見た図になる )
    {
        curtHeight = 1.38959E+16 / 1.9;
    }
    else if (Math.abs(m_gamma) >= 30.0) {        // 30°以上で描画が大きく歪むので、30～88に適用
        curtHeight = EXP_DEC_Y0 +
            EXP_DEC_A1 * Math.exp(-(curtDeg - EXP_DEC_X0) / EXP_DEC_T1) +
            EXP_DEC_A2 * Math.exp(-(curtDeg - EXP_DEC_X0) / EXP_DEC_T2) +
            EXP_DEC_A3 * Math.exp(-(curtDeg - EXP_DEC_X0) / EXP_DEC_T3) +
            EXP_DEC_A4 * Math.exp(-(curtDeg - EXP_DEC_X0) / EXP_DEC_T4) +
            EXP_DEC_A5 * Math.exp(-(curtDeg - EXP_DEC_X0) / EXP_DEC_T5);
    }
    else {
        curtHeight = PERS_BASE_HEIGHT;
    }

    //  -------------plot-----------------
    switch (vAx)
    {
        case 1:
            obj.x3 = -m_RRX + z;
            obj.y3 = (-m_RRZ + x) * PERS_BASE_HEIGHT / curtHeight;
            break;
        case 2:
            obj.x3 = -m_RRX + x;
            obj.y3 = (-m_RRZ + y) * PERS_BASE_HEIGHT / curtHeight;
            break;
        case 3:
            obj.x3 = -m_RRX + x;
            obj.y3 = (-m_RRZ + z) * PERS_BASE_HEIGHT / curtHeight;
            break;
        default:
            break;
    }
    obj.z3 = 0.0;

    // DrawLine Overflow 対策
    if (Math.abs(obj.x3) > max || Math.abs(obj.y3) > max)
    {
        msg(0, obj.x3, obj.y3, obj.z3);
        // 座標系の回転で更にoverflowの可能性があり、その場合は無限ループになるので回転は不可とする
        rotateFlg = false;
    }
    // *********************************************************************

}

// 座標軸の描画
function Axis()
{
    // x軸の描画
    let vx1 = 0.0, vy1 = 0.0, vz1 = 0.0, vx2 = 0.0, vy2 = 0.0, vz2 = 0.0;
    let obj1 = {x3: vx1, y3: vy1, z3: vz1};
    let obj2 = {x3: vx2, y3: vy2, z3: vz2};
    R3D(-width0 / 2.0, 0.0, 0.0, obj1);
    pixelX1 = scaleX * (obj1.x3 + width0 / 2);
    pixelY1 = scaleY * (height0 / 2 - obj1.y3);
    R3D( width0 / 2.0, 0.0, 0.0, obj2);
    pixelX2 = scaleX * (obj2.x3 + width0 / 2);
    pixelY2 = scaleY * (height0 / 2 - obj2.y3);
    ctx.beginPath();
    ctx.moveTo(pixelX1, pixelY1);
    ctx.lineTo(pixelX2, pixelY2);
    ctx.strokeStyle = 'rgb(255, 255, 255)';
    ctx.stroke();
    label_xyz(1, obj2.x3, obj2.y3);   // 座標名(x)表示

    // y軸の描画
    vx1 = 0.0, vy1 = 0.0, vz1 = 0.0, vx2 = 0.0, vy2 = 0.0, vz2 = 0.0;
    obj1 = {x3: vx1, y3: vy1, z3: vz1};
    obj2 = {x3: vx2, y3: vy2, z3: vz2};
    R3D(0.0, -height0 / 2.0, 0.0, obj1);
    pixelX1 = scaleX * (obj1.x3 + width0 / 2);
    pixelY1 = scaleY * (height0 / 2 - obj1.y3);
    R3D(0.0, height0 / 2.0, 0.0, obj2);
    pixelX2 = scaleX * (obj2.x3 + width0 / 2);
    pixelY2 = scaleY * (height0 / 2 - obj2.y3);
    ctx.beginPath();
    ctx.moveTo(pixelX1, pixelY1);
    ctx.lineTo(pixelX2, pixelY2);
    ctx.strokeStyle = 'rgb(255, 0, 0)';
    ctx.stroke();
    label_xyz(2, obj2.x3, obj2.y3);   // 座標名(x)表示

    // z軸の描画
    if (m_gamma90Flg == 0) {
        vx1 = 0.0, vy1 = 0.0, vz1 = 0.0, vx2 = 0.0, vy2 = 0.0, vz2 = 0.0;
        obj1 = {x3: vx1, y3: vy1, z3: vz1};
        obj2 = {x3: vx2, y3: vy2, z3: vz2};
        R3D(0.0, 0.0, -width0 / 2, obj1);
        pixelX1 = scaleX * (obj1.x3 + width0 / 2);
        pixelY1 = scaleY * (height0 / 2 - obj1.y3);
        R3D(0.0, 0.0, width0 / 2, obj2);
        pixelX2 = scaleX * (obj2.x3 + width0 / 2);
        pixelY2 = scaleY * (height0 / 2 - obj2.y3);
        ctx.beginPath();
        ctx.moveTo(pixelX1, pixelY1);
        ctx.lineTo(pixelX2, pixelY2);
        ctx.strokeStyle = 'rgb(0, 255, 0)';
        ctx.stroke();
        label_xyz(3, obj2.x3, obj2.y3);   // 座標名(x)表示
    }
}

// 座標名(x y z)の描画
function label_xyz(kbn, x, y)
{
    let pixelX1, pixelY1, pixelX2, pixelY2;
    let addLen = 1.0; ;  // (x, y)から座標の記号を書き込むために伸ばす距離
    let AxLen;           // 軸の長さ
    let xc;  // 座標軸の余弦
    let ys;  // 座標軸の正弦
    let addLenX;  // 座標を書き込むための x 方向の伸ばし量
    let addLenY;  // 座標を書き込むための y 方向の伸ばし量

    AxLen = Math.sqrt(x * x + y * y);
    xc = x / AxLen;
    ys = y / AxLen;
    mag = width0 / magStd;
    addLenX = mag * addLen * xc;
    if (addLenX < 0.0) addLenX = addLenX * 2.0;
    addLenY = mag * addLen * ys;
    if (addLenY < 0.0) addLenY = addLenY * 2.0;
    switch (kbn)
    {
        case 1: // 文字"X"の描画
            pixelX1 = scaleX * ((x + addLenX + mag * 0.4) + width0 / 2);
            pixelY1 = scaleY * (height0 / 2 - (y + addLenY + mag * 0.4));
            pixelX2 = scaleX * ((x + addLenX + mag * 1.2) + width0 / 2);
            pixelY2 = scaleY * (height0 / 2 - (y + addLenY - mag * 0.4));
            ctx.beginPath();
            ctx.moveTo(pixelX1, pixelY1);
            ctx.lineTo(pixelX2, pixelY2);
            ctx.strokeStyle = 'rgb(255, 255, 255)';
            ctx.stroke();
            pixelX1 = scaleX * ((x + addLenX + mag * 1.2) + width0 / 2);
            pixelY1 = scaleY * (height0 / 2 - (y + addLenY + mag * 0.4));
            pixelX2 = scaleX * ((x + addLenX + mag * 0.4) + width0 / 2);
            pixelY2 = scaleY * (height0 / 2 - (y + addLenY - mag * 0.4));
            ctx.beginPath();
            ctx.moveTo(pixelX1, pixelY1);
            ctx.lineTo(pixelX2, pixelY2);
            ctx.strokeStyle = 'rgb(255, 255, 255)';
            ctx.stroke();
            break;
        case 2: // 文字"Y"の描画
            pixelX1 = scaleX * ((x + addLenX + mag * 0.4) + width0 / 2);
            pixelY1 = scaleY * (height0 / 2 - (y + addLenY + mag * 0.4));
            pixelX2 = scaleX * ((x + addLenX + mag * 0.8) + width0 / 2);
            pixelY2 = scaleY * (height0 / 2 - (y + addLenY));
            ctx.beginPath();
            ctx.moveTo(pixelX1, pixelY1);
            ctx.lineTo(pixelX2, pixelY2);
            ctx.strokeStyle = 'rgb(255, 0, 0)';
            ctx.stroke();
            pixelX1 = scaleX * ((x + addLenX + mag * 1.2) + width0 / 2);
            pixelY1 = scaleY * (height0 / 2 - (y + addLenY + mag * 0.4));
            pixelX2 = scaleX * ((x + addLenX + mag * 0.4) + width0 / 2);
            pixelY2 = scaleY * (height0 / 2 - (y + addLenY - mag * 0.8));
            ctx.beginPath();
            ctx.moveTo(pixelX1, pixelY1);
            ctx.lineTo(pixelX2, pixelY2);
            ctx.strokeStyle = 'rgb(255, 0, 0)';
            ctx.stroke();
            break;
        case 3: // 文字"Y"の描画
            pixelX1 = scaleX * ((x + addLenX + mag * 0.4) + width0 / 2);
            pixelY1 = scaleY * (height0 / 2 - (y + addLenY + mag * 0.4));
            pixelX2 = scaleX * ((x + addLenX + mag * 1.2) + width0 / 2);
            pixelY2 = scaleY * (height0 / 2 - (y + addLenY + mag * 0.4));
            ctx.beginPath();
            ctx.moveTo(pixelX1, pixelY1);
            ctx.lineTo(pixelX2, pixelY2);
            ctx.strokeStyle = 'rgb(0, 255, 0)';
            ctx.stroke();
            pixelX1 = scaleX * ((x + addLenX + mag * 1.2) + width0 / 2);
            pixelY1 = scaleY * (height0 / 2 - (y + addLenY + mag * 0.4));
            pixelX2 = scaleX * ((x + addLenX + mag * 0.4) + width0 / 2);
            pixelY2 = scaleY * (height0 / 2 - (y + addLenY - mag * 0.4));
            ctx.beginPath();
            ctx.moveTo(pixelX1, pixelY1);
            ctx.lineTo(pixelX2, pixelY2);
            ctx.strokeStyle = 'rgb(0, 255, 0)';
            ctx.stroke();
            pixelX1 = scaleX * ((x + addLenX + mag * 0.4) + width0 / 2);
            pixelY1 = scaleY * (height0 / 2 - (y + addLenY - mag * 0.4));
            pixelX2 = scaleX * ((x + addLenX + mag * 1.2) + width0 / 2);
            pixelY2 = scaleY * (height0 / 2 - (y + addLenY - mag * 0.4));
            ctx.beginPath();
            ctx.moveTo(pixelX1, pixelY1);
            ctx.lineTo(pixelX2, pixelY2);
            ctx.strokeStyle = 'rgb(0, 255, 0)';
            ctx.stroke();
            break;
        default:
            break;
    }

}

function scaling()
{
    // ここの処理は全般的に見直しが必要 20230930
    // ここがなくても描画に問題ないが、描画範囲の変更で、原点のzが上下にずれる
    ////////////////////////////////////////////
    let V;
    let x, y, z;

    V = 1.0 / m_et;
    m_RRX = 0.0;
    switch (vAx)
    {
        case 1:
            x = 0.0;
            y = width0 / 2.0;
            z = height0 / 2.0;
            m_RRZ = ((x * m_zfctr + m_zc) * V - m_zm) * m_el;
            break;
        case 2:
            x = width0 / 2.0;
            y = 0.0;
            z = height0 / 2.0;
            m_RRZ = ((y * m_zfctr + m_zc) * V - m_zm) * m_el;
            break;
        case 3:
            x = width0 / 2.0;
            y = height0 / 2.0;
            z = 0.0;
            m_RRZ = ((z * m_zfctr + m_zc) * V - m_zm) * m_el;
            break;
        default:
            break;
    }
    ////////////////////////////////////////////
}

// 座標変換で指定された角度で計算済みの解曲線を描画する

function mapping()
{
    // for debug start
    //m_alpha = -20;
    //m_gamma = -30;
    // for debug   end
    prep();
    let haba;
    let vx1 = 0.0, vy1 = 0.0, vz1 = 0.0, vx2 = 0.0, vy2 = 0.0, vz2 = 0.0;

    // 解曲線描画用配列のクリア
    linePoints.length = 0;

    for (let i = 0; i < 2; i++) {
        linePoints.push([]);
    }

//            for (let i = 0; i < 3; i++) {
//                ary3D.push([]);
//            }

    // 描画領域をリセット
    ctx.fillStyle = 'rgb( 0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    Axis();
//            if (drawnFlg == true && debugMode == false) {
        //for (int dp = 1; dp <= cnt_dp; dp++)
        for (let dp = 1; dp <= cnt_dp; dp = dp + 1) {
            for (let i = 0; i < 2; i++) {
                if (dp == 1) {
                    vx1 = 0.0, vy1 = 0.0, vz1 = 0.0;
                    let obj1 = {x3: vx1, y3: vy1, z3: vz1};
                    R3D(ary3D[i][0].x, ary3D[i][0].y, ary3D[i][0].z, obj1);
                    pixelX = scaleX * (obj1.x3 + width0 / 2);
                    pixelY = scaleY * (height0 / 2 - obj1.y3);
                    linePoints[i].push({ x: pixelX, y: pixelY });
                }
                else {
                    vx2 = 0.0, vy2 = 0.0, vz2 = 0.0;
                    let obj2 = {x3: vx2, y3: vy2, z3: vz2};
                    R3D(ary3D[i][dp].x, ary3D[i][dp].y, ary3D[i][dp].z, obj2);

                    pixelX = scaleX * (obj2.x3 + width0 / 2);
                    pixelY = scaleY * (height0 / 2 - obj2.y3);

                    linePoints[i].push({ x: pixelX, y: pixelY });
                }
            }
        }
        for (let i = 0; i < 2; i++)
        {
            if (i == 0) {
                ctx.beginPath();
                ctx.moveTo(linePoints[i][0].x, linePoints[i][0].y);
                for (const point of linePoints[i]) {
                    ctx.lineTo(point.x, point.y);
                }
                ctx.strokeStyle = 'rgb(100, 149, 237)';
                ctx.stroke();
            }
            if (i == 1) {
                ctx.beginPath();
                ctx.moveTo(linePoints[i][0].x, linePoints[i][0].y);
                for (const point of linePoints[i]) {
                    ctx.lineTo(point.x, point.y);
                }
                ctx.strokeStyle = 'rgb(200, 200, 55)';
                ctx.stroke();
            }
        }
//            }
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
    document.getElementById('spd').disabled = flg;
    document.getElementById('dh').disabled = flg;
    document.getElementById('cnt_dp').disabled = flg;
    document.getElementById('init1_x').disabled = flg;
    document.getElementById('init2_x').disabled = flg;
    document.getElementById('init1_y').disabled = flg;
    document.getElementById('init2_y').disabled = flg;
    document.getElementById('init1_z').disabled = flg;
    document.getElementById('init2_z').disabled = flg;
    document.getElementById('angleAlpha').disabled = flg;
    document.getElementById('angleGamma').disabled = flg;
    document.getElementById('axX').disabled = flg;
    document.getElementById('axY').disabled = flg;
    document.getElementById('axZ').disabled = flg;
    document.getElementById('start').disabled = flg;
    // R3Dの変換でDrawLineがoverflowになったときの対応(回転を許可すると無限ループに入る可能性あり)
    /*
    if (rotateFlg == false)
    {
        nUD_alpha.Enabled = false;
        nUD_gamma.Enabled = false;
        rotateFlg = true;
    }
    if (flg == true) {
        btStop.Enabled = false;
    }
    else {
        btStop.Enabled = true;
    }
    */

    // スライダーバーの使用可否を切り替える
    $("#horizontal-slider").slider("option", "disabled", flg);
    $("#vertical-slider").slider("option", "disabled", flg);

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



// 描画開始処理
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
    width0 = parseFloat(document.getElementById('width0').value);
    height0 = parseFloat(document.getElementById('width0').value);
    cnt_dp = parseInt(document.getElementById('cnt_dp').value);
    init1[0] = parseFloat(document.getElementById('init1_x').value);
    init1[1] = parseFloat(document.getElementById('init1_y').value);
    init1[2] = parseFloat(document.getElementById('init1_z').value);
    init2[0] = parseFloat(document.getElementById('init2_x').value);
    init2[1] = parseFloat(document.getElementById('init2_y').value);
    init2[2] = parseFloat(document.getElementById('init2_z').value);

    // 描画領域をリセット
    ctx.fillStyle = 'rgb( 0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 解曲線描画用配列のクリア
    linePoints.length = 0;


    animateGraph();
}

// 途中中断処理
function stopAnimation() {
    cnt_dp = dp - 1;
    document.getElementById('stop').disabled = true;
}

// リセット処理(アングル、垂直軸をデフォルトに戻す)
function resetAnimation() {
    resetFlg = true;
    changeType();
    // slider bar
    $("#horizontal-slider").slider("value", m_alpha);
    $("#vertical-slider").slider("value", m_gamma);
    mapping();
    resetFlg = false;
    document.getElementById('reset').disabled = true;
}

function updateRange() {
    const width0 = parseFloat(document.getElementById('width0').value);
    const wmax = width0 / 2;
    const wmin = -wmax;
    document.getElementById('wmax').innerText = wmax;
    document.getElementById('wmin').innerText = wmin;
    
    height0 = width0;

    // スケーリング
    scaleX = canvas.width / width0;
    scaleY = canvas.height / height0;

    mag = width0 / magStd;
    prep();
    scaling();
}

//        function setRange() {
//            document.getElementById('width0').value = 100;
//            document.getElementById('cnt_dp').value = 3200;
//            document.getElementById('dh').value = 0.01;
//            updateRange();
//        }

// Vertical Axis 変更 html -> js
function changeAxis() {
    var selectedAxis = document.querySelector('input[name="vAxis"]:checked').value;
    // 選択された軸に基づいて処理を行う
    switch(selectedAxis) {
        case "axisX":
            vAx = 1;
            break;
        case "axisY":
            vAx = 2;
            break;
        case "axisZ":
            vAx = 3;
            break;
        default:
            vAx = 3;
    }
    if (drawnFlg == true)
        {
        mapping();
        // Resetボタンを使用可に設定
        document.getElementById('reset').disabled = false;

    }
}

// Vertical Axis 設定 js -> html
function setAxis() {
    switch (vAx) {
        case 1:
            //document.querySelector('input[value="axisZ"]').checked = true; // value属性が"axisZ"のラジオボタンにチェックを付ける                    // 描画アングル
            document.getElementById("axX").checked = true;
            break;
        case 2:
            document.getElementById("axY").checked = true;
            break;
        case 3:
            document.getElementById("axZ").checked = true;
            break;
        default:
            document.getElementById("axZ").checked = true;
            break;
    }
}

// 描画角度 変更 html -> js
function changeAngle() {
    m_alpha = parseInt(document.getElementById('angleAlpha').value) || m_alpha;
    m_gamma = parseInt(document.getElementById('angleGamma').value) || m_gamma;

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
    if (drawnFlg == true)
        {
        // Resetボタンを使用可に設定
        document.getElementById('reset').disabled = false;
        mapping();
    }
}

// 描画角度 設定 js -> html
function setAngle() {
    document.getElementById('angleAlpha').value = m_alpha;
    document.getElementById('angleGamma').value = m_gamma;
}

// 描画速度 変更 html -> js
function changeSpeed() {
    spd = parseInt(document.getElementById('spd').value);
}
/*
    // 解説のページに戻る関数(deq00_v3.jsに移動)
    function goBack() {
        window.history.back(); // ブラウザの「戻る」ボタンと同じ動作
    }
*/
function changeType() {
    const type = String(document.getElementById('type').value);

    switch (type) {
        case "01":  // Lorenz
            dat = 1;
            // vertical axis
            vAx = 3;
            setAxis();
            m_alpha = -20.0;
            m_gamma = -30.0;
            setAngle();
            if (resetFlg) {
                return;
            }
            changeProperty(0);
            // 描画範囲
            width0 = 100;
            height0 = width0;
            document.getElementById('width0').value = width0;
            // 係数デフォルト値
            document.getElementById('ma').value = 10.0;
            document.getElementById('mb').value = 28.0;
            document.getElementById('mc').value = 8.0 / 3.0;
            ma_used = 1;
            mb_used = 1;
            mc_used = 1;
            // 初期値デフォルト値
            document.getElementById('init1_x').value = 0;
            document.getElementById('init1_y').value = 1;
            document.getElementById('init1_z').value = 2;
            document.getElementById('init2_x').value = 0;
            document.getElementById('init2_y').value = 1;
            document.getElementById('init2_z').value = 2.01;
            // 式を表示する
            document.getElementById('dx').innerText = "$ \\dot{x} = ay - ax $";
            document.getElementById('dy').innerText = "$ \\dot{y} = bx - xz - y $";
            document.getElementById('dz').innerText = "$ \\dot{z} = xy - cz $";
            document.getElementById('where').innerText = "";
            updateRange();
            document.getElementById('cnt_dp').value = 3200;
            document.getElementById('dh').value = 0.01;
            document.getElementById('ma').disabled = false;
            document.getElementById('mb').disabled = false;
            document.getElementById('mc').disabled = false;
            break;
        case "02":  // Thomas
            dat = 2;
            // vertical axis
            vAx = 3;
            setAxis();
            // 描画アングル
            m_alpha = -20.0;
            m_gamma = -30.0;
            setAngle();
            if (resetFlg) {
                return;
            }
            changeProperty(0);
            // 描画範囲
            width0 = 10;
            height0 = width0;
            document.getElementById('width0').value = width0;
            // 係数デフォルト値
            document.getElementById('ma').value = 0.208186;
            ma_used = 1;
            // 初期値デフォルト値
            document.getElementById('init1_x').value = 0;
            document.getElementById('init1_y').value = 1;
            document.getElementById('init1_z').value = 2;
            document.getElementById('init2_x').value = 0;
            document.getElementById('init2_y').value = 1;
            document.getElementById('init2_z').value = 2.01;
            // 式を表示する
            document.getElementById('dx').innerText = "$ \\dot{x} = \\sin y - ax $";
            document.getElementById('dy').innerText = "$ \\dot{y} = \\sin z - ay $";
            document.getElementById('dz').innerText = "$ \\dot{z} = \\sin x - az $";
            document.getElementById('where').innerText = "";
            updateRange();
            document.getElementById('cnt_dp').value = 3200;
            document.getElementById('dh').value = 0.1;
            document.getElementById('ma').disabled = false;
            break;
        case "03":  // Four-Wing
            dat = 3;
            // vertical axis
            vAx = 3;
            setAxis();
            // 描画アングル
            m_alpha = -20.0;
            m_gamma = -65.0;
            setAngle();
            if (resetFlg) {
                return;
            }
            changeProperty(0);
            // 描画範囲
            width0 = 10;
            height0 = width0;
            document.getElementById('width0').value = width0;
            // 係数デフォルト値
            document.getElementById('ma').value = 0.2;
            document.getElementById('mb').value = 0.01;
            document.getElementById('mc').value = -0.4;
            ma_used = 1;
            mb_used = 1;
            mc_used = 1;
            // 初期値デフォルト値
            document.getElementById('init1_x').value = 0;
            document.getElementById('init1_y').value = 1;
            document.getElementById('init1_z').value = 2;
            document.getElementById('init2_x').value = 0;
            document.getElementById('init2_y').value = 1;
            document.getElementById('init2_z').value = 2.01;
            // 式を表示する
            document.getElementById('dx').innerText = "$ \\dot{x} = ax + yz $";
            document.getElementById('dy').innerText = "$ \\dot{y} = bx + cy - xz $";
            document.getElementById('dz').innerText = "$ \\dot{z} = -z -xy $";
            document.getElementById('where').innerText = "";
            updateRange();
            document.getElementById('cnt_dp').value = 6400;
            document.getElementById('dh').value = 0.1;
            document.getElementById('ma').disabled = false;
            document.getElementById('mb').disabled = false;
            document.getElementById('mc').disabled = false;
            break;
        case "04":  // Halvorsen
            dat = 4;
            // vertical axis
            vAx = 3;
            setAxis();
            // 描画アングル
            m_alpha = -20.0;
            m_gamma = -30.0;
            setAngle();
            if (resetFlg) {
                return;
            }
            changeProperty(0);
            // 描画範囲
            width0 = 36;
            height0 = width0;
            document.getElementById('width0').value = width0;
            // 係数デフォルト値
            document.getElementById('ma').value = 1.499;
            ma_used = 1;
            // 初期値デフォルト値
            document.getElementById('init1_x').value = 0;
            document.getElementById('init1_y').value = 1;
            document.getElementById('init1_z').value = 2;
            document.getElementById('init2_x').value = 0;
            document.getElementById('init2_y').value = 1;
            document.getElementById('init2_z').value = 2.01;
            // 式を表示する
            document.getElementById('dx').innerText = "$ \\dot{x} = -ax -4y -4z + y^2 $";
            document.getElementById('dy').innerText = "$ \\dot{y} = -ay -4z -4x + z^2 $";
            document.getElementById('dz').innerText = "$ \\dot{z} = -az -4x -4y + x^2 $";
            document.getElementById('where').innerText = "";
            updateRange();
            document.getElementById('cnt_dp').value = 3200;
            document.getElementById('dh').value = 0.02;
            document.getElementById('ma').disabled = false;
            break;
        case "05":  // Rössler
            dat = 5;
            // vertical axis
            vAx = 3;
            setAxis();
            // 描画アングル
            m_alpha = -20.0;
            m_gamma = -21.0;
            setAngle();
            if (resetFlg) {
                return;
            }
            changeProperty(0);
            // 描画範囲
            width0 = 50;
            height0 = width0;
            document.getElementById('width0').value = width0;
            // 係数デフォルト値
            document.getElementById('ma').value = 0.2;
            document.getElementById('mb').value = 0.2;
            document.getElementById('mc').value = 5.7;
            ma_used = 1;
            mb_used = 1;
            mc_used = 1;
            // 初期値デフォルト値
            document.getElementById('init1_x').value = 0;
            document.getElementById('init1_y').value = 1;
            document.getElementById('init1_z').value = 2;
            document.getElementById('init2_x').value = 0;
            document.getElementById('init2_y').value = 1;
            document.getElementById('init2_z').value = 2.01;
            // 式を表示する
            document.getElementById('dx').innerText = "$ \\dot{x} = -(y + z) $";
            document.getElementById('dy').innerText = "$ \\dot{y} = x + ay $";
            document.getElementById('dz').innerText = "$ \\dot{z} = b + z(x - c) $";
            document.getElementById('where').innerText = "";
            updateRange();
            document.getElementById('cnt_dp').value = 3200;
            document.getElementById('dh').value = 0.04;
            document.getElementById('ma').disabled = false;
            document.getElementById('mb').disabled = false;
            document.getElementById('mc').disabled = false;
            break;
        case "06":  // Sprott
            dat = 6;
            // vertical axis
            vAx = 3;
            setAxis();
            // 描画アングル
            m_alpha = -20.0;
            m_gamma = 40.0;
            setAngle();
            if (resetFlg) {
                return;
            }
            changeProperty(0);
            // 描画範囲
            width0 = 5;
            height0 = width0;
            document.getElementById('width0').value = width0;
            // 係数デフォルト値
            document.getElementById('ma').value = 2.07;
            document.getElementById('mb').value = 1.79;
            ma_used = 1;
            mb_used = 1;
            // 初期値デフォルト値
            document.getElementById('init1_x').value = 0.63;
            document.getElementById('init1_y').value = 0.47;
            document.getElementById('init1_z').value = -0.54;
            document.getElementById('init2_x').value = 0.63;
            document.getElementById('init2_y').value = 0.47;
            document.getElementById('init2_z').value = -0.55;
            // 式を表示する
            document.getElementById('dx').innerText = "$ \\dot{x} = y + axy + xz $";
            document.getElementById('dy').innerText = "$ \\dot{y} = 1 - bx^2 + yz $";
            document.getElementById('dz').innerText = "$ \\dot{z} = x - x^2 - y^2 $";
            document.getElementById('where').innerText = "";
            updateRange();
            document.getElementById('cnt_dp').value = 3200;
            document.getElementById('dh').value = 0.04;
            document.getElementById('ma').disabled = false;
            document.getElementById('mb').disabled = false;
            break;
        case "07":  // Rabinovich-Fabrikant
            dat = 7;
            // vertical axis
            vAx = 3;
            setAxis();
            // 描画アングル
            m_alpha = -20.0;
            m_gamma = 40.0;
            setAngle();
            if (resetFlg) {
                return;
            }
            changeProperty(0);
            // 描画範囲
            width0 = 8;
            height0 = width0;
            document.getElementById('width0').value = width0;
            // 係数デフォルト値
            document.getElementById('ma').value = 0.14;
            document.getElementById('mb').value = 0.1;
            ma_used = 1;
            mb_used = 1;
            // 初期値デフォルト値
            document.getElementById('init1_x').value = -1;
            document.getElementById('init1_y').value = 0.9;
            document.getElementById('init1_z').value = 0.6;
            document.getElementById('init2_x').value = -1;
            document.getElementById('init2_y').value = 0.9;
            document.getElementById('init2_z').value = 0.61;
            // 式を表示する
            document.getElementById('dx').innerText = "$ \\dot{x} = y(z - 1 + x^2) + bx $";
            document.getElementById('dy').innerText = "$ \\dot{y} = x(3z + 1 - x^2) + by $";
            document.getElementById('dz').innerText = "$ \\dot{z} = -2z(a + xy) $";
            document.getElementById('where').innerText = "";
            updateRange();
            document.getElementById('cnt_dp').value = 3200;
            document.getElementById('dh').value = 0.04;
            document.getElementById('ma').disabled = false;
            document.getElementById('mb').disabled = false;
            break;
        case "08":  // Chen
            dat = 8;
            // vertical axis
            vAx = 3;
            setAxis();
            // 描画アングル
            m_alpha = -20.0;
            m_gamma = -30.0;
            setAngle();
            if (resetFlg) {
                return;
            }
            changeProperty(0);
            // 描画範囲
            width0 = 50;
            height0 = width0;
            document.getElementById('width0').value = width0;
            // 係数デフォルト値
            document.getElementById('ma').value = 5;
            document.getElementById('mb').value = -10;
            document.getElementById('mc').value = -0.38;
            ma_used = 1;
            mb_used = 1;
            mc_used = 1;
            // 初期値デフォルト値
            document.getElementById('init1_x').value = 5;
            document.getElementById('init1_y').value = 10;
            document.getElementById('init1_z').value = 10;
            document.getElementById('init2_x').value = -7;
            document.getElementById('init2_y').value = -5;
            document.getElementById('init2_z').value = -10;
            // 式を表示する
            document.getElementById('dx').innerText = "$ \\dot{x} = ax - yz $";
            document.getElementById('dy').innerText = "$ \\dot{y} = by + xz $";
            document.getElementById('dz').innerText = "$ \\dot{z} = cz + xy/3 $";
            document.getElementById('where').innerText = "";
            updateRange();
            document.getElementById('cnt_dp').value = 3200;
            document.getElementById('dh').value = 0.01;
            document.getElementById('ma').disabled = false;
            document.getElementById('mb').disabled = false;
            document.getElementById('mc').disabled = false;
            break;
        case "09":  // Chen2
            dat = 9;
            // vertical axis
            vAx = 3;
            setAxis();
            // 描画アングル
            m_alpha = -20.0;
            m_gamma = -30.0;
            setAngle();
            if (resetFlg) {
                return;
            }
            changeProperty(0);
            // 描画範囲
            width0 = 80;
            height0 = width0;
            document.getElementById('width0').value = width0;
            // 係数デフォルト値
            document.getElementById('ma').value = 40;
            document.getElementById('mb').value = 3;
            document.getElementById('mc').value = 28;
            ma_used = 1;
            mb_used = 1;
            mc_used = 1;
            // 初期値デフォルト値
            document.getElementById('init1_x').value = -0.1;
            document.getElementById('init1_y').value = 0.5;
            document.getElementById('init1_z').value = -0.6;
            document.getElementById('init2_x').value = -0.1;
            document.getElementById('init2_y').value = 0.5;
            document.getElementById('init2_z').value = -0.601;
            // 式を表示する
            document.getElementById('dx').innerText = "$ \\dot{x} = a(y - x) $";
            document.getElementById('dy').innerText = "$ \\dot{y} = (c - a)x - xz + cy $";
            document.getElementById('dz').innerText = "$ \\dot{z} = xy -bz $";
            document.getElementById('where').innerText = "";
            updateRange();
            document.getElementById('cnt_dp').value = 6400;
            document.getElementById('dh').value = 0.005;
            document.getElementById('ma').disabled = false;
            document.getElementById('mb').disabled = false;
            document.getElementById('mc').disabled = false;
            break;
        case "10":  // Chua_14_4
            dat = 10;
            // vertical axis
            vAx = 3;
            setAxis();
            // 描画アングル
            m_alpha = 31.0;
            m_gamma = -31.0;
            setAngle();
            if (resetFlg) {
                return;
            }
            changeProperty(0);
            // 描画範囲
            width0 = 8;
            height0 = width0;
            document.getElementById('width0').value = width0;
            // 係数デフォルト値
            document.getElementById('ma').value = 15.41;
            document.getElementById('mb').value = 28;
            document.getElementById('mc').value = -0.714;
            document.getElementById('md').value = -1.143;
            ma_used = 1;
            mb_used = 1;
            mc_used = 1;
            md_used = 1;
            // 初期値デフォルト値
            document.getElementById('init1_x').value = (-0.000001).toExponential();
            document.getElementById('init1_y').value = 0;
            document.getElementById('init1_z').value = 0;
            document.getElementById('init2_x').value = (-0.0000011).toExponential();
            document.getElementById('init2_y').value = 0;
            document.getElementById('init2_z').value = 0;
            // 式を表示する
            document.getElementById('dx').innerText = "$ \\dot{x} = a(y - x - f(x) $";
            document.getElementById('dy').innerText = "$ \\dot{y} = x - y + z $";
            document.getElementById('dz').innerText = "$ \\dot{z} = -by $";
            document.getElementById('where').innerText = "$\\;$ where $\\; f(x) = cx + 0.5(d - c)(|x + 1| - |x - 1|) $";
            updateRange();
            document.getElementById('cnt_dp').value = 6400;
            document.getElementById('dh').value = 0.01;
            document.getElementById('ma').disabled = false;
            document.getElementById('mb').disabled = false;
            document.getElementById('mc').disabled = false;
            document.getElementById('md').disabled = false;
            break;
        case "11":  // Lorenz2
            dat = 11;
            // vertical axis
            vAx = 3;
            setAxis();
            // 描画アングル
            m_alpha = -20.0;
            m_gamma = -30.0;
            setAngle();
            if (resetFlg) {
                return;
            }
            changeProperty(0);
            // 描画範囲
            width0 = 100;
            height0 = width0;
            document.getElementById('width0').value = width0;
            // 係数デフォルト値
            document.getElementById('ma').value = 10;
            document.getElementById('mb').value = 44;
            document.getElementById('mc').value = 8.0 / 3.0;
            document.getElementById('md').value = 0.17;
            ma_used = 1;
            mb_used = 1;
            mc_used = 1;
            md_used = 1;
            // 初期値デフォルト値
            document.getElementById('init1_x').value = 0;
            document.getElementById('init1_y').value = 1;
            document.getElementById('init1_z').value = 2;
            document.getElementById('init2_x').value = 0;
            document.getElementById('init2_y').value = 1;
            document.getElementById('init2_z').value = 2.01;
            // 式を表示する
            document.getElementById('dx').innerText = "$ \\dot{x} = -ax + ay $";
            document.getElementById('dy').innerText = "$ \\dot{y} = bx - xz - y $";
            document.getElementById('dz').innerText = "$ \\dot{z} = x(y - dx) -cz $";
            document.getElementById('where').innerText = "";
            updateRange();
            document.getElementById('cnt_dp').value = 3200;
            document.getElementById('dh').value = 0.01;
            document.getElementById('ma').disabled = false;
            document.getElementById('mb').disabled = false;
            document.getElementById('mc').disabled = false;
            document.getElementById('md').disabled = false;
            break;
        case "12":  // Langford
            dat = 12;
            // vertical axis
            vAx = 3;
            setAxis();
            // 描画アングル
            m_alpha = -20.0;
            m_gamma = -30.0;
            setAngle();
            if (resetFlg) {
                return;
            }
            changeProperty(0);
            // 描画範囲
            width0 = 4;
            height0 = width0;
            document.getElementById('width0').value = width0;
            // 係数デフォルト値
            document.getElementById('ma').value = 0.7;
            document.getElementById('mb').value = 3.5;
            document.getElementById('mc').value = 0.6;
            document.getElementById('md').value = 1;
            document.getElementById('me').value = 0.25;
            document.getElementById('mf').value = 0;
            ma_used = 1;
            mb_used = 1;
            mc_used = 1;
            md_used = 1;
            me_used = 1;
            mf_used = 1;
            // 初期値デフォルト値
            document.getElementById('init1_x').value = 1;
            document.getElementById('init1_y').value = 1;
            document.getElementById('init1_z').value = 1;
            document.getElementById('init2_x').value = 1;
            document.getElementById('init2_y').value = 1;
            document.getElementById('init2_z').value = 1.01;
            // 式を表示する
            document.getElementById('dx').innerText = "$ \\dot{x} = (z - a)x - by $";
            document.getElementById('dy').innerText = "$ \\dot{y} = bx + (z - a)y $";
            document.getElementById('dz').innerText = "$ \\dot{z} = c + dz - z^3/3 - (x^2 + y^2)(1 + ex) + fzx^3 $";
            document.getElementById('where').innerText = "";
            updateRange();
            document.getElementById('cnt_dp').value = 3200;
            document.getElementById('dh').value = 0.01;
            document.getElementById('ma').disabled = false;
            document.getElementById('mb').disabled = false;
            document.getElementById('mc').disabled = false;
            document.getElementById('md').disabled = false;
            document.getElementById('me').disabled = false;
            document.getElementById('mf').disabled = false;
            break;
        defaut:
            break;
    }
    // スケーリング
    scaleX = canvas.width / width0;
    scaleY = canvas.height / height0;

    mag = width0 / magStd;
    prep();
    scaling();

    // 他の処理が終わった後にMathJaxを再度実行する
    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);

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

function FNF(dt, x, y, z) {
    let FNF;
    switch (dat)
    {
        case 1:
            FNF = ma * y - ma * x;
            return FNF;
        case 2:
            FNF = Math.sin(y) - ma * x;
            return FNF;
        case 3:
            FNF = ma * x + y * z;
            return FNF;
        case 4:
            FNF = -ma * x - 4.0 * y - 4.0 * z - y * y;
            return FNF;
        case 5:
            FNF = -(y + z);
            return FNF;
        case 6:
            FNF = y + ma * x * y + x * z;
            return FNF;
        case 7:
            FNF = y * (z - 1.0 + x * x) + mb * x;
            return FNF;
        case 8:
            FNF = ma * x - y * z;
            return FNF;
        case 9:
            FNF = ma * (y - x);
            return FNF;
        case 10:
            let fx = mc * x + 0.5 * (md - mc) * (Math.abs(x + 1) - Math.abs(x - 1));
            FNF = ma * (y - x - fx);
            return FNF;
        case 11:
            FNF = ma * y - ma * x;
            return FNF;
        case 12:
            FNF = (z - ma) * x - mb * y;
            return FNF;
        default:
            break;
    }
    return 0.0;
}

function FNG(dt, x, y, z) {
    let FNG;
    switch (dat)
    {
        case 1:
            FNG = mb * x - x * z - y;
            return FNG;
        case 2:
            FNG = Math.sin(z) - ma * y;
            return FNG;
        case 3:
            FNG = mb * x + mc * y - x * z;
            return FNG;
        case 4:
            FNG = -ma * y - 4.0 * z - 4.0 * x - z * z;
            return FNG;
        case 5:
            FNG = x + ma * y;
            return FNG;
        case 6:
            FNG = 1.0 - mb * x * x + y * z;
            return FNG;
        case 7:
            FNG = x * (3.0 * z + 1.0 - x * x) + mb * y;
            return FNG;
        case 8:
            FNG = mb * y + x * z;
            return FNG;
        case 9:
            FNG = (mc - ma) * x - x * z + mc * y;
            return FNG;
        case 10:
            FNG = x - y + z;
            return FNG;
        case 11:
            FNG = mb * x - x * z - y;
            return FNG;
        case 12:
            FNG = mb * x + (z - ma) * y;
            return FNG;
        default:
            break;
    }
    return 0.0;
}

function FNH(dt, x, y, z) {
    let FNH;
    switch (dat)
    {
        case 1:
            FNH = x * y - mc * z;
            return FNH;
        case 2:
            FNH = Math.sin(x) - ma * z;
            return FNH;
        case 3:
            FNH = -z - x * y;
            return FNH;
        case 4:
            FNH = -ma * z - 4.0 * x - 4.0 * y - x * x;
            return FNH;
        case 5:
            FNH = mb + z * (x - mc);
            return FNH;
        case 6:
            FNH = x - x * x - y * y;
            return FNH;
        case 7:
            FNH = -2.0 * z * (ma + x * y);
            return FNH;
        case 8:
            FNH = mc * z + x * y / 3.0;
            return FNH;
        case 9:
            FNH = x * y - mb * z;
            return FNH;
        case 10:
            FNH = -mb * y;
            return FNH;
        case 11:
            FNH = x * y - md * x * x - mc * z;
            return FNH;
        case 12:
            FNH = mc + md * z - z * z * z / 3.0 - (x * x + y * y) * (1.0 + me * z) + mf * z * x * x * x;
            return FNH;
        default:
            break;
    }
    return 0.0;
}

// slider bar
$(function() {
    $("#horizontal-slider").slider({
        max: 180,
        min: -180,
        value: -20,
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
        value: -30,
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


