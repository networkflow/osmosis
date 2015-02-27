console.log('This would be the main JS file.');

var canvas = document.getElementById("display");
var particleTypes = Object.freeze({
	solute: 'solute', 
	solvent: 'solvent', 
    });
var particles;

var init = function() {
    particles = []
    // Solute:
    for (var i = 0; i < 25; i++) {
	var p = {
	    x: Math.random() * canvas.width, 
	    y: Math.random() * canvas.height, 
	    vx: 5, 
	    vy: 5, 
	    color: '#FF8888', 
	    radius: 5, 
	    mass: 25, 
	    type: particleTypes.solute, 
	};
	particles.push(p);
    }
    // Solvent:
    for (var i = 0; i < 200; i++) {
	var p = {
	    x: Math.random() * canvas.width, 
	    y: Math.random() * canvas.height, 
	    vx: 5, 
	    vy: 5, 
	    color: '#8899AA', 
	    radius: 3, 
	    mass: 4, 
	    type: particleTypes.solvent, 
	};
	if (i == 0)
	    p.color = '#FF0000';
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

var dist = function(p, q) {
    var square = function(x) { return x * x; };
    return Math.sqrt(square(p.x - q.x) + square(p.y - q.y));
};

var step = function() {
    for (var i = 0; i < particles.length; i++) {
	var p = particles[i];
	p.x += p.vx;
	p.y += p.vy;

	// Check for particle-wall collisions
	//
	// Corrective factors are commented out to avoid creating collisions 
	// with other particles:
	if (p.x - p.radius < 0) {
	    p.x = p.radius;// + (p.radius - p.x);
	    // Use abs so that if somehow we're moving away from the wall we do nothing
	    p.vx = Math.abs(p.vx);
	} else if (p.x + p.radius > canvas.width) {
	    p.x = canvas.width - p.radius;// - (p.x + p.radius - canvas.width);
	    p.vx = -Math.abs(p.vx);
	}
	if (p.y - p.radius < 0) {
	    p.y = p.radius;// + (p.radius - p.y);
	    p.vy = Math.abs(p.vy);
	} else if (p.y + p.radius > canvas.height) {
	    p.y = canvas.height - p.radius;// - (p.y + p.radius - canvas.height);
	    p.vy = -Math.abs(p.vy);
	}
    }

    // Check for particle-particle collisions
    for (var i = 0; i < particles.length; i++) {
	for (var j = i + 1; j < particles.length; j++) {
	    var p = particles[i];
	    var q = particles[j];
	    var d = dist(p, q);
	    if (i == j || d > p.radius + q.radius)
		continue;

	    // Undo the collision:
	    p.x -= p.vx; p.y -= p.vy;
	    q.x -= q.vx; q.y -= q.vy;
	    d = dist(p, q);

	    if (d == 0) // Pretty unlikely haha
		continue;

	    var dot = (p.vx - q.vx) * (p.x - q.x) + (p.vy - q.vy) * (p.y - q.y);
	    p.vx -= 2 * q.mass / (p.mass + q.mass) * dot / (d * d) * (p.x - q.x);
	    p.vy -= 2 * q.mass / (p.mass + q.mass) * dot / (d * d) * (p.y - q.y);
	    q.vx -= 2 * p.mass / (p.mass + q.mass) * dot / (d * d) * (q.x - p.x);
	    q.vy -= 2 * p.mass / (p.mass + q.mass) * dot / (d * d) * (q.y - p.y);

	    if (d <= p.radius + q.radius) {
		// If the previous unsticking didn't help then try this:
		p.x += p.vx; p.y += p.vy;
		q.x += q.vx; q.y += q.vy;
	    }
	}
    }


    draw();
};

init();
draw();
setInterval(step, 20);