        // Gloavbl 変数 //
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
        let me_used = 1;
        let mf_used = 1;
        let mg_used = 1;
        let mh_used = 0;
        //////////////////

        let width0 = 4;
        let height0 = 4;
        
        let cons = 0.0;

        const canvas = document.getElementById('graphCanvas');
        const ctx = canvas.getContext('2d');

        // 描画領域をリセット
        ctx.fillStyle = 'rgb( 0, 0, 0)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // リセットフラグ 再描画の条件を設定する
        let resetFlg = true;

        function animateGraph() {

            let x0, y0, x1, y1, x2, y2;
            let f0, f1, f2, f3, f4;

            // 描画中に使用不可とするコントロール
            usability(false);

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
            
            let loop;
            if (width0 <= 8) {
                loop = 160;
            }
            else {
                loop = width0 * 20;
            }

            let color;
            for (let k = 0; k < 8; k++) {
                switch (k) {
                    case 0:
                        cons = ma;
//                        color = 'rgb(  0,  11, 112)';
                        color = 'rgb(  0, 176, 240)';
                        break;
                    case 1:
                        cons = mb;
//                        color = 'rgb(130, 162, 190)';
                        color = 'rgb(101, 195, 237)';
                        break;
                    case 2:
                        cons = mc;
//                        color = 'rgb(162, 175, 142)';
                        color = 'rgb(101, 237, 237)';
                        break;
                    case 3:
                        cons = md;
//                        color = 'rgb(200, 200, 200)';
                        color = 'rgb(255,   0,   0)';
    //                    color = '#e6e6fa';
                        break;
                    case 4:
                        cons = me;
//                        color = 'rgb(193, 188,  94)';
                        color = 'rgb( 67, 221, 115)';
                        break;
                    case 5:
                        cons = mf;
//                        color = 'rgb(234, 201,  47)';
                        color = 'rgb(146, 208,  80)';
                        break;
                    case 6:
                        cons = mg;
//                        color = 'rgb(255, 215,  20)';
                        color = 'rgb(255, 225,   0)';
                        break;
                    case 7:
                        cons = mh;
//                        color = 'rgb(255, 255   0)';
                        break;
                }
                let xs = 0.025;
                let ys = 0.025;
//                let xs = 0.01;
//                let ys = 0.01;

                x0 = 0;
                y0 = 0;

                for (let m = -loop; m < loop; m++) {
                    for (let n = -loop; n < loop; n++) {
                                /*  // 間隔の確認
                                line(m, n, m + 1, n, 'rgb(100, 149, 237)');
                                */
//                for (let m = -130; m < 130; m++) {
//                    for (let n = -130; n < 130; n++) {
                        f0 = 0;
                        f1 = FNA(x0 + m * xs, y0 + n * ys);
                        f2 = FNA(x0 + (m + 1) * xs, y0 + n * ys);
                        f3 = FNA(x0 + m * xs, y0 + (n + 1) * ys);
                        f4 = FNA(x0 + (m + 1) * xs, y0 + (n + 1) * ys);
                        if (f1 * f2 <= 0) {
                            f0 = 1;
                            x1 = x0 + (m + f1 / (f1 - f2)) * xs;
                            y1 = y0 + n * ys;
                        }
//L_A:
                        if (f3 * f4 <= 0) {
                            if (f0 == 1) {
                                x2 = x0 + (m + f3 / (f3 - f4)) * xs;
                                y2 = y0 + (n + 1) * ys;
                                line(x1, y1, x2, y2, color);
                                continue;
                            }
                            if (f0 == 0) {
                                x1 = x0 + (m + f3 / (f3 - f4)) * xs;
                                y1 = y0 + (n + 1) * ys;
                                f0 = 1;
                            }
                        }
//L_B:
                        if (f2 * f4 <= 0) {
                            if (f0 == 1) {
                                x2 = x0 + (m + 1) * xs;
                                y2 = y0 + ( n + f2 / (f2 - f4)) * ys;
                                if (f4 * f2 != 0) {
                                    line(x1, y1, x2, y2, color);
                                    continue;
                                }
                            }
                            if (f0 == 0) {
                                x1 = x0 + (m + 1) * xs;
                                y1 = y0 + (n + f2 / (f2 - f4)) * ys;
                                f0 = 1;
                            }
                        }
//L_C:
//L_D:
                        if (f1 * f3 <= 0) {
                            if (f0 == 1) {
                                x2 = x0 + m * xs;
                                y2 = y0 + (n + f1 / (f1 - f3)) * ys;
                                line(x1, y1, x2, y2, color);
                            }
                        }
//L_E:
                    }
                }
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
//            document.getElementById('dh').disabled = flg;
//            document.getElementById('cnt_dp').disabled = flg;
            document.getElementById('start').disabled = flg;
        }

        // 線分のプロット
        function line(x1, y1, x2, y2, color) {
            // スケーリング
            let scaleX = canvas.width / width0;
            let scaleY = canvas.height / height0;

            let pixelX1 = scaleX * (x1 + width0 / 2);
            let pixelY1 = scaleY * (height0 / 2 - y1);
            let pixelX2 = scaleX * (x2 + width0 / 2);
            let pixelY2 = scaleY * (height0 / 2 - y2);

            ctx.beginPath();
            ctx.moveTo(pixelX1, pixelY1);
            ctx.lineTo(pixelX2, pixelY2);
            ctx.strokeStyle = color;
            ctx.stroke();
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
            width0 = parseFloat(document.getElementById('width0').value) || width0;
            height0 = parseFloat(document.getElementById('width0').value) || width0;

            // 描画領域をリセット
            if (resetFlg == true) {
                ctx.fillStyle = 'rgb( 0, 0, 0)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
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

        function updateRange() {
            const width0 = parseFloat(document.getElementById('width0').value);
            const wmax = width0 / 2;
            const wmin = -wmax;
            document.getElementById('wmax').innerText = wmax;
            document.getElementById('wmin').innerText = wmin;
        }

        function setRange() {
            document.getElementById('width0').value = width0;
            updateRange();
        }

        function changeType() {
            const type = String(document.getElementById('type').value);
            const typeAry = type.split('&');

            document.getElementById('where').innerText = "";

            switch (typeAry[0]) {
                case "01":  
                    switch (typeAry[1]) {
                        case "01":  // 同心円
                            dat = 1;
                            // 式を表示する
                            document.getElementById('dx').innerText = "$ x^2 + y^2 = $ const";
                            changeProperty(0);
                            document.getElementById('ma').value = 0.1;
                            document.getElementById('mb').value = 0.2;
                            document.getElementById('mc').value = 0.5;
                            document.getElementById('md').value = 1.0;
                            document.getElementById('me').value = 2.0;
                            document.getElementById('mf').value = 3.0;
                            document.getElementById('mg').value = 4.0;
                            width0 = 6;
                            height = 6;
                            setRange();
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
                    document.getElementById('mg').disabled = false;
                    document.getElementById('mh').disabled = true;
                    ma_used = 1;
                    mb_used = 1;
                    mc_used = 1;
                    md_used = 1;
                    me_used = 1;
                    mf_used = 1;
                    mg_used = 1;
                    mh_used = 0;

                    break;
                
                case "04":  
                    switch (typeAry[1]) {
                        case "10":  // デカルトの葉線
                            dat = 2;
                            // 式を表示する
                            document.getElementById('dx').innerText = "$ x^3 - 2xy + y^3 = $ const";
                            changeProperty(0);
                            document.getElementById('ma').value = -0.6;
                            document.getElementById('mb').value = -0.4;
                            document.getElementById('mc').value = -0.2;
                            document.getElementById('md').value = 0.0;
                            document.getElementById('me').value = 0.2;
                            document.getElementById('mf').value = 0.4;
                            document.getElementById('mg').value = 0.6;
                            width0 = 6;
                            height = 6;
                            setRange();
                            break;
                        case "06":  // レムニスケート
                            dat = 3;
                            // 式を表示する
                            document.getElementById('dx').innerText = "$ (x^2 + y^2 )^2 - (x^2 - y^2)  = $ const";
                            changeProperty(0);
                            document.getElementById('ma').value = "-0.249";
                            document.getElementById('mb').value = "-0.2";
                            document.getElementById('mc').value = "-0.1";
                            document.getElementById('md').value = 0.0;
                            document.getElementById('me').value = "0.1";
                            document.getElementById('mf').value = "0.3";
                            document.getElementById('mg').value = "0.7";
                            document.getElementById('mh').value = "";
                            width0 = 3.2;
                            height = 3.2;
                            setRange();
                            break;
                        case "09":  // カシニの橙形
                            dat = 4;
                            // 式を表示する
                            document.getElementById('dx').innerText = "$ (x^2 + y^2 + a^2)^2 - 4a^2x^2 = 4 \\cdot$const";
                            document.getElementById('where').innerText = "$\\;$ where $\\; a = 1$";
                            changeProperty(0);
                            document.getElementById('ma').value = 0.1;
                            document.getElementById('mb').value = 0.25;
                            document.getElementById('mc').value = 0.4;
                            document.getElementById('md').value = 0.6;
                            document.getElementById('me').value = 0.8;
                            document.getElementById('mf').value = 1.0;
                            document.getElementById('mg').value = "";
                            width0 = 4;
                            height = 4;
                            setRange();
                            break;
                        case "22":  // 4次曲線の例
                            dat = 5;
                            // 式を表示する
                            document.getElementById('dx').innerText = "$ x^4 + xy - y^4 = $ const";
                            changeProperty(0);
                            document.getElementById('ma').value = -0.6;
                            document.getElementById('mb').value = -0.4;
                            document.getElementById('mc').value = -0.2;
                            document.getElementById('md').value = 0.0;
                            document.getElementById('me').value = 0.2;
                            document.getElementById('mf').value = 0.4;
                            document.getElementById('mg').value = 0.6;
                            width0 = 3.2;
                            height = 3.2;
                            setRange();
                            break;
                        case "11":  // 5次曲線の例
                            dat = 6;
                            // 式を表示する
                            document.getElementById('dx').innerText = "$ x^5 - 2x^2y *- y^5 = $ const";
                            changeProperty(0);
                            document.getElementById('ma').value = -0.6;
                            document.getElementById('mb').value = -0.4;
                            document.getElementById('mc').value = -0.2;
                            document.getElementById('md').value = 0.0;
                            document.getElementById('me').value = 0.2;
                            document.getElementById('mf').value = 0.4;
                            document.getElementById('mg').value = 0.6;
                            width0 = 3.2;
                            height = 3.2;
                            setRange();
                            break;
                        case "12":  // 三角関数の周期性の例
                            dat = 7;
                            // 式を表示する
                            document.getElementById('dx').innerText = "$ \cos(y) - \cos(x) = $ const";
                            changeProperty(0);
                            document.getElementById('ma').value = -0.6;
                            document.getElementById('mb').value = -0.4;
                            document.getElementById('mc').value = -0.2;
                            document.getElementById('md').value = 0.0;
                            document.getElementById('me').value = 0.2;
                            document.getElementById('mf').value = 0.4;
                            document.getElementById('mg').value = 0.6;
                            width0 = 25.6;
                            height = 25.6;
                            setRange();
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
                    document.getElementById('mg').disabled = false;
                    ma_used = 1;
                    mb_used = 1;
                    mc_used = 1;
                    md_used = 1;
                    me_used = 1;
                    mf_used = 1;
                    mg_used = 1;

                    break;
                
                default:
                    break;
                
            }

            // 描画領域をリセット
            ctx.fillStyle = 'rgb( 0, 0, 0)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

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

        function FNA(x, y) {
            let FNA;
            switch (dat)
            {
                case 1: // 同心円
                    FNA = x*x + y*y -cons;
                    return FNA;
                case 2: // デカルトの葉線
                    FNA = x*x*x - 2*x*y + y*y*y -cons;
                    return FNA;
                case 3: // レムニスケート
                    FNA = Math.pow((x*x + y*y), 2) - (x*x - y*y) - cons;
                    return FNA;
                case 4: // カシニの橙形
//                    let a = 0.6;
                    let a = 1;
//                    FNA = Math.pow((x*x + y*y + a*a), 2) - 4 * a*a * x*x - Math.pow(cons, 4);
                    FNA = Math.pow((x*x + y*y + a*a), 2) - 4 * a*a * x*x - 4 * cons;
                    return FNA;
                case 5: // 4次曲線の例
                    FNA = Math.pow(x, 4) + x*y - Math.pow(y, 4) - cons;
                    return FNA;
                case 6: // 5次曲線の例
                    FNA = Math.pow(x, 5) - 2*x*x*y + Math.pow(y, 5) - cons;
                    return FNA;
                case 7: // 三角関数の周期性が反映される例
                    FNA = Math.cos(y) -Math.cos(x) - cons;
                    return FNA;
                default:
                    break;
            }
            return 0.0;
        }
