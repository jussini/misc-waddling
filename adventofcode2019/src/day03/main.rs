use std::env;
use std::fs;
use std::fmt;
use std::collections::HashSet;

#[derive(Debug)]
enum Segment {
    U(i32),
    D(i32),
    L(i32),
    R(i32)
}

#[derive(Hash, Eq, PartialEq)]
struct Coordinate {
    x: i32,
    y: i32
}
impl fmt::Debug for Coordinate {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "({},{})", self.x, self.y)
    }
}

const ORIGO: Coordinate = Coordinate {x: 0, y: 0};

fn main() {
    let args: Vec<String> = env::args().collect();
    let contents = fs::read_to_string(&args[1]).expect("Something went wrong reading the file");

    let mut lines = contents.lines();
    let line1 = lines.next().unwrap();
    let line2 = lines.next().unwrap();

    //println!("Line1 {}", line1);
    //println!("Line2 {}", line2);

    let line1_segments = line_to_segments(line1);
    let line2_segments = line_to_segments(line2);
    //println!("Segments {:?}, {:?}", line1_segments, line2_segments);
    let set1 = trace(ORIGO, &line1_segments);
    let set2 = trace(ORIGO, &line2_segments);
    let intersects = set1.intersection(&set2);
    //println!("Intersecting at: {:?}", intersects);
    let closest = intersects.clone().min_by(|a, b| distance(a).cmp(&distance(b)));
    match closest {
        Some(c) => {
            println!("Closest: {:?}, distance: {}", c, distance(c));
        },
        None    => println!("Oh, there was no intersection?"),
    }
    
    let least_steps_compare = |a: &&Coordinate, b: &&Coordinate| {
        let a_steps = count_steps(&ORIGO, a, &line1_segments) + count_steps(&ORIGO, a, &line2_segments);
        let b_steps = count_steps(&ORIGO, b, &line1_segments) + count_steps(&ORIGO, b, &line2_segments);
        a_steps.cmp(&b_steps)
    };

    let least_steps = intersects.clone().min_by(least_steps_compare);
    match least_steps {
        Some(c) => {
            let steps1 = count_steps(&ORIGO, c, &line1_segments);
            let steps2 = count_steps(&ORIGO, c, &line2_segments);
            println!("Least steps: {:?}, path1: {} + path2: {} = {}", c, steps1, steps2, steps1 + steps2);
        },
        None    => println!("Oh, there was no intersection?"),
    }

}


fn line_to_segments(line: &str) -> Vec<Segment>{

    let parse_segment = |item: &str| {
        let item = String::from(item);
        let amount: i32 = item[1..].parse().expect("Could not parse segment amount");
        let character = item.chars().nth(0);
        match character {
            Some('U') => Segment::U(amount),
            Some('D') => Segment::D(amount),
            Some('L') => Segment::L(amount),
            Some('R') => Segment::R(amount),
            Some(_)   => panic!("Oh noes, unknown direction"),
            None      => panic!(""),
        }
    };

    return line.split(",").map(parse_segment).collect();
}

fn move_up(amount: i32, from: &Coordinate, coordinates: &mut HashSet<Coordinate>) -> Coordinate {

    for i in 1..(amount+1){
        coordinates.insert(Coordinate {x: from.x, y: from.y + i});
    }
    return Coordinate {x: from.x, y: from.y + amount};
}

fn move_down(amount: i32, from: &Coordinate, coordinates: &mut HashSet<Coordinate>) -> Coordinate {
    for i in 1..(amount+1){
        coordinates.insert(Coordinate {x: from.x, y: from.y - i});
    }
    return Coordinate {x: from.x, y: from.y - amount};
}

fn move_right(amount: i32, from: &Coordinate, coordinates: &mut HashSet<Coordinate>) -> Coordinate {
    for i in 1..(amount+1){
        coordinates.insert(Coordinate {x: from.x + i, y: from.y});
    }
    return Coordinate {x: from.x + amount, y: from.y };
}

fn move_left(amount: i32, from: &Coordinate, coordinates: &mut HashSet<Coordinate>) -> Coordinate {
    for i in 1..(amount+1){
        coordinates.insert(Coordinate {x: from.x - i, y: from.y});
    }
    return Coordinate {x: from.x - amount, y: from.y};
}

fn trace(from: Coordinate, segments: &Vec<Segment>) -> HashSet<Coordinate>{

    let mut coordinates = HashSet::new();
    let mut from = from;
    for segment in segments {
        from = match segment {
            Segment::U(amount) => move_up(*amount, &from, &mut coordinates),
            Segment::D(amount) => move_down(*amount, &from, &mut coordinates),
            Segment::R(amount) => move_right(*amount, &from, &mut coordinates),
            Segment::L(amount) => move_left(*amount, &from, &mut coordinates),
        };
    }

    //println!("After trace: {:?},{:?}", from, coordinates);

    return coordinates;
}


fn count_steps(from: &Coordinate, to: &Coordinate, segments: &Vec<Segment>) -> u32 {
    let mut current = Coordinate {x: from.x, y: from.y};
    let mut steps = 0;

    for segment in segments {
        match segment {
            Segment::U(amount) => {
                for _s in 0..*amount {
                    current.y += 1;
                    steps += 1;
                    if current.eq(to) {
                        //println!("Reached {:?} in {} steps", to, steps);
                        return steps;
                    }
                }
            },
            Segment::D(amount) => {
                for _s in 0..*amount {
                    current.y -= 1;
                    steps += 1;
                    if current.eq(to) {
                        //println!("Reached {:?} in {} steps", to, steps);
                        return steps;
                    }
                }
            },
            Segment::L(amount) => {
                for _s in 0..*amount {
                    current.x -= 1;
                    steps += 1;
                    if current.eq(to) {
                        //println!("Reached {:?} in {} steps", to, steps);
                        return steps;
                    }
                }
            },
            Segment::R(amount) => {
                for _s in 0..*amount {
                    current.x += 1;
                    steps += 1;
                    if current.eq(to) {
                        //println!("Reached {:?} in {} steps", to, steps);
                        return steps;
                    }
                }
            },
        }
    }
    panic!("Could not find the interception");
}

fn distance(b: &Coordinate) -> i32 {
    return (ORIGO.x - b.x).abs() + (ORIGO.y - b.y).abs();
}

