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

// ホバー時のポップアップ(簡単な説明とリンク先を表示)
// cssファイル: E:\Data\GitHub\Contrail\libs\etc\css\kko_etc_style.css

document.addEventListener("DOMContentLoaded", function () {
    let currentElement = null;

    function showPopup(element) {
        let popup = document.getElementById("popup");
        let rect = element.getBoundingClientRect();

        currentElement = element;

        // ポップアップの内容を更新 (改行を <br> に変換)
        document.getElementById("popup-text").innerHTML = element.getAttribute("comment-popup").replace(/\n/g, "<br>");

        // <a>タグなら「詳細を見る」を表示、<span>タグなら非表示
        if (element.tagName.toLowerCase() === "a") {
            document.getElementById("popup-link").style.display = "block";
            document.getElementById("popup-link").setAttribute("href", element.getAttribute("href"));
        } else {
            document.getElementById("popup-link").style.display = "none";
        }

        // ポップアップをリンクまたはスパンの下に表示
        popup.style.top = window.scrollY + rect.bottom + 5 + "px";
        popup.style.left = window.scrollX + rect.left + "px";
        popup.style.display = "block";
    }

    function hidePopup() {
        document.getElementById("popup").style.display = "none";
        if (currentElement) {
            currentElement.classList.remove("active");
        }
    }

    document.querySelectorAll(".hover-link, .hover-comment").forEach(element => {
        element.addEventListener("mouseenter", function () {
            showPopup(element);
        });

        element.addEventListener("mouseleave", function () {
            setTimeout(() => {
                if (!document.getElementById("popup").matches(":hover")) {
                    hidePopup();
                }
            }, 200);
        });
    });

    document.getElementById("popup").addEventListener("mouseleave", hidePopup);
});

document.addEventListener("DOMContentLoaded", function () {
    // 画面幅を判定してクラスを切り替える
    function adjustLayout() {
        const CommonElement = document.getElementById("common-k_920");
        const mainElement = document.getElementById("main920");
        const widthElement = document.querySelector(".c_main920");
        const picLeftElement = document.querySelector('.pic-left920');
        const headerElement = document.querySelector(".header_label920");
        const footerElement = document.querySelector(".footer_label920");
        const imageElements = document.querySelectorAll(".image-container > img");
        const popupElement = document.querySelector(".popup > width");

        if (mainElement) {

            function isMobile() {
              return window.innerWidth / window.devicePixelRatio < 768;
            }

            if (isMobile()) { // スマホの場合
                CommonElement.id = "common-k_400";
                mainElement.id = "main400";
                widthElement.className = "c_main400";
                picLeftElement.className = "pic-left400";
                headerElement.className = "header_label400";
                footerElement.className = "footer_label400";
                if (imageElements) {
                    imageElements.forEach(image => {
                        image.style.width = "100%";
                    });
                }
                if (popupElement) {
                    popupElement.forEach(style => {
                        width = "85%";
                    });
                }
                console.log('スマホの画面です。IDは変更されません。');
            } else {  // PCの場合
                CommonElement.id = "common-k_920";
                mainElement.id = "main920";
                widthElement.className = "c_main920";
                picLeftElement.className = "pic-left920";
                headerElement.className = "header_label920";
                footerElement.className = "footer_label920";
                if (imageElements) {
                    imageElements.forEach(image => {
                        image.style.width = "700px";
                    });
                }
                if (popupElement) {
                    popupElement.forEach(style => {
                        width = "300px";
                    });
                }
                console.log('PCの画面です。IDを main920 に変更しました。');
            }
        } else {
            console.error('main 要素が見つかりません。');
        }
    }
    adjustLayout(); // 初回実行
});


// マウスのホバーで、元のサイズの画像をポップアップする

$(document).ready(function () {
    $(".image-container").hover(
        function () {
            const popupImage = $(this).find(".popup-image");
            popupImage.css({ width: "auto", height: "auto" });  // 元のサイズを保つ
            popupImage.fadeIn(200);
        },
        function () {
            $(this).find(".popup-image").fadeOut(200);
        }
    );
});

