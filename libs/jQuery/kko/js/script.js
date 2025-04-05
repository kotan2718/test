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

    document.querySelectorAll(".hover-link, .hover-xxxx").forEach(element => {
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
