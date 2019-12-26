use std::env;
use std::fs;
use std::collections::HashSet;


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
}


fn is_between(test: &Asteroid, from: &Asteroid, to: &Asteroid) -> bool {
    //println!("Is {:?} between {:?} and {:?}", test, from, to);
    
    let dist = |a:&Asteroid, b:&Asteroid| {
        ((a.x - b.x).pow(2) as f32 + (a.y - b.y).pow(2) as f32).sqrt()
    };
    
    //println!("is {} + {} == {}", dist(from, test), dist(test, to), dist(from, to));
    dist(from, test) + dist(test, to) - dist(from, to) < 0.000001
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

     
}