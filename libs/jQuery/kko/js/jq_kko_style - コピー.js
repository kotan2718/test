charset="UTF8"

/* BLINK at cursor on */
/* "IE" "Safari" "FireFox" "Chrome"  OK */
$(function(){
	$('.jQ_blink a img').hover(
		function(){
			$(this).fadeTo(0, 0.6).fadeTo('normal', 1.0);
		},
		function(){
			$(this).fadeTo('fast', 1.0);
		}
	);
});

/* 
   上記の操作にhoverで画像の枠線を変化させようと思ったが，
   デフォルトで画像に枠線をつけておく必要がある。
   
		$(function(){
			$('.jQ_blink a img').hover(
				function(){
					$(this).fadeTo(0, 0.6).fadeTo('normal', 1.0).css("border", "2px solid #f0f0f0");
				},
				function(){
					$(this).fadeTo('fast', 1.0).css("border", "2px solid #c8c8c8");
				}
			);
		});

単純に，上記を実行すると，最初に画像にマウスが乗ったとき，画像が少し動く。
外枠なしの画像に外枠が追加されたためで，一度，マウスがはずれた後は，
意図通りの効果を得ることができる。
問題は，最初なので，最初で失敗すると，みっともない。
デフォルトで画像に枠線をつけて置けば良いが...
ならば，ブリンクと外枠の処理は切り離した方が，良いのではないかと思う。
*/

/* image CHANGE at cursor on - off */
/* "IE" "Safari" "FireFox" "Chrome"  OK */
$(function(){
	$('.jQ_change a img').hover(function(){
		$(this).attr('src', $(this).attr('src').replace('_off', '_on'));
			}, function(){
			   if (!$(this).hasClass('current')) {
			   $(this).attr('src', $(this).attr('src').replace('_on', '_off'));
		}
	});
});


// ホバー時のポップアップ(簡単な説明とリンク先を表示)
// cssファイル: E:\Data\GitHub\Contrail\libs\etc\css\kko_etc_style.css

/*
$(document).ready(function () {
    let currentLink = null; // 現在のリンクを保存

    $(".hover-link").mouseenter(function (event) {
        let popup = $("#popup");
        let linkOffset = $(this).offset(); // リンクの位置を取得
        currentLink = $(this); // 現在のリンクを記録

        // ポップアップの内容を更新
        $("#popup-text").text($(this).attr("data-popup"));
        $("#popup-link").attr("href", $(this).attr("href"));

        // ポップアップの位置をリンクの下に固定
        popup.css({
            top: linkOffset.top + $(this).outerHeight() + 5 + "px",
            left: linkOffset.left + "px",
            display: "block"
        });

        // リンクの色を保持するために active クラスを追加
        $(this).addClass("active");
    });

    $(".hover-link").mouseleave(function () {
        setTimeout(() => {
            if (!$("#popup").is(":hover")) {
                $("#popup").hide();
                $(".hover-link").removeClass("active"); // リンクの色を戻す
            }
        }, 200);
    });

    $("#popup").mouseleave(function () {
        $(this).hide();
        $(".hover-link").removeClass("active"); // リンクの色を戻す
    });
});
*/
document.addEventListener("DOMContentLoaded", function () {
    let currentLink = null;

    document.querySelectorAll(".hover-link").forEach(link => {
        link.addEventListener("mouseenter", function (event) {
            let popup = document.getElementById("popup");
            let rect = link.getBoundingClientRect();

            currentLink = link;

            // ポップアップの内容を更新 (改行を <br> に変換)
            document.getElementById("popup-text").innerHTML = link.getAttribute("data-popup").replace(/\n/g, "<br>");
            document.getElementById("popup-link").setAttribute("href", link.getAttribute("href"));

            // ポップアップをリンクの下に表示
            popup.style.top = window.scrollY + rect.bottom + 5 + "px";
            popup.style.left = window.scrollX + rect.left + "px";
            popup.style.display = "block";

            link.classList.add("active");
        });

        link.addEventListener("mouseleave", function () {
            setTimeout(() => {
                if (!document.getElementById("popup").matches(":hover")) {
                    document.getElementById("popup").style.display = "none";
                    link.classList.remove("active");
                }
            }, 200);
        });
    });

    document.getElementById("popup").addEventListener("mouseleave", function () {
        this.style.display = "none";
        if (currentLink) {
            currentLink.classList.remove("active");
        }
    });
});


$(document).ready(function () {
    let currentElement = null; // 現在の要素を保存

    $(".hover-link, .comment-popup").mouseenter(function (event) {
        let popup = $("#popup");
        let elementOffset = $(this).offset();
        currentElement = $(this);

        // 適切な属性を取得して表示内容を設定
        let popupText = $(this).attr("data-popup") || $(this).attr("comment-popup");
        $("#popup-text").text(popupText);

        // ポップアップを表示
        popup.css({
            top: elementOffset.top + $(this).outerHeight() + 5 + "px",
            left: elementOffset.left + "px",
            display: "block"
        });

        // リンクまたはコメントに active クラスを追加
        $(this).addClass("active");
    });

    $(".hover-link, .comment-popup").mouseleave(function () {
        setTimeout(() => {
            if (!$("#popup").is(":hover")) {
                $("#popup").hide();
                $(".hover-link, .comment-popup").removeClass("active");
            }
        }, 200);
    });

    $("#popup").mouseleave(function () {
        $(this).hide();
        $(".hover-link, .comment-popup").removeClass("active");
    });
});



// マウスのホバーで、元のサイズの画像をポップアップする
$(document).ready(function () {
    $(".image-container").hover(
        function () {
            $(this).find(".popup-image").fadeIn(200);
        },
        function () {
            $(this).find(".popup-image").fadeOut(200);
        }
    );
});

