
// ホバー時のポップアップ(簡単な説明とリンク先を表示)
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
