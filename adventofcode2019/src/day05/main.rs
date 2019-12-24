use std::env;
use std::fs;

fn main() {
    let args: Vec<String> = env::args().collect();
    let contents = fs::read_to_string(&args[1]).expect("Something went wrong reading the file");

    let parse = |number:&str| {
        let number:i64 = number.trim().parse().expect("could not parse number");
        number
    };

    let mut memory: Vec<i64> = contents.split(",").map(parse).collect();
    intcode::run_program(&mut memory, &mut None, &mut None);
    intcode::print_code(&memory);

}

