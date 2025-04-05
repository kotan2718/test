$(function(){
	$('#sample07 a img').hover(
		function(){
			$(this).fadeTo(1, 0.6);
		},
		function(){
			$(this).fadeTo(1, 1.0);
		}
	);
});



$(function(){
	$('#sample08 a img').hover(
		function(){
			$(this).fadeTo(200, 0.6);
		},
		function(){
			$(this).fadeTo(200, 1.0);
		}
	);
});



$(function(){
	$('#sample09 a img').hover(
		function(){
			$(this).fadeTo(0, 0.6).fadeTo('normal', 1.0);
		},
		function(){
			$(this).fadeTo('fast', 1.0);
		}
	);
});


$(function(){
	$('#sample10 a img').hover(function(){
		$(this).attr('src', $(this).attr('src').replace('_off', '_on'));
			}, function(){
			   if (!$(this).hasClass('current')) {
			   $(this).attr('src', $(this).attr('src').replace('_on', '_off'));
		}
	});
});



$(function() {
	$('#sample11 a img')
	.hover(
		function(){
			$(this).stop().animate({'marginTop':'-34px'}, 300);
		},
		function () {
			$(this).stop().animate({'marginTop':'0px'}, 300);
		}
	);
});



$(function(){
	$('#sample12 a img').hover(
		function(){
			$(this).fadeTo(400, 0);
		},
		function(){
			$(this).fadeTo(400, 1.0);
		}
	);
});