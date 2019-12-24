use std::io;
use std::io::Write; // for flush

#[derive(Hash, Eq, PartialEq, Debug)]
enum ParamMode {
    Position,
    Immediate,
}

pub struct Execution {
    pub memory: Vec<i64>,
    pub inputs: Vec<i64>,
    pub ip: usize
}


pub fn execute_instruction(program: &mut Vec<i64>, ip: usize, inputs: &mut Option<&mut Vec<i64>>, outputs: &mut Option<&mut Vec<i64>>) -> usize{

    let opcode = program[ip] % 100;

    return match opcode {
        1  => add(program, ip),
        2  => mul(program, ip),
        3  => input(program, ip, inputs),
        4  => output(program, ip, outputs),
        5  => jump_if_true(program, ip),
        6  => jump_if_false(program, ip),
        7  => less_than(program, ip),
        8  => equals(program, ip),
        _  => panic!("Unknown opcode: {}", opcode),
    }
}

pub fn run_program(program: &mut Vec<i64>, inputs: &mut Option<&mut Vec<i64>>, outputs: &mut Option<&mut Vec<i64>>) {
    let mut ip = 0;
    while program[ip] != 99 {
        ip = execute_instruction(program, ip, inputs, outputs);
    }
}

pub fn run_execution(execution: &mut Execution, outputs: &mut Option<&mut Vec<i64>>) -> Option<i64>{
    while execution.memory[execution.ip] != 99 {
        execution.ip = execute_instruction(&mut execution.memory, execution.ip, &mut Some(&mut execution.inputs), outputs);
        if outputs.is_some() && outputs.as_ref().unwrap().len() != 0 {
            return Some(1); // not halted, just produced output value
        }
    }

    return None; // halted
}

pub fn print_code(code: &Vec<i64>) {
    for num in code {
        print!("[{}] ", num);
    }
    println!("");
}

fn get_parameter(program: &Vec<i64>, address: usize, mode: &ParamMode) -> i64 {
    match mode {
        ParamMode::Position => program[program[address] as usize],
        ParamMode::Immediate => program[address],
    }
}

fn get_parameter_modes(opcode: i64) -> (ParamMode, ParamMode, ParamMode) {

    // convert to str, left pad with zeros to len of 5
    let opcode: String = format!("{:0>5}", opcode);
    let immediate = '1' as u8;
    let positional = '0' as u8;
    let bytes = opcode.as_bytes();

    let mode = |character: u8| -> ParamMode {
        if character == immediate {
            return ParamMode::Immediate;
        } else if character == positional {
            return ParamMode::Position;
        } else {
            panic!("Unknown parameter mode: {}", character);
        }
    }; 
    

    return (mode(bytes[2]), mode(bytes[1]), mode(bytes[0]));

} 

fn add(program: &mut Vec<i64>, ip: usize) -> usize {
    let param_modes = get_parameter_modes(program[ip]);
    let a = get_parameter(program, ip+1, &param_modes.0);
    let b = get_parameter(program, ip+2, &param_modes.1);
    let to = program[ip+3] as usize;
    program[to] = a + b;
    
    ip + 4
}

fn mul(program: &mut Vec<i64>, ip: usize) -> usize {
    let param_modes = get_parameter_modes(program[ip]);
    let a = get_parameter(program, ip+1, &param_modes.0);
    let b = get_parameter(program, ip+2, &param_modes.1);
    let to = program[ip+3] as usize;
    program[to] = a * b;

    ip + 4
}

fn input(program: &mut Vec<i64>, ip: usize, inputs: &mut Option<&mut Vec<i64>>) -> usize {
    let to = program[ip + 1] as usize;

    let mut input = String::new();

    let input: i64 =
    match inputs {
        Some(input_vec) => {
            input_vec.remove(0)
        },
        None => {
            print!("input > " );
            let _ = io::stdout().flush();
            match io::stdin().read_line(&mut input) {
                Ok(_) => {},
                Err(error) => panic!("error: {}", error),
            };
            input.trim().parse().expect("Could not parse i64")
        }
    };

    program[to] = input;
    ip + 2
}

