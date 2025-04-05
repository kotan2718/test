charset="UTF8"

	$(window).load(function(){
		var delaySpeed = 3000;
		var fadeSpeed = 5000;
		$('.welcome img').each(function(i){
			$(this).delay(i*(delaySpeed)).css({display:'block',opacity:'0'}).animate({opacity:'1'},fadeSpeed);
		});
	});
