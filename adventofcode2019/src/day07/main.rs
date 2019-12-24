use std::env;
use std::fs;
use permutohedron::LexicalPermutation;

fn main() {
    let args: Vec<String> = env::args().collect();
    let contents = fs::read_to_string(&args[1]).expect("Something went wrong reading the file");

    let parse = |number:&str| {
        let number:i64 = number.trim().parse().expect("could not parse number");
        number
    };

    let program: Vec<i64> = contents.split(",").map(parse).collect();
    
    part1(&program);
    part2(&program);    

}

fn part1(program: &Vec<i64>) {
    let mut phases = [0,1,2,3,4];
    let mut max_output = 0;
    let mut max_phases = vec![];
    loop {
        let phase_inputs = phases.to_vec();
        
        let output = run_amplifiers_for_phases(&program, &phase_inputs);
        if output > max_output {
            max_output = output;
            max_phases = phase_inputs.clone();
        } 
        if !phases.next_permutation() {
            break;
        }
    }
    println!("Max output reached with phases {:?} at {}", max_phases, max_output);

}

fn part2(program: &Vec<i64>) {
    let mut phases = [5,6,7,8,9];
    let mut max_output = 0;
    let mut max_phases = vec![];
    loop {
        let phase_inputs = phases.to_vec();
        
        let output = run_amplifiers_for_phases_with_feedback(&program, &phase_inputs);
        if output > max_output {
            max_output = output;
            max_phases = phase_inputs.clone();
        } 
        if !phases.next_permutation() {
            break;
        }
    }
    println!("Max output reached with feedback phases {:?} at {}", max_phases, max_output);
}

fn run_amplifiers_for_phases(program: &Vec<i64>, phases: &Vec<i64>) -> i64{
    let mut output_signal = 0;
    for phase in phases {
        let mut memory = program.clone();
        output_signal = run_amplifier(&mut memory, *phase, output_signal);
    }
    output_signal
}

fn run_amplifiers_for_phases_with_feedback(program: &Vec<i64>, phases: &Vec<i64>) -> i64{
    let mut output_signal = 0;
    let mut executions: Vec<intcode::Execution> = phases.into_iter().map(|p| {
        intcode::Execution{ memory: program.clone(), ip: 0, inputs: vec![*p]}
    }).collect();

    // initial signal input
    executions[0].inputs.push(0);

    let mut outputs = vec![];
    loop {
        let mut execution = executions.first_mut().unwrap();
        let halt = intcode::run_execution(&mut execution, &mut Some(&mut outputs));
        if halt.is_some() {
            output_signal = outputs.pop().unwrap();
            executions.rotate_left(1);
            executions[0].inputs.push(output_signal);
        } else {
            break;
        }
    }

    output_signal
}

fn run_amplifier(memory: &mut Vec<i64>, phase: i64, input_signal: i64) -> i64{
    let mut inputs = vec![phase, input_signal];
    let mut outputs = vec![];
    intcode::run_program(memory, &mut Some(&mut inputs), &mut Some(&mut outputs));

    return *(outputs.first().unwrap());
}

