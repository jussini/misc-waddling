use std::env;
use std::fs;
use std::collections::HashSet;
use std::cmp::Ordering;


#[derive(Debug, Hash, Eq, PartialEq, Clone, Copy)]
struct Asteroid {
    x: i32,
    y: i32
}

fn main() {
    let args: Vec<String> = env::args().collect();

    let contents = fs::read_to_string(&args[1]).expect("Something went wrong reading the file");

    let mut roids = HashSet::new();
    for (y, line) in contents.lines().enumerate() {
        for (x, col) in line.char_indices() {
            if col == '#' {
                roids.insert(Asteroid{x: x as i32, y: y as i32});
            }

        }
    }

    let mut max_count = 0;
    let mut best_candidate: Asteroid = Asteroid{x:-1, y:-1};
    for from in &roids {
        let one: HashSet<Asteroid> = [*from].iter().cloned().collect();
        let rest = roids.difference(&one);
        let mut count = 0;

        for to in rest {
            let ends: HashSet<Asteroid> = [*from, *to].iter().cloned().collect();
            let mut to_test = roids.difference(&ends);

            if to_test.any(|test| is_between(test, from, to)) == false {
                count += 1;
            }
        }

        if count >= max_count {
            max_count = count;
            best_candidate = *from;
        }
    }

    println!("{:?} can detect  {} other roids", best_candidate, max_count);


    // sort
    // remove the stationed roid
    let station: HashSet<Asteroid> = [best_candidate].iter().cloned().collect();
    let mut roids: Vec<Asteroid> = roids.difference(&station).cloned().collect();
    
    let compare = |a: &Asteroid, b: &Asteroid| -> Ordering {

        let a_angle = laser_angle(&best_candidate, a);
        let b_angle = laser_angle(&best_candidate, b);
        let a_distance = dist(&best_candidate, a);
        let b_distance = dist(&best_candidate, b);
        a_angle.partial_cmp(&b_angle).unwrap().then(a_distance.partial_cmp(&b_distance).unwrap())
 
    };

    roids.sort_by(compare);
    let mut vapor_turn = 0;
    let mut i = 0;
    while roids.len() > 0 {
        if i == roids.len() {
            i = 0;
        }
        vapor_turn += 1;

        let removed = roids.remove(i);
        println!("Vapored {:?} on turn {}", removed, vapor_turn);

        let angle = laser_angle(&best_candidate, &removed);
        //println!("Next angle {:?} is in {} vs current {}", &roids[i], laser_angle(&best_candidate, &roids[i]), angle);
        // update index till we get past other asteroids at same angle
        while i < roids.len() && cmp_float(laser_angle(&best_candidate, &roids[i]), angle) == Ordering::Equal {
            println!("{:?} in on same angle ({} vs {})", &roids[i], angle, laser_angle(&best_candidate, &roids[i]));
            i += 1;
        }

    }
}

fn cmp_float(a: f64, b: f64) -> Ordering {
    if (a - b).abs() < 0.000001 {
        return Ordering::Equal;
    }
    a.partial_cmp(&b).unwrap()
}

fn dist(a: &Asteroid, b: &Asteroid) -> f64 {
    ((a.x - b.x).pow(2) as f64 + (a.y - b.y).pow(2) as f64).sqrt()
}

fn is_between(test: &Asteroid, from: &Asteroid, to: &Asteroid) -> bool {
    //println!("Is {:?} between {:?} and {:?}", test, from, to);
       
    //println!("is {} + {} == {}", dist(from, test), dist(test, to), dist(from, to));
    dist(from, test) + dist(test, to) - dist(from, to) < 0.000001
}


fn laser_angle(station: &Asteroid, asteroid: &Asteroid) -> f64 {

    let len = |v:Vec<i32>| {
        ((v[0].pow(2) + v[1].pow(2)) as f64).sqrt()
    };

    // unit vector pointing up
    let up = vec![0, -1];

    let target = vec![asteroid.x - station.x, asteroid.y - station.y];
    
    let dotp = (up[0]*target[0] + up[1]*target[1]) as f64;
    let lengths = len(up) * len(target);

    // a = arcos( up dot target / (||up|| ||target||))
    let mut angle = (dotp / lengths).acos() * (180.0 / std::f64::consts::PI);
    if asteroid.x < station.x {
        angle = 360.0 - angle;
    } 

    //println!("Laser angle between {:?} and {:?} : {}", station, asteroid, angle);
    angle
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn is_between_true() {
        assert_eq!(is_between(&Asteroid{x: 3, y: 1}, &Asteroid{x: 0, y: 0}, &Asteroid{x: 6, y: 2}), true);
        assert_eq!(is_between(&Asteroid{x: 2, y: 2}, &Asteroid{x: 3, y: 4}, &Asteroid{x: 1, y: 0}), true);
        assert_eq!(is_between(&Asteroid{x: 6, y: 2}, &Asteroid{x: 0, y: 0}, &Asteroid{x: 9, y: 3}), true);
    }

    #[test]
    fn is_between_false() {
        assert_eq!(is_between(&Asteroid{x: 3, y: 2}, &Asteroid{x: 0, y: 0}, &Asteroid{x: 4, y: 3}), false);
        assert_eq!(is_between(&Asteroid{x: 3, y: 2}, &Asteroid{x: 3, y: 4}, &Asteroid{x: 1, y: 0}), false);
        assert_eq!(is_between(&Asteroid { x: 4, y: 2 }, &Asteroid { x: 3, y: 2 }, &Asteroid { x: 4, y: 0 }), false);
    }

    
    #[test]
    fn test_laser_angle() {

        let station = Asteroid{x: 3, y: 3};

        let angle = laser_angle(&station, &Asteroid{x: 3, y: 0});
        assert_eq!((angle - 0.0).abs() < 0.0001, true);

        let angle = laser_angle(&station, &Asteroid{x: 6, y: 3});
        assert_eq!((angle - 90.0).abs() < 0.0001, true);

        let angle = laser_angle(&station, &Asteroid{x: 3, y: 6});
        assert_eq!((angle - 180.0).abs() < 0.0001, true);

        let angle = laser_angle(&station, &Asteroid{x: 0, y: 3});
        assert_eq!((angle - 270.0).abs() < 0.0001, true);


    }
}