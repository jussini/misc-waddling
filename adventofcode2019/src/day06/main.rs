use std::env;
use std::fs;
use std::collections::HashMap;
use std::collections::HashSet;

fn main() {
    let args: Vec<String> = env::args().collect();

    let contents = fs::read_to_string(&args[1]).expect("Something went wrong reading the file");
    let mut orbits: HashMap<&str, &str> = HashMap::new();
    for line in contents.lines() {
        let mut line = line.split(")");
        let inner = line.next().unwrap();
        let outer = line.next().unwrap();
        orbits.insert(outer, inner);
    }

    let mut steps = 0;
    let mut trail: HashSet<String> = HashSet::new();
    for start in orbits.keys() {
        trail.clear();
        steps += steps_to(&orbits, &mut trail, start, "COM");
        //println!("Trail set for {}, {:?}", start, trail);
    }
    println!("Total orbits {}", steps);

    let mut you_trail: HashSet<String> = HashSet::new();
    let mut san_trail: HashSet<String> = HashSet::new();
    let you_steps = steps_to(&orbits, &mut you_trail, "YOU", "COM");
    let san_steps = steps_to(&orbits, &mut san_trail, "SAN", "COM");
    //println!("Y: {:?}, S: {:?}, symdif: {:?}", you_trail, san_trail, you_trail.symmetric_difference(&san_trail));
    let symdiff: HashSet<_> = you_trail.symmetric_difference(&san_trail).collect();
    println!("From YOU to SAN: {}", symdiff.len());

}


fn steps_to(orbits: &HashMap<&str, &str>, trail: &mut HashSet<String>, start: &str, target: &str) -> i32 {

    // already there!
    if start == target {
        return 0;
    }

    let next: &str = orbits.get(start).unwrap();
    if next == target {
        trail.insert(String::from(target));
        return 1;        
    } else {
        let trail_item = String::from(next.clone());
        trail.insert(trail_item);
        return 1 + steps_to(orbits, trail, next, target);
    }

}
