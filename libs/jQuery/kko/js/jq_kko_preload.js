charset="UTF8"

/* Loader */
$('head').append(
	'<style type="text/css">#preload { display: none; } #fade, #loader { display: block; }</style>'
);

jQuery.event.add(window,"load",function() { // �S�Ă̓ǂݍ��݊�����ɌĂ΂��֐�
	var pageH = $("#preload").height();

	$("#fade").css("height", pageH).delay(0).fadeOut(0);
	$("#loader").delay(0).fadeOut(0);
	$("#preload").css("display", "block");
});