fn output(program: &mut Vec<i64>, ip: usize, outputs: &mut Option<&mut Vec<i64>>) -> usize {
    let param_modes = get_parameter_modes(program[ip]);
    let value = get_parameter(program, ip+1, &param_modes.0);

    match outputs {
        Some(output_vec) => output_vec.push(value),
        None => println!("output > {}", value)
    }

    ip + 2
}

fn jump_if_true(program: &mut Vec<i64>, ip: usize) -> usize {
    let param_modes = get_parameter_modes(program[ip]);
    let a = get_parameter(program, ip+1, &param_modes.0);
    let b = get_parameter(program, ip+2, &param_modes.1) as usize;
    return match a != 0 {
        true => b,
        false => ip + 3
    };
}

fn jump_if_false(program: &mut Vec<i64>, ip: usize) -> usize {
    let param_modes = get_parameter_modes(program[ip]);
    let a = get_parameter(program, ip+1, &param_modes.0);
    let b = get_parameter(program, ip+2, &param_modes.1) as usize;
    match a == 0 {
        true => b,
        false => ip + 3
    }
}


fn less_than(program: &mut Vec<i64>, ip: usize) -> usize {
    let param_modes = get_parameter_modes(program[ip]);
    let a = get_parameter(program, ip+1, &param_modes.0);
    let b = get_parameter(program, ip+2, &param_modes.1);
    let to = program[ip+3] as usize;
    match a < b {
        true => program[to] = 1,
        false => program[to] = 0
    };
    ip + 4
}

