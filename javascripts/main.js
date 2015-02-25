console.log('This would be the main JS file.');

var canvas = document.getElementById("display");
var particles;

var init = function() {
    particles = []
    // Solute:
    for (var i = 0; i < 3; i++) {
	var p = {
	    x: 50 * (i + 1), 
	    y: 30 * (i + 1), 
	    vx: 5, 
	    vy: 5, 
	    color: '#FF8888', 
	    radius: 25, 
	};
	particles.push(p);
    }
    // Solvent:
    for (var i = 0; i < 5; i++) {
	var p = {
	    x: 30 * (i + 1), 
	    y: 20 * (i + 1), 
	    vx: 2, 
	    vy: 2, 
	    color: '#8899AA', 
	    radius: 10, 
	};
	particles.push(p);
    }
};

var draw = function() {
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < particles.length; i++) {
	var p = particles[i];
	ctx.beginPath();
	ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
	ctx.fillStyle = p.color;
	ctx.fill();
    }
};

var step = function() {
    for (var i = 0; i < particles.length; i++) {
	var p = particles[i];
	p.x += p.vx;
	p.y += p.vy;

	if (p.x - p.radius < 0 || p.x + p.radius > canvas.width) {
	    p.vx = -p.vx;
	}
	if (p.y - p.radius < 0 || p.y + p.radius > canvas.height) {
	    p.vy = -p.vy;
	}
    }

    draw();
};

init();
draw();
setInterval(step, 20);