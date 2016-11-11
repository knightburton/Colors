$(function() {
	var base = {
		number_of_hexagons: 6,
		percentage_difference: 0.04,
		color_m: null,
		hexagons: new Array(),
		status: -1,
	};

	var stat = {
		round_counter: 0,
		stopwatch_element: null,
		stopwatch: null,
	};

	var actions = {
		list:  [
			"play",
			"pause",
			"continue",
			"try-again",
			"game-over",
		],
		play: 0,
		pause: 1,
		continue: 2,
		try_again: 3,
		game_over: -1,
	};

	var sections = {
		list: [
			'game',
			'howto',
			'rounds',
			'about',
		],
		game: 0,
		howto: 1,
		rounds: 2,
		about: 3,
	};

	var content_blocks = {
		list: [
			"content-headers",
			"hexagons",
			"game-section",
		],
		stats: 0,
		hexagons: 1,
		all: 2,
	};

	var hexagons_enum = {
		hexagon_m: 0,
		hexagon_1: 1,
		hexagon_2: 2,
		hexagon_3: 3,
		hexagon_4: 4,
		hexagon_5: 5,
		hexagon_6: 6,
	};

    var db = TAFFY();
    db.store("colors-rounds");

	/**
	*	Prototype for shuffle an array.
	*/
	Array.prototype.shuffle = function() {
	    var input = this;
	    for (var i = input.length - 1; i >= 0; i--) {
	        var random_index = Math.floor(Math.random() * (i + 1)); 
	        var item_at_index = input[random_index]; 
	        input[random_index] = input[i]; 
	        input[i] = item_at_index;
	    }
	    return input;
	}

	/**
	*	Construct function.
	*/
	function init() {
		// Event listeners to nav buttons.
		$('#game-nav-button').on('click', function() {
			navigate(sections.game);
		});
		$('#howto-nav-button').on('click', function() {
			navigate(sections.howto);
		});
		$('#rounds-nav-button').on('click', function() {
			navigate(sections.rounds);
		});
		$('#about-nav-button').on('click', function() {
			navigate(sections.about);
		});

		// Event listeners to actions.
		$('#play-action').on('click', function() {
			action(actions.play);
		});
		$('#pause-action').on('click', function() {
			action(actions.pause);
		});
		$('#continue-action').on('click', function() {
			action(actions.continue);
		});
		$('#try-again-action').on('click', function() {
			action(actions.try_again);
		});

		// Event listener to the hexagons.
		$('.clickable').on('click', pick);

		// Init the Stopwatch.
		$('#stopwatch-stat').empty();
		stat.stopwatch_element = $('#stopwatch-stat').get(0);
		stat.stopwatch = new Stopwatch(stat.stopwatch_element, {
			delay: 10,
			buttons: false,
		});

		// Blur the content.
		set_content_block_blur(content_blocks.all, true);

		// Start a new game.
		new_round();
	}

	/**
	*	Returns a random hex color.
	*/
	function random_color() {
		var letters = '0123456789abcdef'.split('');
	    var color = '#';
	    for (var i = 0; i < 6; i++ ) {
	        color += letters[Math.floor(Math.random() * 16)];
	    }
	    return color;
	}

	/**
	*	Returns a lighter or darker color.
	*/
	function color_luminance(color, luminosity) {
		hex = String(color).replace(/[^0-9a-f]/gi, '');
		if (hex.length < base.number_of_hexagons) {
			hex = hex[0] + hex[0]
				+ hex[1] + hex[1]
				+ hex[2] + hex[2];
		}

		luminosity = luminosity || 0;

		var rgb = "#", c, i;
		for (i = 0; i < 3; i++) {
			c = parseInt(hex.substr(i * 2, 2), 16);
			c = Math.round(Math.min(Math.max(0, c + (c * luminosity)), 255)).toString(16);
			rgb += ("00" + c).substr(c.length);
		}

		return rgb;
	}

	/**
	*	Increments the round_counter and refreshes the Round display.
	*/
	function set_round_counter(reset) {
		reset = reset || false;

		if(reset) {
			stat.round_counter = 0;
		} else {
			stat.round_counter++;
		}

		$('#round-stat').html(stat.round_counter);
	}

	/**
	*	Set a new hexagon bacground color.
	*/
	function hexagon_fill(hexagon, color) {
		$('#hexagon-' + hexagon).css("backgroundColor", color);
	}

	/**
	*	Click function for the hexagon pick.
	*/
	function pick(e) {
		var number = this.id.split('-')[1];
		if(base.hexagons[number - 1].localeCompare(base.color_m) === 0) {
			new_round();
		} else {
			game_over();
		}
	}

	/**
	*	Start a new round.
	*/
	function new_round() {
		base.color_m = random_color();
		hexagon_fill(hexagons_enum.hexagon_m, base.color_m);
		
		var direction = (Math.floor((Math.random() * 10) + 1) > 5) ? -base.percentage_difference : base.percentage_difference;

		for (var i = 0; i < base.number_of_hexagons; i++) {
			base.hexagons[i] = color_luminance(base.color_m, (i * direction));
		};

		base.hexagons.shuffle();

		for (var i = 0; i < base.number_of_hexagons; i++) {
			hexagon_fill(i + 1, base.hexagons[i]);
		};

		set_round_counter();
	}

	/**
	*	Game over function implementation.
	*/
	function game_over() {
		stat.stopwatch.stop();
		base.status = actions.game_over;
		set_action_button(actions.pause, false);
		set_action_button(actions.try_again, true);
		set_modal(true);
		set_content_block_blur(content_blocks.hexagons, true);

		db.insert({round: stat.round_counter, second: stat.stopwatch.get()});
        if(db().count() > 20) {
        	var id = db().order("round desc").last()['___id']
            db({___id: id}).remove();
        }
	}

	/**
	*	Handles the navigation through the page.
	*/
	function navigate(section) {
		for( var i = 0; i < sections.list.length; i++) {
			if(i == section) {
				$('#' + sections.list[i] + '-section').show();
			} else {
				$('#' + sections.list[i] + '-section').hide();
			}

			if(section != sections.game && base.status != actions.play) {
				set_modal(false);
			}

			if(section != sections.game && base.status == actions.play) {
				action(actions.pause);
			}

			if(section == sections.game && base.status != actions.play) {
				set_modal(true);
			}
		}

		if(section == sections.rounds) {
			$('#rounds-table-content').empty();
			db().order("round desc").each(function (record, recordnumber) {
                var round_td = $('<td>' + record["round"] + '</td>');

                var temp = record["second"].toString();
                var second = "";
			    if(temp.length > 2) {
			      second = temp.substring(0,  temp.length - 2) + "." + temp.substring(temp.length - 2);
			    } else {
			      second = "0." + temp;
			    }
                var second_td = $('<td>' + second + '</td>');
                
                var row = $('<tr></tr>').append(round_td).append(second_td);

                $('#rounds-table-content').append(row);
            });
		}
	}

	/**
	*	Handles the player actions.
	*/
	function action(type) {
		base.status = type;
		switch(type) {
			case actions.play: {
				stat.stopwatch.start();
				set_action_button(actions.play, false);
				set_modal(false);
				set_content_block_blur(content_blocks.all, false);
				set_action_button(actions.pause, true);
			} break;
			case actions.pause: {
				stat.stopwatch.stop();
				set_action_button(actions.pause, false);
				set_modal(true);
				set_content_block_blur(content_blocks.all, true);
				set_action_button(actions.continue, true);
			} break;
			case actions.continue: {
				set_action_button(actions.continue, false);
				action(actions.play);
			} break;
			case actions.try_again: {
				stat.stopwatch.reset();
				set_round_counter(true)
				new_round();
				set_action_button(actions.try_again, false);
				set_content_block_blur(content_blocks.hexagons, false);
				action(actions.play);
			} break;
		}
	}

	/**
	*	Show or hide the selected player button.
	*/
	function set_action_button(action, enable) {
		if(enable) {
			$('#' + actions.list[action] + '-action').show();
		} else {
			$('#' + actions.list[action] + '-action').hide();
		}
	}

	/**
	*	Enable or disable the modal div.
	*/
	function set_modal(enable) {
		if(enable) {
			$('#main-modal').show();
		} else {
			$('#main-modal').hide();
		}
	}

	/**
	*	Add or remove blur to a specific block.
	*/
	function set_content_block_blur(block, blur) {
		if(blur) {
			$('#' + content_blocks.list[block]).addClass('blur');
		} else {
			$('#' + content_blocks.list[block]).removeClass('blur');
		}
	}

	init();
});