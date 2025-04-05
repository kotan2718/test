charset="UTF8"

/* picture change with fade */
$(function(){
	$('.pic_change_fade img').toggle(
		function(){$(this).fadeTo(600, 0);},
		function(){$(this).fadeTo(200, 1.0);}
	);
});
