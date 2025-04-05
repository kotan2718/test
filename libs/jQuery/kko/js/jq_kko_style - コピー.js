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
   ��L�̑����hover�ŉ摜�̘g����ω������悤�Ǝv�������C
   �f�t�H���g�ŉ摜�ɘg�������Ă����K�v������B
   
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

�P���ɁC��L�����s����ƁC�ŏ��ɉ摜�Ƀ}�E�X��������Ƃ��C�摜�����������B
�O�g�Ȃ��̉摜�ɊO�g���ǉ����ꂽ���߂ŁC��x�C�}�E�X���͂��ꂽ��́C
�Ӑ}�ʂ�̌��ʂ𓾂邱�Ƃ��ł���B
���́C�ŏ��Ȃ̂ŁC�ŏ��Ŏ��s����ƁC�݂��Ƃ��Ȃ��B
�f�t�H���g�ŉ摜�ɘg�������Ēu���Ηǂ���...
�Ȃ�΁C�u�����N�ƊO�g�̏����͐؂藣���������C�ǂ��̂ł͂Ȃ����Ǝv���B
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


// �z�o�[���̃|�b�v�A�b�v(�ȒP�Ȑ����ƃ����N���\��)
// css�t�@�C��: E:\Data\GitHub\Contrail\libs\etc\css\kko_etc_style.css

/*
$(document).ready(function () {
    let currentLink = null; // ���݂̃����N��ۑ�

    $(".hover-link").mouseenter(function (event) {
        let popup = $("#popup");
        let linkOffset = $(this).offset(); // �����N�̈ʒu���擾
        currentLink = $(this); // ���݂̃����N���L�^

        // �|�b�v�A�b�v�̓��e���X�V
        $("#popup-text").text($(this).attr("data-popup"));
        $("#popup-link").attr("href", $(this).attr("href"));

        // �|�b�v�A�b�v�̈ʒu�������N�̉��ɌŒ�
        popup.css({
            top: linkOffset.top + $(this).outerHeight() + 5 + "px",
            left: linkOffset.left + "px",
            display: "block"
        });

        // �����N�̐F��ێ����邽�߂� active �N���X��ǉ�
        $(this).addClass("active");
    });

    $(".hover-link").mouseleave(function () {
        setTimeout(() => {
            if (!$("#popup").is(":hover")) {
                $("#popup").hide();
                $(".hover-link").removeClass("active"); // �����N�̐F��߂�
            }
        }, 200);
    });

    $("#popup").mouseleave(function () {
        $(this).hide();
        $(".hover-link").removeClass("active"); // �����N�̐F��߂�
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

            // �|�b�v�A�b�v�̓��e���X�V (���s�� <br> �ɕϊ�)
            document.getElementById("popup-text").innerHTML = link.getAttribute("data-popup").replace(/\n/g, "<br>");
            document.getElementById("popup-link").setAttribute("href", link.getAttribute("href"));

            // �|�b�v�A�b�v�������N�̉��ɕ\��
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
    let currentElement = null; // ���݂̗v�f��ۑ�

    $(".hover-link, .comment-popup").mouseenter(function (event) {
        let popup = $("#popup");
        let elementOffset = $(this).offset();
        currentElement = $(this);

        // �K�؂ȑ������擾���ĕ\�����e��ݒ�
        let popupText = $(this).attr("data-popup") || $(this).attr("comment-popup");
        $("#popup-text").text(popupText);

        // �|�b�v�A�b�v��\��
        popup.css({
            top: elementOffset.top + $(this).outerHeight() + 5 + "px",
            left: elementOffset.left + "px",
            display: "block"
        });

        // �����N�܂��̓R�����g�� active �N���X��ǉ�
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



// �}�E�X�̃z�o�[�ŁA���̃T�C�Y�̉摜���|�b�v�A�b�v����
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