fn equals(program: &mut Vec<i64>, ip: usize) -> usize {
    let param_modes = get_parameter_modes(program[ip]);
    let a = get_parameter(program, ip+1, &param_modes.0);
    let b = get_parameter(program, ip+2, &param_modes.1);
    let to = program[ip+3] as usize;
    match a == b {
        true => program[to] = 1,
        false => program[to] = 0
    };
    ip + 4
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_add() {
        let mut v: Vec<i64> = vec![1, 5, 6, 7, 99, 10, 20, 0];
        let ip = add(&mut v, 0);
        print_code(&v);
        assert_eq!(ip, 4);
        assert_eq!(v[7], 30);
    }

    #[test]
    fn test_add_immediate() {
        let mut v: Vec<i64> = vec![101, 5, 6, 7, 99, 10, 20, 0];
        let ip = add(&mut v, 0);
        print_code(&v);
        assert_eq!(ip, 4);
        assert_eq!(v[7], 25); // 5 + 20
    }

    #[test]
    fn test_mul() {
        let mut v: Vec<i64> = vec![2, 5, 6, 7, 99, 10, 25, 0];
        let ip = mul(&mut v, 0);
        print_code(&v);
        assert_eq!(ip, 4);
        assert_eq!(v[7], 250);
    }

    #[test]
    fn test_mul_immediate() {
        let mut v: Vec<i64> = vec![1002, 5, 6, 7, 99, 10, 25, 0];
        let ip = mul(&mut v, 0);
        print_code(&v);
        assert_eq!(ip, 4);
        assert_eq!(v[7], 60); // 10 * 6
    }

    #[test]
    fn test_get_parameter() {
        let v: Vec<i64> = vec![0, 777, 1, 9];
        let p = get_parameter(&v, 2, &ParamMode::Position);
        assert_eq!(p, 777);

        let p = get_parameter(&v, 3, &ParamMode::Immediate);
        assert_eq!(p, 9);
    }

    #[test]
    fn test_get_parameter_mode() {
        assert_eq!(get_parameter_modes(102), (ParamMode::Immediate, ParamMode::Position, ParamMode::Position));
        assert_eq!(get_parameter_modes(1002), (ParamMode::Position, ParamMode::Immediate, ParamMode::Position));
    }

    #[test]
    fn test_negative_integers() {
        let mut v: Vec<i64> = vec![1101,100,-1,4,0];
        let ip = add(&mut v, 0);
        print_code(&v);
        assert_eq!(ip, 4);
        assert_eq!(v[4], 99); // 100 + (-1)
    }

    #[test]
    fn test_jump_if_true() {
        let mut v: Vec<i64> = vec![1105,1,9];
        let ip = jump_if_true(&mut v, 0);
        assert_eq!(ip, 9);

        let mut v: Vec<i64> = vec![1105,0,9];
        let ip = jump_if_true(&mut v, 0);
        assert_eq!(ip, 3);

        let mut v: Vec<i64> = vec![5,1,0];
        let ip = jump_if_true(&mut v, 0);
        assert_eq!(ip, 5);
    }

    #[test]
    fn test_jump_if_false() {
        let mut v: Vec<i64> = vec![1105,0,9];
        let ip = jump_if_false(&mut v, 0);
        assert_eq!(ip, 9);

        let mut v: Vec<i64> = vec![1105,1,9];
        let ip = jump_if_false(&mut v, 0);
        assert_eq!(ip, 3);

        let mut v: Vec<i64> = vec![5,2,0];
        let ip = jump_if_false(&mut v, 0);
        assert_eq!(ip, 5);
    }

    #[test]
    fn test_less_than() {
        let mut v: Vec<i64> = vec![1106,0,1,4,88];
        let ip = less_than(&mut v, 0);
        assert_eq!(ip, 4);
        assert_eq!(v[4], 1);

        let mut v: Vec<i64> = vec![1106,1,0,4,88];
        less_than(&mut v, 0);
        assert_eq!(v[4], 0);

        let mut v: Vec<i64> = vec![6,0,2,4,88];
        less_than(&mut v, 0);
        assert_eq!(v[4], 0);

        let mut v: Vec<i64> = vec![6,0,4,4,88];
        less_than(&mut v, 0);
        assert_eq!(v[4], 1);
    }

    #[test]
    fn test_equals() {
        let mut v: Vec<i64> = vec![1106,1,1,4,88];
        let ip = equals(&mut v, 0);
        assert_eq!(ip, 4);
        assert_eq!(v[4], 1);

        let mut v: Vec<i64> = vec![1106,1,0,4,88];
        equals(&mut v, 0);
        assert_eq!(v[4], 0);

        let mut v: Vec<i64> = vec![6,5,3,4,88,4];
        equals(&mut v, 0);
        assert_eq!(v[4], 1);

        let mut v: Vec<i64> = vec![6,0,3,4,88];
        equals(&mut v, 0);
        assert_eq!(v[4], 0);
    }


    #[test]
    fn test_input() {
         let mut v = vec![3,2,0];
        let mut inputs = vec![42, 66];
        let ip = input(&mut v, 0, &mut Some(&mut inputs));
        print_code(&v);
        assert_eq!(ip, 2);
        assert_eq!(v[2], 42);
        assert_eq!(inputs.len(), 1);
    }

    #[test]
    fn test_output() {
        let mut v = vec![4,2,666];
        let mut outputs = vec![44];
        let ip = output(&mut v, 0, &mut Some(&mut outputs));
        print_code(&v);
        assert_eq!(ip, 2);
        assert_eq!(outputs.len(), 2);
        assert_eq!(outputs.first(), Some(&44));
        assert_eq!(outputs.last(), Some(&666));
    }


    #[test]
    fn test_large_mul() {
        let mut v = vec![1102,34915192,34915192,7,4,7,99,0];
        let mut outputs = vec![];
        run_program(&mut v, &mut None, &mut Some(&mut outputs));
        assert_eq!(outputs.first(), Some(&1219070632396864));
    }
}