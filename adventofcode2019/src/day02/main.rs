use std::env;
use std::fs;

fn main() {
    let args: Vec<String> = env::args().collect();
    let contents = fs::read_to_string(&args[1]).expect("Something went wrong reading the file");

    let parse = |number:&str| {
        let number:usize = number.trim().parse().expect("could not parse number");
        number
    };

    // This block is only for establishing the computer, sadly we need the gravity assist restored,
    // which will bork all the test programs :/
    /*
    println!("Testing!");
    let mut code: Vec<usize> = contents.split(",").map(parse).collect();
    run_program(&mut code);
    */
    let program: Vec<usize> = contents.split(",").map(parse).collect();

    println!("With gravity assist restored!");
    let mut memory = restore_gravity_assist(program.clone(), 12, 2);
    run_program(&mut memory);
    print_code(&memory);

    // part 2
    const TARGET: usize = 19690720;
    let mut exit = false;
    for noun in 0..99 {
        for verb in 0..99 {
            let mut memory = restore_gravity_assist(program.clone(), noun, verb);
            run_program(&mut memory);
            if memory[0] == TARGET {
                println!("Found pair: noun={}, verb={}, solution={}", noun, verb, 100 * noun + verb);
                print_code(&memory);
                exit = true;
            }
        }
        if exit {
            break;
        }
    }
}

fn restore_gravity_assist(mut program: Vec<usize>, noun: usize, verb: usize) -> Vec<usize> {
    program[1] = noun;
    program[2] = verb;
    return program;
}

fn execute_opcode(program: &mut Vec<usize>, at: usize) {
    let a = program[program[at+1]];
    let b = program[program[at+2]];
    let to = program[at+3];
    if program[at] == 1 {
        program[to] = a + b;
    }
    else if program[at] == 2 {
        program[to] = a * b;        
    }    
}

fn run_program(program: &mut Vec<usize>) {
    let mut ip = 0; // instruction pointer
    while program[ip] != 99 {
        execute_opcode(program, ip);
        ip += 4; // TODO: should increment by number of values in the instruction.
    }
}

fn print_code(code: &Vec<usize>) {
    for num in code {
        print!("[{}] ", num);
    }
    println!("");

}